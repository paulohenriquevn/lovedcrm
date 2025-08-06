'use client'

import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { authService } from '@/services/auth'

interface VerificationResult {
  success: boolean
  message: string
}

// Loading State Component
function LoadingState(): JSX.Element {
  return (
    <div className="text-center space-y-4">
      <Loader2 className="h-16 w-16 text-primary mx-auto animate-spin" />
      <div>
        <h3 className="text-lg font-semibold">Verificando email...</h3>
        <p className="text-muted-foreground mt-2">Aguarde enquanto verificamos seu email.</p>
      </div>
    </div>
  )
}

// Success State Component
function SuccessState({ message }: { message: string }): JSX.Element {
  return (
    <div className="text-center space-y-4">
      <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
      <div>
        <h3 className="text-lg font-semibold text-green-800">Email Verificado!</h3>
        <p className="text-green-600 mt-2">{message}</p>
      </div>
    </div>
  )
}

// Error State Component
function ErrorState({ message }: { message: string }): JSX.Element {
  return (
    <div className="text-center space-y-4">
      <XCircle className="h-16 w-16 text-red-600 mx-auto" />
      <div>
        <h3 className="text-lg font-semibold text-red-800">Erro na Verificação</h3>
        <p className="text-red-600 mt-2">{message}</p>
      </div>
    </div>
  )
}

// Helper function to handle success result
function createSuccessResult(response: { message?: string }): VerificationResult {
  return {
    success: true,
    message: response.message ?? 'Email verificado com sucesso! Você já pode fazer login.',
  }
}

// Helper function to handle error result
function createErrorResult(error: unknown): VerificationResult {
  const errorMessage =
    error instanceof Error ? error.message : 'Erro de conexão. Tente novamente mais tarde.'
  return {
    success: false,
    message: errorMessage,
  }
}

// Hook for email verification logic
function useEmailVerification(token: string | null) {
  const [result, setResult] = useState<VerificationResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const hasVerified = useRef(false)

  useEffect(() => {
    const verifyEmail = async (): Promise<void> => {
      if (hasVerified.current) {
        // eslint-disable-next-line no-console
        void console.log('Verification already attempted, skipping...')
        return
      }

      if (token === null || token === undefined || token === '') {
        setResult({
          success: false,
          message: 'Token de verificação não encontrado na URL',
        })
        setIsLoading(false)
        return
      }

      hasVerified.current = true

      try {
        // eslint-disable-next-line no-console
        console.log('Starting email verification for token:', token)
        const response = await authService.verifyEmail(token)
        // eslint-disable-next-line no-console
        console.log('Email verification successful:', response)
        setResult(createSuccessResult(response))
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Email verification failed:', error)
        setResult(createErrorResult(error))
      } finally {
        setIsLoading(false)
      }
    }

    void verifyEmail()
  }, [token])

  return { result, isLoading }
}

// Loading view component
function LoadingView(): JSX.Element {
  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/20">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Verificação de Email</CardTitle>
          <CardDescription>Aguarde enquanto verificamos seu email</CardDescription>
        </CardHeader>
        <CardContent>
          <LoadingState />
        </CardContent>
      </Card>
    </div>
  )
}

// Action buttons component
function ActionButtons({
  success,
  onGoToLogin,
  onGoHome,
}: {
  success: boolean
  onGoToLogin: () => void
  onGoHome: () => void
}): JSX.Element {
  return (
    <div className="mt-6 space-y-3">
      {success ? (
        <>
          <Button onClick={onGoToLogin} className="w-full">
            Ir para Login
          </Button>
          <Button variant="secondary" onClick={onGoHome} className="w-full">
            Voltar ao Início
          </Button>
        </>
      ) : (
        <>
          <Button variant="secondary" onClick={onGoHome} className="w-full">
            Voltar ao Início
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Se o problema persistir, entre em contato com o suporte.
          </p>
        </>
      )}
    </div>
  )
}

// Result view component
function ResultView({
  result,
  onGoToLogin,
  onGoHome,
}: {
  result: VerificationResult | null
  onGoToLogin: () => void
  onGoHome: () => void
}): JSX.Element {
  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/20">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Verificação de Email</CardTitle>
          <CardDescription>Resultado da verificação</CardDescription>
        </CardHeader>
        <CardContent>
          {result?.success === true ? (
            <SuccessState message={result.message} />
          ) : (
            <ErrorState message={result?.message ?? 'Erro desconhecido'} />
          )}
          <ActionButtons
            success={result?.success === true}
            onGoToLogin={onGoToLogin}
            onGoHome={onGoHome}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default function VerifyEmailPage(): JSX.Element {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const { result, isLoading } = useEmailVerification(token)

  const handleGoToLogin = (): void => {
    void router.push('/auth/login')
  }

  const handleGoHome = (): void => {
    void router.push('/')
  }

  if (isLoading) {
    return <LoadingView />
  }

  return <ResultView result={result} onGoToLogin={handleGoToLogin} onGoHome={handleGoHome} />
}
