import { FastifyInstance } from 'fastify'
import fastifyRedis from '@fastify/redis'
async function InitRedis(server: FastifyInstance) {
  try {
    await server.register(fastifyRedis, { url: 'redis://@auth-redis-srv:6379' })

    server.log.info('Redis initialized in development mode')
  } catch (err) {
    server.log.error(err)
  }
}
export default InitRedis
