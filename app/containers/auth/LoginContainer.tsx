'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'

import { LoginForm } from '@/components/auth/LoginForm'
import { useAuthRecaptcha } from '@/hooks/use-recaptcha'
import { useToast } from '@/hooks/use-toast'
import { useAuthStore } from '@/stores/auth'

interface LoginData {
  email: string
  password: string
}

// Handle password change redirect
function handlePasswordChangeRedirect(params: {
  router: ReturnType<typeof useRouter>
  email: string
  toast: ReturnType<typeof useToast>['toast']
  tToast: (key: string) => string
}): void {
  const { router, email, toast, tToast } = params
  toast({
    title: tToast('passwordChange.title'),
    description: tToast('passwordChange.description'),
  })
  const encodedEmail = encodeURIComponent(email)
  router.push(`/auth/change-password?email=${encodedEmail}&temp=true`)
}

// Handle login success
function handleLoginSuccess(params: {
  router: ReturnType<typeof useRouter>
  redirectTo: string | null
  toast: ReturnType<typeof useToast>['toast']
  tToast: (key: string) => string
}): void {
  const { router, redirectTo, toast, tToast } = params
  toast({
    title: tToast('loginSuccess.title'),
    description: tToast('loginSuccess.description'),
  })
  const redirectUrl = redirectTo !== null && redirectTo !== '/auth/login' ? redirectTo : '/admin'

  // Intentional log for redirect debugging
  // eslint-disable-next-line no-console
  void console.log('🔍 LoginContainer - Redirecting to:', redirectUrl)

  setTimeout(() => {
    // Intentional log for redirect execution
    // eslint-disable-next-line no-console
    void console.log('🔍 LoginContainer - Executing redirect to:', redirectUrl)
    router.replace(redirectUrl)
  }, 100)
}

// Handle email verification error
function handleEmailVerificationError(params: {
  message: string
  email: string
  onResendVerification: (email: string) => Promise<void>
  toast: ReturnType<typeof useToast>['toast']
  tToast: (key: string) => string
}): void {
  const { message, email, onResendVerification, toast, tToast } = params
  toast({
    title: tToast('emailNotVerified.title'),
    description: message,
    variant: 'destructive',
    action: (
      <button
        type="button"
        onClick={() => {
          void onResendVerification(email)
        }}
        className="text-sm underline text-white hover:no-underline"
      >
        {tToast('emailNotVerified.action')}
      </button>
    ),
  })
}

// Handle generic login error
function handleGenericLoginError(params: {
  message: string
  toast: ReturnType<typeof useToast>['toast']
  tToast: (key: string) => string
}): void {
  const { message, toast, tToast } = params
  toast({
    title: tToast('error.title'),
    description: message,
    variant: 'destructive',
  })
}

export function LoginContainer(): JSX.Element {
  /**
   * Container para login.
   * Gerencia autenticação e redirecionamento.
   */
  const router = useRouter()
  const searchParams = useSearchParams()
  const { loginAsync: login, isLoading } = useAuthStore()
  const { toast } = useToast()
  const { executeLogin } = useAuthRecaptcha()
  const tToast = useTranslations('toast')

  // Get redirect parameter from URL
  const redirectTo = searchParams.get('redirect')

  const handleLogin = async (data: LoginData): Promise<void> => {
    try {
      // Intentional log for login debugging
      // eslint-disable-next-line no-console
      void console.log('🔍 LoginContainer - Starting login process')

      // 🤖 Execute reCAPTCHA challenge
      const recaptchaToken = await executeLogin()

      // Use loginWithRecaptcha via auth store
      await login(data.email, data.password, recaptchaToken)
      // Intentional log for login success
      // eslint-disable-next-line no-console
      void console.log('LoginContainer - Login completed successfully')

      // Handle login success
      handleLoginSuccess({ router, redirectTo, toast, tToast })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao fazer login'

      // Check if user must change password (from invite flow)
      if (message === 'MUST_CHANGE_PASSWORD') {
        handlePasswordChangeRedirect({ router, email: data.email, toast, tToast })
        return
      }

      // Check if it's an email verification error
      if (message.includes('verify your email')) {
        handleEmailVerificationError({
          message,
          email: data.email,
          onResendVerification: handleResendVerification,
          toast,
          tToast,
        })
      } else {
        handleGenericLoginError({ message, toast, tToast })
      }
    }
  }

  const handleResendVerification = async (email: string) => {
    try {
      const result = await import('@/services/auth').then(m =>
        m.authService.resendVerification(email)
      )

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
    }
  }

  const handleForgotPassword = (): void => {
    router.push('/auth/forgot-password')
  }

  const handleGoogleError = (error: string): void => {
    toast({
      title: tToast('googleError.title'),
      description: error,
      variant: 'destructive',
    })
  }

  return (
    <LoginForm
      onSubmit={data => {
        void handleLogin(data)
      }}
      onForgotPassword={() => {
        void handleForgotPassword()
      }}
      onGoogleError={handleGoogleError}
      isLoading={isLoading}
    />
  )
}
