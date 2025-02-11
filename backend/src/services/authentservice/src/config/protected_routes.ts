export const protected_routes = {
  PASG: {
    // protected against authenthicated users
    routes: ['/register', '/initiate_login', '/login', '/', '/health'],
  },
  PAA: {
    // protected against users that are not authenticated
    routes: ['/test'],
  },
}
