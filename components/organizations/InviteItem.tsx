import { Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { InviteStatusBadge } from './InviteStatusBadge'
import { formatInviteDate, isInviteExpiringSoon } from './InviteUtils'

import type { OrganizationInvite, OrganizationRole } from '@/types/organization'

interface InviteItemProps {
  invite: OrganizationInvite
  onCancel: (id: string) => void
  isUpdating: boolean
  userRole: OrganizationRole | string
}

export function InviteItem({
  invite,
  onCancel,
  isUpdating,
  userRole,
}: InviteItemProps): JSX.Element {
  const canCancel = invite.can_be_cancelled && (userRole === 'owner' || userRole === 'admin')

  const handleCancel = (): void => {
    onCancel(invite.id)
  }

  return (
    <div className="p-4 border rounded-lg flex items-center justify-between">
      <div className="flex-1">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <p className="font-medium">{invite.invited_name ?? invite.email}</p>
          <InviteStatusBadge status={invite.status} />
          <span className="text-xs text-muted-foreground capitalize">{invite.role}</span>
        </div>

        {/* Email (if name is shown) */}
        {Boolean(invite.invited_name) && (
          <p className="text-xs text-muted-foreground">{invite.email}</p>
        )}

        {/* Custom message */}
        {Boolean(invite.message) && (
          <p className="text-xs text-muted-foreground italic mt-1">
            &ldquo;{invite.message}&rdquo;
          </p>
        )}

        {/* Dates */}
        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
          <span>Enviado em {formatInviteDate(invite.created_at)}</span>
          <span
            className={isInviteExpiringSoon(invite.expires_at) ? 'text-yellow-600 font-medium' : ''}
          >
            Expira em {formatInviteDate(invite.expires_at)}
          </span>
        </div>
      </div>

      {/* Actions */}
      {Boolean(canCancel) && (
        <Button
          type="button"
          onClick={handleCancel}
          variant="ghost"
          size="sm"
          disabled={isUpdating}
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
          Cancelar
        </Button>
      )}
    </div>
  )
}
