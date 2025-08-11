/**
 * Cost Analytics Utilities
 * Utility functions for cost calculations and analysis
 */

import type { Provider } from './cost-analytics-types'

/**
 * Find the cheapest provider from a list of providers
 */
export function findCheapestProvider(providers: Provider[]): Provider {
  if (providers.length === 0) {
    throw new Error('No providers available')
  }

  const [firstProvider] = providers
  if (!firstProvider) {
    throw new Error('First provider is undefined')
  }

  let cheapest = firstProvider
  for (const provider of providers) {
    if (provider.monthly_cost < cheapest.monthly_cost) {
      cheapest = provider
    }
  }
  return cheapest
}

/**
 * Find the most expensive provider from a list of providers
 */
export function findMostExpensiveProvider(providers: Provider[]): Provider {
  if (providers.length === 0) {
    throw new Error('No providers available')
  }

  const [firstProvider] = providers
  if (!firstProvider) {
    throw new Error('First provider is undefined')
  }

  let mostExpensive = firstProvider
  for (const provider of providers) {
    if (provider.monthly_cost > mostExpensive.monthly_cost) {
      mostExpensive = provider
    }
  }
  return mostExpensive
}

/**
 * Find the primary provider from a list of providers
 */
export function findPrimaryProvider(providers: Provider[]): Provider | undefined {
  return providers.find(p => p.is_primary)
}

/**
 * Calculate potential savings between two providers
 */
export function calculateSavings(
  currentProvider: Provider,
  cheaperProvider: Provider
): { amount: number; percentage: number } {
  const amount = currentProvider.monthly_cost - cheaperProvider.monthly_cost
  const percentage = (amount / currentProvider.monthly_cost) * 100

  return { amount, percentage }
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`
}

/**
 * Format cost per message
 */
export function formatCostPerMessage(cost: number): string {
  return `$${cost.toFixed(4)}`
}
