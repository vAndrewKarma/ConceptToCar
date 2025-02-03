import { FastifyInstance } from 'fastify'
import config from '../../config'
import podIP from './getPodIps'

const start = async (server: FastifyInstance) => {
  try {
    console.log(config.app.ENV==='production' ? '0.0.0.0' : podIP)
    server.listen(
      { port: Number(config.app.port), host: config.app.ENV==='production' ? '0.0.0.0' : podIP },
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
