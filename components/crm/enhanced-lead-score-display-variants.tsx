/**
 * Enhanced Lead Score Display Variants
 * Different display variants for enhanced lead score component
 */
'use client'

import { AlertCircle, BarChart3 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

import {
  FactorBreakdown,
  getScoreColor,
  getUrgencyStyle,
  TrendIndicator,
} from './enhanced-lead-score-display-utils'

// Badge variant
export function ScoreBadge({
  score,
  urgencyLevel,
  trendDirection,
  trendValue,
  showTrends,
  onScoreClick,
  className,
}: {
  score: number
  urgencyLevel?: string
  trendDirection?: string
  trendValue?: number
  showTrends?: boolean
  onScoreClick?: () => void
  className?: string
}): React.ReactElement {
  const scoreColorClass = getScoreColor(score)
  const urgencyClass = getUrgencyStyle(urgencyLevel)

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={cn(
              'cursor-pointer hover:shadow-md transition-all duration-200 font-medium px-2 py-1',
              scoreColorClass,
              urgencyClass,
              className
            )}
            onClick={onScoreClick}
          >
            <div className="flex items-center gap-1">
              <span className="text-sm font-bold">{score}</span>
              {Boolean(showTrends) && (
                <TrendIndicator
                  direction={trendDirection as 'up' | 'down' | 'stable'}
                  value={trendValue}
                  className="ml-1"
                />
              )}
              {Boolean(urgencyLevel === 'critical') && (
                <AlertCircle className="h-3 w-3 text-red-500 ml-1" />
              )}
            </div>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>Score: {score}/100</p>
          <p>Click para ver breakdown</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Card variant
export function ScoreCard({
  score,
  factors,
  urgencyLevel,
  trendDirection,
  trendValue,
  showTrends,
  showBreakdown,
  onScoreClick,
  className,
}: {
  score: number
  factors: Record<string, number>
  urgencyLevel?: string
  trendDirection?: string
  trendValue?: number
  showTrends?: boolean
  showBreakdown?: boolean
  onScoreClick?: () => void
  className?: string
}): React.ReactElement {
  const scoreColorClass = getScoreColor(score)
  const urgencyClass = getUrgencyStyle(urgencyLevel)

  return (
    <Card
      className={cn(
        'cursor-pointer hover:shadow-lg transition-all duration-200',
        urgencyClass,
        className
      )}
      onClick={onScoreClick}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <span>Lead Score</span>
          {Boolean(showTrends) && (
            <TrendIndicator
              direction={trendDirection as 'up' | 'down' | 'stable'}
              value={trendValue}
            />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg border-2',
              scoreColorClass
            )}
          >
            {score}
          </div>
          <div className="flex-1">
            <div className="text-sm text-muted-foreground mb-1">
              {score >= 80 ? 'Excellent' : ''}
              {score >= 60 && score < 80 ? 'Good' : ''}
              {score >= 40 && score < 60 ? 'Average' : ''}
              {score < 40 ? 'Needs Attention' : ''}
            </div>
            {Boolean(urgencyLevel === 'critical') && (
              <div className="flex items-center gap-1 text-xs text-red-600">
                <AlertCircle className="h-3 w-3" />
                Requires immediate action
              </div>
            )}
          </div>
        </div>
        {Boolean(showBreakdown) && (
          <div className="mt-4">
            <FactorBreakdown factors={factors} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Detailed variant
export function ScoreDetailed({
  score,
  factors,
  urgencyLevel,
  trendDirection,
  trendValue,
  showTrends,
  onScoreClick,
  className,
}: {
  score: number
  factors: Record<string, number>
  urgencyLevel?: string
  trendDirection?: string
  trendValue?: number
  showTrends?: boolean
  onScoreClick?: () => void
  className?: string
}): React.ReactElement {
  const scoreColorClass = getScoreColor(score)
  const urgencyClass = getUrgencyStyle(urgencyLevel)

  return (
    <Card className={cn('hover:shadow-lg transition-all duration-200', urgencyClass, className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex items-center justify-center w-16 h-16 rounded-full font-bold text-xl border-2',
                scoreColorClass
              )}
            >
              {score}
            </div>
            <div>
              <h3 className="text-lg font-semibold">Lead Score</h3>
              <p className="text-sm text-muted-foreground">
                {score >= 80 ? 'Excellent prospect' : ''}
                {score >= 60 && score < 80 ? 'Good potential' : ''}
                {score >= 40 && score < 60 ? 'Average quality' : ''}
                {score < 40 ? 'Needs improvement' : ''}
              </p>
            </div>
          </div>
          {Boolean(showTrends) && (
            <div className="text-right">
              <TrendIndicator
                direction={trendDirection as 'up' | 'down' | 'stable'}
                value={trendValue}
              />
              <p className="text-xs text-muted-foreground mt-1">30 days trend</p>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <FactorBreakdown factors={factors} className="mb-4" />
        {Boolean(urgencyLevel === 'critical') && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md mb-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Critical attention needed</span>
            </div>
            <p className="text-xs text-red-600 mt-1">
              This lead requires immediate follow-up to prevent loss
            </p>
          </div>
        )}
        <Button variant="outline" size="sm" onClick={onScoreClick} className="w-full">
          <BarChart3 className="h-4 w-4 mr-2" />
          View Detailed Analysis
        </Button>
      </CardContent>
    </Card>
  )
}
