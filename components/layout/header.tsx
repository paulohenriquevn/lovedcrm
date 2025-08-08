/**
 * Header - Main Application Header
 * Header principal com contexto organizacional e navegação
 * Baseado na especificação do agente 09-ui-ux-designer.md
 */

'use client'

import { useTheme } from 'next-themes'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
// Hooks para dados reais
import { useMemberCount } from '@/hooks/use-member-count'
import { useNotifications } from '@/hooks/use-notifications'
import { useUserOrganizations } from '@/hooks/use-user-organizations'
import { useAuthStore } from '@/stores/auth'

import {
  NotificationButton,
  OrgSwitcher,
  SearchCommand,
  ThemeToggle,
  UserMenu,
} from './header-components'
import {
  createSafeOrganization,
  getDisplayName,
  getUserInitials,
  handleLogout,
  handleOrgSwitch,
  handleThemeToggle,
} from './header-utils'

interface HeaderProps {
  className?: string
}

// Move outside component to avoid scoping warning
const handleNotificationClick = (): void => {
  // Handle notification click - implement notification functionality
}

export function Header({ className }: HeaderProps): JSX.Element {
  const [commandOpen, setCommandOpen] = useState(false)
  const { setTheme, theme } = useTheme()

  // Hooks para dados reais
  const { user, organization, logout } = useAuthStore()
  const { organizations, currentOrganization, switchOrganization } = useUserOrganizations()
  const { unreadCount } = useNotifications()
  const { memberCount, isLoading: memberLoading } = useMemberCount()

  // Process organization data
  const safeOrganizations = organizations.map(org => createSafeOrganization(org))
  const currentOrg = createSafeOrganization(currentOrganization ?? organization)

  // User data
  const displayName = getDisplayName(user)
  const userInitials = getUserInitials(user)

  // Event handlers
  const onThemeToggle = (): void => handleThemeToggle(theme, setTheme)
  const onOrgSwitch = (orgId: string): void => handleOrgSwitch(orgId, switchOrganization)
  const onLogout = (): void => handleLogout(logout)

  return (
    <>
      <header className={`h-16 bg-background border-b border-border ${className ?? ''}`}>
        <div className="flex items-center justify-between h-full px-6">
          {/* Left: Organization Context */}
          <div className="flex items-center gap-4">
            <OrgSwitcher
              organizations={safeOrganizations}
              currentOrg={currentOrg}
              memberCount={memberCount}
              memberLoading={memberLoading}
              onOrgSwitch={onOrgSwitch}
            />
          </div>

          {/* Center: Command Search */}
          <div className="flex-1 max-w-md mx-6">
            <Button
              variant="outline"
              className="relative w-full justify-start text-sm text-muted-foreground h-9"
              onClick={() => setCommandOpen(true)}
            >
              <span>Buscar leads, clientes, conversas...</span>
            </Button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <NotificationButton unreadCount={unreadCount} onClick={handleNotificationClick} />

            <ThemeToggle theme={theme} onToggle={onThemeToggle} />

            <UserMenu
              user={user}
              displayName={displayName}
              userInitials={userInitials}
              onLogout={onLogout}
            />
          </div>
        </div>
      </header>

      <SearchCommand open={commandOpen} onOpenChange={setCommandOpen} />
    </>
  )
}
