export interface PipelineFiltersState {
  stages: string[]
  sources: string[]
  assignedUsers: string[]
  tags: string[]
  dateFrom: Date | null
  dateTo: Date | null
  valueMin: string
  valueMax: string
}

export interface User {
  id: string
  name: string
}

export interface PipelineFilterOptions {
  stages?: string[]
  sources?: string[]
  assigned_users?: User[]
  available_tags?: string[]
}
