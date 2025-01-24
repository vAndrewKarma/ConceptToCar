import fastify, { FastifyInstance } from 'fastify'
import helmet from '@fastify/helmet'
import cors from '@fastify/cors'
import start from '../helper/start'
import InitRedis from './InitRedis'
import InitRabbit from './InitRabbitMq'
import RouteCore from '../plugins/route_core/core'
import ErrorHandler from '../errors/handler'
export default async function fastify_loader() {
  const server: FastifyInstance = fastify({
    logger: true,
    maxParamLength: 256,
    trustProxy: true,
    bodyLimit: 1000000,
  })

  await InitRedis(server) // IMPORTANT  redis must be initialized here for plugin to boot. ( NU SCHIMBA NMK )
  await InitRabbit(server)
  await server.register(helmet)
  await server.register(cors)
  RouteCore(server)
  server.register(ErrorHandler)
  await start(server)
  return server
}
