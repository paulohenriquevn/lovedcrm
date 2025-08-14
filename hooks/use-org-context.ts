/**
 * Hook para contexto organizacional multi-tenant.
 * Fornece informações e utilities sobre a organização atual do usuário.
 */

import { useCallback, useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/auth'
import type { Organization } from '@/types/organization'

export interface OrgContextData {
  // Estado da organização
  organization: Organization | null
  orgId: string | null
  isOrgLoaded: boolean
  isOwner: boolean
  isAdmin: boolean
  isMember: boolean

  // Utilities
  validateOrgAccess: (requiredOrgId?: string) => boolean
  requireOrgAccess: (requiredOrgId?: string) => void
  hasRole: (roles: string[]) => boolean

  // Error handling
  orgError: string | null
  clearOrgError: () => void
}

export function useOrgContext(): OrgContextData {
  const { user, organization } = useAuthStore()
  const [orgError, setOrgError] = useState<string | null>(null)

  // Computar estados derivados
  const orgId = organization?.id || null
  const isOrgLoaded = !!organization
  const isOwner = organization?.owner_id === user?.id
  const isAdmin = false // Role management via RBAC system em use-permissions.ts
  const isMember = isOrgLoaded // Se tem organização, é membro

  /**
   * Valida se usuário tem acesso à organização especificada
   */
  const validateOrgAccess = useCallback(
    (requiredOrgId?: string): boolean => {
      // Se não especificou org requerida, apenas verificar se tem alguma org
      if (!requiredOrgId) {
        return isOrgLoaded
      }

      // Verificar se org atual === org requerida
      if (!orgId) {
        return false
      }

      return orgId === requiredOrgId
    },
    [orgId, isOrgLoaded]
  )

  /**
   * Requer acesso à organização (throw error se não tiver)
   */
  const requireOrgAccess = useCallback(
    (requiredOrgId?: string): void => {
      if (!validateOrgAccess(requiredOrgId)) {
        const errorMsg = requiredOrgId
          ? `Access denied: Current organization (${orgId}) does not match required organization (${requiredOrgId})`
          : 'Organization context is required but not available'

        setOrgError(errorMsg)
        throw new Error(errorMsg)
      }
    },
    [validateOrgAccess, orgId]
  )

  /**
   * Verifica se usuário tem uma das roles especificadas
   */
  const hasRole = useCallback(
    (roles: string[]): boolean => {
      if (!isOrgLoaded) return false

      // Por enquanto, owner tem todas as permissões
      if (isOwner) return true

      // Role management implementado via use-permissions.ts hook
      // Verificar contra organization.members ou user.organizationMemberships
      return roles.includes('member') // Default: member role
    },
    [isOrgLoaded, isOwner]
  )

  /**
   * Limpar erro organizacional
   */
  const clearOrgError = useCallback(() => {
    setOrgError(null)
  }, [])

  // Listener para erros organizacionais do BaseService
  useEffect(() => {
    const handleOrgError = (event: CustomEvent) => {
      const { endpoint, error } = event.detail
      setOrgError(`Organization error in ${endpoint}: ${error}`)
    }

    const handleHeaderError = (event: CustomEvent) => {
      const { endpoint, error } = event.detail
      setOrgError(`Header error in ${endpoint}: ${error}`)
    }

    window.addEventListener('org-access-error', handleOrgError as EventListener)
    window.addEventListener('org-header-error', handleHeaderError as EventListener)

    return () => {
      window.removeEventListener('org-access-error', handleOrgError as EventListener)
      window.removeEventListener('org-header-error', handleHeaderError as EventListener)
    }
  }, [])

  // Auto-clear error quando organização muda
  useEffect(() => {
    if (organization && orgError) {
      setOrgError(null)
    }
  }, [organization, orgError])

  return {
    // Estado
    organization,
    orgId,
    isOrgLoaded,
    isOwner,
    isAdmin,
    isMember,

    // Utilities
    validateOrgAccess,
    requireOrgAccess,
    hasRole,

    // Error handling
    orgError,
    clearOrgError,
  }
}

/**
 * Hook simplificado para apenas pegar orgId
 */
export function useOrgId(): string | null {
  const { orgId } = useOrgContext()
  return orgId
}

/**
 * Hook para verificar se é owner da organização
 */
export function useIsOrgOwner(): boolean {
  const { isOwner } = useOrgContext()
  return isOwner
}
