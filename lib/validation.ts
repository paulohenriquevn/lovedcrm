// Validation utility functions

// Import useState for the hook
import { useState } from 'react'

import type {
  ValidationResult,
  ValidationRule,
  ValidationFormData,
  ValidationSchema,
  ValidationErrors,
  FormValidationHook,
} from './validation-types'

// Common validation messages - Will be replaced by translations
const VALIDATION_MESSAGES = {
  REQUIRED: 'validation.required',
  VALID_EMAIL: 'validation.email.invalid',
  VALID_PHONE: 'validation.phone.invalid',
  VALID_URL: 'validation.url.invalid',
  NUMERIC_ONLY: 'validation.numeric.only',
  VALID_NUMBER: 'validation.number.invalid',
  PASSWORDS_MATCH: 'validation.password.mismatch',
  PASSWORD_STRENGTH: 'validation.password.strength',
  VALIDATION_ERROR: 'validation.error.generic',
  EMAIL_REQUIRED: 'validation.email.required',
  PASSWORD_REQUIRED: 'validation.password.required',
} as const

// Helper function for basic validation rules
const createBasicRules = (
  t: (key: string, params?: Record<string, unknown>) => string
): Record<string, (...args: unknown[]) => ValidationRule> => ({
  required: (message?: string): ValidationRule => ({
    test: (value: unknown) => value !== null && value !== undefined && value !== '',
    message: message ?? t('validation.required'),
  }),

  minLength: (min: number, message?: string): ValidationRule => ({
    test: (value: unknown) => {
      if (typeof value !== 'string') {
        return false
      }
      return value.length > 0 && value.length >= min
    },
    message: message ?? t('validation.minLength', { min }),
  }),

  maxLength: (max: number, message?: string): ValidationRule => ({
    test: (value: unknown) => {
      if (typeof value !== 'string') {
        return true
      }
      return value.length === 0 || value.length <= max
    },
    message: message ?? t('validation.maxLength', { max }),
  }),
})

