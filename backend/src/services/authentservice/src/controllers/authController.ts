import { BadRequestError } from '../common/errors/custom/errors'
import { User } from '../db/m_m'

const authcontroller = {
  async RegisterController(req, res) {
    try {
      const user = JSON.parse(JSON.stringify(req.body)) as Omit<
        User,
        'confirmPassword'
      >

      const userModel = req.server.userModel
      if (await userModel.findUserByEmail(user.email)) {
        throw new BadRequestError('Email already registered')
      }
      const userIp = req.headers['x-forwarded-for'] || req.ip
      user.ip = userIp
      await userModel.createUser(user)

      return res.status(200).send({ message: 'Succesfully registered' })
    } catch (err) {
      throw err
    }
  },
}

export default authcontroller
