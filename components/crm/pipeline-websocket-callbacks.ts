/**
 * Pipeline WebSocket Event Callbacks
 * Separated callback functions for better maintainability
 */

import { useCallback } from 'react'

import {
  findTargetStage,
  updateStageWithLead,
  type StageData,
  type LeadData,
} from './pipeline-websocket-utils'

import type {
  WebSocketLeadEvent,
  WebSocketUserEvent,
  WebSocketDragEvent,
  WebSocketConnectionData,
} from './pipeline-types'

export function useWebSocketCallbacks(
  reloadLeadsData: () => Promise<void>,
  setStages: React.Dispatch<React.SetStateAction<StageData[]>>,
  setRealtimeUsers: React.Dispatch<
    React.SetStateAction<Array<{ user_id?: string; full_name?: string }>>
  >
): {
  onLeadStageChanged: (data: WebSocketLeadEvent) => void
  onLeadCreated: (data: WebSocketLeadEvent) => void
  onLeadUpdated: (data: WebSocketLeadEvent) => void
  onLeadDeleted: (data: WebSocketLeadEvent) => void
  onUserActivity: (data: WebSocketUserEvent) => void
  onUserDragging: (data: WebSocketDragEvent) => void
  onConnectionEstablished: (data: WebSocketConnectionData) => void
} {
  const onLeadStageChanged = useCallback(
    (data: WebSocketLeadEvent) => {
      // Update stages directly without full reload for better performance
      const leadId = data.lead?.id
      if (leadId === null || leadId === undefined || leadId === '') {
        void reloadLeadsData()
        return
      }

      setStages(prevStages => {
        const targetStage = findTargetStage(prevStages, data.lead?.stage)

        if (targetStage === undefined) {
          return prevStages
        }

        const leadData = data.lead
        if (leadData === null || leadData === undefined) {
          return prevStages
        }

        return updateStageWithLead(prevStages, leadId, {
          targetStage,
          leadData: leadData as LeadData,
        })
      })
    },
    [setStages, reloadLeadsData]
  )

  const onLeadCreated = useCallback(
    (_data: WebSocketLeadEvent) => {
      // Real-time lead created
      void reloadLeadsData()
    },
    [reloadLeadsData]
  )

  const onLeadUpdated = useCallback(
    (_data: WebSocketLeadEvent) => {
      // Real-time lead updated
      void reloadLeadsData()
    },
    [reloadLeadsData]
  )

  const onLeadDeleted = useCallback(
    (_data: WebSocketLeadEvent) => {
      // Real-time lead deleted
      void reloadLeadsData()
    },
    [reloadLeadsData]
  )

  const onUserActivity = useCallback((_data: WebSocketUserEvent) => {
    // Real-time user activity
  }, [])

  const onUserDragging = useCallback((_data: WebSocketDragEvent) => {
    // Real-time user dragging
  }, [])

  const onConnectionEstablished = useCallback(
    (data: WebSocketConnectionData) => {
      const activeUsers = data.active_users ?? []
      setRealtimeUsers(activeUsers)
    },
    [setRealtimeUsers]
  )

  return {
    onLeadStageChanged,
    onLeadCreated,
    onLeadUpdated,
    onLeadDeleted,
    onUserActivity,
    onUserDragging,
    onConnectionEstablished,
  }
}
