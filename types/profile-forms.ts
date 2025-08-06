/**
 * TypeScript interfaces for profile form components
 * Addresses camelCase naming issues and provides proper type safety
 */

import type { UseFormReturn } from 'react-hook-form'
import type { User } from './user'

// Form data interfaces with proper camelCase naming
export interface ProfileFormData {
  fullName: string
  phone?: string
  timezone: string
  language: string
}

export interface PasswordFormData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

// Properly typed user interface for profile page
// Using the existing User interface and ensuring compatibility
export interface ProfileUser extends Omit<User, 'full_name' | 'phone' | 'timezone' | 'language'> {
  full_name: string | undefined
  phone: string | undefined
  timezone: string | undefined
  language: string | undefined
}

// Form hook return types
export type ProfileFormHook = UseFormReturn<ProfileFormData>
export type PasswordFormHook = UseFormReturn<PasswordFormData>

// Component prop interfaces
export interface FormFieldBaseProps {
  isLoading: boolean
}

export interface ProfileFormFieldProps extends FormFieldBaseProps {
  form: ProfileFormHook
}

export interface PasswordFormFieldProps extends FormFieldBaseProps {
  form: PasswordFormHook
}

// Select option interface
export interface SelectOption {
  value: string
  label: string
}

// Password visibility state interface
export interface PasswordVisibilityState {
  showCurrentPassword: boolean
  setShowCurrentPassword: (show: boolean) => void
  showNewPassword: boolean
  setShowNewPassword: (show: boolean) => void
  showConfirmPassword: boolean
  setShowConfirmPassword: (show: boolean) => void
}

// Submit handler interfaces
export interface ProfileSubmitHandler {
  handleSubmit: (data: ProfileFormData) => Promise<void>
  isLoading: boolean
}

export interface PasswordSubmitHandler {
  handleSubmit: (data: PasswordFormData) => Promise<void>
  isLoading: boolean
}

// Configuration interfaces
export interface PasswordFieldConfig {
  name: keyof PasswordFormData
  label: string
  placeholder: string
}

// Constants with proper typing
export const TIMEZONE_OPTIONS: SelectOption[] = [
  { value: 'America/Sao_Paulo', label: 'São Paulo (BRT)' },
  { value: 'America/New_York', label: 'Nova York (EST)' },
  { value: 'Europe/London', label: 'Londres (GMT)' },
  { value: 'Asia/Tokyo', label: 'Tóquio (JST)' },
] as const

export const LANGUAGE_OPTIONS: SelectOption[] = [
  { value: 'pt-BR', label: 'Português (Brasil)' },
  { value: 'en-US', label: 'English (US)' },
  { value: 'es-ES', label: 'Español' },
] as const

export const PASSWORD_FIELD_CONFIGS: Record<string, PasswordFieldConfig> = {
  current: {
    name: 'currentPassword',
    label: 'Senha Atual',
    placeholder: 'Digite sua senha atual',
  },
  new: {
    name: 'newPassword',
    label: 'Nova Senha',
    placeholder: '8+ chars, A-Z, a-z, 0-9',
  },
  confirm: {
    name: 'confirmPassword',
    label: 'Confirmar Nova Senha',
    placeholder: 'Confirme sua nova senha',
  },
} as const
