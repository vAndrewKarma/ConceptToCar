export default function clearCookie(req) {
  req.clearCookie('deviceId', { path: '/' })
  req.clearCookie('access_token', { path: '/' })
  req.clearCookie('refresh_token', { path: '/' })
}
