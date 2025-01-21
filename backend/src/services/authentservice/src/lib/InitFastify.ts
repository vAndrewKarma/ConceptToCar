import fastify, { FastifyInstance } from 'fastify'
import helmet from '@fastify/helmet'
import cors from '@fastify/cors'
import start from '../helper/start'
import InitRedis from './InitRedis'
import InitRabbit from './InitRabbitMq'
import config from '../config'
export default async function fastify_loader() {
  console.log(config.app.ENV)
  console.log(config.app.ENV)
  console.log(config.app.ENV)
  console.log(config.app.DB)
  console.log(config.app.MQ)
  console.log(config.app.REDIS)
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
  await start(server)
  server.get('/health', function (request, reply) {
    request.log.info(
      'includes request information, but is the same logger instance as `log`'
    )
    reply.send({ hello: 'worldz' })
  })
  server.get('/', function (request, reply) {
    request.log.info(
      'includes request information, but is the same logger instance as `log`'
    )
    reply.send({ hello: 'world' })
  })
  return server
}
