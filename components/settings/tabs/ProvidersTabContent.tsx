'use client'

/**
 * Providers Tab Content Component
 *
 * Manages multi-provider configuration and switching in settings.
 */

import { useState } from 'react'

import { useProviderData } from '@/hooks/use-provider-data'

import {
  ProvidersError,
  ProvidersLoading,
  ProvidersMainContent,
  ProvidersPermissionDenied,
} from './ProvidersTabContentComponents'

interface ProvidersTabContentProps {
  canManageProviders?: boolean
  userRole?: string
}

export function ProvidersTabContent({
  canManageProviders = true,
  userRole,
}: ProvidersTabContentProps): JSX.Element {
  const [migrationWizardOpen, setMigrationWizardOpen] = useState(false)
  const [selectedProviderType, setSelectedProviderType] = useState<string>('')

  const { providers, isLoading, error, refetch } = useProviderData()

  const handleSwitchProvider = (providerType: string): void => {
    setSelectedProviderType(providerType)
    setMigrationWizardOpen(true)
  }

  const handleMigrationComplete = (): void => {
    // Refresh provider data after successful migration
    void refetch()
    setMigrationWizardOpen(false)
    setSelectedProviderType('')
  }

  const handleMigrationClose = (): void => {
    setMigrationWizardOpen(false)
    setSelectedProviderType('')
  }

  const handleRetry = (): void => {
    void refetch()
  }

  // Permission check
  if (!canManageProviders) {
    return <ProvidersPermissionDenied userRole={userRole} />
  }

  // Loading state or error handling
  if (isLoading || providers === null) {
    return <ProvidersLoading />
  }

  if (error !== null) {
    return <ProvidersError onRetry={handleRetry} />
  }

  return (
    <ProvidersMainContent
      providers={providers}
      onSwitchProvider={handleSwitchProvider}
      migrationWizardOpen={migrationWizardOpen}
      selectedProviderType={selectedProviderType}
      onMigrationClose={handleMigrationClose}
      onMigrationComplete={handleMigrationComplete}
    />
  )
}
