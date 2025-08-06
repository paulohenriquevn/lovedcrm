'use client'

import { LucideIcon, FileX, Search, Plus } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    variant?: 'default' | 'outline'
  }
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'py-8',
  md: 'py-12',
  lg: 'py-16',
}

const iconSizes = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
}

export function EmptyState({
  icon: Icon = FileX,
  title,
  description,
  action,
  className,
  size = 'md',
}: EmptyStateProps): JSX.Element {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center space-y-4',
        sizeClasses[size],
        className
      )}
    >
      <div className="rounded-full bg-muted p-4">
        <Icon className={cn('text-muted-foreground', iconSizes[size])} />
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {description !== undefined && description !== null && description !== '' && (
          <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
        )}
      </div>

      {action !== null && action !== undefined && (
        <Button
          type="button"
          onClick={() => action.onClick()}
          variant={action.variant ?? 'default'}
          size="sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          {action.label}
        </Button>
      )}
    </div>
  )
}

// Predefined empty states for common scenarios
export function NoResultsFound({
  searchQuery,
  onClear,
}: {
  searchQuery?: string
  onClear?: () => void
}): JSX.Element {
  return (
    <EmptyState
      icon={Search}
      title="No results found"
      description={
        searchQuery !== undefined && searchQuery !== null && searchQuery !== ''
          ? `No results found for "${searchQuery}". Try adjusting your search terms.`
          : 'No results match your current filters.'
      }
      {...(onClear && {
        action: {
          label: 'Clear filters',
          onClick: onClear,
          variant: 'outline' as const,
        },
      })}
    />
  )
}

export function NoDataAvailable({
  title = 'No data available',
  description = "There's no data to display at the moment.",
  onCreate,
}: {
  title?: string
  description?: string
  onCreate?: () => void
}): JSX.Element {
  return (
    <EmptyState
      title={title}
      description={description}
      {...(onCreate && {
        action: {
          label: 'Create new',
          onClick: onCreate,
        },
      })}
    />
  )
}
