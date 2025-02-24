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
      '/get-products',
      '/initiate_material',
      '/create-material',
      '/update-material',
      '/get-material',
      '/get-materials',
      '/delete-material',
      '/test',
    ],
  },
  SC: {
    routes: ['/health', '/', '/logout', '/metrics', '/register-key'], // sc = shouldn t care
  },
}
