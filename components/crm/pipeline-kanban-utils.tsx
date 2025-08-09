/**
 * Pipeline Kanban Utilities
 * Helper functions to reduce complexity in main component
 */

import { type Lead } from '@/services/crm-leads'

import { type PipelineFiltersState } from './pipeline-filters-types'
import { type PipelineStageDisplay } from './pipeline-types'

export interface FilterableStage {
  id: string
  leads: Lead[]
}

// Helper function to check if lead matches source filter
const matchesSourceFilter = (lead: Lead, sources: string[]): boolean => {
  return sources.length === 0 || sources.includes(lead.source)
}

// Helper function to check if lead matches assigned user filter
const matchesAssignedUserFilter = (lead: Lead, assignedUsers: string[]): boolean => {
  if (assignedUsers.length === 0) {
    return true
  }
  return Boolean(
    lead.assigned_user_id !== null &&
      lead.assigned_user_id !== undefined &&
      assignedUsers.includes(lead.assigned_user_id)
  )
}

// Helper function to check if lead matches tags filter
const matchesTagsFilter = (lead: Lead, tags: string[]): boolean => {
  if (tags.length === 0) {
    return true
  }
  return Boolean(
    lead.tags !== null && lead.tags !== undefined && tags.some(tag => lead.tags?.includes(tag))
  )
}

// Helper function to check if lead matches date range filter
const matchesDateRangeFilter = (
  lead: Lead,
  dateFrom: Date | null,
  dateTo: Date | null
): boolean => {
  const leadDate = new Date(lead.created_at)

  return !((dateFrom !== null && leadDate < dateFrom) || (dateTo !== null && leadDate > dateTo))
}

// Helper function to check if lead matches value range filter
const matchesValueRangeFilter = (lead: Lead, valueMin: string, valueMax: string): boolean => {
  const estimatedValue = lead.estimated_value ?? 0

  return !(
    (valueMin !== '' && estimatedValue < Number.parseFloat(valueMin)) ||
    (valueMax !== '' && estimatedValue > Number.parseFloat(valueMax))
  )
}

// Main filter function to check if lead passes all filters
export const applyLeadFilters = (lead: Lead, filters: PipelineFiltersState): boolean => {
  return (
    matchesSourceFilter(lead, filters.sources) &&
    matchesAssignedUserFilter(lead, filters.assignedUsers) &&
    matchesTagsFilter(lead, filters.tags) &&
    matchesDateRangeFilter(lead, filters.dateFrom, filters.dateTo) &&
    matchesValueRangeFilter(lead, filters.valueMin, filters.valueMax)
  )
}

// Apply stage filter to determine if stage should be included
export const shouldIncludeStage = (stageId: string, stageFilters: string[]): boolean => {
  return stageFilters.length === 0 || stageFilters.includes(stageId)
}

// Apply all filters to stages data
export const applyFiltersToStages = (
  stages: PipelineStageDisplay[] | null,
  filters: PipelineFiltersState
): PipelineStageDisplay[] | null => {
  if (!stages) {
    return stages
  }

  return stages.map(stage => {
    // Apply stage filter first
    if (!shouldIncludeStage(stage.id, filters.stages)) {
      return { ...stage, leads: [] }
    }

    // Apply other filters to leads
    const filteredLeads = stage.leads.filter(lead => applyLeadFilters(lead, filters))

    return { ...stage, leads: filteredLeads }
  })
}

// Helper to handle boolean conditions safely
export const isTruthy = <T,>(value: T | null | undefined): value is T =>
  value !== null && value !== undefined

// Helper to handle nullable values safely
export const hasValue = (value: number | null | undefined): value is number =>
  value !== null && value !== undefined && !Number.isNaN(value)
