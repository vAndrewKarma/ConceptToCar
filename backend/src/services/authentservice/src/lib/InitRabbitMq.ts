import { FastifyInstance } from 'fastify'
import fastifyAmqpAsync from 'fastify-amqp-async'
async function InitRabbit(server: FastifyInstance) {
  try {
    await server.register(fastifyAmqpAsync, {
      connectionString: 'amqp://guest:guest@rabbitmq:5672',
      useConfirmChannel: false,
      useRegularChannel: true,
    })
  } catch (err) {
    server.log.error(err)
  }
}
export default InitRabbit
