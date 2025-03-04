import generateToken from '@karma-packages/conceptocar-common/dist/helper/generateToken'
import getDeviceId from '@karma-packages/conceptocar-common/dist/helper/getDeviceId'
import config from '../config'
import {
  BadRequestError,
  Unauthorized,
} from '@karma-packages/conceptocar-common'
import verifyPKCE from '@karma-packages/conceptocar-common/dist/helper/verifyPKCE'
import { createMaterialModel } from '../db/m_m'
import sanitizeHTML from '../helper/sanitizeHtml'

const MaterialsController = {
  async CreateBom(req, res) {
    try {
      if (req.sessionData.role !== 'Admin')
        throw new Unauthorized('Not authorized')
      const {
        name,
        material_description,
        modifyID,
        code_verifier,
        estimated_height,
        estimated_width,
        estimated_weight,
        qty,
        length_unit,
        productId,
        productName,
      } = req.body
      const redis = req.server.redis
      const materialModel = req.server.materialModel
      const product = req.server.productModel
      if (config.app.ENV === 'production') {
        const bomraw = await redis.get(`bom_modify:${modifyID}`)
        if (!bomraw) throw new BadRequestError('Invalid or expired request')
        const proreq = JSON.parse(bomraw)
        const boundDevice = getDeviceId(req)
        if (proreq.fingerprint !== boundDevice)
          throw new BadRequestError('Invalid or expired request')
        if (!verifyPKCE(code_verifier, proreq.challenge))
          throw new BadRequestError('Invalid or expired request')
      }
      if (
        await redis.get(
          `materials:${sanitizeHTML(productId)}:${sanitizeHTML(name)}`
        )
      )
        throw new BadRequestError('A material with this name already exists')
      if (!(await redis.get(`product: ${productName}`)))
        if (!(await product.findProductById(productId)))
          throw new BadRequestError('Product doesnt exist')
      if (
        await materialModel.getMaterialByProductAndName(
          productId,
          sanitizeHTML(name)
        )
      )
        throw new BadRequestError('A material with this name already exists')
      const material = {
        name: sanitizeHTML(name),
        description: sanitizeHTML(material_description),
        estimated_height: estimated_height,
        estimated_width: estimated_width,
        estimated_weight: estimated_weight,
        length_unit: length_unit,
        qty: qty,
        weight_unit: 'kg',
        height_unit: 'cm',

        width_unit: 'cm',
        product_id: sanitizeHTML(productId),
        product_name: sanitizeHTML(productName),
      }
      await materialModel.addMaterial(material)
      const pipeline = redis.pipeline()
      pipeline.set(
        `materials:${sanitizeHTML(productId)}:${sanitizeHTML(name)}`,
        JSON.stringify(material),
        'EX',
        3600
      )
      const keys = await redis.keys('materials_lists:*')
      if (keys.length) {
        pipeline.del(...keys)
      }
      await pipeline.exec()
      res.send(200)
    } catch (err) {
      console.log(err)
      throw err
    }
  },
  async GetMaterial(req, res) {
    try {
      if (!req.sessionData) throw new Unauthorized('Not authorized')
      const { productId, name } = req.body
      const redis = req.server.redis
      const materialModel = req.server.materialModel
      const cacheKey = `materials:${sanitizeHTML(productId)}:${sanitizeHTML(
        name
      )}`
      const cachedMaterial = await redis.get(cacheKey)
      if (cachedMaterial) return res.send(JSON.parse(cachedMaterial))
      const material = await materialModel.getMaterialByProductAndName(
        productId,
        name
      )
      if (!material) throw new BadRequestError('Material does not exist')
      await redis.set(cacheKey, JSON.stringify(material), 'EX', 3600)
      res.send(material)
    } catch (err) {
      throw err
    }
  },
  async GetMaterials(req, res) {
    try {
      if (!req.sessionData) throw new Unauthorized('Not authorized')
      const { productId, page = 1 } = req.body
      const limit = 15
      const redis = req.server.redis
      const materialModel = req.server.materialModel
      const cacheKey = `materials_lists:${productId}:page:${page}:limit:${limit}`
      const cachedMaterials = await redis.get(cacheKey)
      if (cachedMaterials) return res.send(JSON.parse(cachedMaterials))
      const materials = await materialModel.getMaterialsByProduct(productId)
      if (!materials || materials.length < 1) {
        throw new BadRequestError('No materials found')
      }
      const startIndex = (page - 1) * limit
      const paginatedMaterials = materials.slice(startIndex, startIndex + limit)
      await redis.set(cacheKey, JSON.stringify(paginatedMaterials), 'EX', 3600)
      res.send(paginatedMaterials)
    } catch (err) {
      throw err
    }
  },
  async UpdateProduct(req, res) {
    try {
      if (!req.sessionData) throw new Unauthorized('Not authorized')
      const userRole = req.sessionData.role
      // Only allow known roles to update:
      if (
        !['Admin', 'Designer', 'Seller', 'Portfolio Manager'].includes(userRole)
      ) {
        throw new Unauthorized('Not authorized')
      }

      const {
        productId,
        name,
        description,
        estimated_height,
        estimated_width,
        estimated_weight,
        weight_unit,
        width_unit,
        height_unit,
      } = req.body

      const redis = req.server.redis
      const productModel = req.server.productModel

      const currentProduct = await productModel.findProductById(productId)
      if (!currentProduct) throw new BadRequestError('Product not found')

      // Set allowed fields based on role.
      // Designers can only update dimensions and weight related fields.
      let allowedFields
      if (userRole === 'Designer') {
        allowedFields = [
          'estimated_height',
          'estimated_width',
          'estimated_weight',
          'weight_unit',
          'width_unit',
          'height_unit',
        ]
      } else {
        // Admin, Seller, Portfolio Manager may update everything.
        allowedFields = [
          'name',
          'description',
          'estimated_height',
          'estimated_width',
          'estimated_weight',
          'weight_unit',
          'width_unit',
          'height_unit',
        ]
      }

      // Optionally, if disallowed fields are provided, throw an error.
      const disallowed = []
      if (name && !allowedFields.includes('name')) disallowed.push('name')
      if (description && !allowedFields.includes('description'))
        disallowed.push('description')
      if (disallowed.length) {
        throw new Unauthorized(
          `Not authorized to update fields: ${disallowed.join(', ')}`
        )
      }

      // Build the update data based only on allowed fields.
      interface UpdateData {
        name?: string
        description?: string
        estimated_height?: number
        estimated_width?: number
        estimated_weight?: number
        weight_unit?: string
        width_unit?: string
        height_unit?: string
      }

      const updateData: UpdateData = {}

      if (name && allowedFields.includes('name')) {
        const sanitizedName = sanitizeHTML(name)
        if (sanitizedName !== currentProduct.name) {
          if (
            (await redis.get(`product: ${sanitizedName}`)) ||
            (await productModel.findProductByName(sanitizedName))
          ) {
            throw new BadRequestError('Product already exists with this name')
          }
          updateData.name = sanitizedName
        }
      }

      if (description && allowedFields.includes('description')) {
        updateData.description = sanitizeHTML(description)
      }
      if (
        estimated_height !== undefined &&
        allowedFields.includes('estimated_height')
      ) {
        updateData.estimated_height = estimated_height
      }
      if (
        estimated_width !== undefined &&
        allowedFields.includes('estimated_width')
      ) {
        updateData.estimated_width = estimated_width
      }
      if (
        estimated_weight !== undefined &&
        allowedFields.includes('estimated_weight')
      ) {
        updateData.estimated_weight = estimated_weight
      }
      if (weight_unit !== undefined && allowedFields.includes('weight_unit')) {
        updateData.weight_unit = weight_unit
      }
      if (width_unit !== undefined && allowedFields.includes('width_unit')) {
        updateData.width_unit = width_unit
      }
      if (height_unit !== undefined && allowedFields.includes('height_unit')) {
        updateData.height_unit = height_unit
      }

      const updated = await productModel.updateProduct(productId, updateData)
      if (!updated) throw new BadRequestError('Product update failed')

      // Clear related redis cache.
      await redis.del(`product: ${currentProduct.name}`)
      if (updateData.name) {
        await redis.del(`product: ${updateData.name}`)
      }
      const keys = await redis.keys('products:all:*')
      if (keys.length) {
        await redis.del(...keys)
      }

      res.send({ ok: true })
    } catch (err) {
      throw err
    }
  },

  async BomModify(req, res) {
    try {
      if (!req.sessionData) throw new Unauthorized('Not authorized')
      const { challenge } = JSON.parse(JSON.stringify(req.body))
      const modifyID = generateToken(16)
      const redis = req.server.redis
      const fingerprint = getDeviceId(req)
      await redis.set(
        `bom_modify:${modifyID}`,
        JSON.stringify({ challenge, fingerprint }),
        'EX',
        config.app.ENV === 'production' ? 90 : 300
      )
      res.send({ id: modifyID })
    } catch (err) {
      console.log(err)
      throw err
    }
  },
  async DeleteMaterial(req, res) {
    try {
      if (req.sessionData.role !== 'Admin')
        throw new Unauthorized('Not authorized')
      const { productId, name, modifyID, code_verifier } = req.body
      const redis = req.server.redis
      const materialModel = req.server.materialModel
      console.log('exec1')
      console.log(req.body)
      console.log(JSON.stringify(req.body))
      console.log(modifyID)
      if (config.app.ENV === 'production') {
        const bomraw = await redis.get(`bom_modify:${modifyID}`)
        console.log(bomraw)
        console.log('exec2')
        if (!bomraw) throw new BadRequestError('Invalid or expired request')
        const proreq = JSON.parse(bomraw)
        console.log('exec3')
        const boundDevice = getDeviceId(req)
        if (proreq.fingerprint !== boundDevice)
          throw new BadRequestError('Invalid or expired request')
        console.log('exec4')
        if (!verifyPKCE(code_verifier, proreq.challenge))
          throw new BadRequestError('Invalid or expired request')
        console.log('exec5')
      }
      const sanitizedProductId = sanitizeHTML(productId)
      const sanitizedName = sanitizeHTML(name)
      const existingMaterial = await materialModel.getMaterialByProductAndName(
        sanitizedProductId,
        sanitizedName
      )
      if (!existingMaterial)
        throw new BadRequestError('Material does not exist')
      const deleted = await materialModel.deleteMaterial(
        sanitizedProductId,
        sanitizedName
      )
      if (!deleted) throw new BadRequestError('Material deletion failed')
      const cacheKey = `materials:${sanitizedProductId}:${sanitizedName}`
      const pipeline = redis.pipeline()
      pipeline.del(cacheKey)
      const keys = await redis.keys(`materials_lists:*`)
      if (keys.length) pipeline.del(...keys)
      await pipeline.exec()
      res.send(200)
    } catch (err) {
      console.log(err)
      throw err
    }
  },
}

export default MaterialsController
