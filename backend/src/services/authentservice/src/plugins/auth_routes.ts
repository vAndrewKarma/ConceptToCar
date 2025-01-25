import { FastifyInstance, FastifySchema } from 'fastify'
import routes from '../config/routes' 

async function AuthRoutes(fastify: FastifyInstance) {
  Object.values(routes.authRoutes).forEach((route) => {
    fastify.route({
      method: route.method,
      url: route.routeName,
      handler: route.controller,
      schema: { body: route.schema } as FastifySchema
    })
  })
}

export default AuthRoutes
