'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { ErrorMessage } from '@/components/common/error-message'
import { LoadingSpinner } from '@/components/common/loading-spinner'
import { OrganizationDetailsView } from '@/components/organizations/OrganizationDetailsView'
import { useAuthStore } from '@/stores/auth'
import {
  OrganizationRole,
  type OrganizationMemberCreate,
  type Organization,
  type OrganizationMember,
} from '@/types/organization'

import { useOrganizationData } from './hooks/useOrganizationData'
import { useOrganizationHandlers } from './hooks/useOrganizationHandlers'

interface OrganizationUpdateData {
  name?: string
  description?: string
  slug?: string
}

export function OrganizationDetailsContainer() {
  const router = useRouter()
  const { user } = useAuthStore()

  const {
    organizationId,
    currentOrganization,
    members,
    isLoading,
    isLoadingMembers,
    error,
    reloadOrganization,
  } = useOrganizationData()

  const handlers = useOrganizationHandlers(organizationId ?? '')

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
    }
  }, [user, router])

  if (!user) {
    return null
  }

  return (
    <OrganizationContentContainer
      currentOrganization={currentOrganization}
      members={members}
      user={user}
      isLoading={isLoading}
      isLoadingMembers={isLoadingMembers}
      error={error}
      handlers={handlers}
      onRetry={reloadOrganization}
    />
  )
}

interface OrganizationContentContainerProps {
  currentOrganization: Organization | null
  members: OrganizationMember[]
  user: { id: string }
  isLoading: boolean
  isLoadingMembers: boolean
  error: string | null
  handlers: {
    handleUpdateOrganization: (data: OrganizationUpdateData) => Promise<void>
    handleAddMember: (data: OrganizationMemberCreate) => Promise<void>
    handleUpdateMemberRole: (memberId: string, newRole: string) => Promise<void>
    handleRemoveMember: (memberId: string) => Promise<void>
    handleLeaveOrganization: () => Promise<void>
    handleDeleteOrganization: () => Promise<void>
  }
  onRetry: () => Promise<void>
}

function OrganizationContentContainer(props: OrganizationContentContainerProps) {
  const { isLoading, error, currentOrganization, onRetry } = props

  if (isLoading) {
    return <OrganizationLoadingState />
  }

  if (error !== null && error !== undefined && error !== '') {
    return (
      <OrganizationErrorState
        error={error}
        onRetry={() => {
          void onRetry()
        }}
      />
    )
  }

  if (!currentOrganization) {
    return <OrganizationNotFoundState />
  }

  return <OrganizationDetailsContent {...props} />
}

function OrganizationLoadingState() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <LoadingSpinner />
    </div>
  )
}

function OrganizationErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <ErrorMessage message={error} onRetry={onRetry} />
    </div>
  )
}

function OrganizationNotFoundState() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <p>Organização não encontrada</p>
    </div>
  )
}

function OrganizationDetailsContent({
  currentOrganization,
  members,
  user,
  isLoadingMembers,
  handlers,
}: OrganizationContentContainerProps) {
  const currentMember = members.find(m => m.user_id === user.id)
  const userRole = currentMember?.role ?? OrganizationRole.MEMBER

  if (!currentOrganization) {
    return null
  }

  return (
    <OrganizationDetailsView
      organization={currentOrganization}
      members={members}
      userRole={userRole}
      isUpdating={false}
      isLoadingMembers={isLoadingMembers}
      onUpdateOrganization={(data: OrganizationUpdateData) =>
        void handlers.handleUpdateOrganization(data)
      }
      onAddMember={(data: OrganizationMemberCreate) => void handlers.handleAddMember(data)}
      onUpdateMemberRole={(memberId: string, newRole: string) =>
        void handlers.handleUpdateMemberRole(memberId, newRole)
      }
      onRemoveMember={(memberId: string) => void handlers.handleRemoveMember(memberId)}
      onLeaveOrganization={() => void handlers.handleLeaveOrganization()}
      onDeleteOrganization={() => void handlers.handleDeleteOrganization()}
    />
  )
}
