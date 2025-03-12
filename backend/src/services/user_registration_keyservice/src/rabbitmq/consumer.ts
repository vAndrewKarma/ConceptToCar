import {
  publishMessage,
  rabbitConfig,
} from '@karma-packages/conceptocar-common'
import { createUserModel } from '../db/m_m'
async function startKeyConsumers(channel, server) {
  try {
    const queue = rabbitConfig.queues.AUTH_CREATE_USER_SESSION.name
    console.log(queue)
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
          await userModel.createUser(message)
          await publishMessage(
            channel,
            rabbitConfig.queues.AUTH_SEND_EMAIL_VALIDATION.name,
            {
              to: 'karma.andrew16@gmail.com',
              subject: 'Email Validation',
              body: 'Please click the following link to verify your email address.',
            },
            rabbitConfig.queues.AUTH_SEND_EMAIL_VALIDATION.options
          )
          await server.redis.set(
            `email_validation:${message.email}`,
            'pending',
            'EX',
            86400
          )
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
