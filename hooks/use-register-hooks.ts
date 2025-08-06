import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'

import { useAuthRecaptcha } from '@/hooks/use-recaptcha'
import { useToast } from '@/hooks/use-toast'
import { useAuthStore } from '@/stores/auth'
import type { RegisterFormData } from '@/lib/validation/register-schema'

// Helper function for auth redirection
export function useAuthCheckAndRedirect(): void {
  const router = useRouter()
  const locale = useLocale()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    const init = async (): Promise<void> => {
      // checkAuth removed - using stores/auth now
    }
    void init()
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(`/${locale}/admin`)
    }
  }, [isAuthenticated, router, locale])
}

// Helper function for form submission
export function useRegisterSubmission(tAuth: (key: string) => string): {
  handleSubmit: (data: RegisterFormData) => void
  isLoading: boolean
} {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const locale = useLocale()
  const { toast } = useToast()
  const { registerAsync } = useAuthStore()
  const { executeRegister } = useAuthRecaptcha()

  const handleSubmit = (data: RegisterFormData): void => {
    void (async (): Promise<void> => {
      setIsLoading(true)

      try {
        // 🤖 Execute reCAPTCHA challenge
        const recaptchaToken = await executeRegister()

        await registerAsync(
          data.fullName,
          data.email,
          data.password,
          data.termsAccepted,
          recaptchaToken
        )
        // Note: toast will be updated in container later
        toast({
          title: tAuth('register.success.title'),
          description: tAuth('register.success.description'),
        })
        // Pequeno delay para permitir que o estado seja atualizado
        setTimeout(() => {
          router.replace(
            `/${locale}/auth/resend-verification?email=${encodeURIComponent(data.email)}`
          )
        }, 1000)
      } catch (error) {
        console.error('Registration error:', error)
        const errorMessage =
          error instanceof Error && error.message ? error.message : tAuth('register.error.general')

        toast({
          title: tAuth('register.error.title'),
          description: errorMessage,
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    })()
  }

  return { handleSubmit, isLoading }
}
