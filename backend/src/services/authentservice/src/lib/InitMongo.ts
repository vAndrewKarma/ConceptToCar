import mongoose from 'mongoose'
import config from '../config'

import { FastifyInstance } from 'fastify';

export default async function InitMongo(server: FastifyInstance) {
  try {
    const { connection } = await mongoose.connect(
      `mongodb://auth-mongo-srv:27017/authenthication`
    )
    server.log.info(`Succesfully connected ${connection.db.databaseName}`)
  } catch (err) {
    console.log(err)
    process.exit(1)
  }
}
