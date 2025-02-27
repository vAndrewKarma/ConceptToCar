import fastify, { FastifyInstance, FastifyRequest } from 'fastify'
import helmet from '@fastify/helmet'
import cors from '@fastify/cors'
import start from '@karma-packages/conceptocar-common/dist/helper/start'
import ajvErrors from 'ajv-errors'
import ajvKeywords from 'ajv-keywords'
import InitRedis from './InitRedis'
import { FastifySSEPlugin } from 'fastify-sse-v2'
import InitRabbit from './InitRabbitMq'
import RouteCore from '../plugins/route_core/core'
import { ErrorHandler } from '@karma-packages/conceptocar-common'
import fastifyCookie from '@fastify/cookie'
import config from '../config'
import verifyAuth from '@karma-packages/conceptocar-common/dist/hook/authVerify'
import Initprometheus from '../move_to_common/prometheus'
declare module 'fastify' {
  interface FastifyRequest {
    startTime?: number
  }
}

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
      maxAge: 30 * 24 * 60 * 60,
      domain: '.conceptocar.xyz',
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
    allowedHeaders: ['content-type', 'accept', 'content-type'], // todo change for prod
    credentials: true,
  })

  server.addHook('preHandler', async (request, reply) => {
    await verifyAuth(request, reply, config)
  })
  server.addHook('onRequest', (request, reply, done) => {
    request.startTime = Date.now()
    done()
  })

  RouteCore(server)

  // ------------------ METRICS ------------------

  if (config.app.ENV === 'production') Initprometheus(server)

  // ----------------------------------------------

  await start(server, config)
  return server
}
