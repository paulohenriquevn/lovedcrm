import { RotateCcw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useInvitesList } from '@/hooks/use-invites-list'

import { InviteManagementContent } from './InviteManagementContent'

import type { OrganizationRole } from '@/types/organization'

interface InviteManagementProps {
  userRole: OrganizationRole | string
  isUpdating: boolean
}

export function InviteManagement({
  userRole,
  isUpdating,
}: InviteManagementProps): JSX.Element | null {
  const canManageInvites = userRole === 'owner' || userRole === 'admin'
  const { refreshInvites, loading } = useInvitesList({ canManageInvites })

  if (!canManageInvites) {
    return null
  }

  const handleRefresh = (): void => {
    void refreshInvites()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Convites de Membros</CardTitle>
          <Button
            type="button"
            onClick={handleRefresh}
            variant="ghost"
            size="sm"
            disabled={loading}
            title="Atualizar lista"
          >
            <RotateCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <InviteManagementContent
          userRole={userRole}
          isUpdating={isUpdating}
          canManageInvites={canManageInvites}
        />
      </CardContent>
    </Card>
  )
}
