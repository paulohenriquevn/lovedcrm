import { Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

import type { RegisterFormData } from '@/lib/validation/register-schema'

// Password field component with toggle visibility
export function PasswordField({
  name,
  label,
  placeholder,
  form,
  isLoading,
  showPassword,
  onToggleVisibility,
  tAuth,
}: {
  name: 'password' | 'confirmPassword'
  label: string
  placeholder: string
  form: ReturnType<typeof useForm<RegisterFormData>>
  isLoading: boolean
  showPassword: boolean
  onToggleVisibility: () => void
  tAuth: (key: string) => string
}): JSX.Element {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder={placeholder}
                {...field}
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={onToggleVisibility}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span className="sr-only">
                  {showPassword ? tAuth('common.hidePassword') : tAuth('common.showPassword')}
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

// Basic form fields component
export function BasicFields({
  form,
  isLoading,
  tAuth,
  tPlaceholders,
}: {
  form: ReturnType<typeof useForm<RegisterFormData>>
  isLoading: boolean
  tAuth: (key: string) => string
  tPlaceholders: (key: string) => string
}): JSX.Element {
  return (
    <>
      <FormField
        control={form.control}
        name="fullName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{tAuth('register.fullName')}</FormLabel>
            <FormControl>
              <Input placeholder={tPlaceholders('fullName')} {...field} disabled={isLoading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{tAuth('register.email')}</FormLabel>
            <FormControl>
              <Input
                type="email"
                placeholder={tPlaceholders('email')}
                {...field}
                disabled={isLoading}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  )
}

// Terms acceptance component
export function TermsAcceptanceField({
  form,
  isLoading,
  tAuth,
}: {
  form: ReturnType<typeof useForm<RegisterFormData>>
  isLoading: boolean
  tAuth: (key: string) => string
}): JSX.Element {
  const locale = useLocale()

  return (
    <FormField
      control={form.control}
      name="termsAccepted"
      render={({ field }) => (
        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
          <FormControl>
            <Checkbox
              checked={field.value}
              onCheckedChange={checked => field.onChange(checked)}
              disabled={isLoading}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            <FormLabel className="text-sm font-medium leading-5">
              {tAuth('register.agreeToTerms')}{' '}
              <Link
                href={`/${locale}/terms`}
                className="text-primary underline hover:no-underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {tAuth('register.termsOfService')}
              </Link>{' '}
              {tAuth('register.and')}{' '}
              <Link
                href={`/${locale}/privacy`}
                className="text-primary underline hover:no-underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {tAuth('register.privacyPolicy')}
              </Link>
            </FormLabel>
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  )
}
