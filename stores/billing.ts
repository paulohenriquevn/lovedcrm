/**
 * Billing Store - State management integrado com backend real
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import {
  Plan,
  Subscription,
  FeaturesResponse,
  PlanComparisonResponse,
  PlanSlug,
} from '../types/billing'
import { billingService } from '../services/billing'

interface BillingState {
  // Data from backend
  currentPlan: Subscription | null
  availablePlans: Plan[]
  features: FeaturesResponse | null
  planComparison: PlanComparisonResponse | null

  // Loading states
  loading: {
    currentPlan: boolean
    availablePlans: boolean
    features: boolean
    planComparison: boolean
    upgrade: boolean
    downgrade: boolean
  }

  // Error states
  errors: {
    currentPlan: string | null
    availablePlans: string | null
    features: string | null
    planComparison: string | null
    upgrade: string | null
    downgrade: string | null
  }

  // Actions
  fetchCurrentPlan: () => Promise<void>
  fetchAvailablePlans: () => Promise<void>
  fetchFeatures: () => Promise<void>
  fetchPlanComparison: () => Promise<void>
  fetchAllData: () => Promise<void>

  // Plan actions
  upgradeToPlan: (planSlug: string) => Promise<void>
  downgradeToBasic: (reason?: string) => Promise<void>

  // Utility actions
  clearErrors: () => void
  clearError: (key: keyof BillingState['errors']) => void
  reset: () => void
}

const initialLoadingState = {
  currentPlan: false,
  availablePlans: false,
  features: false,
  planComparison: false,
  upgrade: false,
  downgrade: false,
}

const initialErrorState = {
  currentPlan: null,
  availablePlans: null,
  features: null,
  planComparison: null,
  upgrade: null,
  downgrade: null,
}

export const useBillingStore = create<BillingState>()(
  devtools(
    (set, get) => ({
      // Initial state
      currentPlan: null,
      availablePlans: [],
      features: null,
      planComparison: null,
      loading: initialLoadingState,
      errors: initialErrorState,

      // Fetch current plan
      fetchCurrentPlan: async () => {
        set(state => ({
          loading: { ...state.loading, currentPlan: true },
          errors: { ...state.errors, currentPlan: null },
        }))

        try {
          const currentPlan = await billingService.getCurrentPlan()
          set(state => ({
            currentPlan,
            loading: { ...state.loading, currentPlan: false },
          }))
        } catch (error) {
          set(state => ({
            loading: { ...state.loading, currentPlan: false },
            errors: { ...state.errors, currentPlan: (error as Error).message },
          }))
        }
      },

      // Fetch available plans
      fetchAvailablePlans: async () => {
        set(state => ({
          loading: { ...state.loading, availablePlans: true },
          errors: { ...state.errors, availablePlans: null },
        }))

        try {
          const availablePlans = await billingService.getAvailablePlans()
          set(state => ({
            availablePlans,
            loading: { ...state.loading, availablePlans: false },
          }))
        } catch (error) {
          set(state => ({
            loading: { ...state.loading, availablePlans: false },
            errors: { ...state.errors, availablePlans: (error as Error).message },
          }))
        }
      },

      // Fetch features
      fetchFeatures: async () => {
        set(state => ({
          loading: { ...state.loading, features: true },
          errors: { ...state.errors, features: null },
        }))

        try {
          const features = await billingService.getOrganizationFeatures()
          set(state => ({
            features,
            loading: { ...state.loading, features: false },
          }))
        } catch (error) {
          set(state => ({
            loading: { ...state.loading, features: false },
            errors: { ...state.errors, features: (error as Error).message },
          }))
        }
      },

      // Fetch plan comparison
      fetchPlanComparison: async () => {
        set(state => ({
          loading: { ...state.loading, planComparison: true },
          errors: { ...state.errors, planComparison: null },
        }))

        try {
          const planComparison = await billingService.getPlanComparison()
          set(state => ({
            planComparison,
            loading: { ...state.loading, planComparison: false },
          }))
        } catch (error) {
          set(state => ({
            loading: { ...state.loading, planComparison: false },
            errors: { ...state.errors, planComparison: (error as Error).message },
          }))
        }
      },

      // Fetch all data
      fetchAllData: async () => {
        const { fetchCurrentPlan, fetchAvailablePlans, fetchFeatures, fetchPlanComparison } = get()

        await Promise.all([
          fetchCurrentPlan(),
          fetchAvailablePlans(),
          fetchFeatures(),
          fetchPlanComparison(),
        ])
      },

      // Upgrade to plan
      upgradeToPlan: async (planSlug: string) => {
        set(state => ({
          loading: { ...state.loading, upgrade: true },
          errors: { ...state.errors, upgrade: null },
        }))

        try {
          await billingService.redirectToCheckout(planSlug)
          // Note: User will be redirected or page will refresh
        } catch (error) {
          set(state => ({
            loading: { ...state.loading, upgrade: false },
            errors: { ...state.errors, upgrade: (error as Error).message },
          }))
        }
      },

      // Downgrade to basic
      downgradeToBasic: async (reason?: string) => {
        set(state => ({
          loading: { ...state.loading, downgrade: true },
          errors: { ...state.errors, downgrade: null },
        }))

        try {
          await billingService.downgradePlan(reason)

          // Refresh current plan data
          const { fetchCurrentPlan } = get()
          await fetchCurrentPlan()

          set(state => ({
            loading: { ...state.loading, downgrade: false },
          }))
        } catch (error) {
          set(state => ({
            loading: { ...state.loading, downgrade: false },
            errors: { ...state.errors, downgrade: (error as Error).message },
          }))
        }
      },

      // Clear all errors
      clearErrors: () => {
        set(_state => ({
          errors: initialErrorState,
        }))
      },

      // Clear specific error
      clearError: (key: keyof BillingState['errors']) => {
        set(state => ({
          errors: { ...state.errors, [key]: null },
        }))
      },

      // Reset store
      reset: () => {
        set({
          currentPlan: null,
          availablePlans: [],
          features: null,
          planComparison: null,
          loading: initialLoadingState,
          errors: initialErrorState,
        })
      },
    }),
    {
      name: 'billing-store',
    }
  )
)

// Selectors for easy access to computed values
export const useBillingSelectors = () => {
  const store = useBillingStore()

  return {
    // Current plan info
    currentPlanSlug: store.currentPlan?.plan.slug || PlanSlug.BASIC,
    currentPlanName: store.currentPlan?.plan.name || 'Básico',
    currentPlanPrice: store.currentPlan?.plan.price_cents || 0,
    isSubscriptionActive: store.currentPlan
      ? billingService.isSubscriptionActive(store.currentPlan)
      : false,

    // Formatted current plan info
    formattedCurrentPrice: store.currentPlan
      ? billingService.formatPrice(store.currentPlan.plan.price_cents)
      : 'Gratuito',
    formattedCreatedAt: store.currentPlan
      ? billingService.formatDate(store.currentPlan.created_at)
      : null,

    // Available plans info
    availablePlansSorted: store.availablePlans.sort((a, b) => a.price_cents - b.price_cents),
    cheapestPlan:
      store.availablePlans.length > 0
        ? store.availablePlans.reduce((min, plan) =>
            !min || plan.price_cents < min.price_cents ? plan : min
          )
        : null,
    mostExpensivePlan:
      store.availablePlans.length > 0
        ? store.availablePlans.reduce((max, plan) =>
            !max || plan.price_cents > max.price_cents ? plan : max
          )
        : null,

    // Features info
    currentFeatures: store.features?.features || [],
    readableFeatures: store.features?.features
      ? billingService.getReadableFeatures(store.features.features)
      : [],

    // Plan comparison info
    canUpgrade: store.planComparison?.upgrade_available || false,
    canDowngrade: store.planComparison?.downgrade_available || false,

    // Loading states
    isLoading: Object.values(store.loading).some(Boolean),
    hasErrors: Object.values(store.errors).some(Boolean),

    // Specific loading states
    isLoadingCurrentPlan: store.loading.currentPlan,
    isLoadingPlans: store.loading.availablePlans,
    isUpgrading: store.loading.upgrade,
    isDowngrading: store.loading.downgrade,
  }
}

export default useBillingStore
