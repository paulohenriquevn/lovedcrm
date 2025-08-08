import { useRouter } from 'next/navigation'
import { useState, useCallback } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { invitesService } from '@/services/invites'
import { useAuthStore } from '@/stores/auth'

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

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Erro desconhecido'

interface User {
  id: string
  email: string
}

interface InviteContext {
  user: User | null
  inviteInfo: PublicInviteInfo | null
}

function useInviteActions(
  setResult: React.Dispatch<
    React.SetStateAction<{ type: 'success' | 'error'; message: string } | null>
  >,
  router: ReturnType<typeof useRouter>,
  context: InviteContext
) {
  const { user, inviteInfo } = context

  const processAcceptSuccess = useCallback(
    (message: string): void => {
      if (user && inviteInfo) {
        setTimeout(() => {
          router.push(`/${inviteInfo.organization_slug}/admin`)
        }, 2000)
      }
      setResult({ type: 'success', message })
    },
    [user, inviteInfo, router, setResult]
  )

  const processAcceptError = useCallback(
    (error: unknown): void => {
      setResult({ type: 'error', message: getErrorMessage(error) })
    },
    [setResult]
  )

  const processRejectSuccess = useCallback(
    (message: string): void => {
      setResult({ type: 'success', message })
    },
    [setResult]
  )

  const processRejectError = useCallback(
    (error: unknown): void => {
      setResult({ type: 'error', message: getErrorMessage(error) })
    },
    [setResult]
  )

  return {
    processAcceptSuccess,
    processAcceptError,
    processRejectSuccess,
    processRejectError,
  }
}

function useInviteLogic(token: string, inviteInfo: PublicInviteInfo | null) {
  const router = useRouter()
  const { user } = useAuthStore()
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const { processAcceptSuccess, processAcceptError, processRejectSuccess, processRejectError } =
    useInviteActions(setResult, router, { user, inviteInfo })

  const handleAcceptInvite = useCallback(async (): Promise<void> => {
    if (inviteInfo === null || inviteInfo === undefined) {
      return
    }

    setProcessing(true)

    try {
      const response = await invitesService.acceptInvite(token)
      processAcceptSuccess(response.message)
    } catch (error_) {
      processAcceptError(error_)
    } finally {
      setProcessing(false)
    }
  }, [inviteInfo, token, processAcceptSuccess, processAcceptError])

  const handleRejectInvite = useCallback(async (): Promise<void> => {
    if (inviteInfo === null || inviteInfo === undefined) {
      return
    }

    const reason = prompt('Motivo da recusa (opcional):')
    const validReason = reason ?? undefined

    setProcessing(true)

    try {
      const response = await invitesService.rejectInvite(token, validReason)
      processRejectSuccess(response.message)
    } catch (error_) {
      processRejectError(error_)
    } finally {
      setProcessing(false)
    }
  }, [inviteInfo, token, processRejectSuccess, processRejectError])

  return {
    processing,
    result,
    handleAcceptInvite,
    handleRejectInvite,
  }
}

interface InviteActionsProps {
  token: string
  inviteInfo: PublicInviteInfo | null
}

export function InviteActions({ token, inviteInfo }: InviteActionsProps): JSX.Element {
  const { processing, handleAcceptInvite, handleRejectInvite } = useInviteLogic(token, inviteInfo)

  if (!inviteInfo || inviteInfo.is_expired) {
    return null
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={() => void handleAcceptInvite()}
            disabled={processing}
            className="flex-1"
            size="lg"
          >
            {processing ? 'Processando...' : 'Aceitar Convite'}
          </Button>
          <Button
            onClick={() => void handleRejectInvite()}
            disabled={processing}
            variant="outline"
            className="flex-1"
            size="lg"
          >
            Recusar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export { useInviteLogic }
