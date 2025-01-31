import { FastifyInstance } from 'fastify'
import Checks from '../checks_route'
import keyRoutes from '../key_routes'
export default function RouteCore(fastify: FastifyInstance) {
  fastify.register(keyRoutes)
  fastify.register(Checks)
}
