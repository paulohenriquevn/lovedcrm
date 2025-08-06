import { AdvancedSettingsView } from '@/components/settings/AdvancedSettingsView'
import { PermissionDenied } from '@/components/settings/PermissionDenied'
import { Card, CardContent } from '@/components/ui/card'

interface AdvancedTabContentProps {
  canViewAdvancedSettings: boolean
  userRole?: string
}

export function AdvancedTabContent({
  canViewAdvancedSettings,
  userRole,
}: AdvancedTabContentProps): JSX.Element {
  if (!canViewAdvancedSettings) {
    return (
      <PermissionDenied
        message="Você não tem permissão para acessar configurações avançadas."
        userRole={userRole}
      />
    )
  }

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <AdvancedSettingsView />
      </CardContent>
    </Card>
  )
}
