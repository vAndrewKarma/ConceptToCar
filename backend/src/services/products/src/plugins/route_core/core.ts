import { FastifyInstance } from 'fastify'
import Checks from '../checks_route'
import ProductRoutes from '../product_routes'
export default function RouteCore(fastify: FastifyInstance) {
  fastify.register(ProductRoutes)
  fastify.register(Checks)
}
