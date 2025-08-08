/**
 * Lead Edit Form Helpers - Form initialization and validation
 * Extracted from LeadEditModal to reduce complexity
 */

'use client'

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

export const getDefaultFormValues = (): LeadEditForm => ({
  name: '',
  email: '',
  phone: '',
  stage: PipelineStage.LEAD,
  source: '',
  estimatedValue: undefined,
  tags: [],
  notes: '',
  isFavorite: false
})

export const getLeadFormValues = (lead: Lead): LeadEditForm => ({
  name: lead.name,
  email: lead.email ?? '',
  phone: lead.phone ?? '',
  stage: lead.stage,
  source: lead.source ?? '',
  estimatedValue: lead.estimated_value ?? undefined,
  tags: lead.tags ?? [],
  notes: lead.notes ?? '',
  isFavorite: lead.is_favorite
})

export const initializeFormWithLead = (
  form: UseFormReturn<LeadEditForm>, 
  lead: Lead | null,
  setCurrentTags: (tags: string[]) => void
): void => {
  if (!lead) {
    return
  }
  
  const formValues = getLeadFormValues(lead)
  form.reset(formValues)
  setCurrentTags(lead.tags ?? [])
}

export const resetForm = (
  form: UseFormReturn<LeadEditForm>,
  setCurrentTags: (tags: string[]) => void,
  setTagInput: (input: string) => void
): void => {
  form.reset(getDefaultFormValues())
  setCurrentTags([])
  setTagInput('')
}