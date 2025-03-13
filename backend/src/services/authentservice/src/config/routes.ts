import { FastifySchema } from 'fastify'
import authcontroller from '../controllers/authController'
import checksController from '../controllers/checkController'
import {
  chanePassSChema,
  initiateAuthSessionSchema,
  loginSchema,
  registerSchema,
  verifyEmailSchema,
} from '../schemas/auth_validation'
interface AuthRoute {
  method: string
  routeName: string
  controller: (req: any, res: any) => Promise<void>
  schema?: any
}

interface RouteGroup {
  [key: string]: AuthRoute
}

const routes: Record<string, RouteGroup> = {
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
    verifyEmail: {
      method: 'POST',
      routeName: '/verify-email',
      controller: authcontroller.verifyYourEmail,
      schema: verifyEmailSchema,
    },
    verifyPasswordchangge: {
      method: 'POST',
      routeName: '/verify-password-change',
      controller: authcontroller.verifyLinksExist,
      schema: verifyEmailSchema,
    },
    reqEmailverify: {
      method: 'POST',
      routeName: '/request-verification',
      controller: authcontroller.requestEmailVerify,
    },
    reqPasswordChange: {
      method: 'POST',
      routeName: '/request-password-change',
      controller: authcontroller.requestPasswordChange,
    },
    changeYourPass: {
      method: 'POST',
      routeName: '/change-password',
      controller: authcontroller.changeYourPassword,
      schema: chanePassSChema,
    },
    me: {
      method: 'GET',
      routeName: '/me',
      controller: authcontroller.me,
    },
    logout: {
      method: 'POST',
      routeName: '/logout',
      controller: authcontroller.logout,
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
