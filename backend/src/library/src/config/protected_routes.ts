// not the safest prob but it works for now

export const protected_routes = {
  PASG: {
    // protected against authenthicated users
    routes: ['/register', '/initiate_login', '/login'],
  },
  PAA: {
    // protected against users that are not authenticated
    routes: [
      '/initiate_product',
      '/create-product',
      '/get-product',
      '/request-verification',
      '/get-products',
      '/initiate_material',
      '/create-material',
      '/dashboard',
      '/user-dash',
      '/update-material',
      '/get-material',
      '/get-materials',
      '/delete-material',
      '/test',
    ],
  },
  SC: {
    routes: [
      '/health',
      '/',
      '/request-password-change',
      '/verify-password-change',
      '/change-password',
      '/logout',
      '/metrics',
      '/register-key',
      '/verify-email',
    ], // sc = shouldn t  care
  },
}
