/**
 * Hook for Pipeline WebSocket Real-time Updates
 * Handles real-time communication for Pipeline Kanban board
 */

'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useAuthStore } from '@/stores/auth'

export interface PipelineWebSocketMessage {
  type: string
  lead?: any
  user_id?: string
  user_name?: string
  timestamp?: string
  [key: string]: any
}

interface UsePipelineWebSocketOptions {
  onLeadStageChanged?: (data: PipelineWebSocketMessage) => void
  onLeadCreated?: (data: PipelineWebSocketMessage) => void
  onLeadUpdated?: (data: PipelineWebSocketMessage) => void
  onLeadDeleted?: (data: PipelineWebSocketMessage) => void
  onUserActivity?: (data: PipelineWebSocketMessage) => void
  onUserDragging?: (data: PipelineWebSocketMessage) => void
  onConnectionEstablished?: (data: PipelineWebSocketMessage) => void
  autoReconnect?: boolean
  reconnectInterval?: number
  enablePollingFallback?: boolean
  pollingInterval?: number
}

interface UsePipelineWebSocketReturn {
  isConnected: boolean
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error' | 'polling'
  sendMessage: (message: any) => void
  activeUsers: any[]
  lastMessage: PipelineWebSocketMessage | null
  reconnect: () => void
  isPolling: boolean
}

