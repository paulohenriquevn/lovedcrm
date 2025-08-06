import { Card, CardContent } from '@/components/ui/card'

import type { OrganizationInviteStats } from '@/types/organization'

interface InviteStatsProps {
  stats: OrganizationInviteStats
}

export function InviteStats({ stats }: InviteStatsProps): JSX.Element {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-3">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-lg font-bold text-blue-600">{stats.total_invites}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3">
          <p className="text-xs text-muted-foreground">Pendentes</p>
          <p className="text-lg font-bold text-yellow-600">{stats.pending_invites}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3">
          <p className="text-xs text-muted-foreground">Aceitos</p>
          <p className="text-lg font-bold text-green-600">{stats.accepted_invites}</p>
        </CardContent>
      </Card>
    </div>
  )
}
