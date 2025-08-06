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
  Target
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useMemberCount } from '@/hooks/use-member-count'
import { cn } from '@/lib/utils'

// Hooks para dados reais
import { useAuthStore } from '@/stores/auth'


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
        description: 'Visão geral da agência'
      },
      {
        label: 'CRM',
        href: '/admin/crm',
        icon: Kanban,
        badge: 'BETA',
        badgeVariant: 'outline',
        description: 'Sistema de gestão de clientes'
      }
    ]
  },
  {
    title: 'Gestão',
    items: [
      {
        label: 'Equipe',
        href: '/admin/team',
        icon: Users,
        description: 'Gerenciar membros da organização'
      },
      {
        label: 'Faturamento',
        href: '/admin/billing',
        icon: BarChart3,
        description: 'Planos e pagamentos'
      }
    ]
  },
  {
    title: 'Configurações',
    items: [
      {
        label: 'Perfil',
        href: '/admin/profile',
        icon: User,
        description: 'Seu perfil pessoal'
      },
      {
        label: 'Configurações',
        href: '/admin/settings',
        icon: Settings,
        description: 'Configurações da organização'
      }
    ]
  }
]

export function Sidebar({ className }: SidebarProps): JSX.Element {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  // Hooks para dados reais
  const { organization } = useAuthStore()
  const { memberCount, isLoading: memberLoading } = useMemberCount()

  // Fallbacks para dados de loading
  const currentOrg = organization || {
    id: '',
    name: 'Organização',
    tier: 'free',
    owner_id: '',
    created_at: '',
    updated_at: ''
  }

  const toggleCollapsed = (): void => {
    setCollapsed(!collapsed)
  }

  const isActiveRoute = (href: string): boolean => {
    // Remove locale prefix from pathname for comparison
    const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}(?:-[A-Z]{2})?/, '') || '/'
    
    if (href === '/admin') {
      return pathWithoutLocale === '/admin' || pathWithoutLocale.endsWith('/admin')
    }
    return pathWithoutLocale.startsWith(href)
  }

  return (
    <div className={cn(
      "bg-background border-r border-border flex flex-col transition-all duration-200",
      collapsed ? "w-16" : "w-64",
      className
    )}>
      
      {/* Header */}
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
          
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleCollapsed}
            className="h-8 w-8 shrink-0"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
            <span className="sr-only">
              {collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
            </span>
          </Button>
        </div>
      </div>

      {/* Quick Action */}
      {!collapsed && (
        <div className="p-4">
          <Button className="w-full" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Novo Lead
          </Button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-6 overflow-y-auto">
        {navigationSections.map((section, sectionIndex) => (
          <div key={section.title}>
            {!collapsed && (
              <h3 className="px-2 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {section.title}
              </h3>
            )}
            
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = isActiveRoute(item.href)
                const Icon = item.icon
                
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start h-10 px-3",
                        collapsed ? "px-2" : "px-3",
                        isActive && "bg-primary/10 text-primary border-r-2 border-primary"
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon className={cn(
                        "h-4 w-4 shrink-0",
                        collapsed ? "mr-0" : "mr-3"
                      )} />
                      
                      {!collapsed && (
                        <>
                          <span className="flex-1 text-left">{item.label}</span>
                          {Boolean(item.badge) && (
                            <Badge 
                              variant={item.badgeVariant ?? "secondary"} 
                              className="ml-auto text-xs"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </>
                      )}
                    </Button>
                  </Link>
                )
              })}
            </div>
            
            {sectionIndex < navigationSections.length - 1 && !collapsed && Boolean(navigationSections.length > 1) && (
              <Separator className="mt-4" />
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        {!collapsed && (
          <div className="space-y-2">
            {/* Organization Status */}
            <div className="bg-violet-50 rounded-lg p-3 border border-violet-200">
              <div className="flex items-center gap-2 mb-1">
                <div className="h-2 w-2 bg-violet-500 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-violet-700">
                  Organização Ativa
                </span>
              </div>
              <p className="text-xs text-violet-600 truncate">
                {currentOrg.name}
              </p>
              <p className="text-xs text-violet-500">
                {memberLoading ? '...' : memberCount} membros conectados
              </p>
            </div>

            {/* Plan Status */}
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium">Plano {(currentOrg.tier || 'free').charAt(0).toUpperCase() + (currentOrg.tier || 'free').slice(1)}</span>
                <Badge variant="secondary" className="text-xs">
                  Ativo
                </Badge>
              </div>
              <div className="w-full bg-muted rounded-full h-2 mb-1">
                <div className="bg-primary h-2 rounded-full w-3/4" />
              </div>
              <p className="text-xs text-muted-foreground">
                Funcionalidades disponíveis
              </p>
            </div>
          </div>
        )}
        
        {collapsed ? <div className="flex flex-col items-center space-y-2">
            <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
            <Badge variant="secondary" className="text-xs rotate-90 whitespace-nowrap">
              {(currentOrg.tier || 'FREE').slice(0, 3).toUpperCase()}
            </Badge>
          </div> : null}
      </div>
    </div>
  )
}