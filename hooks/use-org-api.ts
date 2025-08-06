/**
 * Hook para API calls organization-aware.
 * Wrapper sobre BaseService que garante contexto organizacional correto.
 */

import { useCallback } from 'react'
import { useOrgContext } from './use-org-context'
import { BaseService } from '@/services/base'

interface RequestOptions extends RequestInit {
  skipAuth?: boolean
  skipOrgHeader?: boolean
}

export interface OrgApiData {
  // Informações da organização
  orgId: string | null
  isOrgLoaded: boolean

  // API methods com contexto organizacional garantido
  get: <T>(endpoint: string, options?: RequestOptions) => Promise<T>
  post: <T>(endpoint: string, data?: any, options?: RequestOptions) => Promise<T>
  put: <T>(endpoint: string, data?: any, options?: RequestOptions) => Promise<T>
  patch: <T>(endpoint: string, data?: any, options?: RequestOptions) => Promise<T>
  delete: <T>(endpoint: string, options?: RequestOptions) => Promise<T>

  // Utilities
  requireOrg: () => void
  validateEndpoint: (endpoint: string) => boolean
}

/**
 * Service interno que extende BaseService para usar com hooks
 */
class OrgAwareApiService extends BaseService {
  // Expor métodos protegidos como públicos para o hook
  public makeRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, options)
  }
}

// Instância singleton do service
const orgApiService = new OrgAwareApiService()

export function useOrgApi(): OrgApiData {
  const { orgId, isOrgLoaded, requireOrgAccess, validateOrgAccess } = useOrgContext()

  /**
   * Requer que organização esteja carregada
   */
  const requireOrg = useCallback(() => {
    requireOrgAccess()
  }, [requireOrgAccess])

  /**
   * Valida se endpoint é apropriado para o contexto atual
   */
  const validateEndpoint = useCallback(
    (endpoint: string): boolean => {
      // Endpoints que sempre requerem organização
      const orgRequiredPatterns = [
        '/api/organizations/',
        '/api/members/',
        '/api/invites/',
        '/api/billing/',
        '/api/admin/',
      ]

      const requiresOrg = orgRequiredPatterns.some(pattern => endpoint.startsWith(pattern))

      if (requiresOrg) {
        return validateOrgAccess()
      }

      return true // Endpoint não requer org, sempre válido
    },
    [validateOrgAccess]
  )

  /**
   * GET request com contexto organizacional
   */
  const get = useCallback(
    <T>(endpoint: string, options: RequestOptions = {}): Promise<T> => {
      if (!validateEndpoint(endpoint)) {
        throw new Error(`Organization context required for endpoint: ${endpoint}`)
      }

      return orgApiService.makeRequest<T>(endpoint, {
        ...options,
        method: 'GET',
      })
    },
    [validateEndpoint]
  )

  /**
   * POST request com contexto organizacional
   */
  const post = useCallback(
    <T>(endpoint: string, data?: any, options: RequestOptions = {}): Promise<T> => {
      if (!validateEndpoint(endpoint)) {
        throw new Error(`Organization context required for endpoint: ${endpoint}`)
      }

      return orgApiService.makeRequest<T>(endpoint, {
        ...options,
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
      })
    },
    [validateEndpoint]
  )

  /**
   * PUT request com contexto organizacional
   */
  const put = useCallback(
    <T>(endpoint: string, data?: any, options: RequestOptions = {}): Promise<T> => {
      if (!validateEndpoint(endpoint)) {
        throw new Error(`Organization context required for endpoint: ${endpoint}`)
      }

      return orgApiService.makeRequest<T>(endpoint, {
        ...options,
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
      })
    },
    [validateEndpoint]
  )

  /**
   * PATCH request com contexto organizacional
   */
  const patch = useCallback(
    <T>(endpoint: string, data?: any, options: RequestOptions = {}): Promise<T> => {
      if (!validateEndpoint(endpoint)) {
        throw new Error(`Organization context required for endpoint: ${endpoint}`)
      }

      return orgApiService.makeRequest<T>(endpoint, {
        ...options,
        method: 'PATCH',
        body: data ? JSON.stringify(data) : undefined,
      })
    },
    [validateEndpoint]
  )

  /**
   * DELETE request com contexto organizacional
   */
  const deleteRequest = useCallback(
    <T>(endpoint: string, options: RequestOptions = {}): Promise<T> => {
      if (!validateEndpoint(endpoint)) {
        throw new Error(`Organization context required for endpoint: ${endpoint}`)
      }

      return orgApiService.makeRequest<T>(endpoint, {
        ...options,
        method: 'DELETE',
      })
    },
    [validateEndpoint]
  )

  return {
    // Informações
    orgId,
    isOrgLoaded,

    // API methods
    get,
    post,
    put,
    patch,
    delete: deleteRequest,

    // Utilities
    requireOrg,
    validateEndpoint,
  }
}

/**
 * Hook simplificado para API calls básicas com org context
 */
export function useOrgQuery() {
  const { get, orgId, isOrgLoaded } = useOrgApi()

  return {
    get,
    orgId,
    isReady: isOrgLoaded,
  }
}

/**
 * Hook para mutations com org context
 */
export function useOrgMutation() {
  const { post, put, patch, delete: del, orgId, isOrgLoaded } = useOrgApi()

  return {
    post,
    put,
    patch,
    delete: del,
    orgId,
    isReady: isOrgLoaded,
  }
}
