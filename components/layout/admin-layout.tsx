'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import * as React from 'react'

import { useOrgContext } from '@/hooks/use-org-context'
import { useSaasMode } from '@/hooks/use-saas-mode'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth'
import { useSidebarStore } from '@/stores/sidebar'

import { AdminBreadcrumbs } from './admin-breadcrumbs'
import { AdminSearch } from './admin-search'
import { AdminSidebar, MobileSidebar } from './admin-sidebar'
import { UserDropdownMenu } from './admin-user-menu'
import { LanguageSelector } from '../common/language-selector'
import { ThemeToggle } from '../navigation/theme-toggle'

interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
}

interface AdminLayoutProps {
  children: React.ReactNode
}

// Loading spinner component
function LoadingSpinner(): JSX.Element {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  )
}

// Organization error component
function OrganizationError({
  error,
  onRetry,
}: {
  error: string
  onRetry: () => void
}): JSX.Element {
  const tError = useTranslations('error')

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="max-w-md w-full mx-auto p-6 text-center space-y-4">
        <div className="w-16 h-16 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-destructive"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold">{tError('organizationError.title')}</h2>
        <p className="text-sm text-muted-foreground">{error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          {tError('organizationError.tryAgain')}
        </button>
      </div>
    </div>
  )
}

// Organization info component
function OrganizationInfo({ organization }: { organization: { name: string } }): JSX.Element {
  return (
    <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-background rounded-md border">
      <svg
        className="w-4 h-4 text-muted-foreground"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
      <span className="text-sm font-medium truncate max-w-32" title={organization.name}>
        {organization.name}
      </span>
    </div>
  )
}

export function AdminLayout({ children }: AdminLayoutProps): JSX.Element {
  const { user, logout } = useAuthStore()
  const { isCollapsed } = useSidebarStore()
  const { organization, isOrgLoaded, orgError, clearOrgError } = useOrgContext()
  const { isB2B } = useSaasMode()
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = React.useCallback(async (): Promise<void> => {
    try {
      await logout()
      router.push('/')
    } catch {
      router.push('/')
    }
  }, [logout, router])

  if (!user || !isOrgLoaded) {
    return <LoadingSpinner />
  }

  if (orgError !== null) {
    return <OrganizationError error={orgError} onRetry={clearOrgError} />
  }

  return (
    <div
      className={cn(
        'grid min-h-screen w-full transition-all duration-300 ease-in-out',
        isCollapsed
          ? 'md:grid-cols-[60px_1fr]'
          : 'md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]'
      )}
    >
      <AdminSidebar />
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <MobileSidebar />
          <div className="flex-1 flex items-center gap-4">
            <AdminBreadcrumbs pathname={pathname} />
            <div className="hidden md:block">
              <AdminSearch />
            </div>
          </div>
          <div className="flex items-center gap-4">
            {organization !== null && isB2B === true && (
              <OrganizationInfo organization={organization} />
            )}
            <LanguageSelector
              variant="dropdown"
              size="sm"
              showFlag
              showName
              className="text-foreground"
            />
            <ThemeToggle />
            <UserDropdownMenu user={user as User} onLogout={handleLogout} />
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
