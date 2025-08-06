import { useState } from 'react'
import * as z from 'zod'

// Create schema function that accepts translation function
export const createLoginFormSchema = (
  tValidation: (key: string) => string
): z.ZodSchema<LoginFormData> =>
  z.object({
    email: z.string().min(1, tValidation('email.required')).email(tValidation('email.invalid')),
    password: z
      .string()
      .min(1, tValidation('password.required'))
      .min(6, tValidation('password.minLength')),
  })

export type LoginFormData = {
  email: string
  password: string
}

// Helper function for form state using simple pattern
export function useLoginFormState(): {
  showPassword: boolean
  setShowPassword: (show: boolean) => void
  formData: LoginFormData
  setFormData: (data: LoginFormData) => void
  errors: Record<string, string>
  setErrors: (errors: Record<string, string>) => void
} {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  return { showPassword, setShowPassword, formData, setFormData, errors, setErrors }
}
