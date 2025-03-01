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
        weight_unit,
        qty,
        width_unit,
        length_unit,
        height_unit,
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
        weight_unit: sanitizeHTML(weight_unit),
        height_unit: sanitizeHTML(height_unit),

        width_unit: sanitizeHTML(width_unit),
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
  async UpdateBom(req, res) {
    try {
      if (req.sessionData.role !== 'Admin')
        throw new Unauthorized('Not authorized')

      const {
        productId,
        originalName,
        name,
        material_description,
        estimated_height,
        estimated_width,
        estimated_weight,
        weight_unit,
        qty,
        width_unit,
        height_unit,
        modifyID,
        code_verifier,
      } = req.body
      const redis = req.server.redis
      const materialModel = req.server.materialModel
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
      const sanitizedProductId = sanitizeHTML(productId)
      const sanitizedOriginalName = sanitizeHTML(originalName)
      const existingMaterial = await materialModel.getMaterialByProductAndName(
        sanitizedProductId,
        sanitizedOriginalName
      )
      if (!existingMaterial) {
        throw new BadRequestError('Material does not exist')
      }
      const updateData: { [key: string]: any } = {}
      if (name && name !== sanitizedOriginalName) {
        const sanitizedNewName = sanitizeHTML(name)
        const conflict = await materialModel.getMaterialByProductAndName(
          sanitizedProductId,
          sanitizedNewName
        )
        if (conflict) {
          throw new BadRequestError('A material with this name already exists')
        }
        updateData.name = sanitizedNewName
      }
      const fieldsToUpdate = {
        description: material_description,
        estimated_height,
        estimated_width,
        estimated_weight,
        qty,
        weight_unit,
        width_unit,
        height_unit,
      }
      const sanitizeFields = [
        'description',
        'weight_unit',
        'width_unit',
        'height_unit',
      ]
      for (const [key, value] of Object.entries(fieldsToUpdate)) {
        if (value !== undefined) {
          updateData[key] = sanitizeFields.includes(key)
            ? sanitizeHTML(value)
            : value
        }
      }
      const updated = await materialModel.updateMaterial(
        sanitizedProductId,
        sanitizedOriginalName,
        updateData
      )
      if (!updated) {
        throw new BadRequestError('Material update failed')
      }
      const updatedMaterial = {
        ...existingMaterial,
        ...updateData,
        updated_at: new Date(),
      }
      const oldCacheKey = `materials:${sanitizedProductId}:${sanitizedOriginalName}`
      const newName = updateData.name || sanitizedOriginalName
      const newCacheKey = `materials:${sanitizedProductId}:${newName}`
      const pipeline = redis.pipeline()
      pipeline
        .del(oldCacheKey)
        .set(newCacheKey, JSON.stringify(updatedMaterial), 'EX', 3600)
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
