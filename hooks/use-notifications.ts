/**
 * Hook para gerenciar notificações em tempo real
 * Usado no header para exibir notificações do usuário
 */

import { useState, useEffect, useCallback } from 'react'
import { useOrgContext } from '@/hooks/use-org-context'

export interface Notification {
  id: string
  type: 'lead' | 'team' | 'ai' | 'system' | 'billing'
  title: string
  description: string
  time: string
  unread: boolean
  metadata?: Record<string, any>
}

export interface UseNotificationsReturn {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  error: string | null
  markAsRead: (notificationId: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  refreshNotifications: () => Promise<void>
}

export function useNotifications(): UseNotificationsReturn {
  const { organization } = useOrgContext()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Mock notifications por enquanto - TODO: Implementar API real
  const mockNotifications: Notification[] = [
    {
      id: '1',
      type: 'lead',
      title: 'Novo lead capturado',
      description: 'Maria Santos interessada em marketing digital',
      time: '5 min atrás',
      unread: true,
    },
    {
      id: '2',
      type: 'team',
      title: 'Pedro adicionou nova proposta',
      description: 'Proposta para ClienteCorp - R$ 8.500/mês',
      time: '15 min atrás',
      unread: true,
    },
    {
      id: '3',
      type: 'ai',
      title: 'Resumo IA disponível',
      description: 'Análise completa da conversa com TechStart',
      time: '30 min atrás',
      unread: false,
    },
    {
      id: '4',
      type: 'system',
      title: 'Backup realizado',
      description: 'Backup automático dos dados concluído com sucesso',
      time: '2 horas atrás',
      unread: false,
    },
  ]

  // Buscar notificações
  const fetchNotifications = useCallback(async () => {
    if (!organization) return

    setIsLoading(true)
    setError(null)

    try {
      // TODO: Implementar API call real
      // const response = await notificationsService.getNotifications()

      // Por enquanto, usar mock com contexto organizacional
      const orgNotifications = mockNotifications.map(notification => ({
        ...notification,
        // Simular que notificações são específicas da org
        description: `${notification.description} (${organization.name})`,
      }))

      setNotifications(orgNotifications)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar notificações')
      setNotifications([])
    } finally {
      setIsLoading(false)
    }
  }, [organization])

  // Marcar como lida
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      // TODO: API call para marcar como lida
      // await notificationsService.markAsRead(notificationId)

      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId ? { ...notification, unread: false } : notification
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao marcar notificação como lida')
    }
  }, [])

  // Marcar todas como lidas
  const markAllAsRead = useCallback(async () => {
    try {
      // TODO: API call para marcar todas como lidas
      // await notificationsService.markAllAsRead()

      setNotifications(prev => prev.map(notification => ({ ...notification, unread: false })))
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao marcar todas as notificações como lidas'
      )
    }
  }, [])

  // Refresh notifications
  const refreshNotifications = useCallback(() => {
    return fetchNotifications()
  }, [fetchNotifications])

  // Carregar notificações na montagem
  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Calcular contagem de não lidas
  const unreadCount = notifications.filter(n => n.unread).length

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
  }
}
