import { FeatureGate } from '@/components/common/feature-gate'
import { Card, CardContent } from '@/components/ui/card'
import { useBillingSelectors } from '@/stores/billing'

import { PlanCard, CurrentPlanInfo, PaymentMethodsSection } from './BillingComponents'
import { InvoicesSection } from './InvoiceComponents'

import type { Subscription, PaymentMethod, Invoice } from '@/types/billing'

interface BillingSettingsViewProps {
  subscription: Subscription | null
  paymentMethods: PaymentMethod[]
  invoices: Invoice[]
  isLoading: boolean
  onChangePlan: (planSlug: string) => void
  onCancelSubscription: () => void
  onManageBilling: () => void
  onAddPaymentMethod: () => void
  onRemovePaymentMethod: (id: string) => void
  onSetDefaultPaymentMethod: (id: string) => void
}

// Plans grid component using dynamic data
function PlansGrid({
  subscription,
  onChangePlan,
  isLoading,
}: {
  subscription: Subscription | null
  onChangePlan: (planSlug: string) => void
  isLoading: boolean
}): JSX.Element {
  const { availablePlansSorted } = useBillingSelectors()

  return (
    <div className="pt-8 border-t">
      <h2 className="text-xl font-semibold mb-6">Planos disponíveis</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {availablePlansSorted.map(plan => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isCurrentPlan={subscription?.plan.slug === plan.slug}
            onChangePlan={onChangePlan}
            isLoading={isLoading}
          />
        ))}
      </div>
    </div>
  )
}

// Loading state component
function LoadingState(): JSX.Element {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
        </div>
      </CardContent>
    </Card>
  )
}

export function BillingSettingsView({
  subscription,
  paymentMethods,
  invoices,
  isLoading,
  onChangePlan,
  onCancelSubscription,
  onManageBilling,
  onAddPaymentMethod,
  onRemovePaymentMethod,
  onSetDefaultPaymentMethod,
}: BillingSettingsViewProps): JSX.Element {
  if (isLoading) {
    return <LoadingState />
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <CurrentPlanInfo
          subscription={subscription}
          onManageBilling={onManageBilling}
          onCancelSubscription={onCancelSubscription}
        />

        <PlansGrid subscription={subscription} onChangePlan={onChangePlan} isLoading={isLoading} />

        {/* Payment Methods - Professional feature */}
        <FeatureGate feature="api_access" upgradePromptMode="inline">
          <PaymentMethodsSection
            paymentMethods={paymentMethods}
            onAddPaymentMethod={onAddPaymentMethod}
            onSetDefaultPaymentMethod={onSetDefaultPaymentMethod}
            onRemovePaymentMethod={onRemovePaymentMethod}
          />
        </FeatureGate>

        {/* Invoice History - Advanced billing feature */}
        <FeatureGate feature="advanced_reports" upgradePromptMode="inline">
          <InvoicesSection invoices={invoices} />
        </FeatureGate>
      </CardContent>
    </Card>
  )
}
