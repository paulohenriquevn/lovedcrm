/**
 * Página de callback do Google OAuth.
 */

'use client'

import { Loader2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { useCallback, useEffect, useState } from 'react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { authService } from '@/services/auth'
import { useAuthStore } from '@/stores/auth'
import { UserStatus, User } from '@/types/user'

import type { Organization } from '@/types/organization'

// Types
interface UserApiResponse {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  is_active: boolean
  is_verified: boolean
  created_at: string
  updated_at?: string
}

interface OrganizationApiResponse {
  id: string
  name: string
  created_at: string
  updated_at?: string
}

interface CallbackResponse {
  user: UserApiResponse
  access_token: string
  refresh_token: string
  organization?: OrganizationApiResponse
}

// Helper functions moved to outer scope
const validateCallbackParams = (
  searchParams: URLSearchParams
): { code: string; state?: string } => {
  const errorParam = searchParams.get('error')
  if (errorParam !== null && errorParam !== undefined && errorParam !== '') {
    throw new Error(`Google OAuth error: ${errorParam}`)
  }

  const code = searchParams.get('code')
  if (code === null || code === undefined || code === '') {
    throw new Error('Código de autorização não encontrado')
  }

  return {
    code,
    state: searchParams.get('state') ?? undefined,
  }
}

const processGoogleCallback = async (code: string, state?: string): Promise<CallbackResponse> => {
  // eslint-disable-next-line no-console
  console.log('🔍 Callback: Calling handleGoogleCallback...')
  const callbackResponse = await authService.handleGoogleCallback(code, state)
  // eslint-disable-next-line no-console
  console.log('🔍 Callback: Response received:', callbackResponse)
  return callbackResponse as CallbackResponse
}

const createTypedUser = (user: UserApiResponse): User => {
  return {
    ...user,
    status: user.is_active === true ? UserStatus.ACTIVE : UserStatus.INACTIVE,
    isEmailVerified: user.is_verified === true || true, // Google users are pre-verified
  } as User
}

const createTypedOrganization = (organization: OrganizationApiResponse): Organization => {
  return {
    ...organization,
    updatedAt: organization.updated_at ?? new Date().toISOString(),
  } as Organization
}

// Helper function to render error state
function renderErrorState(error: string, tAuth: (key: string) => string): JSX.Element {
  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/20">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-destructive">{tAuth('oauth.error.title')}</CardTitle>
          <CardDescription>{tAuth('oauth.error.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <p className="text-xs text-muted-foreground">{tAuth('oauth.error.redirecting')}</p>
        </CardContent>
      </Card>
    </div>
  )
}

// Helper function to render loading state
function renderLoadingState(isProcessing: boolean, tAuth: (key: string) => string): JSX.Element {
  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/20">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{tAuth('oauth.processing.title')}</CardTitle>
          <CardDescription>{tAuth('oauth.processing.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-sm text-muted-foreground">
              {isProcessing
                ? tAuth('oauth.processing.loading')
                : tAuth('oauth.processing.finishing')}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Custom hook to handle callback processing
function useCallbackProcessor() {
  const router = useRouter()
  const locale = useLocale()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(true)
  const { setUser, setIsAuthenticated, setTokens, setOrganization } = useAuthStore()

  const updateAuthStore = useCallback(
    (callbackResponse: CallbackResponse): void => {
      const {
        user,
        access_token: accessToken,
        refresh_token: refreshToken,
        organization,
      } = callbackResponse

      if (user === null || user === undefined) {
        throw new Error('Não foi possível obter dados do usuário')
      }

      // eslint-disable-next-line no-console
      console.log('🔍 Callback: User data:', user)

      const typedUser = createTypedUser(user)
      setUser(typedUser)
      setTokens(accessToken, refreshToken)

      if (organization) {
        const typedOrganization = createTypedOrganization(organization)
        setOrganization(typedOrganization)
      }

      setIsAuthenticated(true)
      // eslint-disable-next-line no-console
      console.log('Auth store updated with all data')
    },
    [setUser, setTokens, setOrganization, setIsAuthenticated]
  )

  const handleCallbackError = useCallback(
    (error: unknown): void => {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      setError(errorMessage)

      // Redirecionar para login após alguns segundos
      setTimeout(() => {
        void router.replace(`/${locale}/auth/login?error=oauth_failed`)
      }, 3000)
    },
    [router, locale]
  )

  useEffect(() => {
    const processCallback = async (): Promise<void> => {
      try {
        const { code, state } = validateCallbackParams(searchParams)
        const callbackResponse = await processGoogleCallback(code, state)
        updateAuthStore(callbackResponse)
        void router.replace(`/${locale}/admin`)
      } catch (error) {
        handleCallbackError(error)
      } finally {
        setIsProcessing(false)
      }
    }

    void processCallback()
  }, [searchParams, router, updateAuthStore, handleCallbackError, locale])

  return { error, isProcessing }
}

export default function GoogleCallbackPage(): JSX.Element {
  const { error, isProcessing } = useCallbackProcessor()
  const tAuth = useTranslations('auth')

  if (error !== null && error !== undefined && error !== '') {
    return renderErrorState(error, tAuth)
  }

  return renderLoadingState(isProcessing, tAuth)
}
