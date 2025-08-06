import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { InviteItem } from './InviteItem'

import type { OrganizationInvite, OrganizationRole } from '@/types/organization'

interface InvitesListProps {
  invites: OrganizationInvite[]
  loading: boolean
  statusFilter: string
  onStatusFilterChange: (filter: string) => void
  onCancelInvite: (id: string) => void
  isUpdating: boolean
  userRole: OrganizationRole | string
}

export function InvitesList({
  invites,
  loading,
  statusFilter,
  onStatusFilterChange,
  onCancelInvite,
  isUpdating,
  userRole,
}: InvitesListProps): JSX.Element {
  return (
    <div className="space-y-6">
      {/* Status Filter */}
      <div className="space-y-2">
        <Label htmlFor="status-filter" className="text-sm font-medium">
          Filtrar por status:
        </Label>
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger>
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendentes</SelectItem>
            <SelectItem value="accepted">Aceitos</SelectItem>
            <SelectItem value="rejected">Rejeitados</SelectItem>
            <SelectItem value="expired">Expirados</SelectItem>
            <SelectItem value="cancelled">Cancelados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Invites List */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <p className="text-sm text-muted-foreground">Carregando convites...</p>
        </div>
      ) : invites.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <p className="text-sm text-muted-foreground">
            {statusFilter === 'all'
              ? 'Nenhum convite enviado ainda.'
              : 'Nenhum convite encontrado com este filtro.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {invites.map(invite => (
            <InviteItem
              key={invite.id}
              invite={invite}
              onCancel={onCancelInvite}
              isUpdating={isUpdating}
              userRole={userRole}
            />
          ))}
        </div>
      )}
    </div>
  )
}
