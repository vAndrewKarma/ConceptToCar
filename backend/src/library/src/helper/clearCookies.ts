export default function clearCookie(res) {
  res.clearCookie('deviceId', { path: '/' })
  res.clearCookie('access_token', { path: '/' })
  res.clearCookie('refresh_token', { path: '/' })
}
