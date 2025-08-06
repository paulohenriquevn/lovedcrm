/**
 * 🔍 SENTRY CONTEXT HOOK - Multi-Tenant Error Tracking
 *
 * Hook para gerenciar contexto organizacional e de usuário no Sentry
 * seguindo os padrões multi-tenant do sistema.
 */
import { useCallback, useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'

import { useOrgContext } from '@/hooks/use-org-context'
import { useAuthStore } from '@/stores/auth-store'

interface SentryUser {
  id?: string
  email?: string
  role?: string
  organizationId?: string
}

interface SentryOrganization {
  id: string
  name: string
  plan?: string
}

export function useSentryContext() {
  const { organization } = useOrgContext()
  const { user } = useAuthStore()

  /**
   * 🏢 Set organization context in Sentry
   */
  const setOrganizationContext = useCallback((org: SentryOrganization) => {
    try {
      Sentry.setTag('organization_id', org.id)
      Sentry.setTag('organization_name', org.name)

      if (org.plan) {
        Sentry.setTag('organization_plan', org.plan)
      }

      Sentry.setContext('organization', {
        id: org.id,
        name: org.name,
        plan: org.plan || 'unknown',
      })
    } catch (error) {
      console.warn('Failed to set organization context in Sentry:', error)
    }
  }, [])

  /**
   * 👤 Set user context in Sentry
   */
  const setUserContext = useCallback((sentryUser: SentryUser) => {
    try {
      // Only include email in development to avoid PII in production
      const userData: Sentry.User = {
        id: sentryUser.id,
      }

      // Include email only in development
      if (process.env.NODE_ENV === 'development' && sentryUser.email) {
        userData.email = sentryUser.email
      }

      if (sentryUser.role) {
        userData.segment = sentryUser.role // Use segment for role
      }

      Sentry.setUser(userData)

      // Set additional tags
      if (sentryUser.id) {
        Sentry.setTag('user_id', sentryUser.id)
      }
      if (sentryUser.role) {
        Sentry.setTag('user_role', sentryUser.role)
      }
      if (sentryUser.organizationId) {
        Sentry.setTag('user_organization', sentryUser.organizationId)
      }
    } catch (error) {
      console.warn('Failed to set user context in Sentry:', error)
    }
  }, [])

  /**
   * Capture business event
   */
  const captureBusinessEvent = useCallback((eventName: string, data?: Record<string, any>) => {
    try {
      Sentry.addBreadcrumb({
        message: eventName,
        category: 'business',
        level: 'info',
        data,
      })

      Sentry.captureMessage(`Business Event: ${eventName}`, 'info')
    } catch (error) {
      console.warn('Failed to capture business event:', error)
    }
  }, [])

  /**
   * Capture user error with context
   */
  const captureUserError = useCallback((error: Error, context?: Record<string, any>) => {
    try {
      if (context) {
        Sentry.withScope(scope => {
          Object.entries(context).forEach(([key, value]) => {
            scope.setExtra(key, value)
          })
          Sentry.captureException(error)
        })
      } else {
        Sentry.captureException(error)
      }
    } catch (sentryError) {
      console.warn('Failed to capture error in Sentry:', sentryError)
      // Still log the original error
      console.error('Original error:', error)
    }
  }, [])

  /**
   * Capture performance issue
   */
  const capturePerformanceIssue = useCallback(
    (operation: string, duration: number, threshold: number = 1000) => {
      if (duration > threshold) {
        try {
          Sentry.captureMessage(`Slow Operation: ${operation} took ${duration}ms`, 'warning')
        } catch (error) {
          console.warn('Failed to capture performance issue:', error)
        }
      }
    },
    []
  )

  /**
   * 🔄 Clear all context (useful for logout)
   */
  const clearContext = useCallback(() => {
    try {
      Sentry.setUser(null)
      Sentry.setTag('organization_id', null)
      Sentry.setTag('organization_name', null)
      Sentry.setTag('user_id', null)
      Sentry.setTag('user_role', null)
    } catch (error) {
      console.warn('Failed to clear Sentry context:', error)
    }
  }, [])

  // 🔄 Auto-update context when organization or user changes
  useEffect(() => {
    if (organization) {
      setOrganizationContext({
        id: organization.id,
        name: organization.name,
        plan: organization.plan,
      })
    }
  }, [organization, setOrganizationContext])

  useEffect(() => {
    if (user) {
      setUserContext({
        id: user.id,
        email: user.email,
        role: user.role,
        organizationId: organization?.id,
      })
    } else {
      // Clear user context when logged out
      Sentry.setUser(null)
    }
  }, [user, organization?.id, setUserContext])

  return {
    setOrganizationContext,
    setUserContext,
    captureBusinessEvent,
    captureUserError,
    capturePerformanceIssue,
    clearContext,
  }
}
