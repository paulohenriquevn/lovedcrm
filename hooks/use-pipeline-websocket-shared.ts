/**
 * Shared Pipeline WebSocket Manager
 * Manages single WebSocket connection across multiple component instances
 */

'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useAuthStore } from '@/stores/auth'
import type {
  PipelineWebSocketMessage,
  UsePipelineWebSocketOptions,
  UsePipelineWebSocketReturn,
} from '@/components/crm/pipeline-types'

class WebSocketManager {
  private static instance: WebSocketManager
  private ws: WebSocket | null = null
  private isConnected: boolean = false
  private connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error' | 'polling' =
    'disconnected'
  private activeUsers: any[] = []
  private lastMessage: PipelineWebSocketMessage | null = null
  private subscribers = new Set<string>()
  private messageHandlers = new Map<string, (message: PipelineWebSocketMessage) => void>()
  private reconnectTimeout: NodeJS.Timeout | null = null
  private pollingInterval: NodeJS.Timeout | null = null
  private isPolling: boolean = false
  private updateCallbacks = new Set<() => void>()

  static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager()
    }
    return WebSocketManager.instance
  }

  addUpdateCallback(callback: () => void) {
    this.updateCallbacks.add(callback)
  }

  removeUpdateCallback(callback: () => void) {
    this.updateCallbacks.delete(callback)
  }

  private notifySubscribers() {
    this.updateCallbacks.forEach(callback => {
      try {
        callback()
      } catch (error) {
        console.error('WebSocket callback error:', error)
      }
    })
  }

  getState() {
    return {
      isConnected: this.isConnected,
      connectionStatus: this.connectionStatus,
      activeUsers: this.activeUsers,
      lastMessage: this.lastMessage,
      isPolling: this.isPolling,
      subscriberCount: this.subscribers.size,
    }
  }

  addSubscriber(id: string, handler: (message: PipelineWebSocketMessage) => void) {
    this.subscribers.add(id)
    this.messageHandlers.set(id, handler)
  }

  removeSubscriber(id: string) {
    this.subscribers.delete(id)
    this.messageHandlers.delete(id)
  }

  connect(url: string, options: UsePipelineWebSocketOptions = {}) {
    const { autoReconnect = true, reconnectInterval = 5000, enablePollingFallback = true } = options

    if (this.ws?.readyState === WebSocket.CONNECTING || this.ws?.readyState === WebSocket.OPEN) {
      return
    }

    this.connectionStatus = 'connecting'
    this.notifySubscribers()

    try {
      const ws = new WebSocket(url)
      this.ws = ws

      ws.onopen = () => {
        this.connectionStatus = 'connected'
        this.isConnected = true
        this.stopPolling()

        if (this.reconnectTimeout) {
          clearTimeout(this.reconnectTimeout)
          this.reconnectTimeout = null
        }

        this.notifySubscribers()
      }

      ws.onmessage = event => {
        try {
          const data: PipelineWebSocketMessage = JSON.parse(event.data)
          this.lastMessage = data

          switch (data.type) {
            case 'pipeline_connection_established':
              this.connectionStatus = 'connected'
              this.isConnected = true
              if (data.active_users) {
                this.activeUsers = data.active_users
              }
              break
          }

          // Notify all subscribers
          this.messageHandlers.forEach(handler => {
            try {
              handler(data)
            } catch (error) {
              console.error('WebSocket handler error:', error)
            }
          })

          this.notifySubscribers()
        } catch (error) {
          console.error('WebSocket message parse error:', error)
        }
      }

      ws.onclose = event => {
        this.connectionStatus = 'disconnected'
        this.isConnected = false
        this.activeUsers = []
        this.ws = null
        this.notifySubscribers()

        // Auto-reconnect if there are subscribers
        if (autoReconnect && event.code !== 1000 && this.subscribers.size > 0) {
          this.reconnectTimeout = setTimeout(() => {
            this.connect(url, options)
          }, reconnectInterval)
        } else if (enablePollingFallback && this.subscribers.size > 0) {
          this.startPolling()
        }
      }

      ws.onerror = () => {
        this.connectionStatus = 'error'
        this.notifySubscribers()

        if (enablePollingFallback && this.subscribers.size > 0) {
          setTimeout(() => this.startPolling(), 2000)
        }
      }
    } catch (error) {
      this.connectionStatus = 'error'
      this.notifySubscribers()
    }
  }

  disconnect() {
    if (this.subscribers.size <= 1) {
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout)
        this.reconnectTimeout = null
      }

      if (this.ws) {
        this.ws.close(1000, 'No more subscribers')
        this.ws = null
      }

      this.stopPolling()
      this.connectionStatus = 'disconnected'
      this.isConnected = false
      this.activeUsers = []

      this.notifySubscribers()
    }
  }

  sendMessage(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    }
  }

  private startPolling() {
    if (this.isPolling) return

    this.isPolling = true
    this.connectionStatus = 'polling'
    this.notifySubscribers()

    this.pollingInterval = setInterval(() => {
      // Polling fallback implementation
    }, 10000)
  }

  private stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
      this.pollingInterval = null
    }
    this.isPolling = false
  }
}

