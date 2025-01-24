import { FastifyInstance } from 'fastify'
import Checks from '../checks_route'
import AuthRoutes from '../auth_routes'
export default function RouteCore(fastify: FastifyInstance) {
  fastify.register(AuthRoutes)
  fastify.register(Checks)
}
