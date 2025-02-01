import { FastifyInstance } from 'fastify'
import fastifyAmqpAsync from 'fastify-amqp-async'
import config from '../config'
import { startKeyConsumers } from '../rabbitmq/consumer'
async function InitRabbit(server: FastifyInstance) {
  try {
    await server.register(fastifyAmqpAsync, {
      connectionString: config.app.MQ,
      useConfirmChannel: false,
      useRegularChannel: true,
    })

    const channel = server.amqp.channel
    if (!channel) throw new Error('RabbitMQ channel is not available')
    await startKeyConsumers(channel, server)
  } catch (err) {
    server.log.error(err)
  }
}
export default InitRabbit
