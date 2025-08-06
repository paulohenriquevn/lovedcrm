/**
 * Billing Service - Integrado com API backend real
 */

import { logger } from '@/lib/logger'
import { BaseService } from './base'

import {
  Plan,
  Subscription,
  FeaturesResponse,
  PlanComparisonResponse,
  UpgradeRequest,
  DowngradeRequest,
  CheckoutSessionResponse,
  PlanSlug,
} from '../types/billing'

// Request interfaces for API calls
export interface UpgradePayload extends UpgradeRequest {}
export interface DowngradePayload extends DowngradeRequest {}

class BillingService extends BaseService {
  /**
   * Get available pricing plans (public endpoint)
   */
  async getAvailablePlans(): Promise<Plan[]> {
    try {
      return this.get<Plan[]>('/api/billing/available-plans', { skipAuth: true })
    } catch (error) {
      logger.apiError('Failed to get available plans', error)
      throw error
    }
  }

  /**
   * Get current organization subscription
   */
  async getCurrentPlan(): Promise<Subscription> {
    try {
      return this.get<Subscription>('/api/billing/current-plan')
    } catch (error) {
      logger.apiError('Failed to get current plan', error)
      throw error
    }
  }

  /**
   * Get organization features
   */
  async getOrganizationFeatures(): Promise<FeaturesResponse> {
    try {
      return this.get<FeaturesResponse>('/api/billing/features')
    } catch (error) {
      logger.apiError('Failed to get organization features', error)
      throw error
    }
  }

  /**
   * Get plan comparison data
   */
  async getPlanComparison(): Promise<PlanComparisonResponse> {
    try {
      return this.get<PlanComparisonResponse>('/api/billing/plan-comparison')
    } catch (error) {
      logger.apiError('Failed to get plan comparison', error)
      throw error
    }
  }

  /**
   * Upgrade to a new plan
   */
  async upgradePlan(planSlug: string): Promise<CheckoutSessionResponse> {
    try {
      const payload: UpgradePayload = { plan_slug: planSlug }
      return this.post<CheckoutSessionResponse>('/api/billing/upgrade', payload)
    } catch (error) {
      logger.apiError('Failed to upgrade plan', error)
      throw error
    }
  }

  /**
   * Downgrade to basic plan
   */
  async downgradePlan(
    reason?: string
  ): Promise<{ message: string; new_plan: string; effective_immediately: boolean }> {
    try {
      const payload: DowngradePayload = {
        confirm: true,
        reason: reason || 'User requested downgrade',
      }
      return this.post<{ message: string; new_plan: string; effective_immediately: boolean }>(
        '/api/billing/downgrade',
        payload
      )
    } catch (error) {
      logger.apiError('Failed to downgrade plan', error)
      throw error
    }
  }

  /**
   * Redirect to checkout (for upgrades)
   */
  async redirectToCheckout(planSlug: string): Promise<void> {
    try {
      const checkoutResponse = await this.upgradePlan(planSlug)

      // For free upgrades, stay on page and refresh data
      if (checkoutResponse.session_id === 'free_upgrade') {
        window.location.href = '/admin/billing?success=true'
        return
      }

      // For paid upgrades, redirect to Stripe
      window.location.href = checkoutResponse.checkout_url
    } catch (error) {
      logger.apiError('Failed to redirect to checkout', error)
      throw error
    }
  }

  /**
   * Format currency amount from cents
   */
  formatPrice(priceCents: number): string {
    const priceReais = priceCents / 100

    if (priceCents === 0) {
      return 'Gratuito'
    }

    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(priceReais)
  }

  /**
   * Format date in Portuguese
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  /**
   * Check if subscription is active
   */
  isSubscriptionActive(subscription: Subscription): boolean {
    return subscription.is_active
  }

  /**
   * Get plan slug from name (for compatibility)
   */
  getPlanSlugFromName(planName: string): string {
    switch (planName.toLowerCase()) {
      case 'básico': {
        return PlanSlug.BASIC
      }
      case 'profissional': {
        return PlanSlug.PROFESSIONAL
      }
      case 'expert': {
        return PlanSlug.EXPERT
      }
      default: {
        return PlanSlug.BASIC
      }
    }
  }

  /**
   * Check if plan is free
   */
  isPlanFree(plan: Plan): boolean {
    return plan.price_cents === 0
  }

  /**
   * Get plan features as readable list
   */
  getReadableFeatures(features: string[]): string[] {
    const featureMap: Record<string, string> = {
      user_management: 'Gestão de usuários',
      basic_dashboard: 'Dashboard básico',
      advanced_reports: 'Relatórios avançados',
      analytics: 'Analytics avançado',
      priority_support: 'Suporte prioritário',
      api_access: 'Acesso à API',
    }

    return features.map(feature => featureMap[feature] || feature)
  }
}

// Export singleton instance
export const billingService = new BillingService()
export default billingService
