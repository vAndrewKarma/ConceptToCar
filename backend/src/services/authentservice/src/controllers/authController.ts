import { BadRequestError } from '../common/errors/custom/errors'
import { publishMessage } from '../common/rabbitmq/publish'
import { rabbitConfig } from '../common/rabbitmq/queues'
import { User } from '../db/m_m'
import keyvalidation from '../helper/keyValidation'
import { createHash, createHmac } from 'crypto'
import argon2 from 'argon2'
import generateToken from '../common/helper/generateToken'
import getDeviceId from '../common/helper/getDeviceId'
import verifyPKCE from '../common/helper/verifyPKCE'
import config from '../config'

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
        JSON.parse(JSON.stringify(req.body))

      const loginReqRaw = await redis.get(`login_request:${loginReqId}`)
      console.log(loginReqRaw)
      if (!loginReqRaw) throw new BadRequestError('Invalid or expired request')

      const loginReq = JSON.parse(loginReqRaw)
      const boundDevice = getDeviceId(req)
      console.log(boundDevice, loginReq.fingerprint)

      console.log('debug1')
      if (loginReq.fingerprint !== boundDevice)
        throw new BadRequestError('Invalid or expired request')

      console.log('debug2')
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

      const userTokenKey = `user_refresh_tokens:${userfound._id}`
      const userAccessTokenKey = `user_access_tokens:${userfound._id}`

      await redis
        .pipeline()
        .del(`refresh_token:${userfound._id}:${boundDevice}`)
        .del(`access_token:${userfound._id}:${boundDevice}`)
        .exec()

      const accessToken = generateToken()
      const refreshToken = generateToken()
      const sessionData = {
        email,
        firstName: userfound.firstName,
        lastName: userfound.lastName,
        role: userfound.role,
        ip: userfound.ip,
        deviceId: boundDevice,
      }

      const accessTokenHmac = createHmac(HMAC_ALGORITHM, HMAC_SECRET)
        .update(accessToken)
        .digest('hex')
      const refreshTokenHmac = createHmac(HMAC_ALGORITHM, HMAC_SECRET)
        .update(refreshToken)
        .digest('hex')

      await redis
        .pipeline()
        .set(
          `access_token:${userfound._id}:${boundDevice}`,
          JSON.stringify(sessionData),
          'EX',
          900
        )
        .set(
          `refresh_token:${userfound._id}:${boundDevice}`,
          JSON.stringify(sessionData),
          'EX',
          rememberMe ? 2592000 : 604800
        )
        .sadd(userTokenKey, refreshToken)
        .sadd(userAccessTokenKey, accessToken)
        .expire(userTokenKey, rememberMe ? 2592000 : 604800)
        .expire(userAccessTokenKey, 900)
        .exec()

      res
        .setCookie('access_token', `${accessToken}.${accessTokenHmac}`, {
          secure: config.app.ENV === 'production',
          httpOnly: true,
          sameSite: 'strict',
          path: '/',
        })
        .setCookie('refresh_token', `${refreshToken}.${refreshTokenHmac}`, {
          secure: config.app.ENV === 'production',
          httpOnly: true,
          sameSite: 'strict',
          path: '/',
        })
        .setCookie('deviceId', boundDevice, {
          secure: config.app.ENV === 'production',
          httpOnly: true,
          sameSite: 'strict',
          path: '/',
        })
        .send({ message: 'Login Successful' })
    } catch (err) {
      console.log(err)
      throw err
    }
  },

  async InitiateAuthSession(req, res) {
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
  },
}

export default authcontroller
