import { useState } from 'react'

import { Card, CardContent } from '@/components/ui/card'
import { User, UserUpdate } from '@/types/user'

import { UserHeader, UserForm, UserInfoDisplay, UserActions } from './UserDetailsComponents'

interface UserDetailsViewProps {
  user: User
  isUpdating: boolean
  isDeleting: boolean
  onUpdateUser: (data: UserUpdate) => void
  onDeleteUser: () => void
  onSuspendUser: () => void
  onActivateUser: () => void
  canManageUser: boolean
}

interface UserDetailsContainerProps {
  user: User
  isEditing: boolean
  isUpdating: boolean
  formData: UserUpdate
  setFormData: (data: UserUpdate) => void
  onSubmit: (e: React.FormEvent) => void
  canManageUser: boolean
  onToggleEdit: () => void
}

// User Details Container Component
function UserDetailsContainer(props: UserDetailsContainerProps): JSX.Element {
  const {
    user,
    isEditing,
    isUpdating,
    formData,
    setFormData,
    onSubmit,
    canManageUser,
    onToggleEdit,
  } = props
  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <UserHeader
          user={user}
          canManageUser={canManageUser}
          isEditing={isEditing}
          onToggleEdit={onToggleEdit}
        />
        {isEditing ? (
          <UserForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={onSubmit}
            isUpdating={isUpdating}
          />
        ) : (
          <UserInfoDisplay user={user} />
        )}
      </CardContent>
    </Card>
  )
}

// Custom hook for user details state
function useUserDetailsState(
  user: User,
  onUpdateUser: (data: UserUpdate) => void
): {
  isEditing: boolean
  setIsEditing: (editing: boolean) => void
  formData: UserUpdate
  setFormData: (data: UserUpdate) => void
  handleSubmit: (e: React.FormEvent) => void
} {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<UserUpdate>({
    // eslint-disable-next-line camelcase
    full_name: user.full_name ?? '',
    phone: user.phone ?? '',
    timezone: user.timezone ?? '',
    language: user.language ?? '',
  })

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    onUpdateUser(formData)
    setIsEditing(false)
  }

  return { isEditing, setIsEditing, formData, setFormData, handleSubmit }
}

export function UserDetailsView({
  user,
  isUpdating,
  isDeleting,
  onUpdateUser,
  onDeleteUser,
  onSuspendUser,
  onActivateUser,
  canManageUser,
}: UserDetailsViewProps): JSX.Element {
  const { isEditing, setIsEditing, formData, setFormData, handleSubmit } = useUserDetailsState(
    user,
    onUpdateUser
  )

  return (
    <div className="space-y-6">
      <UserDetailsContainer
        user={user}
        isEditing={isEditing}
        isUpdating={isUpdating}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        canManageUser={canManageUser}
        onToggleEdit={() => setIsEditing(!isEditing)}
      />
      <UserActions
        user={user}
        onSuspendUser={onSuspendUser}
        onActivateUser={onActivateUser}
        onDeleteUser={onDeleteUser}
        isDeleting={isDeleting}
        canManageUser={canManageUser}
      />
    </div>
  )
}
