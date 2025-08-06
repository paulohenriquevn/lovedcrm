/**
 * Language Selector Component
 * Dropdown para seleção de idioma usando shadcn/ui + design tokens
 */

'use client'

import { Check, ChevronDown, Globe } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { type Locale, locales, localeConfig, getLocaleInfo } from '@/lib/i18n/config'
import { setStoredLocale } from '@/lib/i18n/utils'

// Common CSS classes
const LANGUAGE_BUTTON_BASE = 'px-3 py-2 rounded text-sm border'
const LANGUAGE_BUTTON_ACTIVE = 'bg-primary text-primary-foreground'
const LANGUAGE_BUTTON_INACTIVE = 'bg-background'

// Helper function to extract path without locale prefix
function extractPathWithoutLocale(pathname: string): string {
  const pathSegments = pathname.split('/').filter(Boolean)
  const isCurrentlyLocalized = locales.includes(pathSegments[0] as Locale)

  return isCurrentlyLocalized ? `/${pathSegments.slice(1).join('/')}` : pathname
}

// Helper function to create new path with locale
function createNewPathWithLocale(newLocale: Locale, pathWithoutLocale: string): string {
  return `/${newLocale}${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`
}

// Helper function to get the correct translation key for each locale
function getLanguageDisplayName(locale: Locale, t: (key: string) => string): string {
  const localeToKeyMap: Record<Locale, string> = {
    en: 'english',
    pt: 'portuguese',
    es: 'spanish',
  }
  return t(localeToKeyMap[locale])
}

