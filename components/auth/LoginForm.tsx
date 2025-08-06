'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2, LogIn } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

import { GoogleLoginButton } from './GoogleLoginButton'

// Zod schema for validation
const createLoginFormSchema = (
  t: (key: string) => string
): z.ZodSchema<{ email: string; password: string }> =>
  z.object({
    email: z.string().email(t('emailInvalid')),
    password: z.string().min(6, t('passwordMinLength')),
  })

interface LoginFormProps {
  onSubmit: (data: { email: string; password: string }) => void
  onForgotPassword: () => void
  onGoogleError?: (error: string) => void
  isLoading?: boolean
}

// Google login section component
function GoogleLoginSection({
  onGoogleError,
  isLoading,
  tAuth,
}: {
  onGoogleError?: (error: string) => void
  isLoading: boolean
  tAuth: (key: string) => string
}): JSX.Element {
  return (
    <div className="space-y-4">
      <GoogleLoginButton onError={onGoogleError} disabled={isLoading} />
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            {tAuth('orContinueWith')}
          </span>
        </div>
      </div>
    </div>
  )
}

// Password field component
function PasswordField({
  form,
  showPassword,
  setShowPassword,
  isLoading,
  tAuth,
  tPlaceholder,
}: {
  form: ReturnType<typeof useForm<z.infer<ReturnType<typeof createLoginFormSchema>>>>
  showPassword: boolean
  setShowPassword: (show: boolean) => void
  isLoading: boolean
  tAuth: (key: string) => string
  tPlaceholder: (key: string) => string
}): JSX.Element {
  return (
    <FormField
      control={form.control}
      name="password"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{tAuth('password')} *</FormLabel>
          <FormControl>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder={tPlaceholder('password')}
                disabled={isLoading}
                className="pr-10"
                {...field}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span className="sr-only">
                  {showPassword ? tAuth('hidePassword') : tAuth('showPassword')}
                </span>
              </Button>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

// Login form fields component
function LoginFormFields({
  form,
  showPassword,
  setShowPassword,
  isLoading,
  tAuth,
  tPlaceholder,
}: {
  form: ReturnType<typeof useForm<z.infer<ReturnType<typeof createLoginFormSchema>>>>
  showPassword: boolean
  setShowPassword: (show: boolean) => void
  isLoading: boolean
  tAuth: (key: string) => string
  tPlaceholder: (key: string) => string
}): JSX.Element {
  return (
    <>
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{tAuth('email')} *</FormLabel>
            <FormControl>
              <Input
                type="email"
                placeholder={tPlaceholder('email')}
                disabled={isLoading}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <PasswordField
        form={form}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        isLoading={isLoading}
        tAuth={tAuth}
        tPlaceholder={tPlaceholder}
      />
    </>
  )
}

function LoginFormContent({
  form,
  showPassword,
  setShowPassword,
  handleSubmit,
  onForgotPassword,
  onGoogleError,
  isLoading,
  tAuth,
  tPlaceholder,
}: {
  form: ReturnType<typeof useForm<z.infer<ReturnType<typeof createLoginFormSchema>>>>
  showPassword: boolean
  setShowPassword: (show: boolean) => void
  handleSubmit: (data: z.infer<ReturnType<typeof createLoginFormSchema>>) => void
  onForgotPassword: () => void
  onGoogleError?: (error: string) => void
  isLoading: boolean
  tAuth: (key: string) => string
  tPlaceholder: (key: string) => string
}): JSX.Element {
  const handleFormSubmit = (data: z.infer<ReturnType<typeof createLoginFormSchema>>): void => {
    handleSubmit(data)
  }

  return (
    <CardContent className="space-y-4">
      <GoogleLoginSection onGoogleError={onGoogleError} isLoading={isLoading} tAuth={tAuth} />
      <Form {...form}>
        <form
          onSubmit={e => {
            e.preventDefault()
            void form.handleSubmit(handleFormSubmit)(e)
          }}
          className="space-y-4"
        >
          <LoginFormFields
            form={form}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            isLoading={isLoading}
            tAuth={tAuth}
            tPlaceholder={tPlaceholder}
          />
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="link"
              className="p-0 h-auto font-normal"
              onClick={onForgotPassword}
              disabled={isLoading}
            >
              {tAuth('forgotPassword')}
            </Button>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {tAuth('signingIn')}...
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" />
                {tAuth('signIn')}
              </>
            )}
          </Button>
        </form>
      </Form>
    </CardContent>
  )
}

export function LoginForm({
  onSubmit,
  onForgotPassword,
  onGoogleError,
  isLoading = false,
}: LoginFormProps): JSX.Element {
  const [showPassword, setShowPassword] = useState(false)
  const tAuth = useTranslations('auth.login')
  const tPlaceholder = useTranslations('placeholders')
  const tValidation = useTranslations('validation')
  const loginFormSchema = createLoginFormSchema(tValidation)
  type LoginFormData = z.infer<typeof loginFormSchema>

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: '', password: '' },
  })

  const handleSubmit = (data: LoginFormData): void => {
    onSubmit(data)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/20">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">{tAuth('title')}</CardTitle>
          <CardDescription className="text-center">{tAuth('subtitle')}</CardDescription>
        </CardHeader>
        <LoginFormContent
          form={form}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          handleSubmit={handleSubmit}
          onForgotPassword={onForgotPassword}
          onGoogleError={onGoogleError}
          isLoading={isLoading}
          tAuth={tAuth}
          tPlaceholder={tPlaceholder}
        />
      </Card>
    </div>
  )
}
