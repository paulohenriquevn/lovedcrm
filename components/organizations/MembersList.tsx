import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import type { OrganizationMember, OrganizationRole } from '@/types/organization'

// Helper functions to safely compare roles
const isOwner = (role: string | OrganizationRole): boolean => String(role) === 'owner'

interface MemberItemProps {
  member: OrganizationMember
  userRole: OrganizationRole
  onRemoveMember: (id: string) => void
  isUpdating: boolean
}

function MemberItem({
  member,
  userRole,
  onRemoveMember,
  isUpdating,
}: MemberItemProps): JSX.Element {
  return (
    <div className="p-3 bg-muted/50 rounded flex items-center justify-between">
      <div>
        <p className="font-medium">{member.user?.full_name ?? member.invited_email}</p>
        <p className="text-sm text-muted-foreground">{member.role}</p>
      </div>
      {isOwner(userRole) && !isOwner(member.role) && (
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={() => onRemoveMember(member.id)}
          disabled={isUpdating}
        >
          Remover
        </Button>
      )}
    </div>
  )
}

interface MembersListProps {
  members: OrganizationMember[]
  userRole: OrganizationRole
  onRemoveMember: (id: string) => void
  isUpdating: boolean
  isLoadingMembers: boolean
}

export function MembersList({
  members,
  userRole,
  onRemoveMember,
  isUpdating,
  isLoadingMembers,
}: MembersListProps): JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Membros</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoadingMembers ? (
          <p className="text-muted-foreground">Carregando membros...</p>
        ) : (
          <div className="space-y-4">
            {members.map(member => (
              <MemberItem
                key={member.id}
                member={member}
                userRole={userRole}
                onRemoveMember={onRemoveMember}
                isUpdating={isUpdating}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
