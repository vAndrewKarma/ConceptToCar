import useragent from 'user-agent'
import { createHash } from 'crypto'
const getDeviceId = (req) => {
  const ua = useragent.parse(req.headers['user-agent'])
  return createHash('sha256')
    .update(
      (req.headers['x-forwarded-for'] || req.ip) + ua.family ||
        'unknown' + ua.os.family ||
        'unknown'
    )
    .digest('hex')
}

export default getDeviceId
