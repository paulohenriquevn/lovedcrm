/**
 * Sidebar - Main Application Sidebar Navigation
 * Sidebar principal com navegação CRM específica
 * Baseado na especificação do agente 09-ui-ux-designer.md
 */

'use client'

import {
  LayoutDashboard,
  Kanban,
  Users,
  User,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
  Target,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useMemberCount } from '@/hooks/use-member-count'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth'

import { SidebarFooter } from './sidebar-components'

interface SidebarProps {
  className?: string
}

interface NavigationItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline'
  description?: string
}

interface NavigationSection {
  title: string
  items: NavigationItem[]
}

const navigationSections: NavigationSection[] = [
  {
    title: 'Principal',
    items: [
      {
        label: 'Dashboard',
        href: '/admin',
        icon: LayoutDashboard,
        description: 'Visão geral da agência',
      },
      {
        label: 'CRM',
        href: '/admin/crm',
        icon: Kanban,
        badge: 'BETA',
        badgeVariant: 'outline',
        description: 'Sistema de gestão de clientes',
      },
    ],
  },
  {
    title: 'Gestão',
    items: [
      {
        label: 'Equipe',
        href: '/admin/team',
        icon: Users,
        description: 'Gerenciar membros da organização',
      },
      {
        label: 'Faturamento',
        href: '/admin/billing',
        icon: BarChart3,
        description: 'Planos e pagamentos',
      },
    ],
  },
  {
    title: 'Configurações',
    items: [
      {
        label: 'Perfil',
        href: '/admin/profile',
        icon: User,
        description: 'Seu perfil pessoal',
      },
      {
        label: 'Configurações',
        href: '/admin/settings',
        icon: Settings,
        description: 'Configurações da organização',
      },
    ],
  },
]

function SidebarHeader({
  collapsed,
  toggleCollapsed,
}: {
  collapsed: boolean
  toggleCollapsed: () => void
}): JSX.Element {
  return (
    <div className="p-4 border-b border-border">
      <div className="flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <Target className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <span className="font-bold text-foreground">Loved</span>
              <span className="font-bold text-primary">CRM</span>
            </div>
          </div>
        )}

        <Button variant="ghost" size="sm" onClick={toggleCollapsed} className="h-8 w-8 shrink-0">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          <span className="sr-only">{collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}</span>
        </Button>
      </div>
    </div>
  )
}

function QuickAction({ collapsed }: { collapsed: boolean }): JSX.Element | null {
  if (collapsed) {
    return null
  }

  return (
    <div className="p-4">
      <Button className="w-full" size="sm">
        <Plus className="mr-2 h-4 w-4" />
        Novo Lead
      </Button>
    </div>
  )
}

interface NavigationProps {
  collapsed: boolean
  pathname: string
}

function getPathWithoutLocale(pathname: string): string {
  return pathname.replace(/^\/[a-z]{2}(?:-[A-Z]{2})?/, '') || '/'
}

function isActiveRoute(href: string, pathname: string): boolean {
  const pathWithoutLocale = getPathWithoutLocale(pathname)

  if (href === '/admin') {
    return pathWithoutLocale === '/admin' || pathWithoutLocale.endsWith('/admin')
  }
  return pathWithoutLocale.startsWith(href)
}

interface NavigationItemProps {
  item: NavigationItem
  collapsed: boolean
  pathname: string
}

const getButtonClasses = (collapsed: boolean, isActive: boolean): string => {
  return cn(
    'w-full justify-start h-10 px-3',
    collapsed ? 'px-2' : 'px-3',
    isActive && 'bg-primary/10 text-primary border-r-2 border-primary'
  )
}

const getIconClasses = (collapsed: boolean): string => {
  return cn('h-4 w-4 shrink-0', collapsed ? 'mr-0' : 'mr-3')
}

function NavigationItemComponent({ item, collapsed, pathname }: NavigationItemProps): JSX.Element {
  const isActive = isActiveRoute(item.href, pathname)
  const Icon = item.icon

  return (
    <Link href={item.href}>
      <Button
        variant={isActive ? 'secondary' : 'ghost'}
        className={getButtonClasses(collapsed, isActive)}
        title={collapsed ? item.label : undefined}
      >
        <Icon className={getIconClasses(collapsed)} />

        {!collapsed && (
          <>
            <span className="flex-1 text-left">{item.label}</span>
            {Boolean(item.badge) && (
              <Badge variant={item.badgeVariant ?? 'secondary'} className="ml-auto text-xs">
                {item.badge}
              </Badge>
            )}
          </>
        )}
      </Button>
    </Link>
  )
}

function Navigation({ collapsed, pathname }: NavigationProps): JSX.Element {
  return (
    <nav className="flex-1 p-2 space-y-6 overflow-y-auto">
      {navigationSections.map((section, sectionIndex) => (
        <div key={section.title}>
          {!collapsed && (
            <h3 className="px-2 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {section.title}
            </h3>
          )}

          <div className="space-y-1">
            {section.items.map(item => (
              <NavigationItemComponent
                key={item.href}
                item={item}
                collapsed={collapsed}
                pathname={pathname}
              />
            ))}
          </div>

          {sectionIndex < navigationSections.length - 1 &&
            !collapsed &&
            Boolean(navigationSections.length > 1) && <Separator className="mt-4" />}
        </div>
      ))}
    </nav>
  )
}

export function Sidebar({ className }: SidebarProps): JSX.Element {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  const { organization } = useAuthStore()
  const { memberCount, isLoading: memberLoading } = useMemberCount()

  const currentOrg = organization ?? {
    id: '',
    name: 'Organização',
    slug: '',
    owner_id: '',
    is_active: true,
    max_members: '10',
    created_at: '',
    updated_at: '',
    tier: 'free',
  }

  const toggleCollapsed = (): void => {
    setCollapsed(!collapsed)
  }

  return (
    <div
      className={cn(
        'bg-background border-r border-border flex flex-col transition-all duration-200',
        collapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      <SidebarHeader collapsed={collapsed} toggleCollapsed={toggleCollapsed} />
      <QuickAction collapsed={collapsed} />
      <Navigation collapsed={collapsed} pathname={pathname} />
      <SidebarFooter
        collapsed={collapsed}
        currentOrg={currentOrg}
        memberCount={memberCount}
        memberLoading={memberLoading}
      />
    </div>
  )
}
