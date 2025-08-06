'use client'

import { ChevronRight, Home } from 'lucide-react'
import Link from 'next/link'
import * as React from 'react'

import { cn } from '@/lib/utils'

interface BreadcrumbItem {
  label: string
  href?: string | undefined
}

interface AdminBreadcrumbsProps {
  pathname: string
}

function getBreadcrumbItems(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length === 0 || segments[0] !== 'admin') {
    return []
  }

  const items: BreadcrumbItem[] = [{ label: 'Dashboard', href: '/admin' }]

  const pathMap: Record<string, string> = {
    team: 'Team',
    chat: 'Chat',
    billing: 'Billing',
    settings: 'Settings',
    profile: 'Profile',
    users: 'Users',
    organizations: 'Organizations',
    new: 'New',
    invite: 'Invite',
  }

  for (let i = 1; i < segments.length; i++) {
    const segment = segments[i] as string
    const label = pathMap[segment] ?? segment

    // Don't add href for the last item (current page)
    const href = i === segments.length - 1 ? undefined : `/${segments.slice(0, i + 1).join('/')}`

    items.push({ label, href })
  }

  return items
}

export function AdminBreadcrumbs({ pathname }: AdminBreadcrumbsProps): JSX.Element {
  const items = getBreadcrumbItems(pathname)

  if (items.length === 0) {
    return <div />
  }

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
      <Home className="h-4 w-4" />
      {items.map((item, index) => (
        <React.Fragment key={item.label}>
          <ChevronRight className="h-4 w-4" />
          {item.href !== undefined && item.href !== null && item.href.length > 0 ? (
            <Link
              href={item.href}
              className={cn(
                'hover:text-foreground transition-colors',
                index === items.length - 1 && 'text-foreground font-medium'
              )}
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}
