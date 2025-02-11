import { BadRequestError } from '../common/errors/custom/errors'
import { publishMessage } from '../common/rabbitmq/publish'
import { rabbitConfig } from '../common/rabbitmq/queues'
import { User } from '../db/m_m'
import deleteOldTokens from '../common/helper/redis_scan'
import keyvalidation from '../helper/keyValidation'
import { createHash, createHmac } from 'crypto'
import argon2 from 'argon2'
import generateToken from '../common/helper/generateToken'
import getDeviceId from '../common/helper/getDeviceId'
import verifyPKCE from '../common/helper/verifyPKCE'
import config from '../config'
import removeOldTokensFromSet from '../common/helper/removeOldtokens'

const HMAC_SECRET = config.app.SECRET
const HMAC_ALGORITHM = 'sha256'

const authcontroller = {
  async RegisterController(req, res) {
    try {
      // TODO IMPLEMENTARE PT CARE NU AM AVUT TIMP NECESAR, SERVER SIDE EVENTS SI MUT VALIDAREA LA KEY PE SERVICE U KEYS, WILL BE ADDED  */
      const redis = req.server.redis
      const { channel } = req.server.rabbitmq
      console.log(req.headers['x-forwarded-for'] || req.ip)
      console.log(req.headers['x-forwarded-for'])
      console.log(req.ip)
      console.log(req.headers)
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
      await redis.set(`locked_key:${hashedRedisKey}`, 'proc', 'EX', '30')

      res.status(201).send({ message: 'Check your email for validation.' })
    } catch (err) {
      console.log(err)
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

      if (userfound.ip !== expectedIpHash) {
        // TODO better ip implementation, urmeaza pt mobile networks etc, actuala e foarte rigida
        throw new BadRequestError('Invalid login attempt')
      }

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
        id: userfound._id,
        role: userfound.role,
        ip: userfound.ip,
        deviceId: boundDevice,
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

      const cookieOptions = {
        secure: config.app.ENV === 'production',
        httpOnly: true,
        sameSite: 'none',
        path: '/',
      }

      res
        .setCookie(
          'access_token',
          `${accessToken}.${accessTokenHmac}`,
          cookieOptions
        )
        .setCookie(
          'refresh_token',
          `${refreshToken}.${refreshTokenHmac}`,
          cookieOptions
        )
        .setCookie('deviceId', deviceKeyPart, cookieOptions)
        .send({ message: 'Login Successful' })
    } catch (err) {
      console.log(err)
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
        300
      )
      res.send({ id: loginReqId })
    } catch (err) {
      console.log(err)
      throw err
    }
  },
  async test(req, res) {
    res.send({ ok: req.sessionData })
  },
}

export default authcontroller
