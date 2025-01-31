import { FastifyInstance } from 'fastify'
import fastifyRedis from '@fastify/redis'
import config from '../config'
async function InitRedis(server: FastifyInstance) {
  try {
    console.log(config.app.REDIS)
    await server.register(fastifyRedis, {
      url: config.app.REDIS,
      closeClient: true,
    })

    server.log.info('Redis initialized in development mode')
  } catch (err) {
    server.log.error(err)
  }
}
export default InitRedis
