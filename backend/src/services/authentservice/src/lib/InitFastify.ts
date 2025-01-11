import fastify, { FastifyInstance } from 'fastify'
import helmet from '@fastify/helmet'
import cors from '@fastify/cors'
import start from '../helper/start'
export default async function fastify_loader() {
  const server: FastifyInstance = fastify({
    logger: true,
    maxParamLength: 256,
    trustProxy: true,
    bodyLimit: 1000000,
  })
  await server.register(helmet)
  await server.register(cors)
  await start(server)
  server.get('/', function (request, reply) {
    request.log.info(
      'includes request information, but is the same logger instance as `log`'
    )
    reply.send({ hello: 'world' })
  })
  return server
}
