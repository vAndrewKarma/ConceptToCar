export default function clearCookie(res) {
  const cookieOptions = {
    path: '/',
    domain: '.conceptocar.xyz',
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  }

  res.clearCookie('deviceId', cookieOptions)
  res.clearCookie('access_token', cookieOptions)
  res.clearCookie('refresh_token', cookieOptions)

  console.log('Cookies cleared')
}
