/**
 * Provider Card Utilities
 * Helper functions extracted to outer scope for proper linting compliance
 */

/**
 * Format cost display with proper handling of small amounts
 */
export function formatCost(cost: number): string {
  if (cost === 0) {
    return 'Free'
  }
  if (cost < 0.01) {
    return `$${(cost * 1000).toFixed(2)}/1k`
  }
  return `$${cost.toFixed(3)}`
}

/**
 * Get status color classes based on provider status
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case 'active': {
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    }
    case 'inactive': {
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
    }
    case 'error': {
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    }
    case 'pending': {
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    }
    default: {
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
    }
  }
}
