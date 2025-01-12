import fastify_loader from './InitFastify'
import InitMongo from './InitMongo'

export default async function loader() {
  const server = await fastify_loader()
  await InitMongo(server) // db loader

  return server
}
