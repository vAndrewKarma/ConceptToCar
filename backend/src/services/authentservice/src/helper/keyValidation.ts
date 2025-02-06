import { User } from '../db/m_m'
import { createHash } from 'crypto'
import { Roles } from './interfaces'
import { FastifyRedis } from '@fastify/redis'
import { BadRequestError } from '../common/errors/custom/errors'

export default async function keyvalidation(user: User, redis: FastifyRedis) {
  try {
    const hashedRedisKey = createHash('sha256').update(user.key).digest('hex')
    const keyRedisKey = `keys:${hashedRedisKey}`
    const keyData: { email: string; role: Roles } = JSON.parse(
      await redis.get(keyRedisKey)
    )
    console.log(keyData)
    const foundkey =await redis.get(`locked_key:${hashedRedisKey}`)
    if(foundkey)
      throw new BadRequestError('Account is being created... Please wait for the validation email')
    
    if (!keyData) throw new BadRequestError('Invalid key')

    if (keyData.email !== user.email || keyData.role !== user.role)
      throw new BadRequestError(
        'Invalid key or selected role doesn t match the role in the company'
      )
  } catch (err) {
    throw err
  }
}
