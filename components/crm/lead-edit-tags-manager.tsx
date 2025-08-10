/**
 * Lead Edit Tags Manager - Tag management logic for lead editing
 * Extracted from LeadEditModal to reduce complexity
 */

'use client'

import { useState, useCallback } from 'react'
import { UseFormReturn } from 'react-hook-form'

interface TagManagerForm {
  tags?: string[]
}

export interface UseTagManagerReturn {
  currentTags: string[]
  tagInput: string
  setTagInput: (value: string) => void
  setCurrentTags: (tags: string[]) => void
  addTag: (tag: string) => void
  removeTag: (tag: string) => void
  handleTagInputKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
}

export function useTagManager<T extends TagManagerForm>(form: UseFormReturn<T>): UseTagManagerReturn {
  const [currentTags, setCurrentTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')

  const addTag = useCallback(
    (tag: string): void => {
      const trimmedTag = tag.trim().toLowerCase()
      if (trimmedTag && !currentTags.includes(trimmedTag)) {
        const newTags = [...currentTags, trimmedTag]
        setCurrentTags(newTags)
        ;(form.setValue as any)('tags', newTags)
      }
      setTagInput('')
    },
    [currentTags, form]
  )

  const removeTag = useCallback(
    (tagToRemove: string): void => {
      const newTags = currentTags.filter(tag => tag !== tagToRemove)
      setCurrentTags(newTags)
      ;(form.setValue as any)('tags', newTags)
    },
    [currentTags, form]
  )

  const handleTagInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>): void => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault()
        if (tagInput.trim()) {
          addTag(tagInput)
        }
      }
    },
    [tagInput, addTag]
  )

  return {
    currentTags,
    tagInput,
    setTagInput,
    setCurrentTags,
    addTag,
    removeTag,
    handleTagInputKeyDown,
  }
}
