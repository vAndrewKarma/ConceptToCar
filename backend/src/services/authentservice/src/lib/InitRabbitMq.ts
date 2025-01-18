import { FastifyInstance } from 'fastify'
import fastifyAmqpAsync from 'fastify-amqp-async'
import config from '../config'
async function InitRabbit(server: FastifyInstance) {
  try {
    await server.register(fastifyAmqpAsync, {
      connectionString: 'amqp://rabbitmq-service:5672',
      useConfirmChannel: false,
      useRegularChannel: true,
    })
  } catch (err) {
    server.log.error(err)
  }
}
export default InitRabbit
