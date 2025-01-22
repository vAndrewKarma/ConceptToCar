import { FastifyInstance } from 'fastify'
import config from '../config'
import podIP from './getPodIps'

const start = async (server: FastifyInstance) => {
  try {
    server.listen(
      { port: Number(config.app.port), host: podIP },
      function (err, _address) {
        if (err) {
          server.log.error(err)
          process.exit(1)
        }
      }
    )
  } catch (err) {
    server.log.error(`Error ${err}`)
  }
}

export default start