// Helper function for format validation rules
const createFormatRules = (
  t: (key: string, params?: Record<string, unknown>) => string
): Record<string, (...args: unknown[]) => ValidationRule> => ({
  email: (message?: string): ValidationRule => ({
    test: (value: unknown) => {
      if (typeof value !== 'string') {
        return false
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(value)
    },
    message: message ?? t('validation.email.invalid'),
  }),

  phone: (message?: string): ValidationRule => ({
    test: (value: unknown) => {
      if (typeof value !== 'string') {
        return false
      }
      const phoneRegex = /^\+?[1-9]\d{0,15}$/
      // eslint-disable-next-line unicorn/prefer-string-replace-all
      return phoneRegex.test(value.replace(/\D/g, ''))
    },
    message: message ?? t('validation.phone.invalid'),
  }),

  url: (message?: string): ValidationRule => ({
    test: (value: unknown) => {
      if (typeof value !== 'string') {
        return false
      }
      try {
        new URL(value)
        return true
      } catch {
        return false
      }
    },
    message: message ?? t('validation.url.invalid'),
  }),
})

// Helper function for password validation rules
const createPasswordRules = (
  t: (key: string, params?: Record<string, unknown>) => string
): Record<string, (...args: unknown[]) => ValidationRule> => ({
  password: (message?: string): ValidationRule => ({
    test: (value: unknown) => {
      if (typeof value !== 'string') {
        return false
      }
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[\d!$%&*?@A-Za-z]{8,}$/
      return passwordRegex.test(value)
    },
    message: message ?? t('validation.password.strength'),
  }),

  confirmPassword: (originalPassword: string, message?: string): ValidationRule => ({
    test: (value: unknown) => value === originalPassword,
    message: message ?? t('validation.password.mismatch'),
  }),
})

// Helper function for numeric validation rules
const createNumericRules = (
  t: (key: string, params?: Record<string, unknown>) => string
): Record<string, (...args: unknown[]) => ValidationRule> => ({
  numeric: (message?: string): ValidationRule => ({
    test: (value: unknown) => {
      if (typeof value !== 'string') {
        return false
      }
      return /^\d+$/.test(value)
    },
    message: message ?? t('validation.numeric.only'),
  }),

  decimal: (message?: string): ValidationRule => ({
    test: (value: unknown) => {
      if (typeof value !== 'string') {
        return false
      }
      return /^\d+(\.\d+)?$/.test(value)
    },
    message: message ?? t('validation.number.invalid'),
  }),

  min: (min: number, message?: string): ValidationRule => ({
    test: (value: unknown) => {
      if (typeof value !== 'number') {
        return false
      }
      return value >= min
    },
    message: message ?? t('validation.number.min', { min }),
  }),

  max: (max: number, message?: string): ValidationRule => ({
    test: (value: unknown) => {
      if (typeof value !== 'number') {
        return false
      }
      return value <= max
    },
    message: message ?? t('validation.number.max', { max }),
  }),

  range: (min: number, max: number, message?: string): ValidationRule => ({
    test: (value: unknown) => {
      if (typeof value !== 'number') {
        return false
      }
      return value >= min && value <= max
    },
    message: message ?? t('validation.number.range', { min, max }),
  }),
})

// Translation-aware validation rules factory (now under 80 lines)
export const createValidationRules = (
  t: (key: string, params?: Record<string, unknown>) => string
): Record<string, (...args: unknown[]) => ValidationRule> => {
  const basicRules = createBasicRules(t)
  const formatRules = createFormatRules(t)
  const passwordRules = createPasswordRules(t)
  const numericRules = createNumericRules(t)

  return {
    ...basicRules,
    ...formatRules,
    ...passwordRules,
    ...numericRules,
  }
}

// Legacy validation rules for backward compatibility
export const validationRules = createValidationRules(
  (key: string, _params?: Record<string, unknown>) => key
)

// Validate a single field
export function validateField(value: unknown, rules: ValidationRule[]): ValidationResult {
  const errors: string[] = []

  for (const rule of rules) {
    if (!rule.test(value)) {
      errors.push(rule.message)
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Validate an entire form
export function validateForm(
  data: ValidationFormData,
  schema: ValidationSchema
): { isValid: boolean; errors: ValidationErrors } {
  const errors: ValidationErrors = {}
  let isValid = true

  for (const [field, rules] of Object.entries(schema)) {
    const result = validateField(data[field], rules)

    if (!result.isValid) {
      errors[field] = result.errors
      isValid = false
    }
  }

  return { isValid, errors }
}

// Translation-aware validation schemas factory
export const createAuthSchemas = (
  t: (key: string, params?: Record<string, unknown>) => string
): Record<string, ValidationSchema> => {
  const rules = createValidationRules(t)

  return {
    login: {
      email: [rules.required(), rules.email()],
      password: [rules.required(), rules.minLength(1)],
    },

    register: {
      fullName: [rules.required(), rules.minLength(2), rules.maxLength(100)],
      email: [rules.required(), rules.email()],
      password: [rules.required(), rules.password()],
      confirmPassword: [rules.required()],
    },

    forgotPassword: {
      email: [rules.required(), rules.email()],
    },

    resetPassword: {
      password: [rules.required(), rules.password()],
      confirmPassword: [rules.required()],
    },
  }
}

// Legacy schemas for backward compatibility
export const authSchemas = createAuthSchemas((key: string) => key)

// Utility function to format validation errors for display
export function formatValidationErrors(errors: ValidationErrors): Record<string, string> {
  const formatted: Record<string, string> = {}

  for (const [field, fieldErrors] of Object.entries(errors)) {
    formatted[field] = fieldErrors[0] ?? VALIDATION_MESSAGES.VALIDATION_ERROR
  }

  return formatted
}

// Helper functions for form validation hook
function useValidationHandlers<T extends ValidationFormData>(
  schema: ValidationSchema,
  setErrors: (
    errors: Record<string, string> | ((prev: Record<string, string>) => Record<string, string>)
  ) => void,
  setIsValid: (valid: boolean) => void
): {
  validate: (data: T) => boolean
  validateSingleField: (field: string, value: unknown) => boolean
} {
  const validate = (data: T): boolean => {
    const result = validateForm(data, schema)
    const formattedErrors = formatValidationErrors(result.errors)
    setErrors(formattedErrors)
    setIsValid(result.isValid)
    return result.isValid
  }

  const validateSingleField = (field: string, value: unknown): boolean => {
    const rules = schema[field]
    if (!rules) {
      return true
    }
    const result = validateField(value, rules)
    setErrors(prev => ({ ...prev, [field]: result.errors[0] ?? '' }))
    return result.isValid
  }

  return { validate, validateSingleField }
}

function useErrorHandlers(
  setErrors: (
    errors: Record<string, string> | ((prev: Record<string, string>) => Record<string, string>)
  ) => void,
  setIsValid: (valid: boolean) => void
): { clearErrors: () => void; clearFieldError: (field: string) => void } {
  const clearErrors = (): void => {
    setErrors({})
    setIsValid(true)
  }

  const clearFieldError = (field: string): void => {
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[field]
      return newErrors
    })
  }

  return { clearErrors, clearFieldError }
}

// React hook for form validation
export function useFormValidation<T extends ValidationFormData>(
  schema: ValidationSchema
): FormValidationHook<T> {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isValid, setIsValid] = useState(true)

  const { validate, validateSingleField } = useValidationHandlers(schema, setErrors, setIsValid)
  const { clearErrors, clearFieldError } = useErrorHandlers(setErrors, setIsValid)

  return {
    errors,
    isValid,
    validate,
    validateField: validateSingleField,
    clearErrors,
    clearFieldError,
  }
}
