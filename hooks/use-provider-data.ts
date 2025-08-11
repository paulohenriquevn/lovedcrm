/**
 * Hook for managing provider data with multi-provider support.
 *
 * Provides data fetching, caching, and real-time updates for provider management.
 */

import { useCallback, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { providersService } from '@/services/providers'
import { useAuthStore } from '@/stores/auth'

export interface Provider {
  id: string
  name: string
  provider_type: string
  status: 'active' | 'inactive' | 'error' | 'pending'
  is_primary: boolean
  priority: number
  created_at: string
  updated_at: string
  last_sync_at?: string
  metadata: Record<string, any>
}

export interface ProviderType {
  total: number
  active: number
  primary?: string
  providers: Provider[]
}

export interface ProvidersData {
  organization_id: string
  provider_types: Record<string, ProviderType>
  total_providers: number
  active_providers: number
}

export interface CostComparison {
  provider_type: string
  total_providers: number
  providers: Array<{
    id: string
    name: string
    cost_per_message: number
    monthly_cost: number
    is_primary: boolean
    status: string
    potential_savings: number
    savings_percentage: number
  }>
  recommendations: string[]
}

/**
 * Hook for fetching and managing provider data
 */
export function useProviderData() {
  const { organization } = useAuthStore()
  // const queryClient = useQueryClient()

  // Fetch all providers summary
  const {
    data: providers,
    isLoading,
    error: queryError,
    refetch,
  } = useQuery<ProvidersData>({
    queryKey: ['providers', organization?.id],
    queryFn: () => providersService.getProviders(),
    enabled: !!organization?.id,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
  })

  // Convert query error to string
  const error = queryError ? String(queryError) : null

  return {
    providers: providers || null,
    isLoading,
    error,
    refetch,
  }
}

/**
 * Hook for fetching cost comparison for specific provider type
 */
export function useProviderCostComparison(providerType: string | null) {
  const { organization } = useAuthStore()

  const {
    data: costComparison,
    isLoading,
    error: queryError,
    refetch,
  } = useQuery<CostComparison>({
    queryKey: ['providers', 'cost-comparison', organization?.id, providerType],
    queryFn: () => {
      if (!providerType) throw new Error('Provider type is required')
      return providersService.getCostComparison(providerType)
    },
    enabled: !!organization?.id && !!providerType,
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false,
  })

  const error = queryError ? String(queryError) : null

  return {
    costComparison: costComparison || null,
    isLoading,
    error,
    refetch,
  }
}

/**
 * Hook for provider switching operations
 */
export function useProviderSwitch() {
  const { organization } = useAuthStore()
  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const switchProvider = useCallback(
    async (providerType: string, newProviderId: string, force = false) => {
      if (!organization?.id) {
        throw new Error('No organization selected')
      }

      setIsLoading(true)
      setError(null)

      try {
        const result = await providersService.switchProvider({
          provider_type: providerType,
          new_provider_id: newProviderId,
          force,
        })

        if (result.success) {
          // Invalidate and refetch provider data
          await queryClient.invalidateQueries({
            queryKey: ['providers', organization.id],
          })

          // Also invalidate cost comparisons
          await queryClient.invalidateQueries({
            queryKey: ['providers', 'cost-comparison', organization.id],
          })

          return result
        } else {
          throw new Error(result.message || 'Switch failed')
        }
      } catch (err: any) {
        const errorMessage = err.response?.data?.detail || err.message || 'Switch failed'
        setError(errorMessage)
        throw new Error(errorMessage)
      } finally {
        setIsLoading(false)
      }
    },
    [organization?.id, queryClient]
  )

  const validateSwitch = useCallback(
    async (providerType: string, newProviderId: string) => {
      if (!organization?.id) {
        throw new Error('No organization selected')
      }

      try {
        return await providersService.validateSwitch(providerType, newProviderId)
      } catch (err: any) {
        const errorMessage = err.response?.data?.detail || err.message || 'Validation failed'
        throw new Error(errorMessage)
      }
    },
    [organization?.id]
  )

  return {
    switchProvider,
    validateSwitch,
    isLoading,
    error,
  }
}

/**
 * Hook for fetching provider status and health
 */
export function useProviderStatus(providerType: string | null) {
  const { organization } = useAuthStore()

  const {
    data: status,
    isLoading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ['providers', 'status', organization?.id, providerType],
    queryFn: () => {
      if (!providerType) throw new Error('Provider type is required')
      return providersService.getProviderStatus(providerType)
    },
    enabled: !!organization?.id && !!providerType,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refresh every minute for health monitoring
    refetchOnWindowFocus: false,
  })

  const error = queryError ? String(queryError) : null

  return {
    status: status || null,
    isLoading,
    error,
    refetch,
  }
}
