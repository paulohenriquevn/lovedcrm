/**
 * Individual member card and its sub-components
 */

import { Calendar, Clock, MoreVertical, Trash2, UserCog } from 'lucide-react'
import React from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { OrganizationRole } from '@/types/organization'

import {
  MemberAvatarProps,
  MemberInfoProps,
  MemberRoleBadgeProps,
  MemberActionsProps,
  MemberCardProps,
} from '../types/TeamTypes'
import { formatDate, formatLastLogin } from '../utils/dateFormatters'
import {
  getRoleIcon,
  formatRoleDisplay,
  roleBadgeVariants,
  canManageThisMember,
} from '../utils/roleUtils'

// Helper components to reduce MemberCard complexity
function MemberAvatar({ member }: MemberAvatarProps) {
  const getAvatarFallback = () => {
    return member.user?.full_name?.charAt(0) ?? member.user?.email?.charAt(0) ?? '?'
  }

  return (
    <Avatar>
      <AvatarImage src={member.user?.avatar_url ?? undefined} />
      <AvatarFallback>{getAvatarFallback()}</AvatarFallback>
    </Avatar>
  )
}

function MemberInfo({ member, currentUserId }: MemberInfoProps) {
  const getDisplayName = () => {
    return member.user?.full_name ?? member.user?.email ?? 'Usuário'
  }

  const getEmailDisplay = () => {
    return member.user?.email ?? 'Email não disponível'
  }

  const isCurrentUser = member.user_id === currentUserId

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <p className="font-medium">{getDisplayName()}</p>
        {Boolean(isCurrentUser) && (
          <Badge variant="outline" className="text-xs">
            Você
          </Badge>
        )}
      </div>
      <p className="text-sm text-muted-foreground">{getEmailDisplay()}</p>
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          Entrou em {formatDate(member.created_at)}
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Último login: {formatLastLogin(member.user?.last_login ?? null)}
        </div>
      </div>
    </div>
  )
}

function MemberRoleBadge({ member }: MemberRoleBadgeProps) {
  return (
    <div className="flex items-center gap-2">
      {getRoleIcon(member.role)}
      <Badge variant={roleBadgeVariants[member.role]}>{formatRoleDisplay(member.role)}</Badge>
    </div>
  )
}

function MemberActions({
  member,
  canManageMembers,
  currentUserId,
  onChangeRole,
  onRemoveMember,
}: MemberActionsProps) {
  const canManage = canManageThisMember(member, canManageMembers, currentUserId)

  if (!canManage) {
    return null
  }

  const getRoleToggleText = () => {
    return member.role === OrganizationRole.ADMIN ? 'Tornar membro' : 'Tornar admin'
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="default">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Ações</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onChangeRole(member)}>
          <UserCog className="h-4 w-4 mr-2" />
          {getRoleToggleText()}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onRemoveMember(member)} className="text-red-600">
          <Trash2 className="h-4 w-4 mr-2" />
          Remover membro
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Main member card component
export function MemberCard({
  member,
  currentUserId,
  canManageMembers,
  onChangeRole,
  onRemoveMember,
}: MemberCardProps) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center gap-4">
        <MemberAvatar member={member} />
        <MemberInfo member={member} currentUserId={currentUserId} />
      </div>

      <div className="flex items-center gap-3">
        <MemberRoleBadge member={member} />
        <MemberActions
          member={member}
          canManageMembers={canManageMembers}
          currentUserId={currentUserId}
          onChangeRole={onChangeRole}
          onRemoveMember={onRemoveMember}
        />
      </div>
    </div>
  )
}
