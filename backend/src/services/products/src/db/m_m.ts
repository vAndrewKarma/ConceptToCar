import { FastifyInstance } from 'fastify'
import { ObjectId } from '@fastify/mongodb'
import { Collection } from 'mongodb'
export type Stage =
  | 'concept'
  | 'feasibility'
  | 'design'
  | 'production'
  | 'withdrawal'
  | 'standby'
  | 'cancelled'

export interface Product {
  _id?: ObjectId
  name: string
  stage: Stage
  description: string
  estimated_height: number
  estimated_width: number
  weight_unit: string
  width_unit: string
  height_unit: string
  estimated_weight: number
  image?: string
  createdBy: string
  created_at: Date
  updated_at: Date
}
export class ProductModel {
  private collection: Collection<Product>

  constructor(server: FastifyInstance) {
    this.collection = server.mongo.db.collection<Product>('products')
    this.collection
      .createIndex({ name: 1 }, { unique: true })
      .catch(console.error)
  }

  async createProduct(
    data: Omit<Product, '_id' | 'created_at' | 'updated_at' | 'material_number'>
  ): Promise<ObjectId> {
    try {
      const now = new Date()
      const { insertedId } = await this.collection.insertOne({
        ...data,
        created_at: now,
        updated_at: now,
      })
      return insertedId
    } catch (err) {
      console.error('Error when creating product', err)
      throw err
    }
  }

  async findProductByName(name: string): Promise<Product | null> {
    return await this.collection.findOne({ name: name })
  }

  async findProductById(id: string): Promise<Product | null> {
    return await this.collection.findOne({ _id: new ObjectId(id) })
  }
  async findProducts(page = 1, displayLimit = 15): Promise<Product[]> {
    const queryLimit = displayLimit + 1
    const skip = (page - 1) * displayLimit
    return await this.collection.find({}).skip(skip).limit(queryLimit).toArray()
  }

  async updateProduct(
    id: string,
    updateData: Partial<Omit<Product, '_id' | 'created_at'>>
  ): Promise<boolean> {
    const result = await this.collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updateData, updated_at: new Date() } }
    )
    return result.modifiedCount > 0
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await this.collection.deleteOne({ _id: new ObjectId(id) })
    return result.deletedCount > 0
  }
}

export interface ProductStageHistory {
  _id?: ObjectId
  stage: Stage
  product_id: ObjectId
  start_of_stage: Date
  name: string
}

export class ProductStageHistoryModel {
  private collection: Collection<ProductStageHistory>

  constructor(server: FastifyInstance) {
    this.collection = server.mongo.db.collection<ProductStageHistory>(
      'product_stage_history'
    )
  }

  async addStageHistory(
    record: Omit<ProductStageHistory, '_id'>
  ): Promise<ObjectId> {
    try {
      const { insertedId } = await this.collection.insertOne(record)
      return insertedId
    } catch (err) {
      console.error('Error when adding stage history', err)
      throw err
    }
  }

  async getHistoryByProductId(
    productId: string
  ): Promise<ProductStageHistory[]> {
    return await this.collection
      .find({ product_id: new ObjectId(productId) })
      .toArray()
  }
}
export interface Material {
  product_id: string
  name: string
  material_description: string
  product_name: string
  weight: number
  weight_unit: string
  length_unit: number
  width_unit: string
  height_unit: string
  qty: number
  width: number
  height: number
  created_at: Date
  updated_at: Date
}

export class MaterialModel {
  private collection: Collection<Material>

  constructor(server: FastifyInstance) {
    this.collection = server.mongo.db.collection<Material>('materials')

    this.collection
      .createIndex({ product_id: 1, name: 1 }, { unique: true })
      .catch(console.error)
  }

  async addMaterial(
    material: Omit<Material, 'created_at' | 'updated_at'>
  ): Promise<boolean> {
    try {
      const now = new Date()
      await this.collection.insertOne({
        ...material,
        created_at: now,
        updated_at: now,
      })
      return true
    } catch (err) {
      console.error('Error when adding material', err)
      return false
    }
  }

  async getMaterialsByProduct(productId: string): Promise<Material[]> {
    return await this.collection.find({ product_id: productId }).toArray()
  }
  async getMaterialByProductAndName(
    productId: string,
    materialName: string
  ): Promise<Material | null> {
    return await this.collection.findOne({
      product_id: productId,
      name: materialName,
    })
  }
  async updateMaterial(
    productId: string,
    materialName: string,
    updateData: Partial<Material>
  ): Promise<boolean> {
    const result = await this.collection.updateOne(
      { product_id: productId, name: materialName },
      { $set: { ...updateData, updated_at: new Date() } }
    )
    return result.modifiedCount > 0
  }

  async deleteMaterial(
    productId: string,
    materialName: string
  ): Promise<boolean> {
    const result = await this.collection.deleteOne({
      product_id: productId,
      name: materialName,
    })
    return result.deletedCount > 0
  }
}

export const createProductModel = (server: FastifyInstance): ProductModel =>
  new ProductModel(server)

export const createProductStageHistoryModel = (
  server: FastifyInstance
): ProductStageHistoryModel => new ProductStageHistoryModel(server)

export const createMaterialModel = (server: FastifyInstance): MaterialModel =>
  new MaterialModel(server)
