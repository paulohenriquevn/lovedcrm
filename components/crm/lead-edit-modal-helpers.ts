/**
 * Lead Edit Modal Helper Functions
 * Extracted helper functions to reduce main component complexity
 */

import { UseFormReturn } from 'react-hook-form'

import { PipelineStage, type Lead } from '@/services/crm-leads'

export interface LeadEditForm {
  name: string
  email?: string
  phone?: string
  stage: PipelineStage
  source?: string
  estimatedValue?: number
  tags?: string[]
  notes?: string
  isFavorite?: boolean
}

export function createDefaultFormValues(): LeadEditForm {
  return {
    name: '',
    email: '',
    phone: '',
    stage: PipelineStage.LEAD,
    source: '',
    estimatedValue: undefined,
    tags: [],
    notes: '',
    isFavorite: false,
  }
}

export function populateFormWithLeadData(
  form: UseFormReturn<LeadEditForm>,
  lead: Lead,
  setCurrentTags: (tags: string[]) => void
): void {
  const formData: LeadEditForm = {
    name: lead.name,
    email: lead.email ?? '',
    phone: lead.phone ?? '',
    stage: lead.stage,
    source: lead.source ?? '',
    estimatedValue: lead.estimated_value ?? undefined,
    tags: lead.tags ?? [],
    notes: lead.notes ?? '',
    isFavorite: lead.is_favorite,
  }

  form.reset(formData)
  setCurrentTags(lead.tags ?? [])
}

export function resetFormState(
  form: UseFormReturn<LeadEditForm>,
  setCurrentTags: (tags: string[]) => void,
  setTagInput: (input: string) => void
): void {
  form.reset()
  setCurrentTags([])
  setTagInput('')
}

export interface TagOperationsConfig {
  currentTags: string[]
  tagInput: string
  setCurrentTags: (tags: string[]) => void
  setTagInput: (input: string) => void
  form: UseFormReturn<LeadEditForm>
}

export function handleTagOperations(config: TagOperationsConfig): {
  addTag: (tag: string) => void
  removeTag: (tagToRemove: string) => void
  handleTagKeyPress: (e: React.KeyboardEvent) => void
} {
  const { currentTags, tagInput, setCurrentTags, setTagInput, form } = config
  const addTag = (tag: string): void => {
    const trimmedTag = tag.trim().toLowerCase()
    if (trimmedTag && !currentTags.includes(trimmedTag)) {
      const newTags = [...currentTags, trimmedTag]
      setCurrentTags(newTags)
      form.setValue('tags', newTags)
    }
    setTagInput('')
  }

  const removeTag = (tagToRemove: string): void => {
    const newTags = currentTags.filter(tag => tag !== tagToRemove)
    setCurrentTags(newTags)
    form.setValue('tags', newTags)
  }

  const handleTagKeyPress = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (tagInput.trim()) {
        addTag(tagInput)
      }
    }
  }

  return { addTag, removeTag, handleTagKeyPress }
}
