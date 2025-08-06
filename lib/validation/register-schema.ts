import * as z from 'zod'

// Base type for form data
export type RegisterFormData = {
  fullName: string
  email: string
  password: string
  confirmPassword: string
  termsAccepted: boolean
}

// Schema factory function to access translations
export function createRegisterFormSchema(
  t: (key: string) => string
): z.ZodSchema<RegisterFormData> {
  return z
    .object({
      fullName: z.string().min(2, t('validation.name.minLength')),
      email: z.string().min(1, t('validation.required')).email(t('validation.email')),
      password: z
        .string()
        .min(8, t('validation.password.minLength'))
        .regex(/[A-Z]/, t('validation.password.uppercase'))
        .regex(/[a-z]/, t('validation.password.lowercase'))
        .regex(/\d/, t('validation.password.number'))
        .regex(/[!"#$%&()*,.:<>?@^{|}]/, t('validation.password.special')),
      confirmPassword: z.string().min(1, t('validation.required')),
      termsAccepted: z.boolean().refine(val => val === true, {
        message: t('validation.terms'),
      }),
    })
    .refine(data => data.password === data.confirmPassword, {
      message: t('validation.password.mismatch'),
      path: ['confirmPassword'],
    })
}
