'use client'

import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import { ErrorMessage } from '@/components/common/error-message'
import { LoadingSpinner } from '@/components/common/loading-spinner'
import { UserDetailsView } from '@/components/users/UserDetailsView'
import { usersService, type BackendUser } from '@/services/users'
import { useAuthStore } from '@/stores/auth'
import { useOrganizationsStore } from '@/stores/organizations'
import { useUsersStore } from '@/stores/users'
import { type UserUpdate, type User, type UserResponse } from '@/types/user'

// Helper function to validate and clean string values
function cleanStringValue(value: string | null | undefined): string | undefined {
  return value !== null && value !== undefined && value !== '' ? value : undefined
}


// Helper function to transform BackendUser to User
function transformBackendUser(backendUser: BackendUser): User {
  return {
    id: backendUser.id,
    email: backendUser.email,
    // eslint-disable-next-line camelcase
    full_name: cleanStringValue(backendUser.full_name),
    phone: cleanStringValue(backendUser.phone),
    // eslint-disable-next-line camelcase
    avatar_url: cleanStringValue(backendUser.avatar_url),
    status: backendUser.status,
    // eslint-disable-next-line camelcase
    is_email_verified: backendUser.is_email_verified,
    timezone: cleanStringValue(backendUser.timezone),
    language: cleanStringValue(backendUser.language),
    // eslint-disable-next-line camelcase
    created_at: backendUser.created_at,
    // eslint-disable-next-line camelcase
    updated_at: cleanStringValue(backendUser.updated_at),
  }
}

interface UserPermissions {
  canEdit: boolean
  isOwnProfile: boolean
  isAdmin: boolean
}

interface UserActions {
  handleUpdateUser: (data: UserUpdate) => Promise<void>
}

// Hook for user details data management
function useUserDetailsData(userId: string): {
  selectedUser: UserResponse | null
  isLoading: boolean
  error: string | null
  isUpdating: boolean
  setIsUpdating: (value: boolean) => void
  loadUserDetails: () => Promise<void>
  updateUser: (id: string, data: UserResponse) => void
  setSelectedUser: (user: UserResponse) => void
} {
  const { isLoading, error, setLoading, setError, updateCurrentUser } = useUsersStore()
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  const loadUserDetails = useUserDetailsLoader({ userId, setSelectedUser, setLoading, setError })

  return {
    selectedUser,
    isLoading,
    error,
    isUpdating,
    setIsUpdating,
    loadUserDetails,
    updateUser: (id: string, data: UserResponse) => {
      // Convert UserResponse to Partial<User> for the store
      const updates: Partial<User> = {
        full_name: data.full_name,
        phone: data.phone,
        avatar_url: data.avatar_url,
        timezone: data.timezone,
        language: data.language,
      }
      updateCurrentUser(updates)
    },
    setSelectedUser,
  }
}

