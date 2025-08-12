/**
 * Keyboard Navigation Hook
 * Advanced keyboard navigation system for lead management
 * Features: Arrow keys, Enter/Space, Tab navigation, custom shortcuts
 * Story 3.3: Lead Management - Melhorias UX
 */
'use client'

import { useCallback, useEffect, useState, useRef, useMemo } from 'react'

export interface KeyboardNavigationState {
  /** Currently focused item index */
  focusedIndex: number
  /** ID of currently focused item */
  focusedItemId: string | null
  /** Whether keyboard navigation is active */
  isNavigating: boolean
  /** Navigate to next item */
  navigateNext: () => void
  /** Navigate to previous item */
  navigatePrevious: () => void
  /** Navigate to first item */
  navigateFirst: () => void
  /** Navigate to last item */
  navigateLast: () => void
  /** Navigate to specific index */
  navigateToIndex: (index: number) => void
  /** Navigate to specific item ID */
  navigateToItem: (itemId: string) => void
  /** Handle Enter key (select/open) */
  handleEnter: () => void
  /** Handle Space key (toggle selection) */
  handleSpace: () => void
  /** Reset navigation state */
  resetNavigation: () => void
  /** Set focused item programmatically */
  setFocusedIndex: (index: number) => void
}

export interface UseKeyboardNavigationOptions {
  /** Array of item IDs in order */
  items: string[]
  /** Initial focused index */
  initialIndex?: number
  /** Enable arrow key navigation */
  enableArrowKeys?: boolean
  /** Enable Enter key handling */
  enableEnter?: boolean
  /** Enable Space key handling */
  enableSpace?: boolean
  /** Enable Tab key navigation */
  enableTab?: boolean
  /** Loop navigation (go to first after last) */
  enableLoop?: boolean
  /** Custom key shortcuts */
  customShortcuts?: Record<string, () => void>
  /** Callback when item is focused */
  onFocusChange?: (index: number, itemId: string | null) => void
  /** Callback for Enter key */
  onEnterPress?: (index: number, itemId: string) => void
  /** Callback for Space key */
  onSpacePress?: (index: number, itemId: string) => void
  /** Callback when navigation starts */
  onNavigationStart?: () => void
  /** Callback when navigation ends */
  onNavigationEnd?: () => void
  /** Selector for focusable elements (for DOM focus) */
  focusableSelector?: string
  /** Container element ref for scoping */
  containerRef?: React.RefObject<HTMLElement>
}

