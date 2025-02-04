import { BadRequestError } from '../common/errors/custom/errors'
import { publishMessage } from '../common/rabbitmq/publish'
import { rabbitConfig } from '../common/rabbitmq/queues'
import { User } from '../db/m_m'
import keyvalidation from '../helper/keyValidation'
import { createHash } from 'crypto'

const authcontroller = {
  async RegisterController(req, res) {
    try {
      // TODO IMPLEMENTARE PT CARE NU AM AVUT TIMP NECESAR, SERVER SIDE EVENTS SI MUT VALIDAREA LA KEY PE SERVICE U KEYS, WILL BE ADDED  */
      const redis = req.server.redis
      const { channel } = req.server.rabbitmq
console.log(req.headers['x-forwarded-for'] || req.ip)
console.log(req.headers['x-forwarded-for'])
console.log(req.ip)
      const user = JSON.parse(JSON.stringify(req.body)) as Omit<
        User,
        'confirmPassword'
      >

      const userModel = req.server.userModel
      if (await userModel.findUserByEmail(user.email)) {
        throw new BadRequestError('Email already registered')
      }

      await keyvalidation(user, redis)
      const userIp = req.headers['x-forwarded-for'] || req.ip
      user.ip = createHash('sha256').update(userIp).digest('hex')

      await publishMessage(
        channel,
        rabbitConfig.queues.AUTH_CREATE_USER_SESSION.name,
        user,
        rabbitConfig.queues.AUTH_CREATE_USER_SESSION.options
      )
      res.status(201).send({ message: 'Check your email for validation.' })
    } catch (err) {
      console.log(err)
      throw err
    }
  },
}

export default authcontroller
