import checksController from '../controllers/checkController'

const routes = {
  authRoutes: {},
  healthRoutes: {
    healthCheck: {
      method: 'GET',
      routeName: '/health',
      controller: checksController.healthcheck,
    },
    indexCheck: {
      method: 'GET',
      routeName: '/',
      controller: checksController.healthcheck,
    },
  },
  userRoute: null, // todo may not need it, vad pe viitor
}
export default routes
