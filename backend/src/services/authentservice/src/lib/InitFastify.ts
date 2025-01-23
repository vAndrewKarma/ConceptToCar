import fastify, { FastifyInstance } from 'fastify'
import helmet from '@fastify/helmet'
import cors from '@fastify/cors'
import start from '../helper/start'
import InitRedis from './InitRedis'
import InitRabbit from './InitRabbitMq'
import Checks from '../plugins/checks_route'
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
  await server.register(Checks) // de regandit cand ajung la authroutes si scheme pt auth
  await start(server)
  return server
}
