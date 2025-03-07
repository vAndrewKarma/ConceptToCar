import generateToken from '@karma-packages/conceptocar-common/dist/helper/generateToken'
import getDeviceId from '@karma-packages/conceptocar-common/dist/helper/getDeviceId'
import config from '../config'
import {
  BadRequestError,
  Unauthorized,
} from '@karma-packages/conceptocar-common'

type Roles = 'Admin' | 'Designer' | 'Seller' | 'Portfolio Manager'
import verifyPKCE from '@karma-packages/conceptocar-common/dist/helper/verifyPKCE'

import { ObjectId } from '@fastify/mongodb'
import sanitizeHTML from '../helper/sanitizeHtml'
import { Product, ProductModel, Stage } from '../db/m_m'

const productsController = {
  async CreateProduct(req, res) {
    console.log('execcuted3')
    try {
      console.log('execcuted3')
      if (req.sessionData.role !== 'Admin')
        throw new Unauthorized('Not authorized')
      const {
        name,
        description,
        modifyID,
        code_verifier,
        estimated_height,
        estimated_width,
        estimated_length,
        estimated_weight,
      } = req.body
      const redis = req.server.redis
      const productModel = req.server.productModel
      const productStageModel = req.server.productStageModel
      console.log('execcuted')
      if (config.app.ENV === 'production') {
        const productraw = await redis.get(`product_modify:${modifyID}`)

        if (!productraw) throw new BadRequestError('Invalid or expired request')

        const proreq = JSON.parse(productraw)
        const boundDevice = getDeviceId(req)

        if (proreq.fingerprint !== boundDevice)
          throw new BadRequestError('Invalid or expired request')
        console.log(code_verifier, proreq.challenge)
        if (!verifyPKCE(code_verifier, proreq.challenge))
          throw new BadRequestError('Invalid or expired request')
      }
      console.log('exc232')
      const pname = sanitizeHTML(name)
      if (await redis.get(`product: ${pname}`))
        throw new BadRequestError('Product already exists')

      if (await productModel.findProductByName(pname))
        throw new BadRequestError('Product already exists')

      const product = {
        name: pname,
        description: sanitizeHTML(description),
        estimated_height,
        estimated_width,
        estimated_weight,
        estimated_length,
        stage: 'concept',
        createdBy: req.sessionData.firstName + ' ' + req.sessionData.lastName,
      }

      const session = req.server.mongo.client.startSession()
      let productId
      try {
        await session.withTransaction(async () => {
          productId = await productModel.createProduct(product, { session })

          const historyRecord = {
            stage: 'concept',
            product_id: productId,
            start_of_stage: new Date(),
            name: product.createdBy,
          }

          await productStageModel.addStageHistory(historyRecord, { session })
        })
        const pipeline = redis.pipeline()

        pipeline.set(`product:${pname}`, JSON.stringify(product), 'EX', 3600)

        const keys = await redis.keys('products:all:*')
        if (keys.length) {
          pipeline.del(...keys)
        }

        await pipeline.exec()
      } catch (err) {
        throw err
      } finally {
        session.endSession()
      }

      res.send({ ok: true, productId })
    } catch (err) {
      throw err
    }
  },
  async GetProduct(req, res) {
    try {
      if (!req.sessionData) throw new Unauthorized('Not authorized')
      const { name } = req.body
      const redis = req.server.redis
      const productModel = req.server.productModel
      const productStageModel = req.server.productStageModel
      const product = await redis.get(`product: ${name}`)
      if (product) return res.send(JSON.parse(product))

      const prodb = await productModel.findProductByName(name)
      if (!prodb) throw new BadRequestError('Product doesn t exist')
      const stageHistory = await productStageModel.getHistoryByProductId(
        prodb._id,
        0,
        5
      )
      const data = {
        ...prodb,
        stageHistory,
      }
      await redis.set(`product: ${name}`, JSON.stringify(data), 'EX', 3600)
      res.send({
        prodb,
        history: {
          stageHistory,
        },
      })
    } catch (err) {
      throw err
    }
  },
  async GetProducts(req, res) {
    try {
      if (!req.sessionData) throw new Unauthorized('Not authorized')

      const { page = 1, searchTerms } = req.body
      const displayLimit = 10
      const redis = req.server.redis
      const productModel = req.server.productModel

      let cacheKey = `products:all:page:${page}:limit:${displayLimit}`
      if (searchTerms && searchTerms.trim() !== '') {
        cacheKey += `:search:${searchTerms}`
      }

      const cachedData = await redis.get(cacheKey)
      if (cachedData) {
        return res.send(JSON.parse(cachedData))
      }

      let products
      if (searchTerms && searchTerms.trim() !== '') {
        products = await productModel.searchProducts(
          searchTerms,
          page,
          displayLimit
        )
      } else {
        products = await productModel.findProducts(Number(page), displayLimit)
      }

      if (!products || products.length === 0) {
        throw new BadRequestError('No products found')
      }

      const hasNext = products.length === displayLimit + 1
      const displayedProducts = hasNext
        ? products.slice(0, displayLimit)
        : products

      const responseData = {
        length: displayedProducts.length,
        products: displayedProducts,
        hasNext,
      }

      await redis.set(cacheKey, JSON.stringify(responseData), 'EX', 3600)
      res.send(responseData)
    } catch (err) {
      throw err
    }
  },
  async ProductModify(req, res) {
    try {
      if (!req.sessionData) throw new Unauthorized('Not authorized')
      const { challenge } = JSON.parse(JSON.stringify(req.body))
      const modifyID = generateToken(16)
      const redis = req.server.redis
      const fingerprint = getDeviceId(req)
      await redis.set(
        `product_modify:${modifyID}`,
        JSON.stringify({ challenge, fingerprint }),
        'EX',
        config.app.ENV === 'production' ? 90 : 3000
      )
      res.send({ id: modifyID })
    } catch (err) {
      throw err
    }
  },
  async updateProduct(req, res): Promise<void> {
    try {
      if (!req.sessionData) {
        throw new Unauthorized('Not authorized')
      }
      const allowedRoles: Roles[] = [
        'Admin',
        'Designer',
        'Seller',
        'Portfolio Manager',
      ]
      const userRole: Roles = req.sessionData.role
      if (!allowedRoles.includes(userRole)) {
        throw new Unauthorized('Not authorized')
      }
      const productStageModel = req.server.productStageModel

      const {
        productId,
        name,
        description,
        stage,
        modifyID,
        code_verifier,
        estimated_height,
        estimated_width,
        estimated_weight,
        estimated_length,
        weight_unit,
        width_unit,
        height_unit,
      } = req.body as {
        productId: string
        name?: string
        description?: string
        stage?: Stage
        modifyID: string
        code_verifier: string
        estimated_height?: number
        estimated_length?: number
        estimated_width?: number
        estimated_weight?: number
        weight_unit?: string
        width_unit?: string
        height_unit?: string
      }

      const redis = req.server.redis

      const productModel: ProductModel = req.server.productModel

      console.log(modifyID)
      if (config.app.ENV === 'production') {
        const productRaw = await redis.get(`product_modify:${modifyID}`)
        if (!productRaw) {
          throw new BadRequestError('Invalid or expired request')
        }

        const prodReq = JSON.parse(productRaw)
        const boundDevice = getDeviceId(req)
        if (prodReq.fingerprint !== boundDevice) {
          throw new BadRequestError('Invalid or expired request')
        }

        console.log('2')
        if (!verifyPKCE(code_verifier, prodReq.challenge)) {
          throw new BadRequestError('Invalid or expired request')
        }

        console.log('3')
      }

      const currentProduct = await productModel.findProductById(productId)
      if (!currentProduct) {
        throw new BadRequestError('Product not found')
      }
      await redis.del(`product: ${currentProduct.name}`)
      await redis.del(`product: ${name}`)
      const keyz = await redis.keys('products:all:*')
      if (keyz.length > 0) {
        await redis.del(...keyz)
      }

      const allStages: Stage[] = [
        'concept',
        'feasibility',
        'design',
        'production',
        'withdrawal',
        'standby',
        'cancelled',
      ]

      const updateData: Partial<Product> = {}

      if (name !== undefined) {
        if (userRole === 'Designer') {
          throw new Unauthorized(
            'Designers are not allowed to update the product name'
          )
        }
        const sanitizedName = sanitizeHTML(name)
        if (sanitizedName !== currentProduct.name) {
          if (
            (await redis.get(`product:${sanitizedName}`)) ||
            (await productModel.findProductByName(sanitizedName))
          ) {
            throw new BadRequestError('Product already exists with this name')
          }
          updateData.name = sanitizedName
        }
      }
      if (description !== undefined) {
        if (userRole === 'Designer') {
          throw new Unauthorized(
            'Designers are not allowed to update the product description'
          )
        }
        updateData.description = sanitizeHTML(description)
      }
      console.log('STAGE BODY' + stage)
      if (stage !== undefined) {
        console.log('sccriudelafac')
        if (!allStages.includes(stage)) {
          throw new BadRequestError('Invalid stage value')
        }
        if (userRole === 'Designer') {
          console.log('karma')
          const currentStage = currentProduct.stage
          const currentIndex = allStages.indexOf(currentStage)
          if (currentIndex === -1) {
            throw new BadRequestError('Current stage is invalid')
          }

          const allowedStages =
            currentIndex < allStages.length - 1
              ? [allStages[currentIndex], allStages[currentIndex + 1]]
              : [allStages[currentIndex]]
          if (!allowedStages.includes(stage)) {
            throw new Unauthorized(
              'Designer not allowed to update stage to the given value'
            )
          }
        }
        const historyRecord = {
          stage: stage,
          product_id: productId,
          start_of_stage: new Date(),
          name: currentProduct.createdBy,
        }

        await productStageModel.addStageHistory(historyRecord)
        updateData.stage = stage
      }
      console.log('STAGE ------' + updateData.stage)
      if (estimated_height !== undefined)
        updateData.estimated_height = estimated_height
      if (estimated_width !== undefined)
        updateData.estimated_width = estimated_width
      if (estimated_weight !== undefined)
        updateData.estimated_weight = estimated_weight
      if (estimated_length !== undefined)
        updateData.estimated_length = estimated_length
      if (weight_unit !== undefined) updateData.weight_unit = weight_unit
      if (width_unit !== undefined) updateData.width_unit = width_unit
      if (height_unit !== undefined) updateData.height_unit = height_unit

      const updated = await productModel.updateProduct(productId, updateData)
      console.log(updated)
      if (!updated) {
        throw new BadRequestError('Product update failed')
      }

      res.send({ ok: true })
    } catch (err) {
      throw err
    }
  },
  async DeleteProduct(req, res) {
    try {
      if (!req.sessionData) throw new Unauthorized('Not authorized')
      if (req.sessionData.role !== 'Admin')
        throw new Unauthorized('Not authorized')

      const { productId, modifyID, code_verifier } = req.body
      const redis = req.server.redis
      const productModel = req.server.productModel

      if (config.app.ENV === 'production') {
        const productraw = await redis.get(`product_modify:${modifyID}`)
        if (!productraw) throw new BadRequestError('Invalid or expired request')

        const proreq = JSON.parse(productraw)
        const boundDevice = getDeviceId(req)

        if (proreq.fingerprint !== boundDevice)
          throw new BadRequestError('Invalid or expired request')

        if (!verifyPKCE(code_verifier, proreq.challenge))
          throw new BadRequestError('Invalid or expired request')
      }

      const currentProduct = await productModel.findProductById(productId)
      if (!currentProduct) throw new BadRequestError('Product not found')

      const deleted = await productModel.deleteProduct(productId)
      if (!deleted) throw new BadRequestError('Product deletion failed')

      await redis.del(`product: ${currentProduct.name}`)
      const keys = await redis.keys('products:all:*')
      if (keys.length) {
        await redis.del(...keys)
      }

      res.send({ ok: true })
    } catch (err) {
      throw err
    }
  },
}

export default productsController
