/**
 * Pipeline WebSocket Event Callbacks
 * Separated callback functions for better maintainability
 */

import { useCallback } from 'react'

import type { PipelineWebSocketMessage, PipelineStageDisplay } from './pipeline-types'

export function useWebSocketCallbacks(
  reloadLeadsData: () => Promise<void>,
  setStages: React.Dispatch<React.SetStateAction<PipelineStageDisplay[]>>,
  setRealtimeUsers: React.Dispatch<
    React.SetStateAction<Array<{ user_id?: string; full_name?: string }>>
  >
): {
  onLeadStageChanged: (data: PipelineWebSocketMessage) => void
  onLeadCreated: (data: PipelineWebSocketMessage) => void
  onLeadUpdated: (data: PipelineWebSocketMessage) => void
  onLeadDeleted: (data: PipelineWebSocketMessage) => void
  onUserActivity: (data: PipelineWebSocketMessage) => void
  onUserDragging: (data: PipelineWebSocketMessage) => void
  onConnectionEstablished: (data: PipelineWebSocketMessage) => void
} {
  const onLeadStageChanged = useCallback(
    (_data: PipelineWebSocketMessage) => {
      // For now, just reload all data when WebSocket events occur
      // REMOVE: Implement optimistic updates when performance requires
      void reloadLeadsData()
    },
    [reloadLeadsData]
  )

  const onLeadCreated = useCallback(
    (_data: PipelineWebSocketMessage) => {
      // Real-time lead created
      void reloadLeadsData()
    },
    [reloadLeadsData]
  )

  const onLeadUpdated = useCallback(
    (_data: PipelineWebSocketMessage) => {
      // Real-time lead updated
      void reloadLeadsData()
    },
    [reloadLeadsData]
  )

  const onLeadDeleted = useCallback(
    (_data: PipelineWebSocketMessage) => {
      // Real-time lead deleted
      void reloadLeadsData()
    },
    [reloadLeadsData]
  )

  const onUserActivity = useCallback((_data: PipelineWebSocketMessage) => {
    // Real-time user activity
  }, [])

  const onUserDragging = useCallback((_data: PipelineWebSocketMessage) => {
    // Real-time user dragging
  }, [])

  const onConnectionEstablished = useCallback(
    (data: PipelineWebSocketMessage) => {
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
