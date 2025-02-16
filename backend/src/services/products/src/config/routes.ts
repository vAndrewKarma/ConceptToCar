import { FastifySchema } from 'fastify'
import checksController from '../controllers/checkController'

interface ProductRoutes {
  method: string
  routeName: string
  controller: (req: any, res: any) => Promise<void>
  schema?: any
}

interface RouteGroup {
  [key: string]: ProductRoutes
}

const routes: Record<string, RouteGroup> = {
  product_Routes: {},
  healthRoutes: {
    healthCheck: {
      method: 'GET',
      routeName: '/health',
      controller: checksController.healthcheck,
    },
    indexCheck: {
      method: 'GET',
      routeName: '/',
      controller: checksController.healthcheck, // todo add metrics
    },
  },
  userRoute: null, // todo may not need it, vad pe viitor
}
export default routes
