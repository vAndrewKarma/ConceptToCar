import generateToken from '@karma-packages/conceptocar-common/dist/helper/generateToken'
import getDeviceId from '@karma-packages/conceptocar-common/dist/helper/getDeviceId'
import config from '../config'
import {
  BadRequestError,
  Unauthorized,
} from '@karma-packages/conceptocar-common'
import verifyPKCE from '@karma-packages/conceptocar-common/dist/helper/verifyPKCE'

import { ObjectId } from '@fastify/mongodb'
import sanitizeHTML from '../helper/sanitizeHtml'

const productsController = {
  async CreateProduct(req, res) {
    try {
      if (req.sessionData.role !== 'Admin')
        throw new Unauthorized('Not authorized')
      const {
        name,
        description,
        modifyID,
        code_verifier,
        estimated_height,
        estimated_width,
        estimated_weight,
        weight_unit,
        width_unit,
        height_unit,
      } = req.body
      const redis = req.server.redis
      const productModel = req.server.productModel
      const productStageModel = req.server.productStageModel

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

      const pname = sanitizeHTML(name)
      if (await redis.get(`product: ${pname}`))
        throw new BadRequestError('Product already exists')

      if (await productModel.findProductByName(pname))
        throw new BadRequestError('Product already exists')

      // todo check if materials exists

      const product = {
        name: pname,
        description: sanitizeHTML(description),
        estimated_height,
        estimated_width,
        estimated_weight,
        weight_unit,
        width_unit,
        height_unit,
        stage: 'concept',
        createdBy: `dddsa dsadsa`,
      }

      const session = req.server.mongo.client.startSession()
      let productId
      try {
        await session.withTransaction(async () => {
          productId = await productModel.createProduct(product, { session })

          const historyRecord = {
            stage: 'concept',
            product_id: new ObjectId(productId),
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
      console.log(err)
      throw err
    }
  },

  async GetProduct(req, res) {
    try {
      if (!req.sessionData) throw new Unauthorized('Not authorized')
      const { name } = req.body
      const redis = req.server.redis
      const productModel = req.server.productModel
      const product = await redis.get(`product: ${name}`)
      if (product) return res.send(JSON.parse(product))

      const prodb = await productModel.findProductByName(name)
      if (!prodb) throw new BadRequestError('Product doesn t exist')
      await redis.set(`product: ${name}`, JSON.stringify(prodb), 'EX', 3600)
      res.send(prodb)
    } catch (err) {
      throw err
    }
  },
  async GetProducts(req, res) {
    try {
      if (!req.sessionData) throw new Unauthorized('Not authorized')
      const { page = 1 } = req.body
      const limit = 2
      const redis = req.server.redis
      const productModel = req.server.productModel

      const cacheKey = `products:all:page:${page}:limit:${limit}`
      const cachedProducts = await redis.get(cacheKey)

      if (cachedProducts) {
        return res.send(JSON.parse(cachedProducts))
      }

      const products = await productModel.findProducts(
        Number(page),
        Number(limit)
      )

      if (!products || products.length === 0) {
        throw new BadRequestError('No products found')
      }

      await redis.set(cacheKey, JSON.stringify(products), 'EX', 3600)

      res.send(products)
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
      console.log(err)
      throw err
    }
  },
}

export default productsController
