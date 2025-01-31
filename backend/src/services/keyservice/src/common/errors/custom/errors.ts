import AppError from '../template'

class Unauthorized extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401)
  }
}
class BadRequestError extends AppError {
  constructor(message = 'Bad Request') {
    super(message, 400)
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Not Found') {
    super(message, 404)
  }
}
export { Unauthorized, BadRequestError, NotFoundError }
