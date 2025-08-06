import { useState, useMemo } from 'react'

import { useToast } from '@/hooks/use-toast'
import { organizationsService } from '@/services/organizations'
import { useAuthStore } from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'

import type { Organization, OrganizationUpdate } from '@/types/organization'
import type { UserUpdate, UserPreferences } from '@/types/user'

// Constants
const DEVELOPMENT_MESSAGE = 'Em desenvolvimento'

// Helper function for creating development toast messages
function createDevelopmentToast(
  toast: ReturnType<typeof useToast>['toast'],
  description: string
): void {
  toast({
    title: DEVELOPMENT_MESSAGE,
    description,
  })
}

// Profile and preferences handlers
function createProfileHandler(toast: ReturnType<typeof useToast>['toast']): {
  handleUpdateProfile: (data: UserUpdate) => Promise<void>
  handleUpdatePreferences: (data: Partial<UserPreferences>) => Promise<void>
  handleSaveNotificationPreferences: (data: Partial<UserPreferences>) => Promise<void>
} {
  return {
    handleUpdateProfile: async (data: UserUpdate): Promise<void> => {
      try {
        const { settingsService } = await import('@/services/settings')
        const updatedProfile = await settingsService.updateProfile(data)

        const { updateUser } = useAuthStore.getState()
        updateUser(updatedProfile)

        toast({ title: 'Sucesso', description: 'Perfil atualizado com sucesso!' })
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro ao atualizar perfil'
        toast({ title: 'Erro', description: message, variant: 'destructive' })
      }
    },

    handleUpdatePreferences: async (data: Partial<UserPreferences>): Promise<void> => {
      try {
        const { settingsService } = await import('@/services/settings')
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
        const updatedPreferences: UserPreferences =
          await settingsService.updateUserPreferences(data)

        const { setPreferences } = useSettingsStore.getState()
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        setPreferences(updatedPreferences)

        toast({ title: 'Sucesso', description: 'Preferências salvas com sucesso!' })
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro ao salvar preferências'
        toast({ title: 'Erro', description: message, variant: 'destructive' })
      }
    },

    handleSaveNotificationPreferences: async (
      notificationPrefs: Partial<UserPreferences>
    ): Promise<void> => {
      try {
        const { settingsService } = await import('@/services/settings')
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
        const updatedPreferences: UserPreferences =
          await settingsService.updateUserPreferences(notificationPrefs)

        const { setPreferences } = useSettingsStore.getState()
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        setPreferences(updatedPreferences)

        toast({ title: 'Sucesso', description: 'Notificações atualizadas com sucesso!' })
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro ao alterar notificações'
        toast({ title: 'Erro', description: message, variant: 'destructive' })
        throw error
      }
    },
  }
}

// Billing handlers
function createBillingHandlers(toast: ReturnType<typeof useToast>['toast']): {
  handleChangePlan: (planSlug: string) => void
  handleCancelSubscription: () => void
  handleManageBilling: () => void
  handleAddPaymentMethod: () => void
  handleRemovePaymentMethod: (id: string) => void
  handleSetDefaultPaymentMethod: (id: string) => void
} {
  return {
    handleChangePlan: (planSlug: string): void => {
      createDevelopmentToast(toast, `Mudança para plano ${planSlug} será implementada em breve.`)
    },

    handleCancelSubscription: (): void => {
      createDevelopmentToast(toast, 'Cancelamento de assinatura será implementado em breve.')
    },

    handleManageBilling: (): void => {
      createDevelopmentToast(toast, 'Portal de cobrança será implementado em breve.')
    },

    handleAddPaymentMethod: (): void => {
      createDevelopmentToast(toast, 'Adição de método de pagamento será implementada em breve.')
    },

    handleRemovePaymentMethod: (id: string): void => {
      createDevelopmentToast(toast, `Remoção do método ${id} será implementada em breve.`)
    },

    handleSetDefaultPaymentMethod: (id: string): void => {
      createDevelopmentToast(
        toast,
        `Definição do método ${id} como padrão será implementada em breve.`
      )
    },
  }
}

interface SettingsHandlers {
  handleUpdateProfile: (data: UserUpdate) => Promise<void>
  handleUpdatePreferences: (data: Partial<UserPreferences>) => Promise<void>
  handleSaveNotificationPreferences: (data: Partial<UserPreferences>) => Promise<void>
  handleChangePassword: () => void
  handlePasswordChange: (currentPassword: string, newPassword: string) => Promise<void>
  handleUpdateOrganization: (data: OrganizationUpdate) => Promise<void>
  handleChangePlan: (planSlug: string) => void
  handleCancelSubscription: () => void
  handleManageBilling: () => void
  handleAddPaymentMethod: () => void
  handleRemovePaymentMethod: (id: string) => void
  handleSetDefaultPaymentMethod: (id: string) => void
  isUpdatingOrg: boolean
  setIsPasswordModalOpen: (open: boolean) => void
}

export function useSettingsHandlers(): SettingsHandlers {
  const [isUpdatingOrg, setIsUpdatingOrg] = useState(false)
  // eslint-disable-next-line react/hook-use-state
  const [passwordModalOpen, setIsPasswordModalOpen] = useState<boolean>(false)
  void passwordModalOpen // Explicitly acknowledge unused variable
  const { toast } = useToast()

  // Get profile and preferences handlers
  const profileHandlers = useMemo(() => createProfileHandler(toast), [toast])

  // Get billing handlers
  const billingHandlers = useMemo(() => createBillingHandlers(toast), [toast])

  const handleChangePassword = (): void => setIsPasswordModalOpen(true)

  const handlePasswordChange = async (
    currentPassword: string,
    newPassword: string
  ): Promise<void> => {
    try {
      const { settingsService } = await import('@/services/settings')
      await settingsService.updatePassword(currentPassword, newPassword)
      toast({ title: 'Sucesso', description: 'Senha alterada com sucesso!' })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao alterar senha'
      toast({ title: 'Erro', description: message, variant: 'destructive' })
      throw error
    }
  }

  const handleUpdateOrganization = async (data: OrganizationUpdate): Promise<void> => {
    const { organization } = useAuthStore.getState()
    if (!organization) {
      return
    }

    setIsUpdatingOrg(true)
    try {
      const updatedOrg = await organizationsService.updateCurrentOrganization(data)

      const updatedOrgWithTimestamp = updatedOrg as Organization & { updated_at?: string }
      const typedOrg: Organization = {
        ...updatedOrg,
        // eslint-disable-next-line camelcase
        updated_at: updatedOrgWithTimestamp.updated_at ?? new Date().toISOString(),
      }

      const { setOrganization } = useAuthStore.getState()
      setOrganization(typedOrg)

      toast({ title: 'Sucesso', description: 'Organização atualizada com sucesso!' })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar organização'
      toast({ title: 'Erro', description: message, variant: 'destructive' })
    } finally {
      setIsUpdatingOrg(false)
    }
  }

  return {
    ...profileHandlers,
    ...billingHandlers,
    handleChangePassword,
    handlePasswordChange,
    handleUpdateOrganization,
    isUpdatingOrg,
    setIsPasswordModalOpen,
  }
}
