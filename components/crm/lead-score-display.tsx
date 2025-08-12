/**
 * Lead Score Display Component
 * 
 * Displays lead score with color-coded badges and detailed factor breakdown.
 * Integrates with 6-factor scoring algorithm from backend.
 */

"use client"

import React from 'react'
import { InfoIcon, TrendingUpIcon, TrendingDownIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface LeadScoreDisplayProps {
  score: number
  factors?: Record<string, number>
  showBreakdown?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
  variant?: 'badge' | 'full' | 'minimal'
}

interface FactorConfig {
  name: string
  maxPoints: number
  description: string
}

interface ProcessedFactor {
  name: string
  points: number
  maxPoints: number
  description: string
  percentage: number
}

const FACTOR_CONFIG: Record<string, FactorConfig> = {
  emailAuthority: {
    name: 'Email Authority',
    maxPoints: 10,
    description: 'Corporate domain vs consumer email'
  },
  phoneComplete: {
    name: 'Phone Complete',
    maxPoints: 5,
    description: 'Phone number completeness'
  },
  valueTier: {
    name: 'Value Tier', 
    maxPoints: 20,
    description: 'Estimated deal value tier'
  },
  sourceQuality: {
    name: 'Source Quality',
    maxPoints: 15,
    description: 'Lead source reputation'
  },
  companySize: {
    name: 'Company Size',
    maxPoints: 25,
    description: 'Company size indicators'
  },
  engagement: {
    name: 'Recent Engagement',
    maxPoints: 15,
    description: 'Recency of interactions'
  }
} as const

// Extract utility functions
const getScoreVariant = (score: number): 'default' | 'secondary' | 'outline' | 'destructive' => {
  if (score >= 80) {
    return 'default' // Green - high priority
  }
  if (score >= 60) {
    return 'secondary' // Blue - medium priority  
  }
  if (score >= 40) {
    return 'outline' // Gray - low priority
  }
  return 'destructive' // Red - very low priority
}

const getScoreColor = (score: number): string => {
  if (score >= 80) {
    return 'text-green-700 bg-green-50 border-green-200'
  }
  if (score >= 60) {
    return 'text-blue-700 bg-blue-50 border-blue-200'
  }
  if (score >= 40) {
    return 'text-slate-700 bg-slate-50 border-slate-200'
  }
  return 'text-red-700 bg-red-50 border-red-200'
}

const getScoreIcon = (score: number): React.ReactElement => {
  if (score >= 70) {
    return <TrendingUpIcon className="h-3 w-3" />
  }
  if (score >= 40) {
    return <InfoIcon className="h-3 w-3" />
  }
  return <TrendingDownIcon className="h-3 w-3" />
}

const formatFactorName = (factor: string): string => {
  const config = FACTOR_CONFIG[factor as keyof typeof FACTOR_CONFIG]
  if (config) {
    return config.name
  }
  return factor.replaceAll('_', ' ').replaceAll(/\b\w/g, l => l.toUpperCase())
}

const getFactorDescription = (factor: string): string => {
  const config = FACTOR_CONFIG[factor as keyof typeof FACTOR_CONFIG]
  return config?.description ?? ''
}

const getMaxPointsForFactor = (factor: string): number => {
  const config = FACTOR_CONFIG[factor as keyof typeof FACTOR_CONFIG]
  return config?.maxPoints ?? 10
}

// Score quality messages
const getScoreQualityMessage = (score: number): string => {
  if (score >= 80) {
    return "🎯 Excellent lead quality - prioritize for immediate contact"
  }
  if (score >= 60) {
    return "✅ Good lead quality - follow up within 24h"
  }
  if (score >= 40) {
    return "⚠️ Medium lead quality - qualify further before pursuing"
  }
  return "🔍 Low lead quality - may need additional validation"
}

// Main rendering functions
function renderMinimalVariant(score: number, className?: string): React.ReactElement {
  return (
    <span className={cn("text-sm font-medium", getScoreColor(score).split(' ')[0], className)}>
      {score}/100
    </span>
  )
}

function renderScoreBreakdownTooltip(
  factorBreakdown: ProcessedFactor[], 
  score: number
): React.ReactElement {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help hover:text-foreground transition-colors" />
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-sm p-4">
          <div className="space-y-3">
            <div className="font-semibold text-sm border-b pb-2 flex items-center justify-between">
              <span>Score Breakdown</span>
              <span className="text-lg font-bold">{score}/100</span>
            </div>
            <div className="space-y-2">
              {factorBreakdown.map((factor) => (
                <div key={factor.name} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground font-medium">{factor.name}</span>
                    <span className="font-bold text-foreground">{factor.points}pts</span>
                  </div>
                  {factor.description.length > 0 && (
                    <div className="text-xs text-muted-foreground">{factor.description}</div>
                  )}
                  <Progress 
                    value={factor.percentage} 
                    className="h-1.5"
                  />
                </div>
              ))}
            </div>
            <div className="border-t pt-2 text-xs text-muted-foreground">
              Score calculated using 6-factor ML algorithm
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function renderBadgeVariant({
  score,
  size,
  className,
  showBreakdown,
  factorBreakdown
}: {
  score: number
  size: 'sm' | 'md' | 'lg'
  className?: string
  showBreakdown?: boolean
  factorBreakdown?: ProcessedFactor[]
}): React.ReactElement {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Score Badge */}
      <Badge 
        variant={getScoreVariant(score)} 
        className={cn(
          "font-semibold transition-all duration-200 border",
          size === 'sm' && "text-xs px-1.5 py-0.5",
          size === 'md' && "text-sm px-2 py-1", 
          size === 'lg' && "text-base px-3 py-1.5",
          getScoreColor(score)
        )}
      >
        {getScoreIcon(score)}
        <span className="ml-1">{score}</span>
      </Badge>
      
      {/* High Priority Indicator */}
      {score >= 80 && (
        <Badge variant="destructive" className="text-xs px-1.5 py-0.5 bg-orange-100 text-orange-700 border-orange-200">
          🔥 High Priority
        </Badge>
      )}
      
      {/* Score Breakdown Tooltip */}
      {showBreakdown === true && factorBreakdown !== null && factorBreakdown !== undefined && factorBreakdown.length > 0 && (
        renderScoreBreakdownTooltip(factorBreakdown, score)
      )}
    </div>
  )
}

