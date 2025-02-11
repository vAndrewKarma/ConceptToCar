import { createHash, randomBytes } from 'crypto'
import { BadRequestError } from '../common/errors/custom/errors'
import config from '../config'
import { FastifyRequest, FastifyReply } from 'fastify'

interface Key {
  ip: string
  createdAt: Date
  email: string
  role: string
}

const authcontroller = {
  async RegisterController(req: FastifyRequest, res: FastifyReply) {
    try {
      const redis = req.server.redis
      const key = req.body as {
        email: string
        role: string
        secret_key: string
      }

      console.log(Buffer.from(key.secret_key, 'base64').toString('utf-8'))
      console.log(config.app.SECRET_KEY)
      if (
        Buffer.from(key.secret_key, 'base64').toString('utf-8') !==
        config.app.SECRET_KEY
      ) {
        throw new BadRequestError('Unauthorized access.')
      }

      const userIp = req.headers['x-forwarded-for'] || req.ip
      const rawKey = randomBytes(32).toString('hex')

      const keyData: Key = {
        ip: userIp as string,
        createdAt: new Date(),
        email: key.email,
        role: key.role,
      }

      const hashedRedisKey = createHash('sha256').update(rawKey).digest('hex')
      const keyRedisKey = `keys:${hashedRedisKey}`

      const d = await redis.set(
        keyRedisKey,
        JSON.stringify(keyData),
        'EX',
        7 * 24 * 60 * 60
      )

      console.log(d)
      req.log.info(`Key generated for email: ${key.email}, role: ${key.role}`)

      return res.status(201).send({
        message: 'Key successfully created. ( DO NOT EXPOSE IT )',
        key: Buffer.from(rawKey).toString(
          'base64'
        ) /* KEY HAS TO BE DECODED by Admin manually*/,
      })
    } catch (err) {
      req.log.error(err)
      throw err
    }
  },
}

export default authcontroller
