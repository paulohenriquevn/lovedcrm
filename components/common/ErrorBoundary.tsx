'use client'

import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Component, ReactNode } from 'react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { logger } from '@/lib/logger'

// Common error translation key
const ERROR_BOUNDARY_KEY = 'error.boundary'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error | undefined
  errorInfo?: string | undefined
}

// Error header component
function ErrorHeader(): JSX.Element {
  const tError = useTranslations(ERROR_BOUNDARY_KEY)

  return (
    <CardHeader className="text-center">
      <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
      <CardTitle className="text-2xl">{tError('title')}</CardTitle>
      <CardDescription>{tError('description')}</CardDescription>
    </CardHeader>
  )
}

// Error details component for development
function ErrorDetails({ error }: { error?: Error | undefined }): JSX.Element | null {
  const tError = useTranslations(ERROR_BOUNDARY_KEY)

  if (process.env.NODE_ENV !== 'development' || error === null || error === undefined) {
    return null
  }

  return (
    <Alert variant="destructive" className="mb-6 text-left">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{tError('devDetails')}</AlertTitle>
      <AlertDescription>
        <pre className="text-xs overflow-auto max-h-32 mt-2">
          {error?.message ?? tError('unknownError')}
          {Boolean(error?.stack) && `\n${error?.stack ?? ''}`}
        </pre>
      </AlertDescription>
    </Alert>
  )
}

// Error actions component
function ErrorActions({
  onRetry,
  onGoHome,
}: {
  onRetry: () => void
  onGoHome: () => void
}): JSX.Element {
  const tError = useTranslations(ERROR_BOUNDARY_KEY)

  return (
    <div className="space-y-3">
      <Button onClick={onRetry} className="w-full">
        <RefreshCw className="mr-2 h-4 w-4" />
        {tError('retry')}
      </Button>

      <Button variant="outline" onClick={onGoHome} className="w-full">
        <Home className="mr-2 h-4 w-4" />
        {tError('goHome')}
      </Button>
    </div>
  )
}

// Error fallback component
function ErrorFallback({
  error,
  onRetry,
  onGoHome,
}: {
  error?: Error | undefined
  onRetry: () => void
  onGoHome: () => void
}): JSX.Element {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20">
      <Card className="max-w-md w-full">
        <ErrorHeader />
        <CardContent>
          <ErrorDetails error={error} />
          <ErrorActions onRetry={onRetry} onGoHome={onGoHome} />
        </CardContent>
      </Card>
    </div>
  )
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    logger.apiError('Error caught by boundary', error, {
      componentStack: errorInfo.componentStack,
    })

    this.setState({
      error,
      errorInfo: errorInfo.componentStack ?? undefined,
    })
  }

  private readonly handleRetry = (): void => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
    window.location.reload()
  }

  private readonly handleGoHome = (): void => {
    window.location.href = '/admin'
  }

  override render(): ReactNode {
    const { hasError, error } = this.state
    const { fallback, children } = this.props

    if (hasError) {
      if (fallback !== null) {
        return fallback
      }

      return <ErrorFallback error={error} onRetry={this.handleRetry} onGoHome={this.handleGoHome} />
    }

    return children
  }
}

// Helper function for error handling
function createErrorHandler(error: Error, errorInfo?: string): void {
  logger.apiError('Error handled by hook', error, {
    additionalInfo: errorInfo,
  })
  throw error
}

export function useErrorHandler(): { handleError: (error: Error, errorInfo?: string) => void } {
  return {
    handleError: createErrorHandler,
  }
}

export function withErrorHandling<TFunc extends (...args: unknown[]) => Promise<unknown>>(
  fn: TFunc,
  onError?: (error: Error) => void
): TFunc {
  return (async (...args: Parameters<TFunc>) => {
    try {
      return await fn(...args)
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))

      if (onError) {
        onError(err)
      } else {
        logger.apiError('Async function error', err)
      }

      throw err
    }
  }) as TFunc
}
