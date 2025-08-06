import { Shield } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

import { FeatureGate } from '@/components/common/feature-gate'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { User, UserUpdate, UserStatus } from '@/types/user'

import { FullNameInput, PhoneInput } from './UserFormInputs'

// User Avatar Component
export function UserAvatar({
  user,
}: {
  user: { avatar_url?: string; full_name?: string; email: string }
}): JSX.Element {
  if (user.avatar_url !== null && user.avatar_url !== undefined && user.avatar_url !== '') {
    return (
      <Image
        className="h-16 w-16 rounded-full"
        src={user.avatar_url}
        alt="User avatar"
        width={64}
        height={64}
      />
    )
  }

  return (
    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
      <span className="text-muted-foreground text-xl font-medium">
        {user.full_name?.[0] ?? user.email?.[0]?.toUpperCase() ?? 'U'}
      </span>
    </div>
  )
}

// User Info Section Component
function UserInfoSection({
  user,
}: {
  user: { full_name?: string; email: string; avatar_url?: string }
}): JSX.Element {
  const tUser = useTranslations('user')

  return (
    <div className="flex items-center">
      <UserAvatar user={user} />
      <div className="ml-4">
        <h2 className="text-2xl font-bold tracking-tight">
          {user.full_name !== null && user.full_name !== undefined && user.full_name !== ''
            ? user.full_name
            : tUser('noName')}
        </h2>
        <p className="text-muted-foreground">{user.email}</p>
      </div>
    </div>
  )
}

// User Actions Section Component
function UserActionsSection({
  canManageUser,
  isEditing,
  onToggleEdit,
}: {
  canManageUser: boolean
  isEditing: boolean
  onToggleEdit: () => void
}): JSX.Element {
  const tUser = useTranslations('user')
  const tCommon = useTranslations('common')

  return (
    <div className="flex items-center gap-3">
      {/* Advanced user management - requires user_management feature */}
      <FeatureGate feature="user_management" upgradePromptMode="modal">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4 text-blue-600" />
          <span>{tUser('advancedManagementActive')}</span>
        </div>
      </FeatureGate>

      {canManageUser === true && (
        <Button variant="ghost" onClick={onToggleEdit}>
          {isEditing ? tCommon('cancel') : tCommon('edit')}
        </Button>
      )}
    </div>
  )
}

// User Header Component
export function UserHeader({
  user,
  canManageUser,
  isEditing,
  onToggleEdit,
}: {
  user: { full_name?: string; email: string; avatar_url?: string }
  canManageUser: boolean
  isEditing: boolean
  onToggleEdit: () => void
}): JSX.Element {
  return (
    <div className="flex items-center justify-between mb-6">
      <UserInfoSection user={user} />
      <UserActionsSection
        canManageUser={canManageUser}
        isEditing={isEditing}
        onToggleEdit={onToggleEdit}
      />
    </div>
  )
}

// Re-export form inputs from separate file
export { FullNameInput, PhoneInput } from './UserFormInputs'

// User Form Component
export function UserForm({
  formData,
  setFormData,
  onSubmit,
  isUpdating,
}: {
  formData: UserUpdate
  setFormData: (data: UserUpdate) => void
  onSubmit: (e: React.FormEvent) => void
  isUpdating: boolean
}): JSX.Element {
  const tCommon = useTranslations('common')
  const tUser = useTranslations('user')

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <FullNameInput
        value={formData.full_name ?? ''} // eslint-disable-line camelcase
        onChange={value => setFormData({ ...formData, full_name: value })} // eslint-disable-line camelcase
      />
      <PhoneInput
        value={formData.phone ?? ''}
        onChange={value => setFormData({ ...formData, phone: value })}
      />
      <Button type="submit" disabled={isUpdating} className="w-full">
        {isUpdating ? tCommon('updating') : tUser('saveChanges')}
      </Button>
    </form>
  )
}

// User Info Field Component
function UserInfoField({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div>
      <span className="block text-sm font-medium text-muted-foreground">{label}</span>
      <p className="mt-1 text-sm text-foreground">{value}</p>
    </div>
  )
}

// User Status Field Component
function UserStatusField({ user }: { user: User }): JSX.Element {
  const tUser = useTranslations('user')

  const statusClass =
    user.status === UserStatus.ACTIVE
      ? 'inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300'
      : 'inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-300'
  const statusText =
    user.status === UserStatus.ACTIVE ? tUser('status.active') : tUser('status.inactive')

  return (
    <div>
      <span className="block text-sm font-medium text-muted-foreground">
        {tUser('status.label')}
      </span>
      <span className={statusClass}>{statusText}</span>
    </div>
  )
}

// User Info Display Component
export function UserInfoDisplay({ user }: { user: User }): JSX.Element {
  const tUser = useTranslations('user')

  return (
    <div className="space-y-4">
      <UserInfoField label={tUser('fullName')} value={user.full_name ?? tUser('notProvided')} />
      <UserInfoField label={tUser('email')} value={user.email} />
      <UserInfoField
        label={tUser('phone')}
        value={
          user.phone !== null && user.phone !== undefined && user.phone !== ''
            ? user.phone
            : tUser('notProvided')
        }
      />
      <UserStatusField user={user} />
    </div>
  )
}

// Status Action Button Component
export function StatusActionButton({
  user,
  onSuspendUser,
  onActivateUser,
}: {
  user: User
  onSuspendUser: () => void
  onActivateUser: () => void
}): JSX.Element {
  const tUser = useTranslations('user')

  if (user.status === UserStatus.ACTIVE) {
    return (
      <Button
        variant="secondary"
        onClick={onSuspendUser}
        className="w-full"
      >
        {tUser('suspendUser')}
      </Button>
    )
  }

  return (
    <Button variant="default" onClick={onActivateUser} className="w-full">
      {tUser('activateUser')}
    </Button>
  )
}

// Delete Action Button Component
export function DeleteActionButton({
  onDeleteUser,
  isDeleting,
}: {
  onDeleteUser: () => void
  isDeleting: boolean
}): JSX.Element {
  const tUser = useTranslations('user')

  return (
    <Button variant="destructive" onClick={onDeleteUser} disabled={isDeleting} className="w-full">
      {isDeleting ? tUser('deleting') : tUser('deleteUser')}
    </Button>
  )
}

// User Actions Component
export function UserActions({
  user,
  onSuspendUser,
  onActivateUser,
  onDeleteUser,
  isDeleting,
  canManageUser,
}: {
  user: User
  onSuspendUser: () => void
  onActivateUser: () => void
  onDeleteUser: () => void
  isDeleting: boolean
  canManageUser: boolean
}): JSX.Element | null {
  if (!canManageUser) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Ações administrativas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <StatusActionButton
          user={user}
          onSuspendUser={onSuspendUser}
          onActivateUser={onActivateUser}
        />
        <DeleteActionButton onDeleteUser={onDeleteUser} isDeleting={isDeleting} />
      </CardContent>
    </Card>
  )
}
