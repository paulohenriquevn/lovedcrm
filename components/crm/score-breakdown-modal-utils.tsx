/**
 * Score Breakdown Modal Utils
 * Utility functions and hooks for score breakdown modal
 */
import { useMemo } from 'react'

import { FACTOR_CONFIG } from './score-breakdown-modal-config'

// Radar chart data preparation
export function useRadarData(factors: Record<string, number>): Array<{
  factor: string
  value: number
  fullMark: number
}> {
  return useMemo(() => {
    return Object.entries(factors).map(([key, value]) => ({
      factor: FACTOR_CONFIG[key]?.label ?? key,
      value: value,
      fullMark: FACTOR_CONFIG[key]?.maxScore ?? 100,
    }))
  }, [factors])
}
