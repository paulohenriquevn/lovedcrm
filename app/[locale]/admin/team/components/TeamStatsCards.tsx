/**
 * Team statistics cards component
 */

import { Users, Shield, User } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { OrganizationRole } from '@/types/organization'

import { TeamStatsCardsProps } from '../types/TeamTypes'

export function TeamStatsCards({ members }: TeamStatsCardsProps) {
  const tTeam = useTranslations('admin.team.stats')

  const adminCount = members.filter(
    m => m.role === OrganizationRole.ADMIN || m.role === OrganizationRole.OWNER
  ).length
  const activeCount = members.filter(m => m.is_active).length

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{tTeam('totalMembers')}</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{members.length}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{tTeam('administrators')}</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{adminCount}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{tTeam('activeMembers')}</CardTitle>
          <User className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeCount}</div>
        </CardContent>
      </Card>
    </div>
  )
}
