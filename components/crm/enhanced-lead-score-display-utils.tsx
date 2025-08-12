/**
 * Enhanced Lead Score Display Utils
 * Utility functions and styling helpers for enhanced lead score display
 */
import { Minus, TrendingDown, TrendingUp } from 'lucide-react'

import { cn } from '@/lib/utils'

// Score color mapping
export const getScoreColor = (score: number): string => {
  if (score >= 80) {
    return 'text-green-600 bg-green-50 border-green-200'
  }
  if (score >= 60) {
    return 'text-blue-600 bg-blue-50 border-blue-200'
  }
  if (score >= 40) {
    return 'text-yellow-600 bg-yellow-50 border-yellow-200'
  }
  return 'text-red-600 bg-red-50 border-red-200'
}

// Urgency level styling
export const getUrgencyStyle = (urgencyLevel?: string): string => {
  switch (urgencyLevel) {
    case 'critical': {
      return 'animate-pulse border-red-500 shadow-red-200 shadow-lg'
    }
    case 'high': {
      return 'border-orange-400 shadow-orange-100 shadow-md'
    }
    case 'medium': {
      return 'border-yellow-400 shadow-yellow-100 shadow-sm'
    }
    default: {
      return ''
    }
  }
}

// Trend indicator component
export function TrendIndicator({
  direction,
  value,
  className,
}: {
  direction?: 'up' | 'down' | 'stable'
  value?: number
  className?: string
}): React.ReactElement | null {
  if (!direction || direction === 'stable') {
    return (
      <span title="Score estável">
        <Minus className={cn('h-3 w-3 text-gray-400', className)} />
      </span>
    )
  }

  const isUp = direction === 'up'
  const Icon = isUp ? TrendingUp : TrendingDown
  const colorClass = isUp ? 'text-green-500' : 'text-red-500'

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <Icon className={cn('h-3 w-3', colorClass)} />
      {value !== undefined && (
        <span className={cn('text-xs font-medium', colorClass)}>
          {isUp ? '+' : ''}
          {value}
        </span>
      )}
    </div>
  )
}

// Factor breakdown bars component
export function FactorBreakdown({
  factors,
  className,
}: {
  factors: Record<string, number>
  className?: string
}): React.ReactElement {
  const factorLabels: Record<string, string> = {
    emailAuthority: 'Email',
    phoneComplete: 'Phone',
    estimatedValue: 'Value',
    sourceQuality: 'Source',
    companySize: 'Company',
    engagement: 'Engagement',
  }

  return (
    <div className={cn('space-y-2', className)}>
      {Object.entries(factors).map(([factor, value]) => (
        <div key={factor} className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">{factorLabels[factor] ?? factor}</span>
            <span className="font-medium">{value}/100</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div className="bg-blue-600 h-1 rounded-full" style={{ width: `${value}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}
