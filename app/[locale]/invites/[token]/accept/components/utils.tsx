import { useState, useEffect, useCallback } from 'react'

import { invitesService } from '@/services/invites'

interface PublicInviteInfo {
  organization_name: string
  organization_slug: string
  invited_by_name: string
  role: string
  created_at: string
  expires_at: string
  is_expired: boolean
  message?: string
  invited_email: string
}

export const formatDate = (dateString: string): string =>
  new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

export const formatRole = (role: string): string => {
  const roles: Record<string, string> = {
    owner: 'Proprietário',
    admin: 'Administrador',
    member: 'Membro',
    viewer: 'Visualizador',
  }
  return role ? (roles[role] ?? role) : role
}

export const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Erro desconhecido'

// Hook for invite data loading
export function useInviteData(token: string) {
  const [inviteInfo, setInviteInfo] = useState<PublicInviteInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadInviteInfo = useCallback(async (): Promise<void> => {
    try {
      setLoading(true)
      setError(null)

      const info = await invitesService.getPublicInviteInfo(token)
      setInviteInfo(info)
    } catch (error_) {
      const errorMessage = getErrorMessage(error_)
      setError(errorMessage === '' ? 'Convite não encontrado ou inválido' : errorMessage)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (token !== null && token !== undefined && token !== '') {
      void loadInviteInfo()
    }
  }, [token, loadInviteInfo])

  return { inviteInfo, loading, error }
}
