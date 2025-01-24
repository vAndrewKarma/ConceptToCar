import { FastifyError, FastifyInstance } from 'fastify'
import AppError from './template'
import { NotFoundError } from './custom/errors'

function ErrorHandler(server: FastifyInstance) {
  server.setNotFoundHandler((req, _res) => {
    throw new NotFoundError(`${req.url} - ${req.method} not found`)
  })
  server.setErrorHandler((error: FastifyError, _req, res) => {
    if (error instanceof AppError) {
      return res.status(error.statusCode).send({ message: error.message })
    }
    return res.status(500).send({ message: 'Internal Server Error' })
  })
}

export default ErrorHandler
