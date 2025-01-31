import { Channel } from 'amqplib'

export async function publishMessage(
  channel: Channel,
  queue: string,
  message: object,
  options: object = {}
) {
  console.log('message published back to result')
  await channel.assertQueue(queue, { durable: true })
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), options)
}
