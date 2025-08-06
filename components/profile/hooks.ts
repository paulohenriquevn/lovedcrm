'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import { useToast } from '@/hooks/use-toast'
import { settingsService } from '@/services/settings'

import type {
  ProfileFormData,
  PasswordFormData,
  ProfileUser,
  ProfileSubmitHandler,
  PasswordSubmitHandler,
  ProfileFormHook,
  PasswordFormHook,
} from '@/types/profile-forms'
import type { UserUpdate } from '@/types/user'

// Form validation schemas
const profileFormSchema = z.object({
  fullName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  phone: z
    .string()
    .optional()
    .refine(val => val === null || val === undefined || val === '' || /^\+\d{10,15}$/.test(val), {
      message: 'Telefone deve estar no formato +5511999999999',
    }),
  timezone: z.string().min(1, 'Fuso horário é obrigatório'),
  language: z.string().min(1, 'Idioma é obrigatório'),
})

const passwordFormSchema = z
  .object({
    currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
    newPassword: z
      .string()
      .min(8, 'Nova senha deve ter pelo menos 8 caracteres')
      .regex(/[A-Z]/, 'Deve conter pelo menos uma letra maiúscula')
      .regex(/[a-z]/, 'Deve conter pelo menos uma letra minúscula')
      .regex(/\d/, 'Deve conter pelo menos um número'),
    confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

// Hook for profile form management
export function useProfileForm(user: ProfileUser | null): ProfileFormHook {
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      timezone: 'America/Sao_Paulo',
      language: 'pt-BR',
    },
  })

  useEffect(() => {
    if (user) {
      form.reset({
        fullName: user.full_name ?? '',
        phone: user.phone ?? '',
        timezone: user.timezone ?? 'America/Sao_Paulo',
        language: user.language ?? 'pt-BR',
      })
    }
  }, [user, form])

  return form
}

// Hook for password form management
export function usePasswordForm(): PasswordFormHook {
  return useForm<PasswordFormData>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })
}

// Hook for profile form submission
export function useProfileSubmit(
  user: ProfileUser | null,
  setUser: (user: ProfileUser) => void
): ProfileSubmitHandler {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (data: ProfileFormData): Promise<void> => {
    setIsLoading(true)
    try {
      // Note: Using snake_case for API compatibility with backend
      const updateData: UserUpdate = {
        // eslint-disable-next-line camelcase
        full_name: data.fullName,
        phone: data.phone,
        timezone: data.timezone,
        language: data.language,
      }

      const updatedProfile = await settingsService.updateProfile(updateData)

      if (user) {
        setUser({ ...user, ...updatedProfile })
      }

      toast({
        title: 'Sucesso',
        description: 'Perfil atualizado com sucesso!',
      })
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao atualizar perfil',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return { handleSubmit, isLoading }
}

// Hook for password form submission
export function usePasswordSubmit(passwordForm: PasswordFormHook): PasswordSubmitHandler {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (data: PasswordFormData): Promise<void> => {
    setIsLoading(true)
    try {
      await settingsService.updatePassword(data.currentPassword, data.newPassword)
      passwordForm.reset()

      toast({
        title: 'Sucesso',
        description: 'Senha atualizada com sucesso!',
      })
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao atualizar senha',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return { handleSubmit, isLoading }
}

// Hook for password visibility state management
export function usePasswordVisibility(): {
  showCurrentPassword: boolean
  setShowCurrentPassword: (show: boolean) => void
  showNewPassword: boolean
  setShowNewPassword: (show: boolean) => void
  showConfirmPassword: boolean
  setShowConfirmPassword: (show: boolean) => void
} {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  return {
    showCurrentPassword,
    setShowCurrentPassword,
    showNewPassword,
    setShowNewPassword,
    showConfirmPassword,
    setShowConfirmPassword,
  }
}
