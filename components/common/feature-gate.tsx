/**
 * Feature Gate Component for conditional rendering based on subscription features
 */
'use client'

import { AlertTriangle, Zap, ArrowRight } from 'lucide-react'
import React from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/card'
import { useFeatures, useFeatureRequirement } from '@/hooks/use-features'
import { useBillingStore } from '@/stores/billing'

interface FeatureGateProps {
  feature: string
  children: React.ReactNode
  fallback?: React.ReactNode
  showUpgradePrompt?: boolean
  upgradePromptMode?: 'inline' | 'modal' | 'redirect'
}

interface UpgradePromptProps {
  featureName: string
  upgradeMessage: string
  requiredPlans: string[]
  mode?: 'inline' | 'modal' | 'redirect'
}

// Upgrade prompt component
function UpgradePrompt({
  featureName,
  upgradeMessage,
  requiredPlans,
  mode = 'inline',
}: UpgradePromptProps): JSX.Element {
  const { upgradeToPlan } = useBillingStore()

  const handleUpgrade = async (): Promise<void> => {
    if (mode === 'redirect') {
      window.location.href = '/admin/billing'
      return
    }

    // For inline/modal, upgrade to the first required plan
    const [targetPlan] = requiredPlans
    if (targetPlan !== null && targetPlan !== undefined && targetPlan !== '') {
      try {
        await upgradeToPlan(targetPlan)
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Upgrade error:', error)
      }
    }
  }

  if (mode === 'inline') {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="space-y-4">
            <Zap className="h-8 w-8 text-amber-500 mx-auto mb-4" />
            <CardTitle className="text-xl font-semibold mb-2">
              {featureName} - Funcionalidade Premium
            </CardTitle>
            <CardDescription className="text-muted-foreground mb-4">
              {upgradeMessage}
            </CardDescription>
            <Button onClick={() => void handleUpgrade()} className="w-full max-w-xs">
              <ArrowRight className="h-4 w-4 mr-2" />
              Fazer Upgrade
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // For modal mode, you could implement a modal here
  // For now, fallback to inline
  return (
    <div className="p-4 border border-amber-200 rounded-lg bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        <div className="flex-1">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
            {featureName} requer upgrade
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-300">{upgradeMessage}</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => void handleUpgrade()}>
          Upgrade
        </Button>
      </div>
    </div>
  )
}

/**
 * Feature Gate Component
 *
 * @param feature - Feature name to check (e.g., 'advanced_reports')
 * @param children - Content to show if feature is available
 * @param fallback - Custom fallback content (overrides upgrade prompt)
 * @param showUpgradePrompt - Whether to show upgrade prompt when blocked
 * @param upgradePromptMode - Style of upgrade prompt
 */
export function FeatureGate({
  feature,
  children,
  fallback,
  showUpgradePrompt = true,
  upgradePromptMode = 'inline',
}: FeatureGateProps): JSX.Element | null {
  const { hasFeature, isLoadingFeatures } = useFeatures()
  const featureRequirement = useFeatureRequirement(feature)

  // Show loading state
  if (isLoadingFeatures) {
    return (
      <div className="p-4">
        <div className="animate-pulse bg-muted rounded h-20" />
      </div>
    )
  }

  // If user has the feature, show the content
  if (hasFeature(feature)) {
    return children as JSX.Element
  }

  // If custom fallback is provided, use it
  if (fallback !== null && fallback !== undefined) {
    return fallback as JSX.Element
  }

  // If upgrade prompt is disabled, don't show anything
  if (!showUpgradePrompt) {
    return null
  }

  // Show upgrade prompt
  return (
    <UpgradePrompt
      featureName={featureRequirement.featureName}
      upgradeMessage={featureRequirement.upgradeMessage}
      requiredPlans={featureRequirement.requiredPlans}
      mode={upgradePromptMode}
    />
  )
}

/**
 * Hook-based Feature Gate for conditional logic
 */
export function useFeatureGate(feature: string): {
  hasFeature: boolean
  isBlocked: boolean
  featureRequirement: ReturnType<typeof useFeatureRequirement>
  FeatureGate: ({ children }: { children: React.ReactNode }) => JSX.Element
} {
  const { hasFeature } = useFeatures()
  const featureRequirement = useFeatureRequirement(feature)

  return {
    hasFeature: hasFeature(feature),
    isBlocked: !hasFeature(feature),
    featureRequirement,
    FeatureGate: ({ children }: { children: React.ReactNode }) => (
      <FeatureGate feature={feature}>{children}</FeatureGate>
    ),
  }
}

// Named exports preferred - removing default export for consistency
// export default FeatureGate
