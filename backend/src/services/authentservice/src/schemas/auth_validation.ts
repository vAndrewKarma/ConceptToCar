export const registerSchema = {
  type: 'object',
  required: ['email', 'password', 'role'],

  properties: {
    email: {
      type: 'string',
      format: 'email',
    },
    password: {
      type: 'string',
      minLength: 8,
      pattern: '(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])',
    },
    confirmPassword: {
      type: 'string',
      const: { $data: '1/password' },
    },
    role: {
      type: 'string',
      enum: ['Admin', 'Designer', 'Portofolio Management', 'Seller'],
    },
  },
  additionalProperties: false,
}
