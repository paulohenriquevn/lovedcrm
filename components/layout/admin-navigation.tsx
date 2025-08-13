'use client'

import { Home, CreditCard, Settings, Users } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'

import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { useSidebarStore } from '@/stores/sidebar'

interface NavigationItem {
  nameKey: string
  href: string
  icon: React.ComponentType<{ className?: string | undefined }>
}

const ADMIN_BASE_PATH = '/admin'

const NAV_LINK_CLASSES =
  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors'

const navigationItems: NavigationItem[] = [
  { nameKey: 'dashboard', href: ADMIN_BASE_PATH, icon: Home },
  { nameKey: 'team', href: `${ADMIN_BASE_PATH}/team`, icon: Users },
  { nameKey: 'billing', href: `${ADMIN_BASE_PATH}/billing`, icon: CreditCard },
  { nameKey: 'settings', href: `${ADMIN_BASE_PATH}/settings`, icon: Settings },
]

export function AdminNavigation(): JSX.Element {
  const pathname = usePathname()
  const { isCollapsed } = useSidebarStore()
  const tNav = useTranslations('navigation')

  return (
    <ScrollArea className="h-full">
      <TooltipProvider>
        <div className={cn('space-y-1', isCollapsed ? 'p-2' : 'p-4')}>
          {navigationItems
            .map(item => {
              const Icon = item.icon
              const isActive =
                pathname === item.href ||
                (item.href !== ADMIN_BASE_PATH && pathname.startsWith(item.href))

              const linkClasses = cn(
                NAV_LINK_CLASSES,
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                isCollapsed && 'justify-center px-2'
              )

              const itemName = tNav(item.nameKey)
              const linkContent = (
                <Link key={item.href} href={item.href} className={linkClasses}>
                  <Icon className="h-4 w-4" />
                  {!isCollapsed && <span>{itemName}</span>}
                </Link>
              )

              // Se collapsed, envolver com tooltip
              if (isCollapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{itemName}</p>
                    </TooltipContent>
                  </Tooltip>
                )
              }

              return linkContent
            })}
        </div>
      </TooltipProvider>
    </ScrollArea>
  )
}

export function MobileNavigation(): JSX.Element {
  const pathname = usePathname()
  const tNav = useTranslations('navigation')

  return (
    <div className="grid gap-2 p-4">
      {navigationItems
        .map(item => {
          const Icon = item.icon
          const isActive =
            pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {tNav(item.nameKey)}
            </Link>
          )
        })}
    </div>
  )
}
