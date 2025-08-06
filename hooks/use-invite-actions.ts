import { useState } from 'react'

import { invitesService } from '@/services/invites'

import type { OrganizationInviteCreate } from '@/types/organization'

interface UseInviteActionsOptions {
  onSuccess?: () => Promise<void>
}

interface UseInviteActionsReturn {
  isSubmitting: boolean
  error: string | null
  createInvite: (data: OrganizationInviteCreate) => Promise<void>
  cancelInvite: (inviteId: string) => Promise<void>
  clearError: () => void
}

export function useInviteActions({
  onSuccess,
}: UseInviteActionsOptions = {}): UseInviteActionsReturn {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = (): void => {
    setError(null)
  }

  const createInvite = async (data: OrganizationInviteCreate): Promise<void> => {
    try {
      setIsSubmitting(true)
      setError(null)

      await invitesService.createInvite(data)

      if (onSuccess) {
        await onSuccess()
      }
    } catch (error_) {
      const errorMessage = error_ instanceof Error ? error_.message : 'Erro ao enviar convite'
      setError(errorMessage)
      throw error_ // Re-throw to allow caller to handle if needed
    } finally {
      setIsSubmitting(false)
    }
  }

  const cancelInvite = async (inviteId: string): Promise<void> => {
    const confirmed = window.confirm('Tem certeza que deseja cancelar este convite?')
    if (!confirmed) {
      return
    }

    try {
      setError(null)

      await invitesService.cancelInvite(inviteId)

      if (onSuccess) {
        await onSuccess()
      }
    } catch (error_) {
      const errorMessage = error_ instanceof Error ? error_.message : 'Erro ao cancelar convite'
      setError(errorMessage)
      throw error_ // Re-throw to allow caller to handle if needed
    }
  }

  return {
    isSubmitting,
    error,
    createInvite,
    cancelInvite,
    clearError,
  }
}
