import config from '../config'
import { createHmac, createHash } from 'crypto'
import { protected_routes } from '../config/protected_routes'
import { BadRequestError } from '../common/errors/custom/errors'

const HMAC_ALGORITHM = 'sha256'
const HMAC_SECRET = config.app.SECRET

export default async function verifyAuth(req, res) {
  try {
    const redis = req.server.redis
    const {
      deviceId: deviceIdCookie,
      access_token: accessToken,
      refresh_token: refreshToken,
    } = req.cookies

    const isPasgRoute = protected_routes.PASG.routes.includes(req.url)

    if (isPasgRoute) {
      if (accessToken || refreshToken || deviceIdCookie) {
        throw new BadRequestError('User already authenticated')
      }
      return
    }

    if (!accessToken || !refreshToken || !deviceIdCookie) {
      throw new BadRequestError('Invalid authentication')
    }

    const [rawAccessToken, accessHmac] = accessToken.split('.')
    if (!rawAccessToken || !accessHmac) {
      throw new BadRequestError('Malformed access token')
    }

    const expectedAccessHmac = createHmac(HMAC_ALGORITHM, HMAC_SECRET)
      .update(rawAccessToken)
      .digest('hex')

    if (expectedAccessHmac !== accessHmac) {
      throw new BadRequestError('Invalid access token signature')
    }

    const sessionKey = `access_token:${deviceIdCookie}-${rawAccessToken}`
    let sessionData = await redis.get(sessionKey)

    if (!sessionData) {
      const [rawRefreshToken, refreshHmac] = refreshToken.split('.')
      if (!rawRefreshToken || !refreshHmac) {
        throw new BadRequestError('Malformed refresh token')
      }

      const expectedRefreshHmac = createHmac(HMAC_ALGORITHM, HMAC_SECRET)
        .update(rawRefreshToken)
        .digest('hex')

      if (expectedRefreshHmac !== refreshHmac) {
        throw new BadRequestError('Invalid refresh token signature')
      }

      const refreshKey = `refresh_token:${deviceIdCookie}-${rawRefreshToken}`
      sessionData = await redis.get(refreshKey)

      if (!sessionData) {
        throw new BadRequestError('Invalid or expired session')
      }

      req.autoRefresh = true
    }

    sessionData = JSON.parse(sessionData)

    const clientIp = (req.headers['x-forwarded-for'] || req.ip)
      .toString()
      .split(',')[0]
      .trim()

    const expectedIpHash = createHash('sha256').update(clientIp).digest('hex')
    if (
      sessionData.deviceId !== deviceIdCookie ||
      sessionData.ip !== expectedIpHash
    ) {
      throw new BadRequestError('Device or IP mismatch')
    }

    await redis.expire(sessionKey, 900)

    req.sessionData = sessionData
  } catch (err) {
    console.error(err)
    throw err
  }
}
