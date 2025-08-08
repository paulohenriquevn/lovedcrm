'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect } from 'react'

import { ErrorMessage } from '@/components/common/error-message'
import { LoadingSpinner } from '@/components/common/loading-spinner'
import { BillingSettingsView } from '@/components/settings/BillingSettingsView'
import { logger } from '@/lib/logger'
import { useAuthStore } from '@/stores/auth'
import { useBillingStore, useBillingSelectors } from '@/stores/billing'

// Removed unused type interfaces to resolve lint errors

// interface BillingViewData {
//   subscription: PreparedSubscription | null
//   pricingPlans: PreparedPricingPlan[]
//   paymentMethods: PreparedPaymentMethod[]
//   invoices: PreparedInvoice[]
//   usageStats: PreparedUsageStats | null
// }

// Helper function to prepare payment methods data (unused)
// // const preparePaymentMethodsData = (paymentMethods: RawPaymentMethod[]): PreparedPaymentMethod[] => {
//   return paymentMethods.map(method => ({
//     id: method.id ?? '',
//     type: method.type ?? '',
//     last4: method.last4 ?? '',
//     brand: method.brand ?? '',
//     expMonth: method.exp_month ?? 0,
//     expYear: method.exp_year ?? 0,
//     isDefault: method.is_default ?? false,
//   }))
// }
//
// // Helper function to prepare invoices data
// const prepareInvoicesData = (invoices: RawInvoice[]): PreparedInvoice[] => {
//   return invoices.map(invoice => ({
//     id: invoice.id ?? '',
//     amount: invoice.amount ?? 0,
//     currency: invoice.currency ?? 'usd',
//     status: invoice.status ?? 'pending',
//     createdAt: invoice.created ?? '',
//   }))
// }
//
// // Helper function to prepare pricing plans data
// const preparePricingPlansData = (pricingPlans: RawPricingPlan[]): PreparedPricingPlan[] => {
//   return pricingPlans.map(plan => ({
//     name: plan.name,
//     price: plan.price,
//     currency: plan.currency,
//     interval: plan.interval,
//     features: plan.features,
//     popular: plan.popular ?? false,
//     planType: plan.name.toLowerCase() as SubscriptionPlan,
//     maxApiCalls: plan.maxApiCalls ?? null,
//     maxStorageGb: plan.maxStorageGb ?? null,
//     maxTeamMembers: plan.maxTeamMembers ?? null,
//   }))
// }
//
// // Helper function to prepare usage stats data - fixed parameter count
// const prepareUsageStatsData = (
//   params: {
//     usageStats: RawUsageStats | null
//     apiUsagePercentage: number
//     storageUsagePercentage: number
//     teamUsagePercentage: number
//   }
// ): PreparedUsageStats | null => {
//   if (!params.usageStats) {
//     return null
//   }
//
//   return {
//     apiCalls: {
//       ...params.usageStats.apiCalls,
//       percentage: params.apiUsagePercentage,
//     },
//     storage: {
//       ...params.usageStats.storage,
//       percentage: params.storageUsagePercentage,
//     },
//     teamMembers: {
//       ...params.usageStats.teamMembers,
//       percentage: params.teamUsagePercentage,
//     },
//   }
// }
//
// // Helper function to prepare subscription data - fixed parameter count
// const prepareSubscriptionData = (
//   params: {
//     subscription: RawSubscription | null
//     currentPlan: string
//     isSubscriptionActive: boolean
//     isSubscriptionPastDue: boolean
//     willBeCanceled: boolean
//     daysUntilPeriodEnd: number
//     formattedAmount: string | null
//     formattedNextBilling: string | null
//     statusText: string
//   }
// ): PreparedSubscription | null => {
//   if (!params.subscription) {
//     return null
//   }
//
//   return {
//     ...params.subscription,
//     planType: params.currentPlan,
//     isActive: params.isSubscriptionActive,
//     isPastDue: params.isSubscriptionPastDue,
//     willBeCanceled: params.willBeCanceled,
//     daysUntilPeriodEnd: params.daysUntilPeriodEnd,
//     formattedAmount: params.formattedAmount ?? 'N/A',
//     formattedNextBilling: params.formattedNextBilling ?? 'N/A',
//     statusText: params.statusText,
//   }
// }

// Hook for handling URL parameters
function useUrlParameterHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleUrlParameters = useCallback(() => {
    const success = searchParams.get('success')
    const canceled = searchParams.get('canceled')

    if (success === 'true') {
      // toast({ title: "Sucesso", description: 'Payment Successful! Your subscription has been updated successfully.' })
      router.replace('/admin/billing')
      const { fetchAllData } = useBillingStore.getState()
      void fetchAllData()
    } else if (canceled === 'true') {
      // toast({ title: "Info", description: 'Payment Canceled. Your subscription was not changed.' })
      router.replace('/admin/billing')
    }
  }, [searchParams, router])

  useEffect(() => {
    handleUrlParameters()
  }, [handleUrlParameters])
}

// Hook for subscription upgrade
function useSubscriptionUpgrade() {
  return useCallback((planSlug: string) => {
    void (async () => {
      try {
        const { upgradeToPlan } = useBillingStore.getState()
        await upgradeToPlan(planSlug)
      } catch (error_) {
        logger.apiError('Upgrade subscription error', error_)
        // toast({ title: "Erro", description: 'Upgrade Failed. Failed to start the upgrade process. Please try again.', variant: "destructive" })
      }
    })()
  }, [])
}

