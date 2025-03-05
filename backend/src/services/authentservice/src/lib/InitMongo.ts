import fastifyMongo from '@fastify/mongodb'
import fastifyPlugin from 'fastify-plugin'
import config from '../config'
import { createUserModel } from '../db/m_m'
import { FastifyInstance } from 'fastify'

async function InitMongo(server: FastifyInstance) {
  try {
    const isProduction = config.app.ENV === 'production'
    await server.register(fastifyMongo, {
      url: config.app.DB + '?retryWrites=true&w=majority',
      forceClose: true,
      maxPoolSize: isProduction ? 200 : 50,
      socketTimeoutMS: isProduction ? 30000 : 60000,
      connectTimeoutMS: isProduction ? 5000 : 20000,
      retryWrites: true,
    })
    server.log.info(`Succesfully connected to ${config.app.DB}`)
    server.decorate('userModel', createUserModel(server))
  } catch (err) {
    process.exit(1)
  }
}

export default fastifyPlugin(InitMongo)
