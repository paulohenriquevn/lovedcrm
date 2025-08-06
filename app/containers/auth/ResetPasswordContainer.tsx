/**
 * Container para página de reset de senha.
 * Gerencia estado e lógica de negócio.
 */

'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'
import { useToast } from '@/hooks/use-toast'
import { authService } from '@/services/auth'

export function ResetPasswordContainer(): JSX.Element {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const tToast = useTranslations('toast')

  // Get token from URL
  const token = searchParams.get('token')

  const handleSubmit = async (data: {
    password: string
    confirmPassword: string
  }): Promise<void> => {
    if (token === null || token === undefined || token === '') {
      toast({
        title: tToast('error.title'),
        description: tToast('error.tokenNotFound'),
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)

    try {
      const result = await authService.resetPassword(token, data.password)

      setIsSuccess(true)
      toast({
        title: tToast('passwordReset.title'),
        description: result.message || tToast('passwordReset.description'),
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : tToast('error.description')
      toast({
        title: tToast('error.title'),
        description: message,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToLogin = (): void => {
    router.push('/auth/login')
  }

  return (
    <ResetPasswordForm
      onSubmit={data => void handleSubmit(data)}
      onBackToLogin={handleBackToLogin}
      isLoading={isLoading}
      isSuccess={isSuccess}
      hasToken={token !== null && token !== undefined && token !== ''}
    />
  )
}
