import { AdvancedTabContent } from '@/components/settings/tabs/AdvancedTabContent'
import { BillingTabContent } from '@/components/settings/tabs/BillingTabContent'
import { NotificationsTabContent } from '@/components/settings/tabs/NotificationsTabContent'
import { OrganizationTabContent } from '@/components/settings/tabs/OrganizationTabContent'
import { PreferencesTabContent } from '@/components/settings/tabs/PreferencesTabContent'
import { ProfileTabContent } from '@/components/settings/tabs/ProfileTabContent'
import { SecurityTabContent } from '@/components/settings/tabs/SecurityTabContent'
import { Card, CardContent } from '@/components/ui/card'

interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
}

interface Preferences {
  theme: string
  notificationsEmail: boolean
  notificationsPush: boolean
  notificationsSms: boolean
  marketingEmails: boolean
  language: string
  timezone: string
}

interface Organization {
  id: string
  name: string
  updatedAt: string
}

interface Permissions {
  canEditOrganization: boolean
  canManageBilling: boolean
  canViewAdvancedSettings: boolean
}

interface SettingsTabRendererProps {
  activeTab: string
  profile: User | null
  preferences: Preferences | null
  organization: Organization | null
  permissions: Permissions
  userRole?: string
  isUpdatingOrg: boolean
  onUpdateProfile: (data: Partial<User>) => Promise<void>
  onUpdatePreferences: (data: Partial<Preferences>) => Promise<void>
  onSaveNotificationPreferences: (data: Partial<Preferences>) => Promise<void>
  onChangePassword: () => void
  onUpdateOrganization: (data: Partial<Organization>) => Promise<void>
  onChangePlan: (planSlug: string) => void
  onCancelSubscription: () => void
  onManageBilling: () => void
  onAddPaymentMethod: () => void
  onRemovePaymentMethod: (id: string) => void
  onSetDefaultPaymentMethod: (id: string) => void
}

// Tab content renderers
function renderProfileTab({
  profile,
  preferences,
  onUpdateProfile,
  onUpdatePreferences,
  onChangePassword,
}: {
  profile: User | null
  preferences: Preferences | null
  onUpdateProfile: (data: Partial<User>) => Promise<void>
  onUpdatePreferences: (data: Partial<Preferences>) => Promise<void>
  onChangePassword: () => void
}): JSX.Element {
  return (
    <ProfileTabContent
      profile={profile}
      preferences={preferences}
      onUpdateProfile={onUpdateProfile}
      onUpdatePreferences={onUpdatePreferences}
      onChangePassword={onChangePassword}
    />
  )
}

function renderOrganizationTab({
  organization,
  permissions,
  isUpdatingOrg,
  userRole,
  onUpdateOrganization,
}: {
  organization: Organization | null
  permissions: Permissions
  isUpdatingOrg: boolean
  userRole?: string
  onUpdateOrganization: (data: Partial<Organization>) => Promise<void>
}): JSX.Element {
  return (
    <OrganizationTabContent
      organization={organization}
      canEditOrganization={permissions.canEditOrganization}
      isUpdatingOrg={isUpdatingOrg}
      userRole={userRole}
      onUpdateOrganization={onUpdateOrganization}
    />
  )
}

function renderBillingTab({
  permissions,
  userRole,
  onChangePlan,
  onCancelSubscription,
  onManageBilling,
  onAddPaymentMethod,
  onRemovePaymentMethod,
  onSetDefaultPaymentMethod,
}: {
  permissions: Permissions
  userRole?: string
  onChangePlan: (planSlug: string) => void
  onCancelSubscription: () => void
  onManageBilling: () => void
  onAddPaymentMethod: () => void
  onRemovePaymentMethod: (id: string) => void
  onSetDefaultPaymentMethod: (id: string) => void
}): JSX.Element {
  return (
    <BillingTabContent
      canManageBilling={permissions.canManageBilling}
      userRole={userRole}
      onChangePlan={onChangePlan}
      onCancelSubscription={onCancelSubscription}
      onManageBilling={onManageBilling}
      onAddPaymentMethod={onAddPaymentMethod}
      onRemovePaymentMethod={onRemovePaymentMethod}
      onSetDefaultPaymentMethod={onSetDefaultPaymentMethod}
    />
  )
}

export function SettingsTabRenderer(props: SettingsTabRendererProps): JSX.Element {
  const {
    activeTab,
    onChangePassword,
    onSaveNotificationPreferences,
    preferences,
    onUpdatePreferences,
    permissions,
    userRole,
  } = props

  switch (activeTab) {
    case 'profile': {
      return renderProfileTab(props)
    }
    case 'security': {
      return <SecurityTabContent onChangePassword={onChangePassword} />
    }
    case 'notifications': {
      return <NotificationsTabContent onSavePreferences={onSaveNotificationPreferences} />
    }
    case 'preferences': {
      return (
        <PreferencesTabContent
          preferences={preferences}
          onUpdatePreferences={onUpdatePreferences}
        />
      )
    }
    case 'organization': {
      return renderOrganizationTab(props)
    }
    case 'billing': {
      return renderBillingTab(props)
    }
    case 'advanced': {
      return (
        <AdvancedTabContent
          canViewAdvancedSettings={permissions.canViewAdvancedSettings}
          userRole={userRole}
        />
      )
    }
    default: {
      return (
        <Card className="w-full">
          <CardContent className="p-6">
            <p className="text-muted-foreground">Selecione uma aba para continuar.</p>
          </CardContent>
        </Card>
      )
    }
  }
}
