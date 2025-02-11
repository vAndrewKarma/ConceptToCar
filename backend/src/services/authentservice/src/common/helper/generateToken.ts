import { randomBytes } from 'crypto'

const generateToken = (bt: number = 48) => randomBytes(bt).toString('hex')

export default generateToken
