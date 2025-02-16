import { FastifyInstance } from 'fastify'
import { ObjectId } from '@fastify/mongodb'
import { Collection } from 'mongodb'

export interface Product {
  _id?: ObjectId
  name: string
  description: string
  estimated_height: number
  estimated_width: number
  estimated_weight: number
  bom_id: ObjectId
}

export class ProductModel {
  private collection: Collection<Product>
  constructor(server: FastifyInstance) {
    this.collection = server.mongo.db.collection<Product>('products')
  }

  async createProduct(data: Omit<Product, '_id'>): Promise<ObjectId> {
    try {
      const { insertedId } = await this.collection.insertOne({ ...data })
      return insertedId
    } catch (err) {
      console.error('Error when creating product', err)
      throw err
    }
  }

  async findProductById(id: string): Promise<Product | null> {
    return await this.collection.findOne({ _id: new ObjectId(id) })
  }

  async updateProduct(
    id: string,
    updateData: Partial<Product>
  ): Promise<boolean> {
    const result = await this.collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    )
    return result.modifiedCount > 0
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await this.collection.deleteOne({ _id: new ObjectId(id) })
    return result.deletedCount > 0
  }
}

export type Stage =
  | 'concept'
  | 'fezabilitate'
  | 'proiectare'
  | 'productie'
  | 'retragere'
  | 'stand by'
  | 'cancel'

export interface ProductStageHistory {
  _id?: ObjectId
  stage: Stage
  product_id: ObjectId
  start_of_stage: Date
  user_id: string
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

export interface BOMItem {
  bom_id: ObjectId
  material_number: string
  qty: number
  unit_measure_code: string
}

export class BOMModel {
  private collection: Collection<BOMItem>
  constructor(server: FastifyInstance) {
    this.collection = server.mongo.db.collection<BOMItem>('boms')
  }

  async addBOMItem(item: BOMItem): Promise<boolean> {
    try {
      await this.collection.insertOne(item)
      return true
    } catch (err) {
      console.error('Error when adding BOM item', err)
      return false
    }
  }

  async getBOMItemsByBomId(bomId: string): Promise<BOMItem[]> {
    return await this.collection.find({ bom_id: new ObjectId(bomId) }).toArray()
  }

  async updateBOMItem(
    bomId: string,
    material_number: string,
    updateData: Partial<BOMItem>
  ): Promise<boolean> {
    const result = await this.collection.updateOne(
      { bom_id: new ObjectId(bomId), material_number },
      { $set: updateData }
    )
    return result.modifiedCount > 0
  }

  async deleteBOMItem(
    bomId: string,
    material_number: string
  ): Promise<boolean> {
    const result = await this.collection.deleteOne({
      bom_id: new ObjectId(bomId),
      material_number,
    })
    return result.deletedCount > 0
  }
}

export interface BOMMaterial {
  material_number: string
  material_description: string
  weight: number
  width: number
  height: number
}

export class BOMMaterialModel {
  private collection: Collection<BOMMaterial>
  constructor(server: FastifyInstance) {
    this.collection = server.mongo.db.collection<BOMMaterial>('bom_materials')
  }

  async addBOMMaterial(material: BOMMaterial): Promise<boolean> {
    try {
      await this.collection.insertOne(material)
      return true
    } catch (err) {
      console.error('Error when adding BOM material', err)
      return false
    }
  }

  async getBOMMaterial(material_number: string): Promise<BOMMaterial | null> {
    return await this.collection.findOne({ material_number })
  }

  async updateBOMMaterial(
    material_number: string,
    updateData: Partial<BOMMaterial>
  ): Promise<boolean> {
    const result = await this.collection.updateOne(
      { material_number },
      { $set: updateData }
    )
    return result.modifiedCount > 0
  }

  async deleteBOMMaterial(material_number: string): Promise<boolean> {
    const result = await this.collection.deleteOne({ material_number })
    return result.deletedCount > 0
  }
}

export interface Material {
  _id?: ObjectId
  email: string
  name: string
}

export class MaterialModel {
  private collection: Collection<Material>
  constructor(server: FastifyInstance) {
    this.collection = server.mongo.db.collection<Material>('materials')
  }

  async createMaterial(data: Omit<Material, '_id'>): Promise<ObjectId> {
    try {
      const { insertedId } = await this.collection.insertOne({ ...data })
      return insertedId
    } catch (err) {
      console.error('Error when creating material', err)
      throw err
    }
  }

  async findMaterialById(id: string): Promise<Material | null> {
    return await this.collection.findOne({ _id: new ObjectId(id) })
  }

  async updateMaterial(
    id: string,
    updateData: Partial<Material>
  ): Promise<boolean> {
    const result = await this.collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    )
    return result.modifiedCount > 0
  }

  async deleteMaterial(id: string): Promise<boolean> {
    const result = await this.collection.deleteOne({ _id: new ObjectId(id) })
    return result.deletedCount > 0
  }
}

export const createProductModel = (server: FastifyInstance): ProductModel =>
  new ProductModel(server)

export const createProductStageHistoryModel = (
  server: FastifyInstance
): ProductStageHistoryModel => new ProductStageHistoryModel(server)

export const createBOMModel = (server: FastifyInstance): BOMModel =>
  new BOMModel(server)

export const createBOMMaterialModel = (
  server: FastifyInstance
): BOMMaterialModel => new BOMMaterialModel(server)

export const createMaterialModel = (server: FastifyInstance): MaterialModel =>
  new MaterialModel(server)
