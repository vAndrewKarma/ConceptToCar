import { FastifyInstance, FastifySchema, HTTPMethods } from 'fastify'
import routes from '../config/routes'

async function product_Routes(fastify: FastifyInstance) {
  Object.values(routes.product_Routes).forEach((route) => {
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

export default product_Routes
