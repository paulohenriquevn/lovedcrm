/**
 * Pipeline WebSocket Handlers
 * Extracted WebSocket event handlers for better maintainability
 */

import { useState } from 'react'

import { usePipelineWebSocketShared } from '@/hooks/use-pipeline-websocket-shared'

import { useWebSocketCallbacks } from './pipeline-websocket-callbacks'

import type { PipelineStageDisplay } from './pipeline-types'

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
  stages: PipelineStageDisplay[],
  setStages: React.Dispatch<React.SetStateAction<PipelineStageDisplay[]>>
): WebSocketHandlersReturn {
  const [realtimeUsers, setRealtimeUsers] = useState<
    Array<{ user_id?: string; full_name?: string }>
  >([])

  const callbacks = useWebSocketCallbacks(reloadLeadsData, setStages, setRealtimeUsers)

  const { isConnected, sendMessage, activeUsers, isPolling } = usePipelineWebSocketShared(callbacks)

  return {
    isConnected,
    isPolling,
    activeUsers,
    sendMessage,
    realtimeUsers,
    setRealtimeUsers,
  }
}
