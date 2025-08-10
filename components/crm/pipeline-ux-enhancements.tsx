'use client'

import { useCallback, useMemo, useState } from 'react'

import { cn } from '@/lib/utils'

interface UseUXEnhancementsProps {
  isEnabled?: boolean
  reducedMotion?: boolean
}

export function useUXEnhancements({
  isEnabled = true,
  reducedMotion = false,
}: UseUXEnhancementsProps = {}): {
  triggerHaptic: (pattern?: number[]) => void
  hoverClasses: string
  detectReducedMotion: () => boolean
  isEnabled: boolean
  reducedMotion: boolean
} {
  // Haptic feedback for mobile
  const triggerHaptic = useCallback(
    (pattern: number[] = [50]) => {
      if (!isEnabled || typeof navigator === 'undefined') {
        return
      }

      try {
        navigator.vibrate?.(pattern)
      } catch {
        // Silently fail - not all devices support haptic
      }
    },
    [isEnabled]
  )

  // Hover animation classes
  const hoverClasses = useMemo(() => {
    return reducedMotion
      ? 'hover:bg-gray-50 dark:hover:bg-gray-800'
      : cn(
          'pipeline-card-enhanced',
          'transition-all duration-150 ease-out',
          'transform-gpu' // Hardware acceleration
        )
  }, [reducedMotion])

  // Check for reduced motion preference
  const detectReducedMotion = useCallback(() => {
    if (typeof window === 'undefined') {
      return false
    }
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  return {
    triggerHaptic,
    hoverClasses,
    detectReducedMotion,
    isEnabled,
    reducedMotion,
  }
}

// Utility hook for drag state
export function useDragState<T>(): {
  isDragging: boolean
  draggedItem: T | null
  startDrag: (item: T) => void
  endDrag: () => void
} {
  const [isDragging, setIsDragging] = useState(false)
  const [draggedItem, setDraggedItem] = useState<T | null>(null)

  const startDrag = useCallback((item: T) => {
    setIsDragging(true)
    setDraggedItem(item)
  }, [])

  const endDrag = useCallback(() => {
    setIsDragging(false)
    setDraggedItem(null)
  }, [])

  return { isDragging, draggedItem, startDrag, endDrag }
}

// Utility for staggered animations
export function useStaggerAnimation(
  itemCount: number,
  delay: number = 100
): {
  getStaggerDelay: (index: number) => number
  staggerClasses: Array<{ style: React.CSSProperties; delay: number }>
} {
  const getStaggerDelay = useCallback(
    (index: number) => {
      return index * delay
    },
    [delay]
  )

  const staggerClasses = useMemo(() => {
    return Array.from({ length: itemCount }, (_, i) => ({
      style: { '--stagger-index': i } as React.CSSProperties,
      delay: getStaggerDelay(i),
    }))
  }, [itemCount, getStaggerDelay])

  return { getStaggerDelay, staggerClasses }
}

// Enhanced button props helper
export function useEnhancedButton({
  onClick,
  hapticPattern = [25],
  reducedMotion = false,
}: {
  onClick?: () => void
  hapticPattern?: number[]
  reducedMotion?: boolean
}): {
  handleClick: () => void
  className: string
} {
  const { triggerHaptic } = useUXEnhancements({ reducedMotion })

  const handleClick = useCallback(() => {
    triggerHaptic(hapticPattern)
    onClick?.()
  }, [onClick, triggerHaptic, hapticPattern])

  const buttonClasses = useMemo(() => {
    if (reducedMotion) {
      return 'hover:bg-accent'
    }
    return 'btn-enhanced transition-transform hover:scale-105 active:scale-98'
  }, [reducedMotion])

  return {
    handleClick,
    className: buttonClasses,
  }
}
