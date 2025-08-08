/**
 * Shared types for pipeline components
 */
import { Lead } from '@/services/crm-leads'

export interface PipelineStageDisplay {
  id: string
  name: string
  color: string
  count: number
  leads: Lead[]
}

export interface DragParams {
  targetStageId: string
  sendMessage: (msg: Record<string, unknown>) => void
  setStages: React.Dispatch<React.SetStateAction<PipelineStageDisplay[]>>
  setError: React.Dispatch<React.SetStateAction<string | null>>
}

// WebSocket event types
export interface WebSocketLeadEvent {
  lead_id: string
  stage_id: string
  user_id: string
  organization_id: string
  lead?: Lead
}

export interface WebSocketUserEvent {
  user_id: string
  full_name?: string
  activity?: string
  timestamp?: string
}

export interface WebSocketDragEvent {
  user_id: string
  full_name?: string
  lead_id: string
  stage_id: string
  action: 'start' | 'end'
}

export interface WebSocketConnectionData {
  active_users?: Array<{ user_id?: string; full_name?: string }>
  user_count?: number
}
