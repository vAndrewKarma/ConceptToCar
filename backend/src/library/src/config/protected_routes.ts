export const protected_routes = {
  PASG: {
    // protected against authenthicated users
    routes: ['/register', '/initiate_login', '/login'],
  },
  PAA: {
    // protected against users that are not authenticated
    routes: ['/test'],
  },
  SC: {
    routes: ['/health', '/', '/logout', '/metrics'], // sc = shouldn t care
  },
}
