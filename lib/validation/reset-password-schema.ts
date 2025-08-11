import * as z from 'zod'

export const createResetPasswordSchema = (
  tValidation: (key: string) => string
): z.ZodEffects<
  z.ZodObject<{
    password: z.ZodString
    confirmPassword: z.ZodString
  }>,
  ResetPasswordData,
  ResetPasswordData
> =>
  z
    .object({
      password: z
        .string()
        .min(8, tValidation('password.minLengthReset'))
        .regex(/[A-Z]/, tValidation('password.uppercase'))
        .regex(/[a-z]/, tValidation('password.lowercase'))
        .regex(/\d/, tValidation('password.number'))
        .regex(/[!"#$%&()*,.:<>?@^{|}]/, tValidation('password.special')),
      confirmPassword: z.string().min(1, tValidation('confirmPassword.required')),
    })
    .refine(data => data.password === data.confirmPassword, {
      message: tValidation('confirmPassword.mismatch'),
      path: ['confirmPassword'],
    })

export type ResetPasswordData = {
  password: string
  confirmPassword: string
}
