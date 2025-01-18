import { FastifyInstance } from 'fastify'
import fastifyRedis from '@fastify/redis'
import config from '../config'
async function InitRedis(server: FastifyInstance) {
  try {
    await server.register(fastifyRedis, {
      url: 'redis-service.authenthication-service.svc.cluster.local',
      closeClient: true,
      namespace: 'authCache',
    })

    server.log.info('Redis initialized in development mode')
  } catch (err) {
    server.log.error(err)
  }
}
export default InitRedis
