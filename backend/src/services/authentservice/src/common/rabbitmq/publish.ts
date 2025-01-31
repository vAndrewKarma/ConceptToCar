import { Channel } from 'amqplib'

export async function publishMessage(
  channel: Channel,
  queue: string,
  message: object,
  options: object = { persistent: true }
) {
  try {
    await channel.assertQueue(queue, options)
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), options)

    console.log(
      `Message successfully sent to queue: ${queue}, data:${Buffer.from(
        JSON.stringify(message)
      )}`
    )
  } catch (err) {
    console.error(`Failed to publish message to queue ${queue}:`, err)
    throw err
  }
}
