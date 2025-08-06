'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import * as React from 'react'

import { Icons } from '@/components/icons'
import { cn } from '@/lib/utils'

function NavLink({
  href,
  pathname,
  children,
}: {
  href: string
  pathname: string
  children: React.ReactNode
}): JSX.Element {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary',
        pathname === href && 'text-foreground'
      )}
    >
      {children}
    </Link>
  )
}

export function MainNav(): JSX.Element {
  const pathname = usePathname()

  return (
    <div className="flex items-center">
      <div className="mr-4">
        <Link href="/" className="flex items-center space-x-2">
          <Icons.Logo className="h-6 w-6" />
          <span className="hidden sm:inline-block font-bold">SaaS Starter</span>
        </Link>
      </div>
      <nav className="hidden md:flex items-center gap-6 ml-8">
        <NavLink href="/docs" pathname={pathname}>
          Docs
        </NavLink>
        <NavLink href="/pricing" pathname={pathname}>
          Pricing
        </NavLink>
        <NavLink href="/features" pathname={pathname}>
          Features
        </NavLink>
        <NavLink href="/about" pathname={pathname}>
          About
        </NavLink>
      </nav>
    </div>
  )
}
