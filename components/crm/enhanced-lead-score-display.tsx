/**
 * Enhanced Lead Score Display
 * Advanced visualization component for lead scoring with breakdown modal
 * Integrates with Recharts for 6-factor visualization and trend indicators
 * Story 3.3: Lead Management - Melhorias UX
 */
'use client'

import { useState } from 'react'

import { ScoreBadge, ScoreCard, ScoreDetailed } from './enhanced-lead-score-display-variants'
import { ScoreBreakdownModal } from './score-breakdown-modal'

export interface EnhancedLeadScoreDisplayProps {
  leadId?: string
  score: number
  factors: Record<string, number>
  variant: 'badge' | 'card' | 'detailed'
  showTrends?: boolean
  showBreakdown?: boolean
  urgencyLevel?: 'low' | 'medium' | 'high' | 'critical'
  trendDirection?: 'up' | 'down' | 'stable'
  trendValue?: number
  onScoreClick?: () => void
  className?: string
}

// Main component
export function EnhancedLeadScoreDisplay({
  leadId,
  score,
  factors,
  variant,
  showTrends = false,
  showBreakdown = false,
  urgencyLevel,
  trendDirection,
  trendValue,
  onScoreClick,
  className,
}: EnhancedLeadScoreDisplayProps): React.ReactElement {
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false)

  const handleScoreClick = (): void => {
    if (onScoreClick) {
      onScoreClick()
    } else {
      setIsBreakdownOpen(true)
    }
  }

  const commonProps = {
    score,
    factors,
    urgencyLevel,
    trendDirection,
    trendValue,
    showTrends,
    onScoreClick: handleScoreClick,
    className,
  }

  const renderVariant = (): React.ReactElement => {
    switch (variant) {
      case 'badge': {
        return <ScoreBadge {...commonProps} />
      }
      case 'card': {
        return <ScoreCard {...commonProps} showBreakdown={showBreakdown} />
      }
      case 'detailed': {
        return <ScoreDetailed {...commonProps} />
      }
      default: {
        return <ScoreBadge {...commonProps} />
      }
    }
  }

  return (
    <>
      {renderVariant()}
      <ScoreBreakdownModal
        isOpen={isBreakdownOpen}
        onClose={() => setIsBreakdownOpen(false)}
        leadId={leadId}
        score={score}
        factors={factors}
        trendDirection={trendDirection}
        trendValue={trendValue}
      />
    </>
  )
}

// Named export only - no default export
