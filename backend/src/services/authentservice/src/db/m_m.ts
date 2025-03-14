import { FastifyInstance } from 'fastify'
import { ObjectId } from '@fastify/mongodb'
import { Collection } from 'mongodb'
import argon2 from 'argon2' // dc nu bcrypt? simple, performanta, resistent to hardware attacks si e mai future-proof

interface Roles {
  enum: 'Admin' | 'Designer' | 'Seller' | 'Portfolio Manager'
}

/**
 * Modele si metode, sa vedem cum ma mai complic si cu mq-ul dar mai e pana acl
 */
interface User {
  _id?: ObjectId
  email: string
  firstName: string
  lastName: string
  password: string
  key: string
  role: Roles
  ip: string
  verified: boolean
  createdAt: Date
  updatedAt: Date
}

class UserModel {
  private collection: Collection<User>
  constructor(server: FastifyInstance) {
    this.collection = server.mongo.db.collection<User>('users')
  }

  async createUser(D_user: Omit<User, '_id' | 'createdAt' | 'updatedAt'>) {
    try {
      const password = await argon2.hash(D_user.password, {
        memoryCost: 2 ** 15,
        timeCost: 2,
        parallelism: 2,
        type: argon2.argon2id,
      })

      const user: User = {
        role: D_user.role,
        firstName: D_user.firstName,
        lastName: D_user.lastName,
        email: D_user.email.toLowerCase(), // todo may not need it (depends on the use case)
        createdAt: new Date(),
        updatedAt: new Date(),
        password: password,
        verified: false,
        key: D_user.key,
        ip: D_user.ip,
      }
      const { insertedId } = await this.collection.insertOne(user)
      return insertedId
    } catch (err) {
      console.error('Error when creating acc', err)
      throw err
    }
  }
  async countUsers(): Promise<number> {
    return await this.collection.countDocuments({})
  }
  async findUserById(uid: string): Promise<User | null> {
    return await this.collection.findOne({ _id: new ObjectId(uid) })
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return await this.collection.findOne({ email: email.toLowerCase() })
  }

  async updateUser(
    uid: string,
    updateData: Partial<Omit<User, '_id' | 'createdAt'>>
  ): Promise<boolean> {
    const result = await this.collection.updateOne(
      { _id: new ObjectId(uid) },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      }
    )
    return result.modifiedCount > 0
  }

  async deleteUser(userId: string): Promise<boolean> {
    const result = await this.collection.deleteOne({
      _id: new ObjectId(userId),
    })
    return result.deletedCount > 0
  }
}
function createUserModel(server: FastifyInstance): UserModel {
  return new UserModel(server)
}

export { createUserModel, User }