export function usePipelineWebSocket(
  options: UsePipelineWebSocketOptions = {}
): UsePipelineWebSocketReturn {
  console.log('🎣 usePipelineWebSocket hook called')
  
  const {
    onLeadStageChanged,
    onLeadCreated,
    onLeadUpdated,
    onLeadDeleted,
    onUserActivity,
    onUserDragging,
    onConnectionEstablished,
    autoReconnect = true,
    reconnectInterval = 5000,
    enablePollingFallback = true,
    pollingInterval = 10000
  } = options

  const { user, organization, token } = useAuthStore()
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()
  const pollingIntervalRef = useRef<NodeJS.Timeout>()
  const [isConnected, setIsConnected] = useState(false)
  const [isPolling, setIsPolling] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error' | 'polling'>('disconnected')
  const [activeUsers, setActiveUsers] = useState<any[]>([])
  const [lastMessage, setLastMessage] = useState<PipelineWebSocketMessage | null>(null)

  // WebSocket URL construction
  const getWebSocketURL = useCallback(() => {
    if (!token || !organization?.id) return null
    
    // Use dedicated WebSocket URL for browser compatibility (localhost for Docker)
    const wsURL = process.env.NEXT_PUBLIC_WS_URL || 
                  process.env.NEXT_PUBLIC_API_URL?.replace('http', 'ws') || 
                  'ws://localhost:8000'
    const url = `${wsURL}/ws/pipeline?token=${token}&org_id=${organization.id}`
    return url
  }, [token, organization?.id])

  // Polling function for fallback
  const pollPipelineData = useCallback(async () => {
    if (!token || !organization?.id) return

    try {
      // Use Next.js rewritten routes instead of direct backend calls
      const response = await fetch(`/api/crm/leads`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Org-Id': organization.id,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        // Simulate a WebSocket message for pipeline data update
        const simulatedMessage: PipelineWebSocketMessage = {
          type: 'pipeline_data_updated',
          data,
          timestamp: new Date().toISOString()
        }
        setLastMessage(simulatedMessage)
      }
    } catch (error) {
      console.error('Polling failed:', error)
    }
  }, [token, organization?.id])

  // Start polling fallback
  const startPolling = useCallback(() => {
    if (!enablePollingFallback) return
    
    // Check current polling status without depending on it
    setIsPolling(prevIsPolling => {
      if (prevIsPolling) return prevIsPolling // Already polling
      
      console.log('Starting polling fallback for pipeline data')
      setConnectionStatus('polling')
      
      // Initial poll
      pollPipelineData()
      
      // Set up polling interval
      pollingIntervalRef.current = setInterval(() => {
        pollPipelineData()
      }, pollingInterval)
      
      return true
    })
  }, [enablePollingFallback, pollPipelineData, pollingInterval])

  // Stop polling fallback
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = undefined
    }
    setIsPolling(false)
    setConnectionStatus(prevStatus => 
      prevStatus === 'polling' ? 'disconnected' : prevStatus
    )
  }, [])

  // Send message to WebSocket
  const sendMessage = useCallback((message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket is not connected. Message not sent:', message)
    }
  }, [])

  // Handle incoming messages
  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const data: PipelineWebSocketMessage = JSON.parse(event.data)
      setLastMessage(data)

      console.log('Pipeline WebSocket message received:', data.type, data)

      switch (data.type) {
        case 'pipeline_connection_established':
          setConnectionStatus('connected')
          setIsConnected(true)
          if (data.active_users) {
            setActiveUsers(data.active_users)
          }
          onConnectionEstablished?.(data)
          break

        case 'lead_stage_changed':
          onLeadStageChanged?.(data)
          break

        case 'stage_change':
          // Handle stage_change messages from backend
          console.log('📩 Received stage_change:', data)
          onLeadStageChanged?.(data)
          break

        case 'lead_created':
          onLeadCreated?.(data)
          break

        case 'lead_updated':
          onLeadUpdated?.(data)
          break

        case 'lead_deleted':
          onLeadDeleted?.(data)
          break

        case 'pipeline_user_activity_update':
          onUserActivity?.(data)
          break

        case 'user_dragging_lead':
          onUserDragging?.(data)
          break

        case 'error':
          console.error('Pipeline WebSocket error:', data.message)
          setConnectionStatus('error')
          break

        case 'pong':
          // Handle keepalive pong
          break

        default:
          console.log('Unknown pipeline message type:', data.type, data)
      }
    } catch (error) {
      console.error('Failed to parse pipeline WebSocket message:', error, event.data)
    }
  }, [onLeadStageChanged, onLeadCreated, onLeadUpdated, onLeadDeleted, onUserActivity, onUserDragging, onConnectionEstablished])

  // Connect to WebSocket
  const connect = useCallback(() => {
    const url = getWebSocketURL()
    console.log('🔗 WebSocket connect attempt:', {
      hasUrl: !!url,
      hasToken: !!token,
      hasOrg: !!organization?.id,
      wsUrl: process.env.NEXT_PUBLIC_WS_URL,
      apiUrl: process.env.NEXT_PUBLIC_API_URL
    })
    
    if (!url) {
      console.warn('❌ Cannot connect to pipeline WebSocket: missing authentication or organization')
      console.log('🔄 Starting polling fallback')
      startPolling()
      return
    }

    if (wsRef.current?.readyState === WebSocket.CONNECTING || wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('✅ Pipeline WebSocket is already connecting or connected')
      return
    }

    try {
      console.log('🚀 Connecting to pipeline WebSocket:', url.replace(token || '', '[TOKEN]'))
      setConnectionStatus('connecting')
      
      const ws = new WebSocket(url)
      wsRef.current = ws

      ws.onopen = () => {
        console.log('✅ Pipeline WebSocket connected successfully')
        setConnectionStatus('connected')
        setIsConnected(true)
        
        // Stop polling fallback when WebSocket reconnects
        stopPolling()
        
        // Clear any existing reconnect timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current)
        }
      }

      ws.onmessage = handleMessage

      ws.onclose = (event) => {
        console.log('❌ Pipeline WebSocket disconnected:', { code: event.code, reason: event.reason })
        setConnectionStatus('disconnected')
        setIsConnected(false)
        setActiveUsers([])
        wsRef.current = null

        // Auto-reconnect if enabled
        if (autoReconnect && event.code !== 1000) { // Don't reconnect on normal closure
          console.log(`🔄 Pipeline WebSocket reconnecting in ${reconnectInterval}ms...`)
          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, reconnectInterval)
        } else if (enablePollingFallback) {
          // Start polling fallback if reconnection is disabled or normal closure
          console.log('🔄 Starting polling fallback after WebSocket close')
          setTimeout(() => {
            startPolling()
          }, 1000)
        }
      }

      ws.onerror = (error) => {
        console.error('❌ Pipeline WebSocket error:', error)
        console.log('❌ WebSocket error details:', { 
          readyState: ws.readyState, 
          url: ws.url?.replace(token || '', '[TOKEN]') 
        })
        setConnectionStatus('error')
        
        // Start polling fallback on persistent errors
        if (enablePollingFallback) {
          console.log('🔄 Starting polling fallback after WebSocket error')
          setTimeout(() => {
            startPolling()
          }, 2000)
        }
      }

    } catch (error) {
      console.error('Failed to create pipeline WebSocket connection:', error)
      setConnectionStatus('error')
      
      // Start polling fallback if WebSocket creation fails
      if (enablePollingFallback) {
        setTimeout(() => {
          startPolling()
        }, 1000)
      }
    }
  }, [getWebSocketURL, token, autoReconnect, reconnectInterval, handleMessage, enablePollingFallback, startPolling, stopPolling])

  // Disconnect WebSocket
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Component unmounting')
      wsRef.current = null
    }
    
    // Also stop polling
    stopPolling()
    
    setConnectionStatus('disconnected')
    setIsConnected(false)
    setActiveUsers([])
  }, [stopPolling])

  // Manual reconnect function
  const reconnect = useCallback(() => {
    disconnect()
    setTimeout(() => {
      connect()
    }, 100)
  }, [disconnect, connect])

  // Send keepalive ping
  const sendKeepalive = useCallback(() => {
    if (isConnected) {
      sendMessage({
        type: 'ping',
        timestamp: new Date().toISOString()
      })
    }
  }, [isConnected, sendMessage])

  // Connect when user and organization are available
  useEffect(() => {
    console.log('🔍 WebSocket useEffect check:', {
      user: !!user,
      organization: !!organization, 
      token: !!token,
      shouldConnect: !!(user && organization && token)
    })
    
    if (user && organization && token) {
      console.log('✅ Conditions met, calling connect()')
      connect()
    } else {
      console.log('❌ Conditions not met, calling disconnect()')
      disconnect()
    }

    return () => {
      disconnect()
    }
  }, [user, organization, token, connect, disconnect])

  // Setup keepalive ping every 30 seconds
  useEffect(() => {
    if (isConnected) {
      const interval = setInterval(sendKeepalive, 30000)
      return () => clearInterval(interval)
    }
  }, [isConnected, sendKeepalive])

  return {
    isConnected,
    connectionStatus,
    sendMessage,
    activeUsers,
    lastMessage,
    reconnect,
    isPolling
  }
}