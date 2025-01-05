import fastifyMongo from '@fastify/mongodb'
import fastifyPlugin from 'fastify-plugin'
import config from '../config'

import { FastifyInstance } from 'fastify'

async function InitMongo(server: FastifyInstance) {
  try {
    await server.register(fastifyMongo, {
      url: config.app.DB,
      forceClose: true,
      maxPoolSize: 100,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      //  tls: true,
    })
    server.log.info(`Succesfully connected to ${config.app.DB}`)
  } catch (err) {
    console.log(err)
    process.exit(1)
  }
}

export default fastifyPlugin(InitMongo)
