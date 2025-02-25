import { FastifyInstance } from 'fastify'
import Checks from '../checks_route'
import ProductRoutes from '../product_routes'
import material_routes from '../material_route'
export default function RouteCore(fastify: FastifyInstance) {
  
  fastify.register(ProductRoutes)
  fastify.register(Checks)
  fastify.register(material_routes)
}
