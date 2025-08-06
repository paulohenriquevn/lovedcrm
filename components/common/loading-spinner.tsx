'use client'

import { Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  text?: string
}

export function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps): JSX.Element {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }

  const hasText = text !== undefined && text !== null && text.length > 0

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <Loader2 className={cn('animate-spin', sizeClasses[size], hasText && 'mr-3')} />
      {hasText ? <span className="text-muted-foreground text-sm">{text}</span> : null}
    </div>
  )
}