export function usePipelineWebSocketShared(
  options: UsePipelineWebSocketOptions = {}
): UsePipelineWebSocketReturn {
  const {
    onLeadStageChanged,
    onLeadCreated,
    onLeadUpdated,
    onLeadDeleted,
    onUserActivity,
    onUserDragging,
    onConnectionEstablished,
  } = options

  const { user, organization, token } = useAuthStore()
  const subscriberIdRef = useRef<string>(Math.random().toString(36).substring(7))
  const managerRef = useRef<WebSocketManager>()
  const [state, setState] = useState({
    isConnected: false,
    connectionStatus: 'disconnected' as const,
    activeUsers: [],
    lastMessage: null,
    isPolling: false,
  })

  // Initialize manager on client side only
  useEffect(() => {
    managerRef.current = WebSocketManager.getInstance()

    const updateCallback = () => {
      setState(managerRef.current!.getState())
    }

    managerRef.current.addUpdateCallback(updateCallback)

    return () => {
      if (managerRef.current) {
        managerRef.current.removeUpdateCallback(updateCallback)
      }
    }
  }, [])

  // Create message handler for this instance
  const messageHandler = useCallback(
    (data: PipelineWebSocketMessage) => {
      switch (data.type) {
        case 'pipeline_connection_established':
          onConnectionEstablished?.(data)
          break
        case 'lead_stage_changed':
        case 'stage_change':
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
      }
    },
    [
      onConnectionEstablished,
      onLeadStageChanged,
      onLeadCreated,
      onLeadUpdated,
      onLeadDeleted,
      onUserActivity,
      onUserDragging,
    ]
  )

  // Register subscriber once and update handler dynamically
  const messageHandlerRef = useRef(messageHandler)
  messageHandlerRef.current = messageHandler

  useEffect(() => {
    if (!managerRef.current) return

    const subscriberId = subscriberIdRef.current

    // Create stable handler that uses the latest messageHandler
    const stableHandler = (data: PipelineWebSocketMessage) => {
      messageHandlerRef.current(data)
    }

    managerRef.current.addSubscriber(subscriberId, stableHandler)

    return () => {
      if (managerRef.current) {
        managerRef.current.removeSubscriber(subscriberId)

        // Only disconnect if this was the last subscriber after a delay
        setTimeout(() => {
          if (managerRef.current && managerRef.current.getState().subscriberCount === 0) {
            managerRef.current.disconnect()
          }
        }, 500)
      }
    }
  }, []) // NO dependencies - register once only

  // Connect when ready
  useEffect(() => {
    if (!managerRef.current || !user || !organization || !token) return

    const wsURL =
      process.env.NEXT_PUBLIC_WS_URL ||
      process.env.NEXT_PUBLIC_API_URL?.replace('http', 'ws') ||
      'ws://localhost:8000'
    const url = `${wsURL}/ws/pipeline?token=${token}&org_id=${organization.id}`

    managerRef.current.connect(url, options)
  }, [user, organization, token, options])

  // Send message function
  const sendMessage = useCallback((message: any) => {
    if (managerRef.current) {
      managerRef.current.sendMessage(message)
    }
  }, [])

  // Reconnect function
  const reconnect = useCallback(() => {
    if (!managerRef.current || !user || !organization || !token) return

    managerRef.current.disconnect()
    setTimeout(() => {
      if (managerRef.current) {
        const wsURL =
          process.env.NEXT_PUBLIC_WS_URL ||
          process.env.NEXT_PUBLIC_API_URL?.replace('http', 'ws') ||
          'ws://localhost:8000'
        const url = `${wsURL}/ws/pipeline?token=${token}&org_id=${organization.id}`
        managerRef.current.connect(url, options)
      }
    }, 100)
  }, [user, organization, token, options])

  return {
    isConnected: state.isConnected,
    connectionStatus: state.connectionStatus,
    sendMessage,
    activeUsers: state.activeUsers,
    lastMessage: state.lastMessage,
    reconnect,
    isPolling: state.isPolling,
  }
}
