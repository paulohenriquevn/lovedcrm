'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'

import { LanguageSelector } from './common/language-selector'
import { MainNav } from './navigation/main-nav'
import { MobileNav } from './navigation/mobile-nav'
import { ThemeToggle } from './navigation/theme-toggle'
import { Button } from './ui/button'

export function Navbar(): JSX.Element {
  const tAuth = useTranslations('auth')

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex h-14 items-center">
        <MainNav />
        <MobileNav />
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Search can be added here later */}
          </div>
          <nav className="flex items-center space-x-2">
            <Link href="/auth/login">
              <Button variant="ghost">{tAuth('login.title')}</Button>
            </Link>
            <Link href="/auth/register">
              <Button size="sm">{tAuth('register.title')}</Button>
            </Link>
            <LanguageSelector showFlag showName size="sm" />
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  )
}
