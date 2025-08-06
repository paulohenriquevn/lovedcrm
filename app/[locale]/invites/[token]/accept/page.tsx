'use client'

import { CheckCircle, XCircle, AlertTriangle, Building, User, Calendar } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { invitesService } from '@/services/invites'
import { useAuthStore } from '@/stores/auth'

import type { User as AuthUser } from '@/types/user'

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

// Utility functions
const formatDate = (dateString: string): string =>
  new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

const formatRole = (role: string): string => {
  const roles: Record<string, string> = {
    owner: 'Proprietário',
    admin: 'Administrador',
    member: 'Membro',
    viewer: 'Visualizador',
  }
  return role ? (roles[role] ?? role) : role
}

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Erro desconhecido'

// Helper functions for invite processing
function useInviteActions(
  setResult: React.Dispatch<
    React.SetStateAction<{ type: 'success' | 'error'; message: string } | null>
  >,
  router: ReturnType<typeof useRouter>,
  context: { user: AuthUser | null; inviteInfo: PublicInviteInfo | null }
) {
  const { user, inviteInfo } = context
  const redirectAfterAccept = useCallback(
    (userLoggedIn: boolean, email: string) => {
      const redirectUrl = userLoggedIn
        ? '/admin'
        : `/auth/login?email=${encodeURIComponent(email)}&message=Conta criada! Verifique seu email para obter a senha temporária.`
      void router.push(redirectUrl)
    },
    [router]
  )

  const processAcceptSuccess = useCallback(
    (message: string) => {
      setResult({ type: 'success', message })
      setTimeout(() => redirectAfterAccept(Boolean(user), inviteInfo?.invited_email ?? ''), 3000)
    },
    [redirectAfterAccept, user, inviteInfo, setResult]
  )

  const processAcceptError = useCallback(
    (error_: unknown) => {
      setResult({ type: 'error', message: getErrorMessage(error_) || 'Erro ao aceitar convite' })
    },
    [setResult]
  )

  const processRejectSuccess = useCallback(
    (message: string) => {
      setResult({ type: 'success', message })
      setTimeout(() => void router.push('/'), 3000)
    },
    [router, setResult]
  )

  const processRejectError = useCallback(
    (error_: unknown) => {
      setResult({ type: 'error', message: getErrorMessage(error_) || 'Erro ao rejeitar convite' })
    },
    [setResult]
  )

  return { processAcceptSuccess, processAcceptError, processRejectSuccess, processRejectError }
}

// Custom hook for invite logic
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

// State components (compact)
function LoadingState(): JSX.Element {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">Carregando convite...</p>
      </div>
    </div>
  )
}

