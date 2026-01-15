export const Messages = {
  notFound: (entity: string, id?: string | number): string =>
    id !== undefined
      ? `${entity} with ID ${id} not found`
      : `${entity} not found`,

  required: (field: string): string => `${field} is required`,

  minLength: (field: string, min: number): string =>
    `${field} must be at least ${min} characters`,

  maxLength: (field: string, max: number): string =>
    `${field} must be at most ${max} characters`,

  min: (field: string, min: number): string =>
    `${field} must be at least ${min}`,

  max: (field: string, max: number): string =>
    `${field} must be at most ${max}`,

  invalid: (field: string, value?: string): string =>
    value ? `Invalid ${field}: '${value}'` : `Invalid ${field}`,

  duplicate: (field: string, value?: string): string =>
    value ? `${field} '${value}' already exists` : `${field} already exists`,

  positive: (field: string): string => `${field} must be a positive number`,

  integer: (field: string): string => `${field} must be an integer`,

  date: (field: string): string => `${field} must be a valid date`,

  exceedsLimit: (field: string, limit: number): string =>
    `${field} exceeds the limit of ${limit}`,

  validationFailed: (): string => 'Validation failed',

  created: (entity: string): string => `${entity} created successfully`,

  updated: (entity: string): string => `${entity} updated successfully`,

  deleted: (entity: string): string => `${entity} deleted successfully`,

  operationFailed: (operation: string, entity: string): string =>
    `Failed to ${operation} ${entity}`,

  operationSuccess: (entity: string, operation: string): string =>
    `${entity} ${operation} successfully`,

  notOwner: (entity: string): string =>
    `You can only modify your own ${entity}`,

  unauthorized: (): string => 'Unauthorized access',

  forbidden: (): string => 'Access denied',

  general: (): string => 'An unexpected error occurred',

  fileRequired: (): string => 'At least one file is required',

  invalidFileType: (allowed: string): string =>
    `Invalid file type. Allowed types: ${allowed}`,

  fileTooLarge: (maxSize: string): string =>
    `File size exceeds the maximum limit of ${maxSize}`,

  tooManyFiles: (max: number): string => `Maximum ${max} files allowed`,
} as const;
