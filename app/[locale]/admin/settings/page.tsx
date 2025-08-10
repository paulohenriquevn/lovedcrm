'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { ChangePasswordModal } from '@/components/settings/ChangePasswordModal'
import { usePasswordModal } from '@/components/settings/hooks/usePasswordModal'
import { useSettingsData } from '@/components/settings/hooks/useSettingsData'
import { useSettingsHandlers } from '@/components/settings/hooks/useSettingsHandlers'
import { SettingsTabRenderer } from '@/components/settings/SettingsTabRenderer'
import { SettingsTabsView } from '@/components/settings/SettingsTabsView'
import { usePermissions } from '@/hooks/use-permissions'
import { useAuthStore } from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'

export default function SettingsPage(): JSX.Element {
  const [activeTab, setActiveTab] = useState('profile')
  const { profile, preferences } = useSettingsStore()
  const { organization } = useAuthStore()
  const { permissions, userRole } = usePermissions()
  const tSettings = useTranslations('admin.settings')

  // Load settings data
  useSettingsData()

  // Get handlers and modal state
  const handlers = useSettingsHandlers()
  const modal = usePasswordModal()

  return (
    <div className="w-full h-full space-y-6">
      {/* Header */}
      <div className="w-full space-y-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{tSettings('title')}</h1>
          <p className="text-sm text-muted-foreground">{tSettings('subtitle')}</p>
        </div>
      </div>

      {/* Settings Tabs */}
      <div className="w-full space-y-4">
        <SettingsTabsView
          activeTab={activeTab}
          onTabChange={setActiveTab}
          permissions={{
            canEditOrganization: permissions.canEditOrganization,
            canManageBilling: permissions.canManageBilling,
            canViewAdvancedSettings: permissions.canViewAdvancedSettings,
          }}
        />
      </div>

      {/* Settings Content */}
      <div className="w-full space-y-4">
        <div className="w-full min-h-[400px]">
          <SettingsTabRenderer
            activeTab={activeTab}
            profile={profile}
            preferences={preferences}
            organization={organization}
            permissions={permissions}
            userRole={userRole ?? undefined}
            isUpdatingOrg={handlers.isUpdatingOrg}
            onUpdateProfile={handlers.handleUpdateProfile}
            onUpdatePreferences={handlers.handleUpdatePreferences}
            onSaveNotificationPreferences={handlers.handleSaveNotificationPreferences}
            onChangePassword={modal.handlePasswordModalOpen}
            onUpdateOrganization={handlers.handleUpdateOrganization}
            onChangePlan={handlers.handleChangePlan}
            onCancelSubscription={handlers.handleCancelSubscription}
            onManageBilling={handlers.handleManageBilling}
            onAddPaymentMethod={handlers.handleAddPaymentMethod}
            onRemovePaymentMethod={handlers.handleRemovePaymentMethod}
            onSetDefaultPaymentMethod={handlers.handleSetDefaultPaymentMethod}
          />
        </div>
      </div>

      {/* Password Change Modal */}
      <ChangePasswordModal
        isOpen={modal.isPasswordModalOpen}
        onClose={modal.handlePasswordModalClose}
        onChangePassword={handlers.handlePasswordChange}
      />
    </div>
  )
}
