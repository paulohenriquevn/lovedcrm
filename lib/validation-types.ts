// Type definitions for validation

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export interface ValidationRule {
  test: (value: unknown) => boolean
  message: string
}

export type ValidationFormData = Record<string, unknown>
export type ValidationSchema = Record<string, ValidationRule[]>
export type ValidationErrors = Record<string, string[]>

export interface FormValidationHook<T extends ValidationFormData> {
  errors: Record<string, string>
  isValid: boolean
  validate: (data: T) => boolean
  validateField: (field: string, value: unknown) => boolean
  clearErrors: () => void
  clearFieldError: (field: string) => void
}
