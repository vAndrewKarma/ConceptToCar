import { FastifyInstance } from 'fastify'
import routes from '../config/routes'
async function Checks(fastify: FastifyInstance) {
  Object.values(routes.healthRoutes).forEach((route) => {
    fastify.route({
      method: route.method,
      url: route.routeName,
      handler: route.controller,
    })
  })
}

export default Checks
