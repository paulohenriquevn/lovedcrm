/**
 * Bulk Selection Hook
 * State management for multiple lead selection with keyboard shortcuts
 * Features: Select all, clear selection, individual toggle, keyboard navigation
 * Story 3.3: Lead Management - Melhorias UX
 */
'use client'

import { useCallback, useMemo, useState, useEffect } from 'react'

export interface BulkSelectionState {
  selectedLeads: Set<string>
  isAllSelected: boolean
  hasSelection: boolean
  selectedCount: number
  selectLead: (leadId: string) => void
  deselectLead: (leadId: string) => void
  toggleLead: (leadId: string) => void
  toggleSelectAll: (allLeadIds?: string[]) => void
  clearSelection: () => void
  isLeadSelected: (leadId: string) => boolean
  selectMultiple: (leadIds: string[]) => void
  getSelectedLeads: () => string[]
}

export interface UseBulkSelectionOptions {
  /** Initial selected lead IDs */
  initialSelection?: string[]
  /** Maximum number of selectable leads (0 = unlimited) */
  maxSelection?: number
  /** Callback when selection changes */
  onSelectionChange?: (selectedLeads: string[]) => void
  /** Callback when max selection limit is reached */
  onMaxSelectionReached?: (maxSelection: number) => void
  /** Enable keyboard shortcuts (Ctrl+A, Escape, etc) */
  enableKeyboardShortcuts?: boolean
  /** Available lead IDs for select all functionality */
  availableLeadIds?: string[]
}

export function useBulkSelection({
  initialSelection = [],
  maxSelection = 0,
  onSelectionChange,
  onMaxSelectionReached,
  enableKeyboardShortcuts = true,
  availableLeadIds = [],
}: UseBulkSelectionOptions = {}): BulkSelectionState {
  // Core selection state
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set(initialSelection))

  // Derived state
  const selectedCount = selectedLeads.size
  const hasSelection = selectedCount > 0
  const isAllSelected = useMemo(() => {
    return availableLeadIds.length > 0 && availableLeadIds.every(id => selectedLeads.has(id))
  }, [availableLeadIds, selectedLeads])

  // Selection change callback
  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(Array.from(selectedLeads))
    }
  }, [selectedLeads, onSelectionChange])

  // Check selection limit
  const checkSelectionLimit = useCallback(
    (newCount: number): boolean => {
      if (maxSelection > 0 && newCount > maxSelection) {
        if (onMaxSelectionReached) {
          onMaxSelectionReached(maxSelection)
        }
        return false
      }
      return true
    },
    [maxSelection, onMaxSelectionReached]
  )

  // Select a single lead
  const selectLead = useCallback(
    (leadId: string) => {
      setSelectedLeads(prev => {
        if (prev.has(leadId)) return prev // Already selected

        const newSet = new Set(prev)
        if (!checkSelectionLimit(newSet.size + 1)) {
          return prev // Don't add if limit reached
        }

        newSet.add(leadId)
        return newSet
      })
    },
    [checkSelectionLimit]
  )

  // Deselect a single lead
  const deselectLead = useCallback((leadId: string) => {
    setSelectedLeads(prev => {
      if (!prev.has(leadId)) return prev // Not selected

      const newSet = new Set(prev)
      newSet.delete(leadId)
      return newSet
    })
  }, [])

  // Toggle single lead selection
  const toggleLead = useCallback(
    (leadId: string) => {
      setSelectedLeads(prev => {
        const newSet = new Set(prev)

        if (newSet.has(leadId)) {
          // Deselect
          newSet.delete(leadId)
        } else {
          // Select if within limit
          if (!checkSelectionLimit(newSet.size + 1)) {
            return prev
          }
          newSet.add(leadId)
        }

        return newSet
      })
    },
    [checkSelectionLimit]
  )

  // Toggle select all
  const toggleSelectAll = useCallback(
    (allLeadIds?: string[]) => {
      const leadsToToggle = allLeadIds || availableLeadIds

      setSelectedLeads(prev => {
        if (isAllSelected) {
          // Deselect all
          return new Set()
        } else {
          // Select all (within limit)
          const newSet = new Set(prev)

          for (const leadId of leadsToToggle) {
            if (!newSet.has(leadId)) {
              if (maxSelection > 0 && newSet.size >= maxSelection) {
                if (onMaxSelectionReached) {
                  onMaxSelectionReached(maxSelection)
                }
                break
              }
              newSet.add(leadId)
            }
          }

          return newSet
        }
      })
    },
    [isAllSelected, availableLeadIds, maxSelection, onMaxSelectionReached]
  )

  // Clear all selection
  const clearSelection = useCallback(() => {
    setSelectedLeads(new Set())
  }, [])

  // Check if lead is selected
  const isLeadSelected = useCallback(
    (leadId: string): boolean => {
      return selectedLeads.has(leadId)
    },
    [selectedLeads]
  )

  // Select multiple leads at once
  const selectMultiple = useCallback(
    (leadIds: string[]) => {
      setSelectedLeads(prev => {
        const newSet = new Set(prev)
        let addedCount = 0

        for (const leadId of leadIds) {
          if (!newSet.has(leadId)) {
            if (maxSelection > 0 && newSet.size + addedCount >= maxSelection) {
              if (onMaxSelectionReached) {
                onMaxSelectionReached(maxSelection)
              }
              break
            }
            newSet.add(leadId)
            addedCount++
          }
        }

        return newSet
      })
    },
    [maxSelection, onMaxSelectionReached]
  )

  // Get selected leads as array
  const getSelectedLeads = useCallback((): string[] => {
    return Array.from(selectedLeads)
  }, [selectedLeads])

  // Keyboard shortcuts
  useEffect(() => {
    if (!enableKeyboardShortcuts) return

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is typing in input/textarea
      const target = event.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return
      }

      // Ctrl+A or Cmd+A - Select all
      if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
        event.preventDefault()
        toggleSelectAll()
      }

      // Escape - Clear selection
      if (event.key === 'Escape' && hasSelection) {
        event.preventDefault()
        clearSelection()
      }

      // Delete - For bulk delete (handled by parent component)
      if (event.key === 'Delete' && hasSelection) {
        // Dispatch custom event for parent to handle
        const deleteEvent = new CustomEvent('bulkDelete', {
          detail: { selectedLeads: Array.from(selectedLeads) },
        })
        window.dispatchEvent(deleteEvent)
      }

      // Ctrl+Shift+A - Deselect all
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'A') {
        event.preventDefault()
        clearSelection()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [enableKeyboardShortcuts, hasSelection, selectedLeads, toggleSelectAll, clearSelection])

  return {
    selectedLeads,
    isAllSelected,
    hasSelection,
    selectedCount,
    selectLead,
    deselectLead,
    toggleLead,
    toggleSelectAll,
    clearSelection,
    isLeadSelected,
    selectMultiple,
    getSelectedLeads,
  }
}

export default useBulkSelection
