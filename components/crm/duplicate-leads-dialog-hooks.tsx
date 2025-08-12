/**
 * Merge Dialog Hooks
 * Custom hooks for merge dialog logic
 */

import { useState } from 'react'

interface DuplicateLead {
  id: string
  name: string
  email: string
  phone: string
  created_at: string
  lead_score: number
}

interface DuplicatePair {
  original_lead: DuplicateLead
  potential_duplicate: DuplicateLead
  similarity_score: number
  matching_factors: string[]
  confidence_level: 'veryHigh' | 'high' | 'medium' | 'low'
  recommended_action: 'autoMerge' | 'mergeRecommended' | 'reviewRequired' | 'monitor'
}

interface MergeDialogLogic {
  selectedStrategy: string
  setSelectedStrategy: (strategy: string) => void
  notes: string
  setNotes: (notes: string) => void
  isLoading: boolean
  handleMerge: () => Promise<void>
}

export function useMergeDialogLogic(
  duplicate: DuplicatePair,
  onMerge: (primaryId: string, duplicateId: string, strategy: string) => Promise<void>,
  onOpenChange: (open: boolean) => void
): MergeDialogLogic {
  const [selectedStrategy, setSelectedStrategy] = useState('keep_best_data')
  const [notes, setNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleMerge = async (): Promise<void> => {
    setIsLoading(true)
    try {
      await onMerge(duplicate.original_lead.id, duplicate.potential_duplicate.id, selectedStrategy)
      onOpenChange(false)
      setNotes('')
    } catch (error) {
      throw new Error(`Merge failed: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    selectedStrategy,
    setSelectedStrategy,
    notes,
    setNotes,
    isLoading,
    handleMerge,
  }
}

export type { DuplicateLead, DuplicatePair }
