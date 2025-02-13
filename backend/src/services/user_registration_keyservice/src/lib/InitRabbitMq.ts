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

    const connection = server.amqp.connection
    if (!connection) throw new Error('RabbitMQ connection is not available')

    connection.on('error', (err) => {
      server.log.error(`RabbitMQ Connection Error: ${err.message}`)
    })

    connection.on('close', () => {
      server.log.warn('RabbitMQ Connection Closed. Attempting to Reconnect...')
      setTimeout(() => InitRabbit(server), 5000)
    })

    const channel = server.amqp.channel
    if (!channel) throw new Error('RabbitMQ channel is not available')

    channel.on('error', (err) => {
      server.log.error(`RabbitMQ Channel Error: ${err.message}`)
    })

    channel.on('close', () => {
      server.log.warn('RabbitMQ Channel Closed. Re-initializing...')
      setTimeout(() => InitRabbit(server), 5000)
    })

    await startKeyConsumers(channel, server)
    server.log.info('RabbitMQ successfully connected and consumers started')
  } catch (err) {
    server.log.error(`RabbitMQ Initialization Error: ${err.message}`)
    setTimeout(() => InitRabbit(server), 5000)
  }
}

export default InitRabbit
