export const registerSchema = {
  type: 'object',
  required: ['email', 'password', 'confirmPassword', 'role'],
  properties: {
    email: {
      type: 'string',
      format: 'email',
      errorMessage: {
        format: 'Email must be a valid email address.',
      },
    },
    password: {
      type: 'string',
      minLength: 8,
      pattern: '(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])',
      errorMessage: {
        minLength: 'Password must be at least 8 characters long.',
        pattern:
          'Password must include at least one letter, one number, and one special character.',
      },
    },
    confirmPassword: {
      type: 'string',
      const: { $data: '1/password' },
      errorMessage: {
        const: 'Passwords do not match.',
      },
    },
    role: {
      type: 'string',
      enum: ['Admin', 'Designer', 'Portfolio Management', 'Seller'],
      errorMessage: {
        enum: 'Role must be one of Admin, Designer, Portfolio Management, or Seller.',
      },
    },
  },
  additionalProperties: false,
  errorMessage: {
    required: {
      email: 'Email is required.',
      password: 'Password is required.',
      confirmPassword: 'Confirm password is required.',
      role: 'Role is required.',
    },
    additionalProperties: 'Invalid additional fields provided.',
  },
}