// Helper function to render select variant
function renderSelectVariant(options: {
  locale: Locale
  currentLocaleInfo: { flag: string }
  showFlag: boolean
  showName: boolean
  className: string | undefined
  handleLocaleChange: (newLocale: Locale) => void
  t: (key: string) => string
}): JSX.Element {
  const { locale, currentLocaleInfo, showFlag, showName, className, handleLocaleChange, t } =
    options
  return (
    <Select value={locale} onValueChange={handleLocaleChange}>
      <SelectTrigger className={`h-9 w-[180px] ${className ?? ''}`}>
        <Globe className="h-4 w-4" />
        <SelectValue>
          <div className="flex items-center gap-2">
            {showFlag === true && <span className="text-base">{currentLocaleInfo.flag}</span>}
            {showName === true && (
              <span className="text-sm font-medium">{getLanguageDisplayName(locale, t)}</span>
            )}
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {Object.entries(localeConfig).map(([localeKey, config]) => (
          <SelectItem key={localeKey} value={localeKey}>
            <div className="flex items-center gap-2">
              {showFlag === true && <span className="text-base">{config.flag}</span>}
              {showName === true && (
                <span className="text-sm font-medium">
                  {getLanguageDisplayName(localeKey as Locale, t)}
                </span>
              )}
              {localeKey === locale && <Check className="h-4 w-4 text-primary" />}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

// Helper function to render dropdown variant
function renderDropdownVariant(options: {
  locale: Locale
  currentLocaleInfo: { flag: string }
  size: 'sm' | 'md' | 'lg'
  showFlag: boolean
  showName: boolean
  className: string | undefined
  handleLocaleChange: (newLocale: Locale) => void
  t: (key: string) => string
}): JSX.Element {
  const { locale, currentLocaleInfo, size, showFlag, showName, className, handleLocaleChange, t } =
    options
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={size === 'md' ? 'default' : size}
          className={`h-9 px-3 py-2 ${className ?? ''}`}
        >
          <Globe className="h-4 w-4" />
          {showFlag === true && <span className="text-base">{currentLocaleInfo.flag}</span>}
          {showName === true && (
            <span className="text-sm font-medium text-foreground">
              {getLanguageDisplayName(locale, t)}
            </span>
          )}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {Object.entries(localeConfig).map(([localeKey, config]) => (
          <DropdownMenuItem
            key={localeKey}
            onClick={() => handleLocaleChange(localeKey as Locale)}
            className="flex items-center gap-3 cursor-pointer py-2 px-3"
          >
            {showFlag === true && <span className="text-base">{config.flag}</span>}
            <div className="flex-1">
              {showName === true && (
                <span className="text-sm font-medium text-foreground">
                  {getLanguageDisplayName(localeKey as Locale, t)}
                </span>
              )}
            </div>
            {localeKey === locale && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

interface LanguageSelectorProps {
  variant?: 'select' | 'dropdown'
  size?: 'sm' | 'md' | 'lg'
  showFlag?: boolean
  showName?: boolean
  className?: string
  onLocaleChange?: (locale: Locale) => void
}

export function LanguageSelector({
  variant = 'dropdown',
  size = 'md',
  showFlag = true,
  showName = true,
  className,
  onLocaleChange,
}: LanguageSelectorProps): JSX.Element {
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale() as Locale
  const t = useTranslations('language')
  const currentLocaleInfo = getLocaleInfo(locale)

  const handleLocaleChange = React.useCallback(
    (newLocale: Locale) => {
      // Language selector clicked: { currentLocale: locale, newLocale, pathname }

      try {
        // Store in localStorage for persistence
        setStoredLocale(newLocale)

        // Call optional callback
        onLocaleChange?.(newLocale)

        // Extract path and create new locale path
        const pathWithoutLocale = extractPathWithoutLocale(pathname)
        const newPath = createNewPathWithLocale(newLocale, pathWithoutLocale)

        // Navigating to: newPath

        // Navigate to new locale - client components will update automatically
        router.push(newPath)
      } catch (error) {
        // Silently handle locale change errors
        void error
      }
    },
    [pathname, router, onLocaleChange]
  )

  if (variant === 'select') {
    return renderSelectVariant({
      locale,
      currentLocaleInfo,
      showFlag,
      showName,
      className,
      handleLocaleChange,
      t,
    })
  }

  return renderDropdownVariant({
    locale,
    currentLocaleInfo,
    size,
    showFlag,
    showName,
    className,
    handleLocaleChange,
    t,
  })
}

/**
 * Compact Language Selector - Only flag, no text
 */
export function CompactLanguageSelector({
  className,
  onLocaleChange,
}: Pick<LanguageSelectorProps, 'className' | 'onLocaleChange'>): JSX.Element {
  return (
    <LanguageSelector
      variant="dropdown"
      size="sm"
      showFlag
      showName={false}
      className={className}
      onLocaleChange={onLocaleChange}
    />
  )
}

/**
 * Full Language Selector - Flag + name
 */
export function FullLanguageSelector({
  className,
  onLocaleChange,
}: Pick<LanguageSelectorProps, 'className' | 'onLocaleChange'>): JSX.Element {
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale() as Locale

  const handleSimpleLocaleChange = (newLocale: Locale): void => {
    // Simple selector clicked: { currentLocale: locale, newLocale }

    // Extract path and create new locale path
    const pathWithoutLocale = extractPathWithoutLocale(pathname)
    const newPath = createNewPathWithLocale(newLocale, pathWithoutLocale)

    // Simple navigating to: newPath

    // Navigate to new locale - client components will update automatically
    router.push(newPath)
    onLocaleChange?.(newLocale)
  }

  return (
    <div className={`flex gap-2 ${className ?? ''}`}>
      <button
        type="button"
        onClick={() => handleSimpleLocaleChange('en')}
        className={`${LANGUAGE_BUTTON_BASE} ${locale === 'en' ? LANGUAGE_BUTTON_ACTIVE : LANGUAGE_BUTTON_INACTIVE}`}
      >
        🇺🇸 English
      </button>
      <button
        type="button"
        onClick={() => handleSimpleLocaleChange('pt')}
        className={`${LANGUAGE_BUTTON_BASE} ${locale === 'pt' ? LANGUAGE_BUTTON_ACTIVE : LANGUAGE_BUTTON_INACTIVE}`}
      >
        🇧🇷 Português
      </button>
      <button
        type="button"
        onClick={() => handleSimpleLocaleChange('es')}
        className={`${LANGUAGE_BUTTON_BASE} ${locale === 'es' ? LANGUAGE_BUTTON_ACTIVE : LANGUAGE_BUTTON_INACTIVE}`}
      >
        🇪🇸 Español
      </button>
    </div>
  )
}

/**
 * Language Selector for forms/settings
 */
export function FormLanguageSelector({
  className,
  onLocaleChange,
}: Pick<LanguageSelectorProps, 'className' | 'onLocaleChange'>): JSX.Element {
  return (
    <LanguageSelector
      variant="select"
      showFlag
      showName
      className={className}
      onLocaleChange={onLocaleChange}
    />
  )
}
