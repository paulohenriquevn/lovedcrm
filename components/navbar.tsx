'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Zap } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

import { LanguageSelector } from './common/language-selector'
import { MainNav } from './navigation/main-nav'
import { MobileNav } from './navigation/mobile-nav'
import { ThemeToggle } from './navigation/theme-toggle'
import { Badge } from './ui/badge'
import { Button } from './ui/button'

declare global {
  function gtag(...args: unknown[]): void
}

function handleCTAClick(action: string): void {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'navbar_cta_click', { action })
  }
}

function NavbarBrand(): JSX.Element {
  return (
    <motion.div 
      className="flex items-center gap-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <Link href="/" className="flex items-center gap-2 mr-8 hover:opacity-80 transition-opacity">
        <div className="h-8 w-8 bg-gradient-to-br from-violet-600 to-purple-600 rounded-lg flex items-center justify-center">
          <Zap className="h-4 w-4 text-white" />
        </div>
        <span className="font-bold text-lg text-foreground">Loved CRM</span>
        <Badge className="bg-violet-100 text-violet-700 border-violet-200 text-xs">
          BETA
        </Badge>
      </Link>
    </motion.div>
  )
}

function NavigationLinks(): JSX.Element {
  return (
    <nav className="hidden md:flex items-center space-x-6">
      <Link href="#funcionalidades" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
        Funcionalidades
      </Link>
      <Link href="#precos" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
        Preços
      </Link>
      <Link href="#depoimentos" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
        Depoimentos
      </Link>
      <Link href="#faq" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
        FAQ
      </Link>
    </nav>
  )
}

function CTAButtons(): JSX.Element {
  const tAuth = useTranslations('auth')
  
  return (
    <nav className="flex items-center space-x-3">
      <Link href="/auth/login">
        <Button 
          variant="ghost" 
          size="sm"
          className="text-muted-foreground hover:text-primary hover:bg-muted"
          onClick={() => handleCTAClick('login')}
        >
          {tAuth('login.title')}
        </Button>
      </Link>
      
      <Link href="/auth/register">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button 
            size="sm"
            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            onClick={() => handleCTAClick('register')}
          >
            {tAuth('register.title')}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      </Link>
      
      <div className="hidden sm:flex items-center space-x-2 ml-2 pl-2 border-l border-border">
        <LanguageSelector showFlag={false} showName={false} size="sm" />
        <ThemeToggle />
      </div>
    </nav>
  )
}

export function Navbar(): JSX.Element {
  return (
    <motion.header 
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 shadow-sm"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="container mx-auto px-4 flex h-16 items-center">
        <MainNav />
        <MobileNav />
        
        <NavbarBrand />

        <div className="flex flex-1 items-center justify-between space-x-4 md:justify-end">
          <NavigationLinks />
          <CTAButtons />
        </div>
      </div>
    </motion.header>
  )
}