function StateCard({
  icon,
  title,
  message,
  button,
}: {
  icon: React.ReactNode
  title: string
  message: string
  button?: React.ReactNode
}): JSX.Element {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full">
        <Card className="w-full">
          <CardContent className="p-6">
            <div className="text-center">
              {icon}
              <h1 className="text-xl font-semibold text-gray-900 mb-2">{title}</h1>
              <p className="text-gray-600 mb-4">{message}</p>
              {button}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ErrorState({ error, onGoHome }: { error: string; onGoHome: () => void }): JSX.Element {
  return (
    <StateCard
      icon={<XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />}
      title="Convite Inválido"
      message={error}
      button={
        <Button
          variant="secondary"
          onClick={onGoHome}
        >
          Voltar ao Início
        </Button>
      }
    />
  )
}

function ResultState({
  result,
}: {
  result: { type: 'success' | 'error'; message: string }
}): JSX.Element {
  return (
    <StateCard
      icon={
        result.type === 'success' ? (
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
        ) : (
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        )
      }
      title={result.type === 'success' ? 'Sucesso!' : 'Erro'}
      message={result.message}
      button={<p className="text-sm text-gray-500">Redirecionando automaticamente...</p>}
    />
  )
}

// Compressed components
function ExpiredWarning({ isExpired }: { isExpired: boolean }): JSX.Element | null {
  return isExpired ? (
    <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
      <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
      <div>
        <p className="font-medium text-red-800">Convite Expirado</p>
        <p className="text-sm text-red-600">Este convite expirou e não pode mais ser aceito.</p>
      </div>
    </div>
  ) : null
}

// Info row component (moved outside to avoid nested component definition)
function InfoRow({
  icon,
  children,
}: {
  icon: React.ReactNode
  children: React.ReactNode
}): JSX.Element {
  return (
    <div className="flex items-start gap-3">
      {icon}
      <div>{children}</div>
    </div>
  )
}

function OrganizationInfo({ inviteInfo }: { inviteInfo: PublicInviteInfo }): JSX.Element {
  return (
    <div className="space-y-4">
      <InfoRow icon={<Building className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />}>
        <p className="text-sm text-gray-600">Você foi convidado para se juntar à</p>
        <p className="font-semibold text-lg text-gray-900">{inviteInfo.organization_name}</p>
      </InfoRow>
      <InfoRow icon={<User className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />}>
        <p className="text-sm text-gray-600">Convidado por</p>
        <p className="font-medium text-gray-900">{inviteInfo.invited_by_name}</p>
        <p className="text-sm text-gray-600">
          como <span className="font-medium">{formatRole(inviteInfo.role)}</span>
        </p>
      </InfoRow>
      <InfoRow icon={<Calendar className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />}>
        <p className="text-sm text-gray-600">Convite enviado em</p>
        <p className="font-medium text-gray-900">{formatDate(inviteInfo.created_at)}</p>
        <p className="text-sm text-gray-600">Expira em {formatDate(inviteInfo.expires_at)}</p>
      </InfoRow>
      {inviteInfo.message !== null &&
      inviteInfo.message !== undefined &&
      inviteInfo.message !== '' ? (
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Mensagem personalizada:</p>
          <p className="text-gray-900 italic">&ldquo;{inviteInfo.message}&rdquo;</p>
        </div>
      ) : null}
    </div>
  )
}

// User status components
function LoggedInUserStatus({
  user,
  inviteInfo,
}: {
  user: AuthUser
  inviteInfo: PublicInviteInfo
}): JSX.Element {
  const isCorrectEmail =
    user.email.toLowerCase() === (inviteInfo.invited_email?.toLowerCase() ?? '')
  return isCorrectEmail ? (
    <div className="p-4 rounded-lg bg-green-50 border border-green-200">
      <p className="text-sm text-green-800">
        Você está logado com o email correto: <span className="font-medium">{user.email}</span>
      </p>
    </div>
  ) : (
    <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
      <p className="text-sm text-yellow-800">
        Este convite foi enviado para um email diferente.
        <br />
        <strong>Convite:</strong> {inviteInfo.invited_email ?? 'Email do convite'}
        <br />
        <strong>Você está logado como:</strong> {user.email}
        <br />
        <span className="text-xs">Faça login com o email correto ou peça um novo convite.</span>
      </p>
    </div>
  )
}

function UserStatus({
  user,
  inviteInfo,
}: {
  user: AuthUser | null
  inviteInfo: PublicInviteInfo
}): JSX.Element {
  return user !== null && user !== undefined ? (
    <LoggedInUserStatus user={user} inviteInfo={inviteInfo} />
  ) : (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <p className="text-sm text-blue-800">
        <strong>Fluxo Automático:</strong>
        <br />
        Ao aceitar este convite, sua conta será criada automaticamente e você receberá um email com
        uma senha temporária para fazer o primeiro login.
      </p>
    </div>
  )
}

// Action buttons component
function ActionButtons({
  isExpired,
  processing,
  onAccept,
  onReject,
}: {
  isExpired: boolean
  processing: boolean
  onAccept: () => void
  onReject: () => void
}): JSX.Element | null {
  return isExpired === true ? null : (
    <div className="flex gap-3">
      <Button
        variant="default"
        onClick={() => void onAccept()}
        disabled={processing}
        className="flex-1"
      >
        {processing ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
        ) : (
          <CheckCircle className="h-4 w-4" />
        )}
        Aceitar Convite
      </Button>
      <Button
        variant="secondary"
        onClick={() => void onReject()}
        disabled={processing}
        className="flex-1"
      >
        {processing ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
        ) : (
          <XCircle className="h-4 w-4" />
        )}
        Recusar
      </Button>
    </div>
  )
}

// Render helper function (compressed)
function renderInviteStates({
  loading,
  error,
  result,
}: {
  loading: boolean
  error: string | null
  result: { type: 'success' | 'error'; message: string } | null
}): JSX.Element | null {
  if (loading) {
    return <LoadingState />
  }
  if (error !== null) {
    return <ErrorState error={error} onGoHome={() => {}} />
  }
  if (result !== null) {
    return <ResultState result={result} />
  }
  return null
}

// Hook for invite data loading
function useInviteData(token: string) {
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

export default function AcceptInvitePage(): JSX.Element | null {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuthStore()
  const token = params.token as string

  const { inviteInfo, loading, error } = useInviteData(token)
  const { processing, result, handleAcceptInvite, handleRejectInvite } = useInviteLogic(
    token,
    inviteInfo
  )

  // Check for early return states
  const stateRender = renderInviteStates({ loading, error, result })
  if (stateRender !== null) {
    if (error !== null) {
      return <ErrorState error={error} onGoHome={() => router.push('/')} />
    }
    return stateRender
  }

  if (inviteInfo === null) {
    return null
  }

  const isExpired = inviteInfo.is_expired

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-lg w-full">
        <Card className="w-full">
          <CardHeader className="bg-blue-600 px-6 py-4">
            <CardTitle className="text-xl font-semibold text-white text-center">
              Convite para Equipe
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 py-6 space-y-6">
            <ExpiredWarning isExpired={isExpired} />
            <OrganizationInfo inviteInfo={inviteInfo} />
            <UserStatus user={user} inviteInfo={inviteInfo} />
            <ActionButtons
              isExpired={isExpired}
              processing={processing}
              onAccept={() => void handleAcceptInvite()}
              onReject={() => void handleRejectInvite()}
            />
            <div className="text-center">
              <Button
                variant="link"
                onClick={() => router.push('/')}
                className="text-sm"
              >
                Voltar ao início
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
