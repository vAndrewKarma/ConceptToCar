export const initiateProductChange = {
  type: 'object',
  required: ['challenge'],
  properties: {
    challenge: {
      type: 'string',
      minLength: 43,
      maxLength: 128,
      pattern: '^[a-zA-Z0-9-._~]+$',
      errorMessage: {
        minLength: 'Invalid product challenge.',
        maxLength: 'Invalid product challenge.',
        pattern: 'Invalid product challenge.',
      },
    },
  },
  additionalProperties: false,
  errorMessage: {
    required: {
      challenge: 'Product challenge is required.',
    },
    additionalProperties: 'Invalid additional fields provided.',
  },
}

export const productSchema = {
  type: 'object',
  required: [
    'name',
    'description',
    'estimated_height',
    'estimated_width',
    'estimated_weight',
    'weight_unit',
    'width_unit',
    'height_unit',
    // 'material_number',
    'modifyID',
    'code_verifier',
  ],
  properties: {
    name: {
      type: 'string',
      minLength: 1,
      maxLength: 50,
      pattern: '^(?!\\s*$)[A-Za-z0-9 ]+$',
      errorMessage: {
        type: 'Name must be a string.',
        minLength: 'Name cannot be empty.',
        maxLength: 'Name cannot exceed 50 characters.',
        pattern: 'Name can only contain letters, numbers, and spaces.',
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
    modifyID: {
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
    description: {
      type: 'string',
      minLength: 1,
      maxLength: 400,
      errorMessage: {
        type: 'Description must be a string.',
        minLength: 'Description cannot be empty.',
        maxLength: 'Description cannot exceed 400 characters.',
      },
    },
    estimated_height: {
      type: 'number',
      minimum: 0,
      maximum: 999999,
      errorMessage: {
        type: 'estimated_height must be a number.',
        minimum: 'estimated_height cannot be negative.',
        maximum: 'estimated_height cannot exceed 999999.',
      },
    },
    estimated_width: {
      type: 'number',
      minimum: 0,
      maximum: 999999,
      errorMessage: {
        type: 'Estimated width must be a number.',
        minimum: 'Estimated width cannot be negative.',
        maximum: 'Estimated width cannot exceed 999999.',
      },
    },
    estimated_weight: {
      type: 'number',
      minimum: 0,
      maximum: 999999,
      errorMessage: {
        type: 'Estimated weight must be a number.',
        minimum: 'Estimated weight cannot be negative.',
        maximum: 'Estimated weight cannot exceed 999999.',
      },
    },
    // material_number: {
    //   type: 'array',
    //   items: {
    //     type: 'string',
    //     minLength: 1,
    //     errorMessage: {
    //       type: 'Each material number must be a string.',
    //       minLength: 'Material number cannot be empty.',
    //     },
    //   },
    //   minItems: 1,
    //   errorMessage: {
    //     type: 'Material number must be an array.',
    //     minItems: 'At least one material number is required.',
    //   },
    // },
    images: {
      type: 'array',
      items: {
        type: 'string',
        format: 'uri',
        errorMessage: {
          type: 'Each image must be a string.',
          format: 'Each image must be a valid URI.',
        },
      },
      nullable: true,
      minItems: 1,
      errorMessage: {
        type: 'Images must be an array.',
        minItems: 'At least one image is required.',
      },
    },
    width_unit: {
      type: 'string',
      enum: ['cm', 'm'],
      errorMessage: {
        type: 'Width unit must be a string.',
        enum: "Width unit must be either 'cm' or 'm'.",
      },
    },
    weight_unit: {
      type: 'string',
      enum: ['kg', 'lb'],
      errorMessage: {
        type: 'Weight unit must be a string.',
        enum: "Weight unit must be either 'kg' or 'lb'.",
      },
    },
    height_unit: {
      type: 'string',
      enum: ['cm', 'm'],
      errorMessage: {
        type: 'Height unit must be a string.',
        enum: "Height unit must be either 'cm' or 'm'.",
      },
    },
  },
  additionalProperties: false,
  errorMessage: {
    required: {
      name: 'Name is required.',
      description: 'Description is required.',
      estimated_height: 'estimated_height is required.',
      estimated_width: 'Estimated width is required.',
      estimated_weight: 'Estimated weight is required.',
      // material_number: 'Material number is required.',
      modifyID: 'Invalid request',
      code_verifier: 'Invalid request',
      weight_unit: 'Weight unit is required.',
      width_unit: 'Width unit is required.',
      height_unit: 'Height unit is required.',
    },
    additionalProperties: 'No additional properties are allowed.',
  },
}

export const getproductbyname = {
  type: 'object',
  required: ['name'],
  properties: {
    name: {
      type: 'string',
      minLength: 1,
      maxLength: 50,
      pattern: '^(?!\\s*$)[A-Za-z0-9 ]+$',
      errorMessage: {
        type: 'Name must be a string.',
        minLength: 'Name cannot be empty.',
        maxLength: 'Name cannot exceed 50 characters.',
        pattern: 'Name can only contain letters, numbers, and spaces.',
      },
    },
  },
  additionalProperties: false,
  errorMessage: {
    required: {
      name: 'Name is required.',
    },
    additionalProperties: 'No additional properties are allowed.',
  },
}

export const getproducts = {
  type: 'object',
  required: ['page'],
  properties: {
    page: {
      type: 'number',
      minimum: 1,
      maximum: 999999,
      errorMessage: {
        type: 'page must be a number.',
        minimum: 'page cannot be negative.',
        maximum: 'page cannot exceed 999999.',
      },
    },
  },
  additionalProperties: false,
  errorMessage: {
    required: {
      page: 'page is required.',
    },
    additionalProperties: 'No additional properties are allowed.',
  },
}
