export const materialschema = {
  type: 'object',
  required: [
    'material_description',
    'weight',
    'name',
    'estimated_height',
    'estimated_width',
    'estimated_weight',
    'weight_unit',
    'width',
    'qty',
    'width_unit',
    'length_unit',
    'height',
    'height_unit',
    'productId',
    'productName',
    'code_verifier',
    'modifyID',
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
    productId: {
      type: 'string',
      minLength: 1,
      maxLength: 50,
      pattern: '^(?!\\s*$)[A-Za-z0-9 ]+$',
      errorMessage: {
        type: 'productId must be a string.',
        minLength: 'productId cannot be empty.',
        maxLength: 'productId cannot exceed 50 characters.',
        pattern: 'productId can only contain letters, numbers, and spaces.',
      },
    },
    productName: {
      type: 'string',
      minLength: 1,
      maxLength: 50,
      pattern: '^(?!\\s*$)[A-Za-z0-9 ]+$',
      errorMessage: {
        type: 'productName must be a string.',
        minLength: 'productName cannot be empty.',
        maxLength: 'productName cannot exceed 50 characters.',
        pattern: 'productName can only contain letters, numbers, and spaces.',
      },
    },
    estimated_height: {
      type: 'number',
      minimum: 0,
      maximum: 999999,
      errorMessage: {
        type: 'Estimated height must be a number.',
        minimum: 'Estimated height cannot be negative.',
        maximum: 'Estimated height cannot exceed 999999.',
      },
    },
    qty: {
      type: 'number',
      minimum: 0,
      maximum: 999999,
      errorMessage: {
        type: 'Quantity height must be a number.',
        minimum: 'Quantity height cannot be negative.',
        maximum: 'Quantity height cannot exceed 999999.',
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
    length_unit: {
      type: 'number',
      minimum: 0,
      maximum: 999999,
      errorMessage: {
        type: 'Length must be a number.',
        minimum: 'Length   cannot be negative.',
        maximum: 'Length cannot exceed 999999.',
      },
    },
    material_description: {
      type: 'string',
      minLength: 1,
      maxLength: 255,
      errorMessage: {
        type: 'Material description must be a string.',
        minLength: 'Material description cannot be empty.',
        maxLength: 'Material description cannot exceed 255 characters.',
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
    weight: {
      type: 'number',
      exclusiveMinimum: 0,
      errorMessage: {
        type: 'Weight must be a number.',
        exclusiveMinimum: 'Weight must be greater than 0.',
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
    width: {
      type: 'number',
      exclusiveMinimum: 0,
      errorMessage: {
        type: 'Width must be a number.',
        exclusiveMinimum: 'Width must be greater than 0.',
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
    height: {
      type: 'number',
      exclusiveMinimum: 0,
      errorMessage: {
        type: 'Height must be a number.',
        exclusiveMinimum: 'Height must be greater than 0.',
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
      material_description: 'Material description is required.',
      weight: 'Weight is required.',
      qty: 'Quantity is required',
      name: 'Name is required',
      length_unit: 'Length is required',
      weight_unit: 'Weight unit is required.',
      width: 'Width is required.',
      width_unit: 'Width unit is required.',
      height: 'Height is required.',
      height_unit: 'Height unit is required.',
      modifyID: 'Invalid request',
      code_verifier: 'Invalid request',
      productId: 'productId is required',
      productName: 'productName is required',
    },
    additionalProperties: 'No additional properties are allowed.',
  },
}

export const materialupdateschema = {
  type: 'object',
  required: [
    'material_description',
    'weight',
    'name',
    'estimated_height',
    'estimated_width',
    'estimated_weight',
    'weight_unit',
    'width',
    'length_unit',
    'qty',
    'width_unit',
    'height',
    'height_unit',
    'productId',
    'productName',
    'originalName',
    'code_verifier',
    'modifyID',
  ],
  properties: {
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
    originalName: {
      type: 'string',
      minLength: 1,
      maxLength: 50,
      pattern: '^(?!\\s*$)[A-Za-z0-9 ]+$',
      errorMessage: {
        type: 'originalName must be a string.',
        minLength: 'originalName cannot be empty.',
        maxLength: 'originalName cannot exceed 50 characters.',
        pattern: 'originalName can only contain letters, numbers, and spaces.',
      },
    },
    productId: {
      type: 'string',
      minLength: 1,
      maxLength: 50,
      pattern: '^(?!\\s*$)[A-Za-z0-9 ]+$',
      errorMessage: {
        type: 'productId must be a string.',
        minLength: 'productId cannot be empty.',
        maxLength: 'productId cannot exceed 50 characters.',
        pattern: 'productId can only contain letters, numbers, and spaces.',
      },
    },
    productName: {
      type: 'string',
      minLength: 1,
      maxLength: 50,
      pattern: '^(?!\\s*$)[A-Za-z0-9 ]+$',
      errorMessage: {
        type: 'productName must be a string.',
        minLength: 'productName cannot be empty.',
        maxLength: 'productName cannot exceed 50 characters.',
        pattern: 'productName can only contain letters, numbers, and spaces.',
      },
    },
    estimated_height: {
      type: 'number',
      minimum: 0,
      maximum: 999999,
      errorMessage: {
        type: 'Estimated height must be a number.',
        minimum: 'Estimated height cannot be negative.',
        maximum: 'Estimated height cannot exceed 999999.',
      },
    },
    length_unit: {
      type: 'number',
      minimum: 0,
      maximum: 999999,
      errorMessage: {
        type: 'Length must be a number.',
        minimum: 'Length   cannot be negative.',
        maximum: 'Length cannot exceed 999999.',
      },
    },
    qty: {
      type: 'number',
      minimum: 0,
      maximum: 999999,
      errorMessage: {
        type: 'Quantity height must be a number.',
        minimum: 'Quantity height cannot be negative.',
        maximum: 'Quantity height cannot exceed 999999.',
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
    material_description: {
      type: 'string',
      minLength: 1,
      maxLength: 255,
      errorMessage: {
        type: 'Material description must be a string.',
        minLength: 'Material description cannot be empty.',
        maxLength: 'Material description cannot exceed 255 characters.',
      },
    },
    weight: {
      type: 'number',
      exclusiveMinimum: 0,
      errorMessage: {
        type: 'Weight must be a number.',
        exclusiveMinimum: 'Weight must be greater than 0.',
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
    width: {
      type: 'number',
      exclusiveMinimum: 0,
      errorMessage: {
        type: 'Width must be a number.',
        exclusiveMinimum: 'Width must be greater than 0.',
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

    height: {
      type: 'number',
      exclusiveMinimum: 0,
      errorMessage: {
        type: 'Height must be a number.',
        exclusiveMinimum: 'Height must be greater than 0.',
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
      material_description: 'Material description is required.',
      weight: 'Weight is required.',
      qty: 'Quantity is required',
      length_unit: 'length_unit is required',
      name: 'Name is required',
      weight_unit: 'Weight unit is required.',
      width: 'Width is required.',
      width_unit: 'Width unit is required.',
      height: 'Height is required.',
      modifyID: 'Invalid request',
      code_verifier: 'Invalid request',
      height_unit: 'Height unit is required.',
      productId: 'productId is required',
      originalName: 'originalName is required',
      productName: 'productName is required',
    },
    additionalProperties: 'No additional properties are allowed.',
  },
}

export const getmaterialspecific = {
  type: 'object',
  required: ['name', 'productId'],
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

    productId: {
      type: 'string',
      minLength: 1,
      maxLength: 50,
      pattern: '^(?!\\s*$)[A-Za-z0-9 ]+$',
      errorMessage: {
        type: 'productId must be a string.',
        minLength: 'productId cannot be empty.',
        maxLength: 'productId cannot exceed 50 characters.',
        pattern: 'productId can only contain letters, numbers, and spaces.',
      },
    },
  },
  additionalProperties: false,
  errorMessage: {
    required: {
      name: 'Name is required',

      productId: 'productId is required',
    },
    additionalProperties: 'No additional properties are allowed.',
  },
}

export const getmaterialsspecific = {
  type: 'object',
  required: ['page', 'productId'],
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

    productId: {
      type: 'string',
      minLength: 1,
      maxLength: 50,
      pattern: '^(?!\\s*$)[A-Za-z0-9 ]+$',
      errorMessage: {
        type: 'productId must be a string.',
        minLength: 'productId cannot be empty.',
        maxLength: 'productId cannot exceed 50 characters.',
        pattern: 'productId can only contain letters, numbers, and spaces.',
      },
    },
  },
  additionalProperties: false,
  errorMessage: {
    required: {
      page: 'page is required',

      productId: 'productId is required',
    },
    additionalProperties: 'No additional properties are allowed.',
  },
}

export const deleteproductschema = {
  type: 'object',
  required: ['name', 'productId', 'code_verifier', 'modifyID'],
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
    productId: {
      type: 'string',
      minLength: 1,
      maxLength: 50,
      pattern: '^(?!\\s*$)[A-Za-z0-9 ]+$',
      errorMessage: {
        type: 'productId must be a string.',
        minLength: 'productId cannot be empty.',
        maxLength: 'productId cannot exceed 50 characters.',
        pattern: 'productId can only contain letters, numbers, and spaces.',
      },
    },
  },
  additionalProperties: false,
  errorMessage: {
    required: {
      name: 'Name is required',
      modifyID: 'Invalid request',
      code_verifier: 'Invalid request',
      productId: 'productId is required',
    },
    additionalProperties: 'No additional properties are allowed.',
  },
}
export const deleteMaterialSp = {
  type: 'object',
  required: ['name', 'productId', 'code_verifier', 'modifyID'],
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
    productId: {
      type: 'string',
      minLength: 1,
      maxLength: 50,
      pattern: '^(?!\\s*$)[A-Za-z0-9 ]+$',
      errorMessage: {
        type: 'productId must be a string.',
        minLength: 'productId cannot be empty.',
        maxLength: 'productId cannot exceed 50 characters.',
        pattern: 'productId can only contain letters, numbers, and spaces.',
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
  },
  additionalProperties: false,
  errorMessage: {
    required: {
      name: 'Name is required',
      productId: 'productId is required',
      code_verifier: 'Invalid request',
      modifyID: 'Invalid request',
    },
    additionalProperties: 'No additional properties are allowed.',
  },
}
