/**
 * Container para página de recuperação de senha.
 * Gerencia estado e lógica de negócio.
 */

'use client'

import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'
import { useToast } from '@/hooks/use-toast'
import { authService } from '@/services/auth'

export function ForgotPasswordContainer(): JSX.Element {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const tToast = useTranslations('toast')

  const handleSubmit = async (data: { email: string }): Promise<void> => {
    setIsLoading(true)

    try {
      const result = await authService.forgotPassword(data.email)

      setIsSuccess(true)
      toast({
        title: tToast('emailSent.title'),
        description: result.message || tToast('emailSent.description'),
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
    <ForgotPasswordForm
      onSubmit={data => void handleSubmit(data)}
      onBackToLogin={handleBackToLogin}
      isLoading={isLoading}
      isSuccess={isSuccess}
    />
  )
}
