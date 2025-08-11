import { InviteManagement } from './InviteManagement'
import { MembersList } from './MembersList'
import { OrganizationActions } from './OrganizationActions'
import { OrganizationHeader } from './OrganizationHeader'

import type {
  Organization,
  OrganizationMember,
  OrganizationMemberCreate,
  OrganizationRole,
} from '@/types/organization'

interface OrganizationDetailsViewProps {
  organization: Organization
  members: OrganizationMember[]
  userRole: OrganizationRole | string
  isUpdating: boolean
  isLoadingMembers: boolean
  onUpdateOrganization: (data: Partial<Organization>) => void
  onAddMember: (data: OrganizationMemberCreate) => void
  onUpdateMemberRole: (memberId: string, role: string) => void
  onRemoveMember: (memberId: string) => void
  onLeaveOrganization: () => void
  onDeleteOrganization: () => void
}

export function OrganizationDetailsView({
  organization,
  members,
  userRole,
  isUpdating,
  isLoadingMembers,
  onUpdateOrganization,
  onAddMember,
  onUpdateMemberRole: _onUpdateMemberRole,
  onRemoveMember,
  onLeaveOrganization: _onLeaveOrganization,
  onDeleteOrganization,
}: OrganizationDetailsViewProps): JSX.Element {
  return (
    <div className="space-y-6">
      <OrganizationHeader
        organization={organization}
        userRole={userRole}
        onUpdateOrganization={onUpdateOrganization}
        isUpdating={isUpdating}
      />

      <MembersList
        members={members}
        userRole={userRole}
        onRemoveMember={onRemoveMember}
        isUpdating={isUpdating}
        isLoadingMembers={isLoadingMembers}
      />

      <InviteManagement userRole={userRole} isUpdating={isUpdating} />

      <OrganizationActions
        userRole={userRole}
        onAddMember={onAddMember}
        onDeleteOrganization={onDeleteOrganization}
        isUpdating={isUpdating}
      />
    </div>
  )
}
