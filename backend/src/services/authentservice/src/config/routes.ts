import authcontroller from '../controllers/authController'
import checksController from '../controllers/checkController'
import {
  initiateAuthSessionSchema,
  loginSchema,
  registerSchema,
} from '../schemas/auth_validation'

const routes = {
  authRoutes: {
    register: {
      method: 'POST',
      routeName: '/register',
      controller: authcontroller.RegisterController,
      schema: registerSchema,
    },
    login: {
      method: 'POST',
      routeName: '/login',
      controller: authcontroller.LoginController,
      schema: loginSchema,
    },
    initiateLogin: {
      method: 'POST',
      routeName: '/initiate_login',
      controller: authcontroller.InitiateAuthSession,
      schema: initiateAuthSessionSchema,
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
