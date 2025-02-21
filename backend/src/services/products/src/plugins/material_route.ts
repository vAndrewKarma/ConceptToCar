import { FastifyInstance, FastifySchema, HTTPMethods } from 'fastify'
import routes from '../config/routes'

async function material_routes(fastify: FastifyInstance) {
  Object.values(routes.material_routes).forEach((route) => {
    fastify.route({
      method: route.method as HTTPMethods,
      url: route.routeName,
      handler: route.controller,
      schema: route.schema
        ? { body: route.schema as FastifySchema }
        : undefined,
    })
  })
}

export default material_routes
