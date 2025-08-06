'use client'

import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import * as React from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface TrendData {
  value: number
  label?: string
  isPositive?: boolean
}

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon?: LucideIcon
  trend?: {
    value: number
    label?: string
    isPositive?: boolean
  }
  className?: string
  isLoading?: boolean
}

function StatCardSkeleton({
  className,
  icon: Icon,
}: {
  className?: string
  icon?: LucideIcon
}): JSX.Element {
  return (
    <Card className={cn('', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="h-4 w-20 bg-muted animate-pulse rounded" />
        {Boolean(Icon) && <div className="h-4 w-4 bg-muted animate-pulse rounded" />}
      </CardHeader>
      <CardContent>
        <div className="h-7 w-24 bg-muted animate-pulse rounded mb-1" />
        <div className="h-3 w-32 bg-muted animate-pulse rounded" />
      </CardContent>
    </Card>
  )
}

function TrendIndicator({ trend }: { trend: StatCardProps['trend'] }): JSX.Element | null {
  if (trend === undefined) {
    return null
  }

  return (
    <div
      className={cn(
        'flex items-center space-x-1',
        trend.isPositive === true ? 'text-green-600' : 'text-red-600'
      )}
    >
      {trend.isPositive === true ? (
        <TrendingUp className="h-3 w-3" />
      ) : (
        <TrendingDown className="h-3 w-3" />
      )}
      <span>{Math.abs(trend.value)}%</span>
      {trend.label !== undefined && trend.label !== null && trend.label !== '' && (
        <span>{trend.label}</span>
      )}
    </div>
  )
}

function StatCardContent({
  title,
  value,
  description,
  icon: Icon,
  trend,
}: {
  title: string
  value: string | number
  description?: string
  icon?: LucideIcon
  trend?: StatCardProps['trend']
}): JSX.Element {
  const hasDescription = description !== undefined && description !== null && description !== ''
  const hasFooter = hasDescription || trend !== undefined
  const displayValue = typeof value === 'number' ? value.toLocaleString() : value

  return (
    <>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon !== undefined && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{displayValue}</div>
        {hasFooter ? (
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <TrendIndicator trend={trend} />
            {hasDescription ? <span>{description}</span> : null}
          </div>
        ) : null}
      </CardContent>
    </>
  )
}

// Helper to build conditional props
function buildStatCardProps(
  description?: string,
  icon?: LucideIcon,
  trend?: TrendData
): Record<string, unknown> {
  const props: Record<string, unknown> = {}

  if (description !== undefined && description !== null && description.length > 0) {
    props.description = description
  }

  if (icon !== undefined && icon !== null) {
    props.icon = icon
  }

  if (trend !== undefined && trend !== null) {
    props.trend = trend
  }

  return props
}

// Helper to build skeleton props
function buildSkeletonProps(className?: string, icon?: LucideIcon): Record<string, unknown> {
  const props: Record<string, unknown> = {}

  if (className !== undefined && className !== null && className.length > 0) {
    props.className = className
  }

  if (icon !== undefined && icon !== null) {
    props.icon = icon
  }

  return props
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
  isLoading = false,
}: StatCardProps): JSX.Element {
  if (isLoading) {
    return <StatCardSkeleton {...buildSkeletonProps(className, Icon)} />
  }

  return (
    <Card className={cn('', className)}>
      <StatCardContent
        title={title}
        value={value}
        {...buildStatCardProps(description, Icon, trend)}
      />
    </Card>
  )
}
