/**
 * Hook for feature gating based on organization's subscription plan
 */
import { useMemo } from 'react'
import { useBillingSelectors } from '@/stores/billing'

export interface FeatureGating {
  // Check if organization has a specific feature
  hasFeature: (featureName: string) => boolean

  // Get all available features for current plan
  availableFeatures: string[]

  // Get readable feature names
  readableFeatures: string[]

  // Check multiple features at once
  hasAllFeatures: (features: string[]) => boolean
  hasAnyFeature: (features: string[]) => boolean

  // Plan-based checks
  isBasicPlan: boolean
  isProfessionalPlan: boolean
  isExpertPlan: boolean

  // Current plan information
  currentPlanSlug: string | null

  // Loading state
  isLoadingFeatures: boolean
}

// Map of feature keys to readable names
const FEATURE_NAMES: Record<string, string> = {
  user_management: 'Gestão de Usuários',
  basic_dashboard: 'Dashboard Básico',
  advanced_reports: 'Relatórios Avançados',
  analytics: 'Analytics Avançado',
  priority_support: 'Suporte Prioritário',
  api_access: 'Acesso à API',
  team_collaboration: 'Colaboração em Equipe',
  custom_integrations: 'Integrações Personalizadas',
  white_label: 'White Label',
  audit_logs: 'Logs de Auditoria',
}

/**
 * Hook for checking organization features
 */
export function useFeatures(): FeatureGating {
  const { currentFeatures, currentPlanSlug, isLoadingCurrentPlan } = useBillingSelectors()

  const featureGating = useMemo((): FeatureGating => {
    const features = currentFeatures || []

    return {
      // Feature checking functions
      hasFeature: (featureName: string) => features.includes(featureName),

      availableFeatures: features,

      readableFeatures: features.map(feature => FEATURE_NAMES[feature] || feature),

      hasAllFeatures: (requiredFeatures: string[]) =>
        requiredFeatures.every(feature => features.includes(feature)),

      hasAnyFeature: (requiredFeatures: string[]) =>
        requiredFeatures.some(feature => features.includes(feature)),

      // Plan checks
      isBasicPlan: currentPlanSlug === 'basic',
      isProfessionalPlan: currentPlanSlug === 'professional',
      isExpertPlan: currentPlanSlug === 'expert',

      // Current plan information
      currentPlanSlug,

      // Loading state
      isLoadingFeatures: isLoadingCurrentPlan,
    }
  }, [currentFeatures, currentPlanSlug, isLoadingCurrentPlan])

  return featureGating
}

/**
 * Hook for feature requirements with upgrade prompts
 */
export function useFeatureRequirement(requiredFeature: string) {
  const { hasFeature, currentPlanSlug } = useFeatures()

  const isBlocked = !hasFeature(requiredFeature)

  const getUpgradeMessage = () => {
    if (currentPlanSlug === 'basic') {
      return `Esta funcionalidade requer o plano Profissional ou superior.`
    }
    if (currentPlanSlug === 'professional') {
      return `Esta funcionalidade requer o plano Expert.`
    }
    return `Esta funcionalidade não está disponível no seu plano atual.`
  }

  const getRequiredPlans = () => {
    // Simplified logic - in real app, could be more sophisticated
    const featureToPlans: Record<string, string[]> = {
      advanced_reports: ['professional', 'expert'],
      analytics: ['expert'],
      priority_support: ['professional', 'expert'],
      api_access: ['professional', 'expert'],
      audit_logs: ['expert'],
      white_label: ['expert'],
    }

    return featureToPlans[requiredFeature] || ['professional', 'expert']
  }

  return {
    isBlocked,
    hasFeature: !isBlocked,
    upgradeMessage: getUpgradeMessage(),
    requiredPlans: getRequiredPlans(),
    featureName: FEATURE_NAMES[requiredFeature] || requiredFeature,
  }
}

export default useFeatures
