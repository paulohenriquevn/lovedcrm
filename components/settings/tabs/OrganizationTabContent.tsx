import { OrganizationSettingsForm } from '@/components/organizations/OrganizationSettingsForm'
import { LoadingSkeleton } from '@/components/settings/LoadingSkeleton'
import { PermissionDenied } from '@/components/settings/PermissionDenied'
import { Organization, OrganizationUpdate } from '@/types/organization'

interface OrganizationTabContentProps {
  organization: Organization | null
  canEditOrganization: boolean
  isUpdatingOrg: boolean
  userRole?: string
  onUpdateOrganization: (data: OrganizationUpdate) => Promise<void>
}

export function OrganizationTabContent({
  organization,
  canEditOrganization,
  isUpdatingOrg,
  userRole,
  onUpdateOrganization,
}: OrganizationTabContentProps): JSX.Element {
  if (!canEditOrganization) {
    return (
      <PermissionDenied
        message="Você não tem permissão para acessar as configurações da organização."
        userRole={userRole}
      />
    )
  }

  if (!organization) {
    return <LoadingSkeleton />
  }

  return (
    <OrganizationSettingsForm
      organization={organization}
      isUpdating={isUpdatingOrg}
      onSubmit={data => {
        void onUpdateOrganization(data)
      }}
      canEdit={canEditOrganization}
    />
  )
}
