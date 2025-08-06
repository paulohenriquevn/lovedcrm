'use client'

import { useRouter } from 'next/navigation'
import { useEffect, type ReactNode } from 'react'

import { ErrorMessage } from '@/components/common/error-message'
import { LoadingSpinner } from '@/components/common/loading-spinner'
import { authService } from '@/services/auth'
import { settingsService } from '@/services/settings'
import { useAuthStore } from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'
import { UserStatus, type UserResponse } from '@/types/user'

interface SettingsContainerProps {
  children: ReactNode
}

// Componente para estado de carregamento
function LoadingState(): JSX.Element {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner />
    </div>
  )
}

// Componente para estado de erro
function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }): JSX.Element {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <ErrorMessage message={error} onRetry={() => void onRetry()} />
    </div>
  )
}

// Controle para evitar chamadas múltiplas simultâneas
let isLoadingData = false

// Função para carregar dados das configurações (fora do hook para ser estável)
const loadSettingsData = async (): Promise<void> => {
  // Evitar chamadas múltiplas simultâneas
  if (isLoadingData) {
    return
  }

  const { setProfile, setPreferences, setLoading, setError, isLoading } =
    useSettingsStore.getState()

  // Verificar se já está carregando
  if (isLoading) {
    return
  }

  isLoadingData = true
  setLoading(true)
  setError(null)

  try {
    // Carregar perfil do usuário
    const userProfile = await authService.getCurrentUser()
    if (userProfile) {
      // Adaptar User para UserResponse adicionando campos que podem estar faltando
      const profileData: UserResponse = {
        ...userProfile,
        status: UserStatus.ACTIVE, // Default status
        // eslint-disable-next-line camelcase
        is_email_verified: Boolean((userProfile as { is_verified?: boolean }).is_verified),
      }
      setProfile(profileData)
    }

    // Tentar carregar preferências - pode falhar se endpoint não existir
    try {
      const userPreferences = await settingsService.getUserPreferences()
      setPreferences(userPreferences)
    } catch (preferencesError) {
      // Se não conseguir carregar preferências, usar defaults
      void preferencesError // Usar void ao invés de console.warn para evitar linting
      setPreferences({
        theme: 'system',
        // eslint-disable-next-line camelcase
        notifications_email: true,
        // eslint-disable-next-line camelcase
        notifications_push: true,
        // eslint-disable-next-line camelcase
        notifications_sms: false,
        // eslint-disable-next-line camelcase
        marketing_emails: false,
        language: 'pt-BR',
        timezone: 'America/Sao_Paulo',
      })
    }
  } catch (error_) {
    setError(error_ instanceof Error ? error_.message : 'Erro ao carregar configurações')
  } finally {
    setLoading(false)
    isLoadingData = false
  }
}

// Hook para autenticação
function useSettingsAuth() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { profile, preferences, isLoading } = useSettingsStore()

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    // Só carrega se não tem dados E não está carregando E não está fazendo load global
    if (!profile && !preferences && !isLoading && !isLoadingData) {
      void loadSettingsData()
    }
  }, [user, profile, preferences, isLoading, router])

  return { user }
}

export function SettingsContainer({ children }: SettingsContainerProps): JSX.Element | null {
  const { user } = useSettingsAuth()
  const { isLoading, error } = useSettingsStore()

  if (!user) {
    return null
  }
  if (isLoading) {
    return <LoadingState />
  }
  if (error !== null) {
    return <ErrorState error={error} onRetry={() => void loadSettingsData()} />
  }

  return children as JSX.Element | null
}
