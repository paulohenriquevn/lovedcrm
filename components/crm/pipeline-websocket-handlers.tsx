/**
 * Pipeline WebSocket Handlers
 * Extracted WebSocket event handlers for better maintainability
 */

import { useState, useCallback } from 'react'

import { usePipelineWebSocketShared } from '@/hooks/use-pipeline-websocket-shared'

import {
  WebSocketLeadEvent,
  WebSocketUserEvent,
  WebSocketDragEvent,
  WebSocketConnectionData,
} from './pipeline-types'

interface WebSocketHandlersReturn {
  isConnected: boolean
  isPolling: boolean
  activeUsers: Array<{ user_id?: string; full_name?: string }>
  sendMessage: (message: Record<string, unknown>) => void
  realtimeUsers: Array<{ user_id?: string; full_name?: string }>
  setRealtimeUsers: React.Dispatch<
    React.SetStateAction<Array<{ user_id?: string; full_name?: string }>>
  >
}

export function usePipelineWebSocketHandlers(
  reloadLeadsData: () => Promise<void>,
  stages: Array<any>,
  setStages: React.Dispatch<React.SetStateAction<Array<any>>>
): WebSocketHandlersReturn {
  const [realtimeUsers, setRealtimeUsers] = useState<
    Array<{ user_id?: string; full_name?: string }>
  >([])

  const onLeadStageChanged = useCallback(
    (data: WebSocketLeadEvent) => {
      // Update stages directly without full reload for better performance
      if (data.lead && data.lead.id) {
        setStages(prevStages => {
          const newStages = [...prevStages]
          
          // Remove lead from all stages first
          newStages.forEach(stage => {
            stage.leads = stage.leads.filter((lead: any) => lead.id !== data.lead.id)
            stage.count = stage.leads.length
          })
          
          // Add lead to the new stage - match by stage value
          const targetStage = newStages.find(stage => {
            const stageValue = data.lead.stage?.toLowerCase()
            return (
              stage.id?.toLowerCase() === stageValue ||
              stage.name?.toLowerCase() === stageValue ||
              stage.name?.toLowerCase().includes(stageValue) ||
              (stageValue === 'lead' && stage.name?.toLowerCase().includes('lead')) ||
              (stageValue === 'contato' && stage.name?.toLowerCase().includes('contato')) ||
              (stageValue === 'proposta' && stage.name?.toLowerCase().includes('proposta')) ||
              (stageValue === 'negociacao' && stage.name?.toLowerCase().includes('negociação')) ||
              (stageValue === 'fechado' && stage.name?.toLowerCase().includes('fechado'))
            )
          })
          
          if (targetStage) {
            targetStage.leads.push(data.lead)
            targetStage.count = targetStage.leads.length
          }
          
          return newStages
        })
      } else {
        // Fallback to full reload if data is incomplete
        void reloadLeadsData()
      }
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

  const onConnectionEstablished = useCallback((data: WebSocketConnectionData) => {
    setRealtimeUsers(data.active_users ?? [])
  }, [])

  const { isConnected, sendMessage, activeUsers, isPolling } = usePipelineWebSocketShared({
    onLeadStageChanged,
    onLeadCreated,
    onLeadUpdated,
    onLeadDeleted,
    onUserActivity,
    onUserDragging,
    onConnectionEstablished,
  })

  return {
    isConnected,
    isPolling,
    activeUsers,
    sendMessage,
    realtimeUsers,
    setRealtimeUsers,
  }
}
