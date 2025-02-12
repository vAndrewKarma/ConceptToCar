import config from '../../config'
import { createHmac, createHash } from 'crypto'
import { protected_routes } from '../../config/protected_routes'
import { BadRequestError } from '../errors/custom/errors'
import clearCookie from '../helper/clearCookies'
import generateToken from '../helper/generateToken'

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
    console.log(JSON.stringify(req.cookies))
    const isPasgRoute = protected_routes.PASG.routes.includes(req.url)
    console.log(`PASG ROUTE` + isPasgRoute)
    if (isPasgRoute) {
      if (accessToken || refreshToken) {
        throw new BadRequestError('User already authenticated')
      }
      return
    }

    if (!accessToken || !refreshToken || !deviceIdCookie) {
      clearCookie(res)
      throw new BadRequestError('Invalid authentication')
    }

    const [userid, devicebound] = deviceIdCookie.split(':')

    if (!userid || !devicebound) {
      clearCookie(res)
      throw new BadRequestError('Malformed device ID')
    }
    const clientIp = (req.headers['x-forwarded-for'] || req.ip)
      .toString()
      .split(',')[0]
      .trim()

    const expectedIpHash = createHash('sha256').update(clientIp).digest('hex')
    const [rawAccessToken, accessHmac] = accessToken.split('.')
    if (!rawAccessToken || !accessHmac) {
      clearCookie(res)
      throw new BadRequestError('Malformed access token')
    }

    const expectedAccessHmac = createHmac(HMAC_ALGORITHM, HMAC_SECRET)
      .update(rawAccessToken)
      .digest('hex')

    if (expectedAccessHmac !== accessHmac) {
      clearCookie(res)
      throw new BadRequestError('Invalid access token signature')
    }

    const sessionKey = `access_token:${deviceIdCookie}-${rawAccessToken}`
    let sessionData = await redis.get(sessionKey)

    if (!sessionData) {
      const [rawRefreshToken, refreshHmac] = refreshToken.split('.')
      if (!rawRefreshToken || !refreshHmac) {
        clearCookie(res)
        throw new BadRequestError('Malformed refresh token')
      }

      const expectedRefreshHmac = createHmac(HMAC_ALGORITHM, HMAC_SECRET)
        .update(rawRefreshToken)
        .digest('hex')

      if (expectedRefreshHmac !== refreshHmac) {
        clearCookie(res)
        throw new BadRequestError('Invalid refresh token signature')
      }

      const refreshKey = `refresh_token:${deviceIdCookie}-${rawRefreshToken}`
      sessionData = await redis.get(refreshKey)

      if (!sessionData) {
        clearCookie(res)
        throw new BadRequestError('Invalid or expired session')
      }
      sessionData = JSON.parse(sessionData)

      if (
        sessionData.deviceId !== devicebound ||
        sessionData.ip !== expectedIpHash ||
        userid !== sessionData.id
      ) {
        await redis
          .pipeline()
          .del(`refresh_token:${deviceIdCookie}-${refreshToken}`)
          .srem(
            `user_refresh_tokens:${userid}`,
            `refresh_token:${deviceIdCookie}-${refreshToken}`
          )
          .exec()

        clearCookie(res)
        throw new BadRequestError('Device or IP mismatch')
      }
      req.sessionData = sessionData
      req.auth = true
      const newAccessToken = generateToken()
      const newAccessTokenHmac = createHmac(HMAC_ALGORITHM, HMAC_SECRET)
        .update(newAccessToken)
        .digest('hex')
      const newSessionKey = `access_token:${deviceIdCookie}-${newAccessToken}`
      const refreshTokenTTL = 2592000
      const accessTokenTTL = 900
      const userAccessTokenKey = `user_access_tokens:${userid}`
      await redis
        .pipeline()
        .set(newSessionKey, JSON.stringify(sessionData), 'EX', accessTokenTTL)
        .sadd(userAccessTokenKey, newSessionKey)
        .expire(userAccessTokenKey, accessTokenTTL)
        .expire(refreshKey, refreshTokenTTL)
        .exec()

      res.setCookie('access_token', `${newAccessToken}.${newAccessTokenHmac}`, {
        secure: config.app.ENV === 'production',
        httpOnly: true,
        sameSite: 'none',
        path: '/',
      })
      return
    }

    sessionData = JSON.parse(sessionData)
    console.log(sessionData)
    console.log(sessionData.ip)
    console.log(req.headers['x-forwarded-for'] || req.ip)
    if (
      sessionData.deviceId !== devicebound ||
      sessionData.ip !== expectedIpHash ||
      userid !== sessionData.id
    ) {
      await redis
        .pipeline()
        .del(sessionKey)
        .del(`refresh_token:${deviceIdCookie}-${refreshToken}`)
        .srem(
          `user_refresh_tokens:${userid}`,
          `refresh_token:${deviceIdCookie}-${refreshToken}`
        )
        .srem(`user_access_tokens:${userid}`, sessionKey)
        .exec()
      clearCookie(res)
      throw new BadRequestError('Device or IP mismatch')
    }

    await redis.expire(sessionKey, 900)

    req.sessionData = sessionData
    req.auth = true
  } catch (err) {
    console.error(err)
    throw err
  }
}
