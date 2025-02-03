import authcontroller from '../controllers/authController'
import checksController from '../controllers/checkController'
import { registerSchema } from '../schemas/auth_validation'

const routes = {
  authRoutes: {
    register: {
      method: 'POST',
      routeName: '/register',
      controller: authcontroller.RegisterController,
      schema: registerSchema,
    },
  },
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
