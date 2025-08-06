/**
 * Sidebar - Main Application Sidebar Navigation  
 * Sidebar principal com navegação CRM específica
 * Baseado na especificação do agente 09-ui-ux-designer.md
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Kanban,
  Users,
  Clock,
  MessageCircle,
  Mail,
  Phone,
  Sparkles,
  BarChart3,
  Settings,
  Zap,
  ChevronLeft,
  ChevronRight,
  Plus,
  Target
} from 'lucide-react'

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
    title: 'Core CRM',
    items: [
      {
        label: 'Dashboard',
        href: '/admin',
        icon: LayoutDashboard,
        description: 'Visão geral da agência'
      },
      {
        label: 'Pipeline',
        href: '/admin/pipeline',
        icon: Kanban,
        badge: '23',
        badgeVariant: 'default',
        description: 'Kanban de leads e negócios'
      },
      {
        label: 'Clientes',
        href: '/admin/clients',
        icon: Users,
        description: 'Base de clientes e contatos'
      },
      {
        label: 'Timeline',
        href: '/admin/timeline',
        icon: Clock,
        badge: '7',
        badgeVariant: 'secondary',
        description: 'Histórico de interações'
      }
    ]
  },
  {
    title: 'Comunicação',
    items: [
      {
        label: 'WhatsApp',
        href: '/admin/whatsapp',
        icon: MessageCircle,
        badge: '12',
        badgeVariant: 'default',
        description: 'Mensagens WhatsApp Business'
      },
      {
        label: 'Email',
        href: '/admin/email',
        icon: Mail,
        badge: '5',
        badgeVariant: 'secondary',
        description: 'Campanhas e comunicação por email'
      },
      {
        label: 'Chamadas',
        href: '/admin/voip',
        icon: Phone,
        description: 'VoIP e gravações de chamadas'
      }
    ]
  },
  {
    title: 'IA & Insights',
    items: [
      {
        label: 'Resumos IA',
        href: '/admin/ai-summaries',
        icon: Sparkles,
        badge: 'NOVO',
        badgeVariant: 'outline',
        description: 'Resumos automáticos com IA'
      },
      {
        label: 'Relatórios',
        href: '/admin/reports',
        icon: BarChart3,
        description: 'Analytics e métricas'
      }
    ]
  },
  {
    title: 'Configurações',
    items: [
      {
        label: 'Equipe',
        href: '/admin/team',
        icon: Users,
        description: 'Gerenciar membros da agência'
      },
      {
        label: 'Integrações',
        href: '/admin/integrations',
        icon: Zap,
        badge: '3',
        badgeVariant: 'secondary',
        description: 'APIs e conectores externos'
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

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  const toggleCollapsed = () => {
    setCollapsed(!collapsed)
  }

  const isActiveRoute = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin' || pathname.endsWith('/admin')
    }
    return pathname.startsWith(href)
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
                          {item.badge && (
                            <Badge 
                              variant={item.badgeVariant || "secondary"} 
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
            
            {sectionIndex < navigationSections.length - 1 && !collapsed && (
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
              <p className="text-xs text-violet-600">
                Silva Digital Agency
              </p>
              <p className="text-xs text-violet-500">
                12 membros conectados
              </p>
            </div>

            {/* Plan Status */}
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium">Plano Pro</span>
                <Badge variant="secondary" className="text-xs">
                  Ativo
                </Badge>
              </div>
              <div className="w-full bg-muted rounded-full h-2 mb-1">
                <div className="bg-primary h-2 rounded-full w-3/4"></div>
              </div>
              <p className="text-xs text-muted-foreground">
                1.250/2.000 leads este mês
              </p>
            </div>
          </div>
        )}
        
        {collapsed && (
          <div className="flex flex-col items-center space-y-2">
            <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
            <Badge variant="secondary" className="text-xs rotate-90 whitespace-nowrap">
              Pro
            </Badge>
          </div>
        )}
      </div>
    </div>
  )
}