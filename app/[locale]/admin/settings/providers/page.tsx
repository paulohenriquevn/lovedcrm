'use client'

// import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { ProviderDashboard } from '@/components/providers/ProviderDashboard'
import { ProviderMigrationWizard } from '@/components/providers/ProviderMigrationWizard'
import { usePermissions } from '@/hooks/use-permissions'
import { useProviderData } from '@/hooks/use-provider-data'

export default function ProvidersPage(): JSX.Element {
  const [showMigrationWizard, setShowMigrationWizard] = useState(false)
  const [selectedProviderType, setSelectedProviderType] = useState<string | null>(null)

  const { permissions } = usePermissions()
  const { providers, isLoading, error } = useProviderData()
  // const tSettings = useTranslations('admin.settings')

  // Check permissions for provider management
  if (!permissions.canManageProviders) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            You don&apos;t have permission to manage organization providers.
          </p>
        </div>
      </div>
    )
  }

  const handleSwitchProvider = (providerType: string) => {
    setSelectedProviderType(providerType)
    setShowMigrationWizard(true)
  }

  const handleCloseMigrationWizard = () => {
    setShowMigrationWizard(false)
    setSelectedProviderType(null)
  }

  return (
    <div className="w-full h-full space-y-6">
      {/* Header */}
      <div className="w-full space-y-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Provider Management</h1>
          <p className="text-sm text-muted-foreground">
            Configure and switch between communication providers for optimal cost and performance
          </p>
        </div>
      </div>

      {/* Provider Dashboard */}
      <div className="w-full space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            <span className="ml-3 text-sm text-gray-600 dark:text-gray-400">
              Loading providers...
            </span>
          </div>
        ) : error !== null && error !== undefined ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
              Error loading providers
            </h3>
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              {error ?? 'Unknown error occurred'}
            </p>
          </div>
        ) : (
          <ProviderDashboard providers={providers} onSwitchProvider={handleSwitchProvider} />
        )}
      </div>

      {/* Migration Wizard Modal */}
      {Boolean(showMigrationWizard && selectedProviderType) && (
        <ProviderMigrationWizard
          providerType={selectedProviderType ?? ''}
          providers={providers}
          onClose={handleCloseMigrationWizard}
          onComplete={() => {
            handleCloseMigrationWizard()
            // Refresh provider data would be handled by the hook
          }}
        />
      )}
    </div>
  )
}
