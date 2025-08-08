/**
 * Pipeline WebSocket Handlers
 * Extracted WebSocket event handlers for better maintainability
 */

import { useState, useCallback } from 'react'

import { usePipelineWebSocket } from '@/hooks/use-pipeline-websocket'

import { 
  WebSocketLeadEvent, 
  WebSocketUserEvent, 
  WebSocketDragEvent, 
  WebSocketConnectionData 
} from './pipeline-types'


interface WebSocketHandlersReturn {
  isConnected: boolean
  isPolling: boolean
  activeUsers: Array<{ user_id?: string; full_name?: string }>
  sendMessage: (message: Record<string, unknown>) => void
  realtimeUsers: Array<{ user_id?: string; full_name?: string }>
  setRealtimeUsers: React.Dispatch<React.SetStateAction<Array<{ user_id?: string; full_name?: string }>>>
}

export function usePipelineWebSocketHandlers(
  reloadLeadsData: () => Promise<void>
): WebSocketHandlersReturn {
  console.log('🔌 usePipelineWebSocketHandlers called')
  
  const [realtimeUsers, setRealtimeUsers] = useState<Array<{ user_id?: string; full_name?: string }>>([])

  // Memoize callbacks to prevent recreation on every render
  const onLeadStageChanged = useCallback((data: WebSocketLeadEvent) => {
    console.log('📩 Received lead_stage_changed:', data)
    // Real-time lead stage changed
    void reloadLeadsData()
  }, [reloadLeadsData])
  
  const onLeadCreated = useCallback((_data: WebSocketLeadEvent) => {
    // Real-time lead created
    void reloadLeadsData()
  }, [reloadLeadsData])
  
  const onLeadUpdated = useCallback((_data: WebSocketLeadEvent) => {
    // Real-time lead updated
    void reloadLeadsData()
  }, [reloadLeadsData])
  
  const onLeadDeleted = useCallback((_data: WebSocketLeadEvent) => {
    // Real-time lead deleted
    void reloadLeadsData()
  }, [reloadLeadsData])
  
  const onUserActivity = useCallback((_data: WebSocketUserEvent) => {
    // Real-time user activity
  }, [])
  
  const onUserDragging = useCallback((_data: WebSocketDragEvent) => {
    // Real-time user dragging
  }, [])
  
  const onConnectionEstablished = useCallback((data: WebSocketConnectionData) => {
    setRealtimeUsers(data.active_users ?? [])
  }, [])

  console.log('🚀 About to call usePipelineWebSocket')
  
  const { isConnected, sendMessage, activeUsers, isPolling } = usePipelineWebSocket({
    onLeadStageChanged,
    onLeadCreated,
    onLeadUpdated,
    onLeadDeleted,
    onUserActivity,
    onUserDragging,
    onConnectionEstablished
  })
  
  console.log('📊 WebSocket hook result:', { isConnected, isPolling, activeUsersCount: activeUsers.length })

  return {
    isConnected,
    isPolling,
    activeUsers,
    sendMessage,
    realtimeUsers,
    setRealtimeUsers
  }
}