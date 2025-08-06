import { Button } from '@/components/ui/button'

import type { OrganizationRole } from '@/types/organization'

// Helper functions to safely compare roles
const isOwner = (role: string | OrganizationRole): boolean => String(role) === 'owner'
const isAdmin = (role: string | OrganizationRole): boolean => String(role) === 'admin'

// Helper function for member actions
const handleAddMember = (
  onAddMember: (data: { email: string; role: OrganizationRole }) => void
): void => {
  const email = prompt('Email do novo membro:')
  if (email !== null && email !== undefined && email.trim() !== '') {
    onAddMember({ email, role: OrganizationRole.MEMBER })
  }
}

interface OrganizationActionsProps {
  userRole: OrganizationRole
  onAddMember: (data: { email: string; role: OrganizationRole }) => void
  onDeleteOrganization: () => void
  isUpdating: boolean
}

export function OrganizationActions({
  userRole,
  onAddMember,
  onDeleteOrganization,
  isUpdating,
}: OrganizationActionsProps): JSX.Element {
  return (
    <>
      {(isOwner(userRole) || isAdmin(userRole)) && (
        <div className="space-y-4 pt-4 border-t">
          <Button type="button" onClick={() => handleAddMember(onAddMember)} disabled={isUpdating}>
            Adicionar Membro
          </Button>
        </div>
      )}
      {isOwner(userRole) && (
        <div className="space-y-4 pt-4 border-t">
          <Button
            variant="destructive"
            type="button"
            onClick={onDeleteOrganization}
            disabled={isUpdating}
          >
            Deletar Organização
          </Button>
        </div>
      )}
    </>
  )
}
