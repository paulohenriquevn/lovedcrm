/**
 * Providers Service
 * Service for Provider management with organizational isolation
 * Follows template BaseService pattern with X-Org-Id headers
 */

import { BaseService } from './base'

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

export interface SwitchProviderRequest {
  provider_type: string
  new_provider_id: string
  force?: boolean
}

export interface ValidationResult {
  safe_to_switch: boolean
  warnings: string[]
  blockers: string[]
  recommendations: string[]
}

class ProvidersService extends BaseService {
  private readonly baseUrl = '/api/providers'

  /**
   * Get all providers summary for organization
   */
  async getProviders(): Promise<ProvidersData> {
    return this.get<ProvidersData>(this.baseUrl)
  }

  /**
   * Get cost comparison for specific provider type
   */
  async getCostComparison(providerType: string): Promise<CostComparison> {
    return this.get<CostComparison>(`${this.baseUrl}/cost-comparison/${providerType}`)
  }

  /**
   * Switch primary provider with atomic hot-swap
   */
  async switchProvider(request: SwitchProviderRequest): Promise<{
    success: boolean
    message: string
    provider_id?: string
  }> {
    return this.post<{
      success: boolean
      message: string
      provider_id?: string
    }>(`${this.baseUrl}/switch`, request)
  }

  /**
   * Validate provider switch before execution
   */
  async validateSwitch(providerType: string, newProviderId: string): Promise<ValidationResult> {
    return this.post<ValidationResult>(`${this.baseUrl}/validate-switch`, {
      provider_type: providerType,
      new_provider_id: newProviderId,
    })
  }

  /**
   * Get provider status and health for specific type
   */
  async getProviderStatus(providerType: string): Promise<{
    provider_type: string
    primary_provider: Provider | null
    backup_providers: Provider[]
    health_status: 'healthy' | 'warning' | 'critical'
    last_health_check: string
  }> {
    return this.get<{
      provider_type: string
      primary_provider: Provider | null
      backup_providers: Provider[]
      health_status: 'healthy' | 'warning' | 'critical'
      last_health_check: string
    }>(`${this.baseUrl}/status/${providerType}`)
  }

  /**
   * Create new provider configuration
   */
  async createProvider(providerData: {
    provider_type: string
    name: string
    encrypted_credentials: string
    metadata?: Record<string, any>
    is_primary?: boolean
    priority?: number
  }): Promise<Provider> {
    return this.post<Provider>(this.baseUrl, providerData)
  }

  /**
   * Update provider configuration
   */
  async updateProvider(
    providerId: string,
    updates: {
      name?: string
      encrypted_credentials?: string
      metadata?: Record<string, any>
      priority?: number
    }
  ): Promise<Provider> {
    return this.put<Provider>(`${this.baseUrl}/${providerId}`, updates)
  }

  /**
   * Delete provider configuration
   */
  async deleteProvider(providerId: string): Promise<void> {
    return this.delete(`${this.baseUrl}/${providerId}`)
  }

  /**
   * Test provider connection
   */
  async testProvider(providerId: string): Promise<{
    success: boolean
    message: string
    response_time_ms?: number
    details?: Record<string, any>
  }> {
    return this.post<{
      success: boolean
      message: string
      response_time_ms?: number
      details?: Record<string, any>
    }>(`${this.baseUrl}/${providerId}/test`, {})
  }

  /**
   * Get provider health metrics
   */
  async getProviderMetrics(
    providerId: string,
    period: '24h' | '7d' | '30d' = '24h'
  ): Promise<{
    provider_id: string
    period: string
    total_messages: number
    success_rate: number
    avg_response_time: number
    error_rate: number
    cost_metrics: {
      total_cost: number
      cost_per_message: number
      projected_monthly_cost: number
    }
    hourly_stats: Array<{
      hour: string
      messages_sent: number
      errors: number
      avg_response_time: number
    }>
  }> {
    return this.get<{
      provider_id: string
      period: string
      total_messages: number
      success_rate: number
      avg_response_time: number
      error_rate: number
      cost_metrics: {
        total_cost: number
        cost_per_message: number
        projected_monthly_cost: number
      }
      hourly_stats: Array<{
        hour: string
        messages_sent: number
        errors: number
        avg_response_time: number
      }>
    }>(`${this.baseUrl}/${providerId}/metrics?period=${period}`)
  }
}

// Export singleton instance
export const providersService = new ProvidersService()
export default providersService
