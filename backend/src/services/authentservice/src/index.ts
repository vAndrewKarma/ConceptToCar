import fastify from 'fastify'
import config from './config'
const server = fastify({ logger: true })

server.get('/', (_request, reply) => {
  reply.status(200).send('Hello World')
})

server.log.info(config)

server.listen(
  { port: Number(config.app.port), host: '0.0.0.0' },
  function (err, _address) {
    if (err) {
      server.log.error(err)
      process.exit(1)
    }
  }
)
