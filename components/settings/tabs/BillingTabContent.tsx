import { BillingSettingsView } from '@/components/settings/BillingSettingsView'
import { PermissionDenied } from '@/components/settings/PermissionDenied'
import { Card, CardContent } from '@/components/ui/card'

interface BillingTabContentProps {
  canManageBilling: boolean
  userRole?: string
  onChangePlan: (planSlug: string) => void
  onCancelSubscription: () => void
  onManageBilling: () => void
  onAddPaymentMethod: () => void
  onRemovePaymentMethod: (id: string) => void
  onSetDefaultPaymentMethod: (id: string) => void
}

export function BillingTabContent({
  canManageBilling,
  userRole,
  onChangePlan,
  onCancelSubscription,
  onManageBilling,
  onAddPaymentMethod,
  onRemovePaymentMethod,
  onSetDefaultPaymentMethod,
}: BillingTabContentProps): JSX.Element {
  if (!canManageBilling) {
    return (
      <PermissionDenied
        message="Você não tem permissão para gerenciar o faturamento."
        userRole={userRole}
      />
    )
  }

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <BillingSettingsView
          subscription={null}
          paymentMethods={[]}
          invoices={[]}
          isLoading={false}
          onChangePlan={onChangePlan}
          onCancelSubscription={onCancelSubscription}
          onManageBilling={onManageBilling}
          onAddPaymentMethod={onAddPaymentMethod}
          onRemovePaymentMethod={onRemovePaymentMethod}
          onSetDefaultPaymentMethod={onSetDefaultPaymentMethod}
        />
      </CardContent>
    </Card>
  )
}