// Hook for subscription cancellation (downgrade)
function useSubscriptionCancellation() {
  return useCallback(() => {
    void (async () => {
      const { currentPlan, downgradeToBasic } = useBillingStore.getState()

      if (!currentPlan) {
        return
      }

      const confirmed = window.confirm(
        'Tem certeza que deseja fazer downgrade para o plano básico? Esta ação é irreversível.'
      )

      if (!confirmed) {
        return
      }

      try {
        await downgradeToBasic('User requested downgrade')
        // toast({ title: "Sucesso", description: 'Downgrade realizado com sucesso para o plano básico.' })
      } catch (error_) {
        logger.apiError('Downgrade error', error_)
        // toast({ title: "Erro", description: 'Falha no downgrade. Tente novamente.', variant: "destructive" })
      }
    })()
  }, [])
}

// Hook for managing billing (placeholder - not used in new system)
function useCustomerPortal() {
  return useCallback(() => {
    // TODO: Implement if needed - currently not used
    // Customer portal not implemented in simplified billing system
  }, [])
}

// Hook for preparing view data (currently unused but kept for future use)
/* 
function useBillingViewData(): BillingViewData {
  const storeData = useBillingStore()
  const selectorData = useBillingSelectors()

  return useCallback((): BillingViewData => {
    const subscriptionData = prepareSubscriptionData({
      subscription: storeData.subscription as RawSubscription | null,
      currentPlan: selectorData.currentPlan,
      isSubscriptionActive: selectorData.isSubscriptionActive,
      isSubscriptionPastDue: selectorData.isSubscriptionPastDue,
      willBeCanceled: selectorData.willBeCanceled,
      daysUntilPeriodEnd: selectorData.daysUntilPeriodEnd,
      formattedAmount: selectorData.formattedAmount,
      formattedNextBilling: selectorData.formattedNextBilling,
      statusText: selectorData.statusText || '',
    })
    
    return {
      subscription: subscriptionData,
      pricingPlans: preparePricingPlansData(storeData.pricingPlans as unknown as RawPricingPlan[]),
      paymentMethods: preparePaymentMethodsData(storeData.paymentMethods as unknown as RawPaymentMethod[]),
      invoices: prepareInvoicesData(storeData.invoices as unknown as RawInvoice[]),
      usageStats: prepareUsageStatsData({
        usageStats: storeData.usageStats as RawUsageStats | null,
        apiUsagePercentage: selectorData.apiUsagePercentage,
        storageUsagePercentage: selectorData.storageUsagePercentage,
        teamUsagePercentage: selectorData.teamUsagePercentage,
      }),
    }
  }, [storeData, selectorData])()
}
*/

// Component for loading state
function LoadingState() {
  return (
    <div className="flex items-center justify-center py-12">
      <LoadingSpinner size="lg" />
    </div>
  )
}

// Component for error state
function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="py-12">
      <ErrorMessage message={`Failed to Load Billing Information: ${error}`} onRetry={onRetry} />
    </div>
  )
}

interface BillingStoreData {
  currentPlan: unknown
  errors: {
    currentPlan: string | null
  }
  fetchAllData: () => void
}

// Helper to check if component should show error state
function shouldShowError(storeData: BillingStoreData): boolean {
  return (
    Boolean(storeData.errors.currentPlan) &&
    storeData.errors.currentPlan !== '' &&
    storeData.currentPlan === null
  )
}

// Helper to check if component should show loading state  
function shouldShowLoading(
  user: unknown,
  organization: unknown,
  isLoading: boolean
): boolean {
  return user === null || organization === null || isLoading
}

export function BillingSettingsContainer() {
  const { user, organization } = useAuthStore()
  const storeData = useBillingStore()
  const { isLoading } = useBillingSelectors()

  // Custom hooks for specific functionality
  useUrlParameterHandler()
  const handleUpgradeSubscription = useSubscriptionUpgrade()
  const handleCancelSubscription = useSubscriptionCancellation()
  const handleManagePaymentMethods = useCustomerPortal()

  // Load billing data only when user and organization are available
  useEffect(() => {
    if (user && organization) {
      const { fetchAllData } = useBillingStore.getState()
      void fetchAllData()
    }
  }, [user, organization])

  // Show loading state
  if (shouldShowLoading(user, organization, isLoading)) {
    return <LoadingState />
  }

  // Show error state
  if (shouldShowError(storeData)) {
    return (
      <ErrorState
        error={storeData.errors.currentPlan ?? 'Unknown error'}
        onRetry={() => void storeData.fetchAllData()}
      />
    )
  }

  return (
    <BillingSettingsView
      subscription={storeData.currentPlan}
      paymentMethods={[]} // Not used in simplified system
      invoices={[]} // Not used in simplified system
      isLoading={isLoading}
      onChangePlan={handleUpgradeSubscription}
      onCancelSubscription={handleCancelSubscription}
      onManageBilling={handleManagePaymentMethods}
      onAddPaymentMethod={() => {}}
      onRemovePaymentMethod={() => {}}
      onSetDefaultPaymentMethod={() => {}}
    />
  )
}
