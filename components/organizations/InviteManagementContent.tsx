import { useEffect } from 'react'

import { useInviteActions } from '@/hooks/use-invite-actions'
import { useInvitesList } from '@/hooks/use-invites-list'

import { InviteForm } from './InviteForm'
import { InvitesList } from './InvitesList'
import { InviteStats } from './InviteStats'

import type { OrganizationRole } from '@/types/organization'

interface InviteManagementContentProps {
  userRole: OrganizationRole | string
  isUpdating: boolean
  canManageInvites: boolean
}

export function InviteManagementContent({
  userRole,
  isUpdating,
  canManageInvites,
}: InviteManagementContentProps): JSX.Element {
  const {
    invites,
    stats,
    loading,
    error: listError,
    statusFilter,
    setStatusFilter,
    refreshInvites,
  } = useInvitesList({ canManageInvites })

  const {
    isSubmitting,
    error: actionError,
    createInvite,
    cancelInvite,
    clearError,
  } = useInviteActions({ onSuccess: refreshInvites })

  const error = listError ?? actionError

  useEffect(() => {
    if (error !== null) {
      const timer = setTimeout(clearError, 5000)
      return () => clearTimeout(timer)
    }
  }, [error, clearError])

  const handleCreateInvite = (data: Parameters<typeof createInvite>[0]): void => {
    void createInvite(data)
  }

  const handleCancelInvite = (inviteId: string): void => {
    void cancelInvite(inviteId)
  }

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {Boolean(error) && (
        <div className="rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Stats */}
      {stats ? <InviteStats stats={stats} /> : null}

      {/* Invite Form */}
      <InviteForm onSubmit={handleCreateInvite} isSubmitting={isSubmitting} userRole={userRole} />

      {/* Invites List */}
      <InvitesList
        invites={invites}
        loading={loading}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onCancelInvite={handleCancelInvite}
        isUpdating={isUpdating}
        userRole={userRole}
      />
    </div>
  )
}