function renderFullVariant(
  score: number, 
  className?: string,
  factorBreakdown?: ProcessedFactor[]
): React.ReactElement {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with Score */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge 
            variant={getScoreVariant(score)} 
            className={cn(
              "font-bold text-lg px-4 py-2 border",
              getScoreColor(score)
            )}
          >
            {getScoreIcon(score)}
            <span className="ml-2">{score}/100</span>
          </Badge>
          
          {score >= 80 && (
            <Badge className="bg-orange-100 text-orange-700 border-orange-200">
              🔥 High Priority Lead
            </Badge>
          )}
        </div>
      </div>

      {/* Factor Breakdown */}
      {factorBreakdown !== null && factorBreakdown !== undefined && factorBreakdown.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-muted-foreground">Score Factors</h4>
          <div className="grid gap-3">
            {factorBreakdown.map((factor) => (
              <div key={factor.name} className="space-y-2 p-3 rounded-lg border bg-muted/20">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium text-sm">{factor.name}</span>
                    {factor.description.length > 0 && (
                      <p className="text-xs text-muted-foreground">{factor.description}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="font-bold">{factor.points}</span>
                    <span className="text-muted-foreground">/{factor.maxPoints}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <Progress 
                    value={factor.percentage} 
                    className="h-2"
                  />
                  <div className="text-xs text-muted-foreground text-right">
                    {factor.percentage}% of maximum
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Score Quality Indicator */}
      <div className="text-xs text-muted-foreground border-t pt-2">
        {getScoreQualityMessage(score)}
      </div>
    </div>
  )
}

export function LeadScoreDisplay({ 
  score, 
  factors = {}, 
  showBreakdown = false,
  size = 'md',
  className,
  variant = 'badge'
}: LeadScoreDisplayProps): React.ReactElement {
  
  const factorBreakdown: ProcessedFactor[] = Object.entries(factors).map(([factor, points]) => ({
    name: formatFactorName(factor),
    points: Number(points),
    maxPoints: getMaxPointsForFactor(factor),
    description: getFactorDescription(factor),
    percentage: Math.round((Number(points) / getMaxPointsForFactor(factor)) * 100)
  }))

  // Minimal variant - just the score number
  if (variant === 'minimal') {
    return renderMinimalVariant(score, className)
  }

  // Badge variant - compact with tooltip
  if (variant === 'badge') {
    return renderBadgeVariant({ score, size, className, showBreakdown, factorBreakdown })
  }

  // Full variant - detailed breakdown
  return renderFullVariant(score, className, factorBreakdown)
}