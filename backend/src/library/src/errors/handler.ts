import { FastifyError, FastifyInstance } from 'fastify'
import AppError from './template'
import { NotFoundError } from './custom/errors'

function ErrorHandler(server: FastifyInstance) {
  server.setNotFoundHandler((req, _res) => {
    throw new NotFoundError(`${req.url} - ${req.method} not found`)
  })

  const contextErrorMessages: Record<string, string> = {
    '/login': 'Invalid credentials',
  }

  function formatValidationErrors(
    error: FastifyError
  ): { field: string; message: string }[] {
    console.log(JSON.stringify(error))
    return (
      error.validation?.flatMap((err) =>
        (err.params.errors as any[]).map((validationErr) => ({
          field:
            validationErr.params?.missingProperty ||
            err.instancePath.replace('/', ''),
          message: err.message,
        }))
      ) || []
    )
  }

  server.setErrorHandler((error: FastifyError, req, res) => {
    console.error(JSON.stringify(error, null, 2))
    if (error.validation) {
      const context = req.url

      if (contextErrorMessages[context]) {
        return res.status(400).send({ message: contextErrorMessages[context] })
      }

      const validationErrors = formatValidationErrors(error)
      return res.status(400).send({ errors: validationErrors })
    }

    if (error instanceof AppError) {
      return res.status(error.statusCode).send({ message: error.message })
    }

    return res.status(500).send({ message: 'Internal Server Error' })
  })
}
const schemaErrorFormatter = (errors) => {
  console.log(JSON.stringify(errors))
  return new Error(
    errors
      .map(
        (err: { instancePath: string; message: string }) =>
          `${err.instancePath} ${err.message}`
      )
      .join(', ')
  )
}

export { ErrorHandler, schemaErrorFormatter }