interface UserDetailsLoaderParams {
  userId: string
  setSelectedUser: (user: UserResponse) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

function useUserDetailsLoader(params: UserDetailsLoaderParams): () => Promise<void> {
  const { userId, setSelectedUser, setLoading, setError } = params

  return useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const userDetails = await usersService.getUserById(userId)
      setSelectedUser(userDetails)
    } catch {
      const message = 'Erro ao carregar usuário'
      setError(message)
      // toast({ title: "Erro", description: message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [userId, setSelectedUser, setLoading, setError])
}

// Hook for user validation
function useUserValidation(): { validateUserUpdate: (data: UserUpdate) => string | null } {
  const isValidPhone = useCallback((phone: string): boolean => {
    const phoneRegex = /^\+\d{10,15}$/
    return phoneRegex.test(phone)
  }, [])

  const validateUserUpdate = useCallback(
    (data: UserUpdate): string | null => {
      if (
        data.full_name !== null &&
        data.full_name !== undefined &&
        data.full_name.trim().length < 2
      ) {
        return 'Nome deve ter pelo menos 2 caracteres'
      }
      if (data.phone !== null && data.phone !== undefined && !isValidPhone(data.phone)) {
        return 'Telefone inválido'
      }
      return null
    },
    [isValidPhone]
  )

  return { validateUserUpdate }
}

// Hook for user update action
function useUserUpdateAction(
  userId: string,
  setIsUpdating: (value: boolean) => void,
  setSelectedUser: (user: UserResponse) => void
): (data: UserUpdate) => Promise<void> {
  const { updateCurrentUser } = useUsersStore()
  const { validateUserUpdate } = useUserValidation()

  return useCallback(
    async (data: UserUpdate) => {
      setIsUpdating(true)

      try {
        const validationError = validateUserUpdate(data)
        if (validationError !== null) {
          // toast({ title: "Erro", description: validationError, variant: "destructive" })
          return
        }

        const updated = await usersService.updateUser(userId, data)
        updateCurrentUser(updated)
        setSelectedUser({ ...updated } as UserResponse)
        // toast({ title: "Sucesso", description: 'Usuário atualizado com sucesso!' })
      } catch {
        // toast({ title: "Erro", description: 'Erro ao atualizar usuário', variant: "destructive" })
      } finally {
        setIsUpdating(false)
      }
    },
    [userId, validateUserUpdate, updateCurrentUser, setSelectedUser, setIsUpdating]
  )
}

interface UserActionsParams {
  userId: string
  loadUserDetails: () => Promise<void>
  setIsUpdating: (value: boolean) => void
  setSelectedUser: (user: UserResponse) => void
}

// Hook for user actions
function useUserActions(params: UserActionsParams): UserActions {
  const { userId, setIsUpdating, setSelectedUser } = params
  const handleUpdateUser = useUserUpdateAction(userId, setIsUpdating, setSelectedUser)

  return {
    handleUpdateUser,
  }
}

// Hook for user permissions
function useUserPermissions(userId: string): () => UserPermissions {
  const { user: currentUser } = useAuthStore()
  const { currentOrganization } = useOrganizationsStore()

  return useCallback((): UserPermissions => {
    if (!currentUser || !currentOrganization) {
      return { canEdit: false, isOwnProfile: false, isAdmin: false }
    }

    const isOwnProfile = currentUser.id === userId
    const userRole = currentOrganization.members?.find(m => m.user_id === currentUser.id)?.role
    const isAdmin =
      userRole !== null && userRole !== undefined && ['owner', 'admin'].includes(userRole)
    const canEdit = isOwnProfile || Boolean(isAdmin)

    return { canEdit, isOwnProfile, isAdmin: Boolean(isAdmin) }
  }, [currentUser, currentOrganization, userId])
}

// Loading state component
function LoadingState(): JSX.Element {
  return (
    <div className="flex h-[400px] w-full items-center justify-center">
      <LoadingSpinner />
    </div>
  )
}

// Error state component
function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }): JSX.Element {
  return (
    <div className="flex h-[400px] w-full items-center justify-center">
      <ErrorMessage message={error} onRetry={onRetry} />
    </div>
  )
}

// Not found state component
function NotFoundState(): JSX.Element {
  return (
    <div className="flex h-[400px] w-full items-center justify-center">
      <p className="text-muted-foreground">Usuário não encontrado</p>
    </div>
  )
}

// Main user details view component
function UserDetailsContent({
  selectedUser,
  isUpdating,
  permissions,
  actions,
}: {
  selectedUser: UserResponse
  isUpdating: boolean
  permissions: UserPermissions
  actions: UserActions
}): JSX.Element {
  return (
    <UserDetailsView
      user={transformBackendUser(selectedUser)}
      isUpdating={isUpdating}
      isDeleting={false}
      onUpdateUser={data => void actions.handleUpdateUser(data)}
      onDeleteUser={() => {}}
      onSuspendUser={() => {}}
      onActivateUser={() => {}}
      canManageUser={permissions.canEdit}
    />
  )
}

// Component for rendering different states
function UserDetailsRenderer({
  isLoading,
  error,
  selectedUser,
  isUpdating,
  permissions,
  actions,
  onRetry,
}: {
  isLoading: boolean
  error: string | null
  selectedUser: UserResponse | null
  isUpdating: boolean
  permissions: UserPermissions
  actions: UserActions
  onRetry: () => void
}): JSX.Element {
  if (isLoading) {
    return <LoadingState />
  }

  if (error !== null && error !== undefined) {
    return <ErrorState error={error} onRetry={onRetry} />
  }

  if (selectedUser === null || selectedUser === undefined) {
    return <NotFoundState />
  }

  return (
    <UserDetailsContent
      selectedUser={selectedUser}
      isUpdating={isUpdating}
      permissions={permissions}
      actions={actions}
    />
  )
}

export function UserDetailsContainer(): JSX.Element | null {
  const params = useParams()
  const router = useRouter()
  const { user: currentUser } = useAuthStore()
  const userId = params.id as string

  const userData = useUserDetailsData(userId)
  const getUserPermissions = useUserPermissions(userId)
  const userActions = useUserActions({
    userId,
    loadUserDetails: userData.loadUserDetails,
    setIsUpdating: userData.setIsUpdating,
    setSelectedUser: userData.setSelectedUser,
  })

  useEffect(() => {
    if (!currentUser) {
      router.push('/auth/login')
      return
    }

    if (userId) {
      void userData.loadUserDetails()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, userId, router])

  if (!currentUser) {
    return null
  }

  const permissions = getUserPermissions()

  return (
    <UserDetailsRenderer
      isLoading={userData.isLoading}
      error={userData.error}
      selectedUser={userData.selectedUser}
      isUpdating={userData.isUpdating}
      permissions={permissions}
      actions={userActions}
      onRetry={() => void userData.loadUserDetails()}
    />
  )
}
