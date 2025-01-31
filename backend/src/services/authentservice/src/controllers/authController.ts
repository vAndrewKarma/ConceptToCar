import { BadRequestError } from '../common/errors/custom/errors'
import { User } from '../db/m_m'
import keyvalidation from '../helper/keyValidation'
import { createHash } from 'crypto'

const authcontroller = {
  async RegisterController(req, res) {
    try {
      // TODO IMPLEMENTARE PT CARE NU AM AVUT TIMP NECESAR, SERVER SIDE EVENTS SI MUT VALIDAREA LA KEY PE SERVICE U KEYS, WILL BE ADDED  */
      const redis = req.server.redis

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

      await userModel.createUser(user)
      res.status(201).send({ message: 'Account succesfully created.' })
    } catch (err) {
      console.log(err)
      throw err
    }
  },
}

export default authcontroller
