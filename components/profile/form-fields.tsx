'use client'

import { Eye, EyeOff } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import type {
  ProfileFormFieldProps,
  PasswordFormFieldProps,
  SelectOption,
  PasswordFieldConfig,
  PasswordVisibilityState,
} from '@/types/profile-forms'

// Generic text input field for profile forms
export function ProfileTextInput({
  form,
  name,
  label,
  placeholder,
  isLoading,
}: ProfileFormFieldProps & {
  name: 'fullName' | 'phone' | 'timezone' | 'language'
  label: string
  placeholder: string
}): JSX.Element {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              placeholder={placeholder}
              {...field}
              disabled={isLoading}
              value={field.value ?? ''}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

// Generic select field for profile forms
export function ProfileSelectField({
  form,
  name,
  label,
  placeholder,
  options,
  isLoading,
}: ProfileFormFieldProps & {
  name: 'timezone' | 'language'
  label: string
  placeholder: string
  options: SelectOption[]
}): JSX.Element {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select
            onValueChange={value => field.onChange(value)}
            defaultValue={field.value}
            disabled={isLoading}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

// Password visibility toggle button
function PasswordToggle({
  showPassword,
  onToggle,
  isLoading,
}: {
  showPassword: boolean
  onToggle: () => void
  isLoading: boolean
}): JSX.Element {
  return (
    <Button
      variant="ghost"
      size="icon"
      type="button"
      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
      onClick={onToggle}
      disabled={isLoading}
    >
      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      <span className="sr-only">{showPassword ? 'Ocultar senha' : 'Mostrar senha'}</span>
    </Button>
  )
}

// Password input field component
export function PasswordInput({
  form,
  config,
  showPassword,
  onTogglePassword,
  isLoading,
}: PasswordFormFieldProps & {
  config: PasswordFieldConfig
  showPassword: boolean
  onTogglePassword: () => void
}): JSX.Element {
  return (
    <FormField
      control={form.control}
      name={config.name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{config.label}</FormLabel>
          <FormControl>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder={config.placeholder}
                {...field}
                disabled={isLoading}
              />
              <PasswordToggle
                showPassword={showPassword}
                onToggle={onTogglePassword}
                isLoading={isLoading}
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

// Grouped profile form fields
export function ProfileFormFields({ form, isLoading }: ProfileFormFieldProps): JSX.Element {
  return (
    <>
      <ProfileTextInput
        form={form}
        name="fullName"
        label="Nome Completo"
        placeholder="Seu nome completo"
        isLoading={isLoading}
      />
      <ProfileTextInput
        form={form}
        name="phone"
        label="Telefone (opcional)"
        placeholder="+5511999999999"
        isLoading={isLoading}
      />
    </>
  )
}

// Grouped password form fields
export function PasswordFormFields({
  form,
  isLoading,
  passwordVisibility,
  passwordConfigs,
}: PasswordFormFieldProps & {
  passwordVisibility: PasswordVisibilityState
  passwordConfigs: {
    current: PasswordFieldConfig
    new: PasswordFieldConfig
    confirm: PasswordFieldConfig
  }
}): JSX.Element {
  return (
    <>
      <PasswordInput
        form={form}
        config={passwordConfigs.current}
        showPassword={passwordVisibility.showCurrentPassword}
        onTogglePassword={() =>
          passwordVisibility.setShowCurrentPassword(!passwordVisibility.showCurrentPassword)
        }
        isLoading={isLoading}
      />
      <PasswordInput
        form={form}
        config={passwordConfigs.new}
        showPassword={passwordVisibility.showNewPassword}
        onTogglePassword={() =>
          passwordVisibility.setShowNewPassword(!passwordVisibility.showNewPassword)
        }
        isLoading={isLoading}
      />
      <PasswordInput
        form={form}
        config={passwordConfigs.confirm}
        showPassword={passwordVisibility.showConfirmPassword}
        onTogglePassword={() =>
          passwordVisibility.setShowConfirmPassword(!passwordVisibility.showConfirmPassword)
        }
        isLoading={isLoading}
      />
    </>
  )
}
