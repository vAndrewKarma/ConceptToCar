import { FastifyError, FastifyInstance } from 'fastify'
import AppError from './template'
import { NotFoundError } from './custom/errors'

function ErrorHandler(server: FastifyInstance) {
  server.setNotFoundHandler((req, _res) => {
    throw new NotFoundError(`${req.url} - ${req.method} not found`)
  })

  server.setErrorHandler((error: FastifyError, _req, res) => {
    console.error(JSON.stringify(error, null, 2)) // Log the full error object

    if (error.validation) {
      const validationErrors = error.validation.map((err) => ({
        field: err.instancePath.replace('/', ''), // Extract field name
        message: err.message, // Error message
      }))

      return res.status(400).send({ errors: validationErrors })
    }

    if (error instanceof AppError) {
      return res.status(error.statusCode).send({ message: error.message })
    }

    return res.status(500).send({ message: 'Internal Server Error' })
  })
}
const schemaErrorFormatter = (errors) => {
  return new Error(
    errors.map((err) => `${err.instancePath} ${err.message}`).join(', ')
  )
}

export { ErrorHandler, schemaErrorFormatter }
