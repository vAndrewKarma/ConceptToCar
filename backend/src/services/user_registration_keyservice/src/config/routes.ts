import keyController from '../controllers/keyController'
import checksController from '../controllers/checkController'
import { keySchema } from '../schemas/key_validation'

const routes = {
  authRoutes: {
    register: {
      method: 'POST',
      routeName: '/register-key',
      controller: keyController.RegisterController,
      schema: keySchema,
    },
  },
  healthRoutes: {
    healthCheck: {
      method: 'GET',
      routeName: '/keys/healthz',
      controller: checksController.healthcheck,
    },
    indexCheck: {
      method: 'GET',
      routeName: '/',
      controller: checksController.healthcheck, // todo add metrics
    },
  },
}
export default routes
