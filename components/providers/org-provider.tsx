/**
 * Provider para contexto organizacional global.
 * Gerencia estado organizacional e error boundaries espec�ficos.
 */

'use client'

import React, { createContext, useContext, useEffect, useState, useMemo, Component } from 'react'

import { OrgValidationError, getOrgErrorMessage } from '@/lib/org-validation'
import { useAuthStore } from '@/stores/auth'

import type { Organization } from '@/types/organization'
import type { User } from '@/types/user'

interface OrgContextData {
  // Estado organizacional
  organization: Organization | null
  user: User | null
  isLoading: boolean

  // Error state
  error: string | null
  clearError: () => void

  // Utilities
  isOwner: boolean
  isOrgReady: boolean
}

const OrgContext = createContext<OrgContextData | null>(null)

interface OrgProviderProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function OrgProvider({ children, fallback }: OrgProviderProps): JSX.Element {
  const { user, organization, isLoading: authLoading } = useAuthStore()
  const [error, setError] = useState<string | null>(null)

  // Estados derivados
  const isOwner = organization?.owner_id === user?.id
  const isOrgReady = Boolean(organization && user && !authLoading)

  /**
   * Limpar erro organizacional
   */
  const clearError = (): void => {
    setError(null)
  }

  // Listener para erros organizacionais do BaseService
  useEffect(() => {
    const handleOrgError = (event: CustomEvent): void => {
      const { endpoint, error: errorMsg } = event.detail as { endpoint: string; error: string }
      setError(`Organization access error in ${endpoint}: ${errorMsg}`)
    }

    const handleHeaderError = (event: CustomEvent): void => {
      const { endpoint, error: errorMsg } = event.detail as { endpoint: string; error: string }
      setError(`Header error in ${endpoint}: ${errorMsg}`)
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('org-access-error', handleOrgError as EventListener)
      window.addEventListener('org-header-error', handleHeaderError as EventListener)
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('org-access-error', handleOrgError as EventListener)
        window.removeEventListener('org-header-error', handleHeaderError as EventListener)
      }
    }
  }, [])

  // Auto-clear error quando organization/user mudam
  useEffect(() => {
    if ((organization !== null || user !== null) && error !== null) {
      setError(null)
    }
  }, [organization, user, error])

  const contextValue: OrgContextData = useMemo(
    () => ({
      organization,
      user,
      isLoading: authLoading,
      error,
      clearError,
      isOwner,
      isOrgReady,
    }),
    [organization, user, authLoading, error, isOwner, isOrgReady]
  )

  // Se houver erro organizacional crítico, mostrar error boundary
  if (error !== null && organization === null && !authLoading) {
    return <OrgErrorFallback error={error} onRetry={clearError} fallback={fallback} />
  }

  return (
    <OrgContext.Provider value={contextValue}>
      <OrgErrorBoundary>{children}</OrgErrorBoundary>
    </OrgContext.Provider>
  )
}

/**
 * Hook para usar contexto organizacional
 */
export function useOrgProvider(): OrgContextData {
  const context = useContext(OrgContext)

  if (!context) {
    throw new Error('useOrgProvider must be used within OrgProvider')
  }

  return context
}

/**
 * Error Boundary espec�fico para erros organizacionais
 */
interface OrgErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class OrgErrorBoundary extends Component<{ children: React.ReactNode }, OrgErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): OrgErrorBoundaryState {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, _errorInfo: React.ErrorInfo): void {
    // Log para analytics se disponível
    if (typeof window !== 'undefined') {
      const windowWithGtag = window as Window & {
        gtag?: (command: string, eventName: string, parameters?: Record<string, unknown>) => void
      }
      if (typeof windowWithGtag.gtag === 'function') {
        windowWithGtag.gtag('event', 'exception', {
          description: `Org Error: ${error.message}`,
          fatal: false,
        })
      }
    }
  }

  render(): React.ReactNode {
    const { hasError, error } = this.state
    const { children } = this.props

    if (hasError) {
      const errorMessage =
        error === null ? 'An organization error occurred' : getOrgErrorMessage(error)

      return (
        <OrgErrorFallback
          error={errorMessage}
          onRetry={() => this.setState({ hasError: false, error: null })}
        />
      )
    }

    return children
  }
}

/**
 * Componente de fallback para erros organizacionais
 */
interface OrgErrorFallbackProps {
  error: string
  onRetry: () => void
  fallback?: React.ReactNode
}

function OrgErrorFallback({ error, onRetry, fallback }: OrgErrorFallbackProps): JSX.Element {
  // Se forneceu fallback customizado, usar ele
  if (fallback !== null && fallback !== undefined) {
    return <div>{fallback}</div>
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-destructive"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 18.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>

          <h2 className="text-xl font-semibold text-foreground">Organization Error</h2>

          <p className="text-sm text-muted-foreground">{error}</p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={onRetry}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>

            <button
              type="button"
              onClick={() => {
                window.location.href = '/'
              }}
              className="px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors"
            >
              Go Home
            </button>
          </div>

          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              If this problem persists, please contact support.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * HOC para garantir contexto organizacional
 */
export function withOrgContext<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  return function WithOrgContextComponent(props: P) {
    return (
      <OrgProvider>
        <Component {...props} />
      </OrgProvider>
    )
  }
}

/**
 * Hook para validar se componente tem contexto organizacional necess�rio
 */
export function useRequireOrg(): OrgContextData & { isReady: true } {
  const context = useOrgProvider()

  if (!context.isOrgReady) {
    throw new OrgValidationError('missing-org-context')
  }

  return {
    ...context,
    isReady: true as const,
  }
}