export function useKeyboardNavigation({
  items,
  initialIndex = -1,
  enableArrowKeys = true,
  enableEnter = true,
  enableSpace = true,
  enableTab = false,
  enableLoop = true,
  customShortcuts = {},
  onFocusChange,
  onEnterPress,
  onSpacePress,
  onNavigationStart,
  onNavigationEnd,
  focusableSelector = '[data-keyboard-focus]',
  containerRef,
}: UseKeyboardNavigationOptions): KeyboardNavigationState {
  const [focusedIndex, setFocusedIndexState] = useState(initialIndex)
  const [isNavigating, setIsNavigating] = useState(false)
  const navigationTimeoutRef = useRef<NodeJS.Timeout>()
  const lastInteractionRef = useRef<'mouse' | 'keyboard'>('mouse')

  // Derived state
  const focusedItemId = useMemo(() => {
    return focusedIndex >= 0 && focusedIndex < items.length ? (items[focusedIndex] ?? null) : null
  }, [focusedIndex, items])

  // Update focused index with validation
  const setFocusedIndex = useCallback(
    (newIndex: number) => {
      const validIndex = Math.max(-1, Math.min(items.length - 1, newIndex))

      if (validIndex !== focusedIndex) {
        setFocusedIndexState(validIndex)

        // Focus DOM element if available
        if (validIndex >= 0 && focusableSelector) {
          const container = containerRef?.current || document
          const elements = container.querySelectorAll(focusableSelector)
          const targetElement = elements[validIndex] as HTMLElement

          if (targetElement && targetElement.focus) {
            // Delay focus to avoid conflicts with other handlers
            setTimeout(() => {
              targetElement.focus({ preventScroll: false })
            }, 0)
          }
        }

        // Call focus change callback
        if (onFocusChange) {
          const itemId = validIndex >= 0 ? (items[validIndex] ?? null) : null
          onFocusChange(validIndex, itemId)
        }
      }
    },
    [focusedIndex, items, focusableSelector, containerRef, onFocusChange]
  )

  // Start navigation mode
  const startNavigation = useCallback(() => {
    if (!isNavigating) {
      setIsNavigating(true)
      lastInteractionRef.current = 'keyboard'
      if (onNavigationStart) {
        onNavigationStart()
      }
    }

    // Reset navigation timeout
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current)
    }

    // End navigation after inactivity
    navigationTimeoutRef.current = setTimeout(() => {
      setIsNavigating(false)
      if (onNavigationEnd) {
        onNavigationEnd()
      }
    }, 3000)
  }, [isNavigating, onNavigationStart, onNavigationEnd])

  // Navigation methods
  const navigateNext = useCallback(() => {
    startNavigation()
    const nextIndex = focusedIndex + 1

    if (nextIndex < items.length) {
      setFocusedIndex(nextIndex)
    } else if (enableLoop && items.length > 0) {
      setFocusedIndex(0)
    }
  }, [focusedIndex, items.length, enableLoop, setFocusedIndex, startNavigation])

  const navigatePrevious = useCallback(() => {
    startNavigation()
    const prevIndex = focusedIndex - 1

    if (prevIndex >= 0) {
      setFocusedIndex(prevIndex)
    } else if (enableLoop && items.length > 0) {
      setFocusedIndex(items.length - 1)
    }
  }, [focusedIndex, items.length, enableLoop, setFocusedIndex, startNavigation])

  const navigateFirst = useCallback(() => {
    startNavigation()
    if (items.length > 0) {
      setFocusedIndex(0)
    }
  }, [items.length, setFocusedIndex, startNavigation])

  const navigateLast = useCallback(() => {
    startNavigation()
    if (items.length > 0) {
      setFocusedIndex(items.length - 1)
    }
  }, [items.length, setFocusedIndex, startNavigation])

  const navigateToIndex = useCallback(
    (index: number) => {
      startNavigation()
      setFocusedIndex(index)
    },
    [setFocusedIndex, startNavigation]
  )

  const navigateToItem = useCallback(
    (itemId: string) => {
      startNavigation()
      const index = items.indexOf(itemId)
      if (index >= 0) {
        setFocusedIndex(index)
      }
    },
    [items, setFocusedIndex, startNavigation]
  )

  const handleEnter = useCallback(() => {
    if (focusedItemId && onEnterPress) {
      onEnterPress(focusedIndex, focusedItemId)
    }
  }, [focusedIndex, focusedItemId, onEnterPress])

  const handleSpace = useCallback(() => {
    if (focusedItemId && onSpacePress) {
      onSpacePress(focusedIndex, focusedItemId)
    }
  }, [focusedIndex, focusedItemId, onSpacePress])

  const resetNavigation = useCallback(() => {
    setFocusedIndexState(-1)
    setIsNavigating(false)
    lastInteractionRef.current = 'mouse'

    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current)
    }
  }, [])

  // Keyboard event handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is typing in input/textarea or if no items
      const target = event.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        items.length === 0
      ) {
        return
      }

      let handled = false

      // Arrow key navigation
      if (enableArrowKeys) {
        switch (event.key) {
          case 'ArrowDown':
          case 'ArrowRight':
            event.preventDefault()
            navigateNext()
            handled = true
            break
          case 'ArrowUp':
          case 'ArrowLeft':
            event.preventDefault()
            navigatePrevious()
            handled = true
            break
          case 'Home':
            event.preventDefault()
            navigateFirst()
            handled = true
            break
          case 'End':
            event.preventDefault()
            navigateLast()
            handled = true
            break
        }
      }

      // Enter key handling
      if (enableEnter && event.key === 'Enter' && focusedItemId) {
        event.preventDefault()
        handleEnter()
        handled = true
      }

      // Space key handling
      if (enableSpace && event.key === ' ' && focusedItemId) {
        event.preventDefault()
        handleSpace()
        handled = true
      }

      // Tab navigation
      if (enableTab && event.key === 'Tab' && !event.shiftKey) {
        if (focusedIndex < items.length - 1) {
          event.preventDefault()
          navigateNext()
          handled = true
        }
      } else if (enableTab && event.key === 'Tab' && event.shiftKey) {
        if (focusedIndex > 0) {
          event.preventDefault()
          navigatePrevious()
          handled = true
        }
      }

      // Custom shortcuts
      const shortcutKey = event.ctrlKey || event.metaKey ? `Ctrl+${event.key}` : event.key

      if (customShortcuts[shortcutKey]) {
        event.preventDefault()
        customShortcuts[shortcutKey]()
        handled = true
      }

      // Page Up/Down navigation
      if (event.key === 'PageDown') {
        event.preventDefault()
        const jumpSize = Math.min(10, Math.floor(items.length / 4))
        const newIndex = Math.min(focusedIndex + jumpSize, items.length - 1)
        navigateToIndex(newIndex)
        handled = true
      } else if (event.key === 'PageUp') {
        event.preventDefault()
        const jumpSize = Math.min(10, Math.floor(items.length / 4))
        const newIndex = Math.max(focusedIndex - jumpSize, 0)
        navigateToIndex(newIndex)
        handled = true
      }

      if (handled) {
        startNavigation()
      }
    }

    // Mouse interaction detection
    const handleMouseMove = () => {
      if (lastInteractionRef.current !== 'mouse') {
        lastInteractionRef.current = 'mouse'
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('mousemove', handleMouseMove)
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current)
      }
    }
  }, [
    items.length,
    enableArrowKeys,
    enableEnter,
    enableSpace,
    enableTab,
    focusedIndex,
    focusedItemId,
    navigateNext,
    navigatePrevious,
    navigateFirst,
    navigateLast,
    navigateToIndex,
    handleEnter,
    handleSpace,
    customShortcuts,
    startNavigation,
  ])

  // Reset focus when items change
  useEffect(() => {
    if (focusedIndex >= items.length) {
      setFocusedIndex(items.length - 1)
    }
  }, [items.length, focusedIndex, setFocusedIndex])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current)
      }
    }
  }, [])

  return {
    focusedIndex,
    focusedItemId,
    isNavigating,
    navigateNext,
    navigatePrevious,
    navigateFirst,
    navigateLast,
    navigateToIndex,
    navigateToItem,
    handleEnter,
    handleSpace,
    resetNavigation,
    setFocusedIndex,
  }
}

export default useKeyboardNavigation
