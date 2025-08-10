'use client'

import { AlertTriangle } from 'lucide-react'
import * as React from 'react'

import { Organization } from '@/types/organization'
import { User } from '@/types/user'

import { DeleteAccountSection } from './DeleteAccountSection'
import { DeleteOrganizationSection } from './DeleteOrganizationSection'

interface DangerZoneSectionProps {
  user: User | null
  organization: Organization | null
  onDeleteAccount: () => void
  onDeleteOrganization: () => void
}

export function DangerZoneSection({
  user,
  organization,
  onDeleteAccount,
  onDeleteOrganization,
}: DangerZoneSectionProps): JSX.Element {
  const isOwner = Boolean(
    organization !== null && user !== null && user.id === organization.owner_id
  )

  return (
    <div className="pt-8 border-t border-l-4 border-red-500 pl-4">
      <div className="flex items-center mb-6">
        <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
        <div>
          <h2 className="text-xl font-semibold text-foreground">Zona de Perigo</h2>
          <p className="text-sm text-muted-foreground">Ações irreversíveis que afetam sua conta</p>
        </div>
      </div>

      <div className="space-y-6">
        <DeleteAccountSection onDeleteAccount={onDeleteAccount} />

        {organization !== null && isOwner === true && (
          <DeleteOrganizationSection
            organization={organization}
            onDeleteOrganization={onDeleteOrganization}
          />
        )}
      </div>
    </div>
  )
}
