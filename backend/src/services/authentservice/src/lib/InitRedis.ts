import { FastifyInstance } from 'fastify'
import fastifyRedis from '@fastify/redis'
import config from '../config'
async function InitRedis(server: FastifyInstance) {
  try {

    console.log(config.app.REDIS)
    await server.register(fastifyRedis, {
      url: "redis://auth-redis-srv:6379",
      closeClient: true,
      namespace: 'authCache',
    })

    server.log.info('Redis initialized in development mode')
  } catch (err) {
    server.log.error(err)
  }
}
export default InitRedis
