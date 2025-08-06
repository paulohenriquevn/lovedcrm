import { User, Settings, CreditCard, Shield, Bell, Database, Building } from 'lucide-react'

interface SettingsTabsViewProps {
  activeTab: string
  onTabChange: (tab: string) => void
  permissions?: {
    canEditOrganization: boolean
    canManageBilling: boolean
    canViewAdvancedSettings: boolean
  }
}

// Settings tabs configuration
const SETTINGS_TABS = [
  {
    id: 'profile',
    label: 'Perfil',
    icon: User,
    description: 'Gerencie suas informações pessoais',
    // Basic feature - available to all plans
  },
  {
    id: 'security',
    label: 'Segurança',
    icon: Shield,
    description: 'Senha, 2FA e sessões ativas',
    requiredFeature: 'user_management', // Professional+ feature
  },
  {
    id: 'notifications',
    label: 'Notificações',
    icon: Bell,
    description: 'Configure preferências de notificação',
    requiredFeature: 'team_collaboration', // Professional+ feature
  },
  {
    id: 'preferences',
    label: 'Preferências',
    icon: Settings,
    description: 'Tema, idioma e configurações gerais',
    // Basic feature - available to all plans
  },
  {
    id: 'organization',
    label: 'Organização',
    icon: Building,
    description: 'Informações e configurações da organização',
    requiredFeature: 'user_management', // Professional+ feature
  },
  {
    id: 'billing',
    label: 'Faturamento',
    icon: CreditCard,
    description: 'Gerencie assinatura e pagamentos',
    // Available to all plans
  },
  {
    id: 'advanced',
    label: 'Avançado',
    icon: Database,
    description: 'Exportar dados, exclusão de conta',
    requiredFeature: 'audit_logs', // Expert feature
  },
]

// Tab button component
function TabButton({
  tab,
  isActive,
  onTabChange,
}: {
  tab: (typeof SETTINGS_TABS)[0] & { requiredFeature?: string }
  isActive: boolean
  onTabChange: (tab: string) => void
}): JSX.Element {
  const Icon = tab.icon

  // For now, don't block any tabs - let the content handle feature gating
  // TODO: Implement proper feature checking with subscription/plan validation
  const isFeatureBlocked = false

  // Keep this logic for future feature gating implementation:
  // const isFeatureBlocked = tab.requiredFeature && !hasFeature(tab.requiredFeature)

  if (isFeatureBlocked) {
    return (
      <div className="text-left p-4 rounded-lg border opacity-50 cursor-not-allowed relative">
        <div className="flex items-start gap-4">
          <Icon className="h-6 w-6 text-muted-foreground" />
          <div className="text-left">
            <p className="font-medium text-muted-foreground">
              {tab.label} <span className="text-xs text-amber-600">PRO</span>
            </p>
            <p className="text-sm text-muted-foreground">{tab.description}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => onTabChange(tab.id)}
      className={`text-left p-4 rounded-lg border transition-colors ${
        isActive ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:bg-muted/50'
      }`}
    >
      <div className="flex items-start gap-4">
        <Icon className={`h-6 w-6 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
        <div className="text-left">
          <p className={isActive ? 'font-medium text-primary' : 'font-medium text-foreground'}>
            {tab.label}
          </p>
          <p className={isActive ? 'text-sm text-primary/70' : 'text-sm text-muted-foreground'}>
            {tab.description}
          </p>
        </div>
      </div>
    </button>
  )
}

export function SettingsTabsView({
  activeTab,
  onTabChange,
  permissions: _permissions,
}: SettingsTabsViewProps): JSX.Element {
  // Show all tabs - feature gating will handle access control at the tab level
  const availableTabs = SETTINGS_TABS

  return (
    <div className="w-full">
      {/* Mobile: Select dropdown */}
      <div className="sm:hidden">
        <label htmlFor="settings-tab" className="block text-sm font-medium mb-2">
          Seção:
        </label>
        <select
          id="settings-tab"
          value={activeTab}
          onChange={e => onTabChange(e.target.value)}
          className="w-full p-2 border rounded-md"
        >
          {availableTabs.map(tab => (
            <option key={tab.id} value={tab.id}>
              {tab.label} - {tab.description}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop/Tablet: Tab buttons */}
      <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {availableTabs.map(tab => (
          <TabButton
            key={tab.id}
            tab={tab}
            isActive={activeTab === tab.id}
            onTabChange={onTabChange}
          />
        ))}
      </div>
    </div>
  )
}
