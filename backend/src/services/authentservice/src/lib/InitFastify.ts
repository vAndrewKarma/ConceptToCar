import fastify, { FastifyInstance } from 'fastify'
import helmet from '@fastify/helmet'
import cors from '@fastify/cors'
import start from '../common/helper/start'
import ajvErrors from 'ajv-errors'
import ajvKeywords from 'ajv-keywords'
import InitRedis from './InitRedis'
import { FastifySSEPlugin } from 'fastify-sse-v2'
import InitRabbit from './InitRabbitMq'
import RouteCore from '../plugins/route_core/core'
import { ErrorHandler } from '../common/errors/handler'
import fastifyCookie from '@fastify/cookie'
import config from '../config'
import verifyAuth from '../common/hook/authVerify'
export default async function fastify_loader() {
  const server: FastifyInstance = fastify({
    logger: true,
    maxParamLength: 256,
    trustProxy: true,
    bodyLimit: 1000000,
    ajv: {
      customOptions: {
        allErrors: true,
        useDefaults: true,
        messages: true,
        $data: true,
      },
      plugins: [ajvKeywords, ajvErrors],
    },
  })

  await server.register(fastifyCookie, {
    secret: 'secret', // TODO add env variable to change it
    hook: 'onRequest',
    parseOptions: {
      httpOnly: true,
      secure: config.app.ENV === 'production',
      sameSite: 'none',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 7 days in seconds
    },
  })
  const allowedOrigins = ['http://localhost:5173', 'https://conceptocar.xyz/']

  ErrorHandler(server)
  await InitRedis(server) // IMPORTANT  redis must be initialized here for plugin to boot. ( NU SCHIMBA NMK )
  await InitRabbit(server)
  await server.register(FastifySSEPlugin)
  await server.register(helmet)
  await server.register(cors, {
    origin: true,
    methods: ['GET', 'PUT', 'POST', 'DELETE'],
    allowedHeaders: ['content-type', 'accept', 'content-type'],
    credentials: true,
  })
  // todo change for prod
  server.addHook('preHandler', verifyAuth)
  RouteCore(server)

  await start(server)
  return server
}
