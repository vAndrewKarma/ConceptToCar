import { FastifyInstance } from "fastify"

const shutdown = async (server: FastifyInstance) => {
  try {
    await server.close()
    server.log.info('server closed')
    process.exit(0)
  } catch (err) {
    server.log.error('shutdown err', err)
    process.exit(1)
  }
}



export default shutdown
