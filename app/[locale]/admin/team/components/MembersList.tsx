/**
 * Members list component with member cards
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { MemberCard } from './MemberCard'
import { MembersListProps } from '../types/TeamTypes'

export function MembersList({
  members,
  totalMembers,
  currentUserId,
  canManageMembers,
  searchQuery,
  roleFilter,
  onChangeRole,
  onRemoveMember,
}: MembersListProps) {
  return (
    <Card className="w-full rounded-lg border bg-card text-card-foreground shadow-sm">
      <CardHeader>
        <CardTitle>Membros da Equipe</CardTitle>
        <CardDescription>
          {members.length} de {totalMembers} membros
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {members.map(member => (
            <MemberCard
              key={member.id}
              member={member}
              currentUserId={currentUserId}
              canManageMembers={canManageMembers}
              onChangeRole={onChangeRole}
              onRemoveMember={onRemoveMember}
            />
          ))}

          {members.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery || roleFilter !== 'all'
                ? 'Nenhum membro encontrado com os filtros aplicados'
                : 'Nenhum membro encontrado'}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
