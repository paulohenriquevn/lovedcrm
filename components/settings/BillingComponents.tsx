import { Package, ExternalLink, Crown, Zap } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { billingService } from '@/services/billing'

import { PaymentMethodCard } from './PaymentMethodComponents'

import type { Subscription, PaymentMethod, Plan } from '@/types/billing'

// Re-export for convenience
export { PaymentMethodCard } from './PaymentMethodComponents'

// Plan header component
function PlanHeader({ plan }: { plan: Plan }): JSX.Element {
  const isPremiumPlan = plan.slug !== 'basic'

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold">{plan.name}</h3>
        {isPremiumPlan === true && (
          <div className="flex items-center gap-1">
            <Crown className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span className="text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-1 rounded-full font-medium">
              {plan.slug === 'expert' ? 'EXPERT' : 'PRO'}
            </span>
          </div>
        )}
      </div>
      <span className="text-xl font-semibold font-bold">
        {billingService.formatPrice(plan.price_cents)}
      </span>
    </div>
  )
}

// Plan features list component
function PlanFeatures({
  features,
  planSlug,
}: {
  features: string[]
  planSlug: string
}): JSX.Element {
  const readableFeatures = billingService.getReadableFeatures(features)
  // Feature checking available but not used in current implementation

  return (
    <ul className="space-y-2 mb-6">
      {readableFeatures.map(feature => {
        // Determine if this feature is premium
        const featureKey =
          features.find(f => billingService.getReadableFeatures([f])[0] === feature) ?? ''
        const isPremiumFeature = !['basic_dashboard', 'user_management'].includes(featureKey)

        return (
          <li key={feature} className="flex items-center text-sm text-muted-foreground">
            <Package className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
            <span className="flex-1">{feature}</span>
            {isPremiumFeature === true && planSlug !== 'basic' && (
              <Zap className="h-3 w-3 text-amber-600 dark:text-amber-400 ml-2" />
            )}
          </li>
        )
      })}

      {/* Show premium feature callout for basic plan */}
      {planSlug === 'basic' && (
        <li className="flex items-center text-xs text-muted-foreground border-t pt-2 mt-4">
          <Crown className="h-4 w-4 text-amber-600 dark:text-amber-400 mr-2 flex-shrink-0" />
          <span>Upgrade para acessar recursos avançados</span>
        </li>
      )}
    </ul>
  )
}

// Plan action button component
function PlanActionButton({
  isCurrentPlan,
  onChangePlan,
  planSlug,
  isLoading,
}: {
  isCurrentPlan: boolean
  onChangePlan: (planSlug: string) => void
  planSlug: string
  isLoading: boolean
}): JSX.Element {
  if (isCurrentPlan) {
    return (
      <Button variant="secondary" disabled className="w-full">
        Plano atual
      </Button>
    )
  }

  return (
    <Button onClick={() => onChangePlan(planSlug)} disabled={isLoading} className="w-full">
      {isLoading ? 'Carregando...' : 'Selecionar plano'}
    </Button>
  )
}

// Plan card component
export function PlanCard({
  plan,
  isCurrentPlan,
  onChangePlan,
  isLoading,
}: {
  plan: Plan
  isCurrentPlan: boolean
  onChangePlan: (planSlug: string) => void
  isLoading: boolean
}): JSX.Element {
  return (
    <Card
      className={`${
        isCurrentPlan
          ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
          : 'hover:border-border/60 transition-colors'
      }`}
    >
      <CardContent className="p-6">
        <PlanHeader plan={plan} />
        <PlanFeatures features={plan.features} planSlug={plan.slug} />
        <PlanActionButton
          isCurrentPlan={isCurrentPlan}
          onChangePlan={onChangePlan}
          planSlug={plan.slug}
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  )
}

// Plan info header component
function PlanInfoHeader({ onManageBilling }: { onManageBilling: () => void }): JSX.Element {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-semibold">Plano atual</h2>
      <Button
        variant="link"
        onClick={onManageBilling}
        className="flex items-center transition-colors"
      >
        <ExternalLink className="h-4 w-4 mr-1" />
        Portal de cobrança
      </Button>
    </div>
  )
}

// Plan details component
function PlanDetails({ subscription }: { subscription: Subscription }): JSX.Element {
  return (
    <div className="space-y-4">
      <div>
        <span className="block text-sm font-medium text-foreground">Plano</span>
        <p className="mt-1 text-lg font-semibold">{subscription.plan.name}</p>
      </div>
      <div>
        <span className="block text-sm font-medium text-gray-700">Preço</span>
        <p className="mt-1 text-lg font-semibold">
          {billingService.formatPrice(subscription.plan.price_cents)}
        </p>
      </div>
      <div>
        <span className="block text-sm font-medium text-gray-700">Status</span>
        <Badge variant={subscription.is_active ? 'default' : 'destructive'}>
          {subscription.is_active ? 'Ativo' : 'Inativo'}
        </Badge>
      </div>
      <div>
        <span className="block text-sm font-medium text-gray-700">Criado em</span>
        <p className="mt-1">{billingService.formatDate(subscription.created_at)}</p>
      </div>
    </div>
  )
}

// Current plan info component
export function CurrentPlanInfo({
  subscription,
  onManageBilling,
  onCancelSubscription,
}: {
  subscription: Subscription | null
  onManageBilling: () => void
  onCancelSubscription: () => void
}): JSX.Element {
  if (!subscription) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Plano atual</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Você não possui um plano ativo no momento.
        </p>
      </div>
    )
  }

  return (
    <div>
      <PlanInfoHeader onManageBilling={onManageBilling} />
      <PlanDetails subscription={subscription} />
      {subscription.is_active === true && subscription.plan.price_cents > 0 && (
        <Button
          variant="link"
          onClick={onCancelSubscription}
          className="text-red-600 hover:text-red-800 text-sm mt-4 h-auto p-0"
        >
          Fazer downgrade para básico
        </Button>
      )}
    </div>
  )
}

// Payment methods section component
export function PaymentMethodsSection({
  paymentMethods,
  onAddPaymentMethod,
  onSetDefaultPaymentMethod,
  onRemovePaymentMethod,
}: {
  paymentMethods: PaymentMethod[]
  onAddPaymentMethod: () => void
  onSetDefaultPaymentMethod: (id: string) => void
  onRemovePaymentMethod: (id: string) => void
}): JSX.Element {
  return (
    <div className="pt-8 border-t">
      <h2 className="text-xl font-semibold mb-4">Métodos de pagamento</h2>
      {paymentMethods.length === 0 ? (
        <p className="text-sm text-muted-foreground mb-4">Nenhum método de pagamento cadastrado.</p>
      ) : (
        <>
          <div className="space-y-4">
            {paymentMethods.map(method => (
              <PaymentMethodCard
                key={method.id}
                method={method}
                isDefault={Boolean(method.is_default)}
                onSetDefault={onSetDefaultPaymentMethod}
                onRemove={onRemovePaymentMethod}
              />
            ))}
          </div>
          <Button variant="link" onClick={onAddPaymentMethod} className="mt-4 h-auto p-0">
            + Adicionar novo cartão
          </Button>
        </>
      )}
    </div>
  )
}
