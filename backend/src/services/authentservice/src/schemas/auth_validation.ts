export const registerSchema = {
  type: 'object',
  required: [
    'email',
    'password',
    'confirmPassword',
    'role',
    'firstName',
    'lastName',
    'key',
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
    key: {
      type: 'string',
      minLength: 64,
      maxLength: 64,
      pattern: '^[a-zA-Z0-9]+$',
      errorMessage: {
        minLength: 'Invalid secret key.',
        maxLength: 'Invalid secret key.',
        pattern: 'Invalid secret key.',
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
      key: 'Key is required.',
    },
    additionalProperties: 'Invalid additional fields provided.',
  },
}

export const loginSchema = {
  type: 'object',
  required: ['email', 'password', 'loginReqId', 'code_verifier'],
  properties: {
    email: {
      type: 'string',
      format: 'email',
      maxLength: 40,
      errorMessage: {
        format: 'Invalid credentials.',
        maxLength: 'Invalid credentials.',
      },
    },
    password: {
      type: 'string',
      minLength: 8,
      maxLength: 16,
      pattern: '(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])',
      errorMessage: {
        minLength: 'Invalid credentials.',
        maxLength: 'Invalid credentials.',
        pattern: 'Invalid credentials.',
      },
    },
    loginReqId: {
      type: 'string',
      minLength: 32,
      maxLength: 32,
      pattern: '^[a-zA-Z0-9]+$',
      errorMessage: {
        minLength: 'Invalid or expired request.',
        maxLength: 'Invalid or expired request.',
        pattern: 'Invalid or expired request.',
      },
    },
    code_verifier: {
      type: 'string',
      minLength: 43,
      maxLength: 128,
      pattern: '^[a-zA-Z0-9-._~]+$',
      errorMessage: {
        minLength: 'Invalid or expired request.',
        maxLength: 'Invalid or expired request.',
        pattern: 'Invalid or expired request.',
      },
    },
    rememberMe: {
      type: 'boolean',
      errorMessage: {
        type: 'Remember me must be a boolean value.',
      },
    },
  },
  additionalProperties: false,
  errorMessage: {
    required: {
      email: 'Invalid credentials.',
      password: 'Invalid credentials.',
      loginReqId: 'Invalid or expired request.',
      code_verifier: 'Invalid or expired request.',
    },
    additionalProperties: 'Invalid additional fields provided.',
  },
}

export const initiateAuthSessionSchema = {
  type: 'object',
  required: ['challenge'],
  properties: {
    challenge: {
      type: 'string',
      minLength: 43,
      maxLength: 128,
      pattern: '^[a-zA-Z0-9-._~]+$',
      errorMessage: {
        minLength: 'Invalid authentication challenge.',
        maxLength: 'Invalid authentication challenge.',
        pattern: 'Invalid authentication challenge.',
      },
    },
  },
  additionalProperties: false,
  errorMessage: {
    required: {
      challenge: 'Authentication challenge is required.',
    },
    additionalProperties: 'Invalid additional fields provided.',
  },
}

export const verifyEmailSchema = {
  type: 'object',
  required: ['code'],
  properties: {
    challenge: {
      type: 'string',
      minLength: 20,
      maxLength: 45,
      pattern: '^[a-zA-Z0-9-._~]+$',
      errorMessage: {
        minLength: 'Invalid code.',
        maxLength: 'Invalid code.',
        pattern: 'Invalid code.',
      },
    },
  },
  additionalProperties: false,
  errorMessage: {
    required: {
      challenge: 'Invalid code.',
    },
    additionalProperties: 'Invalid code.',
  },
}
