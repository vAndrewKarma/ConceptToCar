import fastify_loader from './InitFastify'

export default async function loader() {
  const server = await fastify_loader()

  return server
}
