/**
 * Simplified Score Breakdown Modal
 * Reduced complexity version to pass linting
 */
'use client'

import { TrendingDown, TrendingUp } from 'lucide-react'
import { useMemo } from 'react'

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

import { ExportOptions } from './score-breakdown-modal-components'
import { generateHistoricalData } from './score-breakdown-modal-config'
import { ModalTabsContent } from './score-breakdown-modal-tabs'
import { useRadarData } from './score-breakdown-modal-utils'

export interface ScoreBreakdownModalProps {
  isOpen: boolean
  onClose: () => void
  score: number
  factors: Record<string, number>
  trendDirection?: 'up' | 'down' | 'stable'
  trendValue?: number
  leadId?: string
}

// Helper to get score color
function getScoreColor(score: number): string {
  if (score >= 80) {
    return 'text-green-600'
  }
  if (score >= 60) {
    return 'text-blue-600'
  }
  if (score >= 40) {
    return 'text-yellow-600'
  }
  return 'text-red-600'
}

// Trend indicator component
function TrendIndicator({
  trendDirection,
  trendValue,
}: {
  trendDirection?: string
  trendValue?: number
}): React.ReactElement | null {
  if (trendDirection === undefined || trendDirection === null || trendDirection === 'stable') {
    return null
  }

  const isUp = trendDirection === 'up'
  const Icon = isUp ? TrendingUp : TrendingDown
  const color = isUp ? 'text-green-500' : 'text-red-500'

  return (
    <div className="ml-auto flex items-center gap-1">
      <Icon className={cn('h-5 w-5', color)} />
      <span className={cn('text-sm font-medium', color)}>
        {isUp ? '+' : ''}
        {trendValue ?? 0}
      </span>
    </div>
  )
}

function ModalHeader({
  score,
  trendDirection,
  trendValue,
}: {
  score: number
  trendDirection?: string
  trendValue?: number
}): React.ReactElement {
  return (
    <DialogTitle className="flex items-center gap-3">
      <div className={cn('text-3xl font-bold', getScoreColor(score))}>{score}</div>
      <div>
        <h2>Lead Score Breakdown</h2>
        <p className="text-sm text-muted-foreground font-normal">
          Detailed analysis of 6-factor scoring system
        </p>
      </div>
      <TrendIndicator trendDirection={trendDirection} trendValue={trendValue} />
    </DialogTitle>
  )
}

export function ScoreBreakdownModal({
  isOpen,
  onClose,
  score,
  factors,
  trendDirection,
  trendValue,
}: ScoreBreakdownModalProps): React.ReactElement {
  const radarData = useRadarData(factors)
  const historicalData = useMemo(
    () => generateHistoricalData(score, trendDirection),
    [score, trendDirection]
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <ModalHeader score={score} trendDirection={trendDirection} trendValue={trendValue} />
        </DialogHeader>

        <ModalTabsContent radarData={radarData} historicalData={historicalData} factors={factors} />

        <DialogFooter className="flex items-center justify-between">
          <ExportOptions score={score} factors={factors} onClose={onClose} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
