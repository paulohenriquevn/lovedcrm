import { SecuritySettingsView } from '@/components/settings/SecuritySettingsView'
import { Card, CardContent } from '@/components/ui/card'

interface SecurityTabContentProps {
  onChangePassword: () => void
}

export function SecurityTabContent({ onChangePassword }: SecurityTabContentProps): JSX.Element {
  return (
    <Card>
      <CardContent className="p-6">
        <SecuritySettingsView onChangePassword={onChangePassword} />
      </CardContent>
    </Card>
  )
}
