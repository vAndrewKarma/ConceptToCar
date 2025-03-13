import { BadRequestError } from '@karma-packages/conceptocar-common'
import { publishMessage } from '@karma-packages/conceptocar-common'
import { rabbitConfig } from '@karma-packages/conceptocar-common'
import { User } from '../db/m_m'
import deleteOldTokens from '@karma-packages/conceptocar-common/dist/helper/redis_scan'
import keyvalidation from '../helper/keyValidation'
import { createHash, createHmac } from 'crypto'
import argon2 from 'argon2'
import generateToken from '@karma-packages/conceptocar-common/dist/helper/generateToken'
import getDeviceId from '@karma-packages/conceptocar-common/dist/helper/getDeviceId'
import verifyPKCE from '@karma-packages/conceptocar-common/dist/helper/verifyPKCE'
import config from '../config'
import removeOldTokensFromSet from '@karma-packages/conceptocar-common/dist/helper/removeOldtokens'
import clearCookie from '@karma-packages/conceptocar-common/dist/helper/clearCookies'

const HMAC_SECRET = config.app.SECRET
const HMAC_ALGORITHM = 'sha256'

const authcontroller = {
  async RegisterController(req, res) {
    try {
      // TODO IMPLEMENTARE PT CARE NU AM AVUT TIMP NECESAR, SERVER SIDE EVENTS SI MUT VALIDAREA LA KEY PE SERVICE U KEYS, WILL BE ADDED  */
      const redis = req.server.redis
      const { channel } = req.server.rabbitmq

      const user = JSON.parse(JSON.stringify(req.body)) as Omit<
        User,
        'confirmPassword'
      >

      const userModel = req.server.userModel
      if (await userModel.findUserByEmail(user.email)) {
        throw new BadRequestError('Email already registered')
      }
      const hashedRedisKey = createHash('sha256').update(user.key).digest('hex')

      await keyvalidation(user, redis)
      const clientIp = (req.headers['x-forwarded-for'] || req.ip)
        .toString()
        .split(',')[0]
        .trim()
      user.ip = createHash('sha256').update(clientIp).digest('hex')

      await publishMessage(
        channel,
        rabbitConfig.queues.AUTH_CREATE_USER_SESSION.name,
        user,
        rabbitConfig.queues.AUTH_CREATE_USER_SESSION.options
      )

      await redis
        .pipeline()
        .set(`email_validation:${user.email}`, 'pending', 'EX', 86400)
        .set(`locked_key:${hashedRedisKey}`, 'proc', 'EX', '30')
        .exec()

      res.status(201).send({ message: 'Check your email for validation.' })
    } catch (err) {
      throw err
    }
  },
  async LoginController(req, res) {
    try {
      const redis = req.server.redis

      const { email, password, loginReqId, code_verifier, rememberMe } =
        req.body

      const loginReqRaw = await redis.get(`login_request:${loginReqId}`)

      if (!loginReqRaw) throw new BadRequestError('Invalid or expired request')

      const loginReq = JSON.parse(loginReqRaw)
      const boundDevice = getDeviceId(req)

      if (loginReq.fingerprint !== boundDevice)
        throw new BadRequestError('Invalid or expired request')

      if (!verifyPKCE(code_verifier, loginReq.challenge))
        throw new BadRequestError('Invalid or expired request')

      // sesiunile de login sunt short lived, se sterg automat dupa 5 min deci nu exista vreun motiv pt care le as sterge manual

      const userModel = req.server.userModel
      const userfound = await userModel.findUserByEmail(email)

      if (!userfound) throw new BadRequestError('Invalid credentials.')
      const clientIp = (req.headers['x-forwarded-for'] || req.ip)
        .toString()
        .split(',')[0]
        .trim()
      const expectedIpHash = createHash('sha256').update(clientIp).digest('hex')

      // if (userfound.ip !== expectedIpHash) {
      // TODO better ip implementation, urmeaza pt mobile networks etc, actuala e foarte rigida
      //   throw new BadRequestError('Invalid login attempt')
      // }

      if (!(await argon2.verify(userfound.password, password)))
        throw new BadRequestError('Invalid credentials')
      const userId = userfound._id
      const accessToken = generateToken()
      const refreshToken = generateToken()

      const [accessTokenHmac, refreshTokenHmac] = [
        accessToken,
        refreshToken,
      ].map((token) =>
        createHmac(HMAC_ALGORITHM, HMAC_SECRET).update(token).digest('hex')
      )

      const sessionData = {
        email,
        firstName: userfound.firstName,
        lastName: userfound.lastName,
        verified: userfound.verified,
        id: userfound._id,
        role: userfound.role,
        ip: req.headers['x-forwarded-for'] || req.ip,
        deviceId: boundDevice,
        createdAt: userfound.createdAt,
      }

      const deviceKeyPart = `${userId}:${boundDevice}`
      const userTokenKey = `user_refresh_tokens:${userId}`
      const userAccessTokenKey = `user_access_tokens:${userId}`
      const refreshTokenTTL = rememberMe ? 2592000 : 604800
      const accessTokenTTL = 900

      await Promise.all([
        // TODO MOVE THEM TO KEYSERVICE
        deleteOldTokens(redis, `refresh_token:${deviceKeyPart}-*`),
        deleteOldTokens(redis, `access_token:${deviceKeyPart}-*`),
        removeOldTokensFromSet(
          redis,
          userAccessTokenKey,
          `access_token:${deviceKeyPart}-*`
        ),
        removeOldTokensFromSet(
          redis,
          userTokenKey,
          `refresh_token:${deviceKeyPart}-*`
        ),
      ])

      await redis
        .pipeline()
        .set(
          `access_token:${deviceKeyPart}-${accessToken}`,
          JSON.stringify(sessionData),
          'EX',
          accessTokenTTL
        )
        .set(
          `refresh_token:${deviceKeyPart}-${refreshToken}`,
          JSON.stringify(sessionData),
          'EX',
          refreshTokenTTL
        )
        .sadd(userTokenKey, `refresh_token:${deviceKeyPart}-${refreshToken}`)
        .sadd(
          userAccessTokenKey,
          `access_token:${deviceKeyPart}-${accessToken}`
        )
        .expire(userTokenKey, refreshTokenTTL)
        .expire(userAccessTokenKey, accessTokenTTL)
        .exec()

      res
        .setCookie('access_token', `${accessToken}.${accessTokenHmac}`, {
          httpOnly: true,
          secure: true,
          sameSite: 'none',
          path: '/',
          maxAge: 30 * 24 * 60 * 60 * 1000,
          domain: '.conceptocar.xyz',
        })
        .setCookie('refresh_token', `${refreshToken}.${refreshTokenHmac}`, {
          httpOnly: true,
          secure: true,
          sameSite: 'none',
          path: '/',
          maxAge: 30 * 24 * 60 * 60 * 1000,
          domain: '.conceptocar.xyz',
        })
        .setCookie('deviceId', deviceKeyPart, {
          httpOnly: true,
          secure: true,
          sameSite: 'none',
          path: '/',
          maxAge: 30 * 24 * 60 * 60 * 1000,
          domain: '.conceptocar.xyz',
        })
        .send({ message: 'Login Successful' })
    } catch (err) {
      throw err
    }
  },

  async InitiateAuthSession(req, res) {
    try {
      const { challenge } = JSON.parse(JSON.stringify(req.body))
      const loginReqId = generateToken(16)
      const redis = req.server.redis
      const fingerprint = getDeviceId(req)
      await redis.set(
        `login_request:${loginReqId}`,
        JSON.stringify({ challenge, fingerprint }),
        'EX',
        config.app.ENV === 'production' ? 90 : 300
      )
      res.send({ id: loginReqId })
    } catch (err) {
      throw err
    }
  },

  async verifyYourEmail(req, res) {
    try {
      const redis = req.server.redis

      const usermodel = req.server.userModel
      console.log(JSON.stringify(req.body))
      const { code } = req.body
      const key = `email_validation:${code}`
      console.log(key)
      const emailredis = await redis.get(key)
      console.log(emailredis)
      if (!emailredis) throw new BadRequestError('Invalid or expired key')
      const user = await usermodel.findUserByEmail(emailredis)
      console.log(user)
      if (!user) throw new BadRequestError('Invalid or expired')
      if (user.verified) throw new BadRequestError('Email already verified')
      clearCookie(res)
      await usermodel.updateUser(user._id, { verified: true })
      await redis.del(key)
      res.send({ message: 'Email verified' })
    } catch (err) {
      throw err
    }
  },

  async requestEmailVerify(req, res) {
    try {
      const redis = req.server.redis
      const email = req.sessionData.email
      const userModel = req.server.userModel
      const user = await userModel.findUserByEmail(email)
      if (!user) {
        throw new BadRequestError('Email not registered')
      }

      const verificationCode = generateToken(20)
      await redis.set(
        `email_validation:${verificationCode}`,
        email,
        'EX',
        86400
      )

      const { channel } = req.server.rabbitmq
      await publishMessage(
        channel,
        rabbitConfig.queues.AUTH_SEND_EMAIL_VALIDATION.name,
        {
          to: email,
          subject: 'Email Validation',
          body: `Please click the following link to verify your email address: https://conceptocar.xyz/email-verification/${verificationCode}`,
        },
        rabbitConfig.queues.AUTH_SEND_EMAIL_VALIDATION.options
      )
      res.send({ message: 'Verification email sent' })
    } catch (err) {
      throw err
    }
  },

  async me(req, res) {
    try {
      if (!req.sessionData) return res.send({ auth: false })
      res.send({ auth: true, session: req.sessionData })
    } catch (err) {
      throw err
    }
  },
  async logout(req, res) {
    try {
      const redis = req.server.redis
      const {
        deviceId: deviceIdCookie,
        access_token: accessToken,
        refresh_token: refreshToken,
      } = req.cookies

      if (!deviceIdCookie || !accessToken || !refreshToken) {
        clearCookie(res)
        throw new BadRequestError('Malformed request')
      }

      const [rawAccessToken, accessHmac] = accessToken.split('.')

      if (!rawAccessToken || !accessHmac) {
        clearCookie(res)
        throw new BadRequestError('Malformed access token')
      }
      const [userid, devicebound] = deviceIdCookie.split(':')

      if (!userid || !devicebound) {
        clearCookie(res)
        throw new BadRequestError('Malformed device ID')
      }
      const sessionKey = `access_token:${deviceIdCookie}-${rawAccessToken}`
      const [rawRefreshToken, refreshHmac] = refreshToken.split('.')
      if (!rawRefreshToken || !refreshHmac) {
        clearCookie(res)
        throw new BadRequestError('Malformed refresh token')
      }
      const refreshKey = `refresh_token:${deviceIdCookie}-${rawRefreshToken}`
      await redis
        .pipeline()
        .del(refreshKey)
        .srem(`user_refresh_tokens:${userid}`, refreshKey)
        .exec()
      await redis
        .pipeline()
        .del(sessionKey)
        .srem(`user_access_tokens:${userid}`, sessionKey)
        .exec()

      clearCookie(res)
      res.send({ message: 'Logged out' })
    } catch (err) {
      throw err
    }
  },
}

export default authcontroller
