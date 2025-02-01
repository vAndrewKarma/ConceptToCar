import { rabbitConfig } from '../common/rabbitmq/queues'
import { createUserModel } from '../db/m_m'
async function startKeyConsumers(channel, server) {
  try {
    const queue = rabbitConfig.queues.AUTH_CREATE_USER_SESSION.name

    await channel.assertQueue(
      queue,
      rabbitConfig.queues.AUTH_CREATE_USER_SESSION.options
    )

    console.log(`Waiting for messages in ${queue}...`)

    channel.consume(queue, async (msg) => {
      if (msg !== null) {
        const message = JSON.parse(msg.content.toString())
        console.log('Received message:', message)
        try {
          const userModel = createUserModel(server)
          userModel.createUser(message)
          console.log('acc created with data', JSON.stringify(message))
          channel.ack(msg)
        } catch (error) {
          console.error('Error processing message:', error)

          channel.nack(msg)
        }
      }
    })
  } catch (err) {
    console.error('Error in startKeyConsumers:', err)
    throw err
  }
}

export { startKeyConsumers }
