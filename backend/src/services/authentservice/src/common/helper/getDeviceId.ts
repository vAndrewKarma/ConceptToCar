import useragent from 'user-agent'
import { createHash } from 'crypto'
const getDeviceId = (req) => {
  const ua = useragent.parse(req.headers['user-agent'])
  console.log(ua)
  return createHash('sha256')
    .update(
      (req.headers['x-forwarded-for'] || req.ip) + ua.fullName ||
        'unknown' + ua.fullName ||
        'unknown'
    )
    .digest('hex')
}

export default getDeviceId
