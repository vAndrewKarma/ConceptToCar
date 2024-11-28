import fastify from 'fastify'
import config from './config'
import shutdown from './helper/shutdown'
import InitMongo from './lib/InitMongo'
const server = fastify({ logger: true })
const start = async () => {
  try {
    await InitMongo()
    server.listen(
      { port: Number(config.app.port), host: '0.0.0.0' },
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

server.get('/', (_request, reply) => {
  reply.status(200).send(config.app.ENV)
})

process.on('SIGTERM', shutdown)

process.on('SIGINT', shutdown)

start()

export default server
