import config from '../config'

export const keySchema = {
  type: 'object',
  required: ['email', 'secret_key', 'role'],
  properties: {
    email: {
      type: 'string',
      format: 'email',
      maxLength: 40,
      errorMessage: {
        format: 'Email must be a valid email address.',
        maxLength: 'Email cannot exceed 40 characters.',
      },
    },
    role: {
      type: 'string',
      enum: ['Admin', 'Designer', 'Portfolio Manager', 'Seller'],
      errorMessage: {
        enum: 'Role must be one of Admin, Designer, Portfolio Manager, or Seller.',
      },
    },
    secret_key: {
      type: 'string',
      minLength: config.app.ENV === 'development' ? 1 : 64,
      maxLength: config.app.ENV === 'development' ? 8000 : 64,
      pattern: '^[a-zA-Z0-9]+$',
      errorMessage: {
        minLength: 'Invalid secret key.',
        maxLength: 'Invalid secret key.',
        pattern: 'Invalid secret key.',
      },
    },
  },
  additionalProperties: false,
  errorMessage: {
    required: {
      email: 'Email is required.',
      key: 'Key is required.',
      role: 'Role is required.',
      secret_key: 'Secret key is required.',
    },
    additionalProperties: 'Invalid additional fields provided.',
  },
}
