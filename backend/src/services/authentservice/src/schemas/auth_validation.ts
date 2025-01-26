export const registerSchema = {
  type: 'object',
  required: [
    'email',
    'password',
    'confirmPassword',
    'role',
    'firstName',
    'lastName',
  ],
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
    password: {
      type: 'string',
      minLength: 8,
      maxLength: 16,
      pattern: '(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])',
      errorMessage: {
        minLength: 'Password must be at least 8 characters long.',
        maxLength: 'Password cannot exceed 16 characters.',
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
      enum: ['Admin', 'Designer', 'Portfolio Manager', 'Seller'],
      errorMessage: {
        enum: 'Role must be one of Admin, Designer, Portfolio Manager, or Seller.',
      },
    },
    firstName: {
      type: 'string',
      minLength: 1,
      maxLength: 50,
      pattern: '^[a-zA-Z\\s]+$',
      errorMessage: {
        minLength: 'First name must be at least 1 character long.',
        maxLength: 'First name cannot exceed 50 characters.',
        pattern: 'First name cannot contain numbers or special characters.',
      },
    },
    lastName: {
      type: 'string',
      minLength: 1,
      maxLength: 50,
      pattern: '^[a-zA-Z]+$',
      errorMessage: {
        minLength: 'Last name must be at least 1 character long.',
        maxLength: 'Last name cannot exceed 50 characters.',
        pattern: 'Last name cannot contain numbers or special characters.',
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
      firstName: 'First name is required.',
      lastName: 'Last name is required.',
    },
    additionalProperties: 'Invalid additional fields provided.',
  },
}
