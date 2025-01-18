import fastifyMongo from '@fastify/mongodb'
import fastifyPlugin from 'fastify-plugin'
import config from '../config'

import { FastifyInstance } from 'fastify'

async function InitMongo(server: FastifyInstance) {
  try {
    const isProduction = config.app.ENV === 'kai'
    await server.register(fastifyMongo, {
      url: 'mongodb://auth-mongo-srv.authenthication-service.svc.cluster.local:27017/authenthication',
      forceClose: true,
      maxPoolSize: isProduction ? 200 : 50,
      socketTimeoutMS: isProduction ? 30000 : 60000,
      connectTimeoutMS: isProduction ? 5000 : 20000,
      retryWrites: true,
    })
    server.log.info(`Succesfully connected to ${config.app.DB}`)
  } catch (err) {
    console.log(err)
    process.exit(1)
  }
}

export default fastifyPlugin(InitMongo)
