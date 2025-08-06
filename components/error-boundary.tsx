/**
 * ERROR BOUNDARY - Multi-Tenant Error Handling with Sentry
 *
 * Componente que captura erros React e os envia para o Sentry
 * com contexto organizacional apropriado.
 */
'use client'

import * as Sentry from '@sentry/nextjs'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import React, { Component, type ErrorInfo, type ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  showDetails?: boolean
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
  eventId?: string
}

class ErrorBoundaryClass extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Capture error with Sentry and get event ID
    const eventId = Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
      extra: {
        componentStack: errorInfo.componentStack,
        errorBoundary: true,
      },
    })

    this.setState({
      error,
      errorInfo,
      eventId,
    })

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      // Console logs are acceptable in development for debugging
      // eslint-disable-next-line no-console
      console.error('Error Boundary caught an error:', error)
      // eslint-disable-next-line no-console
      console.error('Component Stack:', errorInfo.componentStack)
    }
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined, eventId: undefined })
  }

  handleReportFeedback = (): void => {
    const { eventId } = this.state
    if (eventId !== null && eventId !== undefined) {
      Sentry.showReportDialog({ eventId })
    }
  }

  private renderErrorUI(): ReactNode {
    const { error, eventId } = this.state
    const { showDetails } = this.props

    return (
      <div className="flex min-h-[400px] items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-lg">Algo deu errado</CardTitle>
            <CardDescription>
              Encontramos um erro inesperado. Nossa equipe foi notificada automaticamente.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-2">
              <Button onClick={this.handleRetry} className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Tentar novamente
              </Button>

              {Boolean(eventId) && (
                <Button variant="outline" onClick={this.handleReportFeedback} className="w-full">
                  Reportar problema
                </Button>
              )}
            </div>

            {/* Show error details in development */}
            {process.env.NODE_ENV === 'development' && Boolean(showDetails) && (
              <details className="rounded border p-2 text-xs">
                <summary className="cursor-pointer font-semibold">
                  Detalhes do erro (desenvolvimento)
                </summary>
                <div className="mt-2 space-y-2">
                  <div>
                    <strong>Erro:</strong>
                    <pre className="mt-1 whitespace-pre-wrap">{error?.message ?? 'N/A'}</pre>
                  </div>
                  <div>
                    <strong>Stack:</strong>
                    <pre className="mt-1 whitespace-pre-wrap text-xs">{error?.stack ?? 'N/A'}</pre>
                  </div>
                  {Boolean(eventId) && (
                    <div>
                      <strong>Sentry Event ID:</strong> {eventId}
                    </div>
                  )}
                </div>
              </details>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  render(): ReactNode {
    const { hasError } = this.state
    const { fallback, children } = this.props

    if (hasError) {
      // Use custom fallback if provided
      if (fallback !== null && fallback !== undefined) {
        return fallback
      }
      // Default error UI
      return this.renderErrorUI()
    }

    return children
  }
}

// Wrapper component for easier usage
export function ErrorBoundary({ children, fallback, showDetails = false }: Props): JSX.Element {
  return (
    <ErrorBoundaryClass fallback={fallback} showDetails={showDetails}>
      {children}
    </ErrorBoundaryClass>
  )
}

// Higher-order component for wrapping components
export function withErrorBoundary<P extends object>(
  ComponentToWrap: React.ComponentType<P>,
  fallback?: ReactNode
): React.ComponentType<P> {
  function WrappedComponent(props: P): JSX.Element {
    return (
      <ErrorBoundary fallback={fallback}>
        <ComponentToWrap {...props} />
      </ErrorBoundary>
    )
  }

  WrappedComponent.displayName = `withErrorBoundary(${ComponentToWrap.displayName ?? ComponentToWrap.name ?? 'Component'})`

  return WrappedComponent
}
