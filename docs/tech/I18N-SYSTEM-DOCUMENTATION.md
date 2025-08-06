# i18n System - Complete Guide & Examples

**Production-ready internationalization** with next-intl supporting 3 languages and 450+ translations.

> **STATUS**: Fully operational with English, Portuguese, Spanish  
> **UNIFIED**: Complete system documentation with practical examples

## **Quick Implementation**

```bash
# All routes follow [locale]/ pattern
/en/admin/dashboard  # English
/pt/admin/dashboard  # Portuguese
/es/admin/dashboard  # Spanish
```

**Key Features**:

- **3 Languages**: English (default), Portuguese, Spanish
- **450+ Translations**: Complete system coverage
- **Route-based Localization**: `[locale]/` structure
- **SEO Optimized**: Localized URLs and meta tags

## **System Architecture**

**File Structure**

```
app/[locale]/           # Localized routes
├── auth/              # Authentication pages
├── admin/             # Admin dashboard
│   ├── team/          # Team management
│   └── settings/      # Organization settings

messages/              # Translation files
├── en.json           # English (default)
├── pt.json           # Portuguese
└── es.json           # Spanish

middleware.ts         # i18n routing
next.config.js        # Next.js config
```

**Configuration**

```typescript
// middleware.ts - Route localization
export default createMiddleware({
  locales: ["en", "pt", "es"],
  defaultLocale: "en",
  localePrefix: "always",
})

// i18n.ts - Message loading
export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`./messages/${locale}.json`)).default,
}))

// next.config.js - Plugin setup
module.exports = withNextIntl(nextConfig)
```

## **Translation Structure**

**Hierarchical Organization** (en.json, pt.json, es.json)

```json
{
  "common": {
    "loading": "Loading...",
    "save": "Save",
    "cancel": "Cancel"
  },
  "auth": {
    "login": {
      "title": "Sign In",
      "email": "Email"
    }
  },
  "admin": {
    "dashboard": {
      "title": "Dashboard",
      "quickActions": "Quick Actions"
    }
  }
}
```

**Translation Coverage**
| Section | Keys | Coverage |
|---------|------|----------|
| `common` | 50+ | Buttons, states, features |
| `auth` | 80+ | Complete authentication |
| `admin` | 60+ | Admin dashboard |
| `team` | 40+ | Team management |
| `form` | 30+ | Validations |
| **TOTAL** | **450+** | **Complete system** |

## **Implementation**

**Core Hooks & Advanced Usage**

```typescript
import { useTranslations, useLocale } from 'next-intl'
import { useLocale as useAdvancedLocale } from '@/hooks/use-locale'

function MyComponent() {
  const t = useTranslations('auth.login')
  const locale = useLocale() // 'en', 'pt', 'es'

  // Advanced locale hook with formatting
  const {
    localeInfo,       // { name, flag, dir, currency }
    isRTL,           // boolean
    direction,       // 'ltr' | 'rtl'
    formatCurrency,  // (amount: number) => string
    formatDate       // (date: Date) => string
  } = useAdvancedLocale()

  return (
    <div dir={direction}>
      <h1>{t('title')}</h1>
      <p>Current: {localeInfo.flag} {localeInfo.name}</p>
      <p>Price: {formatCurrency(29.99)}</p>
      <Link href={`/${locale}/dashboard`}>Dashboard</Link>
    </div>
  )
}
```

**Translation Helpers**

```typescript
import { useTranslationHelpers } from '@/hooks/use-locale'

function MyForm() {
  const {
    tCommon,      // useTranslations('common')
    tError,       // useTranslations('error')
    tForm,        // useTranslations('form')
    loading,      // tCommon('loading')
    save,         // tCommon('save')
    required      // tForm('required')
  } = useTranslationHelpers()

  return (
    <form>
      <label>{tForm('email')} *</label>
      <input required />
      <small>{required}</small>
      <button>{save}</button>
    </form>
  )
}
```

**Server vs Client Components**

```typescript
// Server Component (default)
export default function AdminPage() {
  const t = useTranslations('admin.dashboard')
  return <h1>{t('title')}</h1>
}

// Client Component
'use client'
export default function LoginForm() {
  const t = useTranslations('auth.login')
  return <input placeholder={t('email')} />
}

// Generate static params for all locales
export function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'pt' },
    { locale: 'es' }
  ]
}
```

**Localized Navigation**

```typescript
// Localized Link Component
function NavLink({ href, children }) {
  const locale = useLocale()
  return <Link href={`/${locale}${href}`}>{children}</Link>
}

// Programmatic Navigation
function useLocalizedNavigation() {
  const router = useRouter()
  const locale = useLocale()

  return {
    push: (href: string) => router.push(`/${locale}${href}`)
  }
}

// Usage
<NavLink href="/admin/team">Team</NavLink> // -> /en/admin/team
const { push } = useLocalizedNavigation()
push('/admin/settings') // -> /en/admin/settings
```

## **Store Integration & Number Formatting**

**AuthStore with i18n**

```typescript
import { useAuthStore } from '@/stores/auth'

function UserSettings() {
  const {
    user,
    userLocale,
    updateUserLanguage,
    getUserPreferredLocale
  } = useAuthStore()

  const handleLanguageChange = async (locale: Locale) => {
    try {
      await updateUserLanguage(locale)
      // Language updated in backend and localStorage
    } catch (error) {
      console.error('Failed to update language:', error)
    }
  }

  return (
    <div>
      <p>User language: {user?.language}</p>
      <p>Stored locale: {userLocale}</p>
      <LanguageSelector onLocaleChange={handleLanguageChange} />
    </div>
  )
}
```

**Number Formatting**

```typescript
import { useNumberFormatting } from '@/hooks/use-locale'

function PriceDisplay({ amount }: { amount: number }) {
  const { formatCurrency, formatPercent, formatCompactNumber } = useNumberFormatting()

  return (
    <div>
      <p>Price: {formatCurrency(amount)}</p>
      <p>Growth: {formatPercent(0.15)}</p>
      <p>Users: {formatCompactNumber(1500)}</p>
    </div>
  )
}
```

## **Language Selector**

```typescript
'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const languages = [
  { code: 'en', name: 'English', flag: 'EN' },
  { code: 'pt', name: 'Português', flag: 'PT' },
  { code: 'es', name: 'Español', flag: 'ES' },
]

export function LanguageSelector() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const handleChange = (newLocale: string) => {
    const path = pathname.replace(`/${locale}`, '') || '/'
    router.push(`/${newLocale}${path}`)
  }

  return (
    <Select value={locale} onValueChange={handleChange}>
      <SelectTrigger className="w-[140px]">
        <SelectValue>
          {languages.find(lang => lang.code === locale)?.flag}
          {languages.find(lang => lang.code === locale)?.name}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
```

## **Routing System**

**URL Structure**

```
Page           English             Portuguese          Spanish
Homepage       /en                 /pt                 /es
Login          /en/auth/login      /pt/auth/login      /es/auth/login
Dashboard      /en/admin           /pt/admin           /es/admin
Team           /en/admin/team      /pt/admin/team      /es/admin/team
```

**Automatic Redirects**

- Root `/` -> `/en` (default locale)
- Browser detection -> preferred locale
- Invalid locale -> fallback to English

## **Advanced Configuration**

**Custom Middleware**

```typescript
const intlMiddleware = createMiddleware({
  locales: ["en", "pt", "es"],
  defaultLocale: "en",
})

export default function middleware(req: NextRequest) {
  // Custom logic before i18n
  const response = intlMiddleware(req)
  // Custom logic after i18n
  return response
}
```

**Locale Validation**

```typescript
export function isValidLocale(locale: string): locale is "en" | "pt" | "es" {
  return ["en", "pt", "es"].includes(locale)
}

export function getValidLocale(locale: string) {
  return isValidLocale(locale) ? locale : "en"
}
```

**Server-Side Translations**

```typescript
import { getTranslations } from 'next-intl/server'

export default async function Page({ params: { locale } }) {
  const t = await getTranslations({ locale, namespace: 'admin' })
  return <h1>{t('title')}</h1>
}
```

## **i18n Components**

**Conditional Navigation**

```typescript
export function ConditionalNavbar() {
  const pathname = usePathname()
  const isAdminRoute = pathname.includes('/admin')
  const isAuthRoute = pathname.includes('/auth')

  if (isAdminRoute || isAuthRoute) return null
  return <Navbar />
}
```

**Localized Error Boundary**

```typescript
export function ErrorBoundary({ error }: { error: Error }) {
  const t = useTranslations('error')
  return (
    <div className="error-container">
      <h2>{t('title')}</h2>
      <p>{t('generic')}</p>
    </div>
  )
}
```

## **Testing**

**Unit Tests**

```typescript
import { render } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'

test('renders with translations', () => {
  render(
    <NextIntlClientProvider locale="en" messages={{ title: 'Test' }}>
      <Component />
    </NextIntlClientProvider>
  )
})
```

**E2E Tests**

```typescript
// playwright.config.ts
export default {
  projects: [
    {
      name: "english",
      use: { baseURL: "http://localhost:3000/en" },
    },
    {
      name: "portuguese",
      use: { baseURL: "http://localhost:3000/pt" },
    },
  ],
}
```

## **Performance**

**Bundle Optimization**

```typescript
// Specific imports
import { useTranslations } from "next-intl"

// Avoid full imports
import * as NextIntl from "next-intl"

// Namespace loading
const t = useTranslations("admin.dashboard") // Only loads this namespace
```

**Static Generation**

```typescript
export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "pt" }, { locale: "es" }]
}
```

**Bundle Impact**

- next-intl: ~15KB gzipped
- Translation files: ~8KB per language
- Total: ~39KB for 3 languages

## **Troubleshooting**

**Common Issues**

1. **Missing locale import**

   ```typescript
   // Missing import
   const locale = useLocale()

   // Correct import
   import { useLocale } from "next-intl"
   ```

2. **Translation not found**

   ```typescript
   // Non-existent key
   t("nonexistent.key") // Returns key as string

   // Check translation file
   // Ensure key exists in messages/en.json
   ```

3. **404 in production**
   ```typescript
   // Ensure middleware config
   export const config = {
     matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
   }
   ```

**Debug Mode**

```typescript
// Enable detailed logs
const nextConfig = {
  env: { NEXT_INTL_DEBUG: "true" },
}
```

## **Deployment**

**Build Process**

```bash
npm run build  # Generates static pages for all locales

# Structure:
# .next/static/chunks/pages/en/
# .next/static/chunks/pages/pt/
# .next/static/chunks/pages/es/
```

## **Resources**

**Official Documentation**

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Next.js i18n Guide](https://nextjs.org/docs/advanced-features/i18n)
- [ICU Message Format](https://formatjs.io/docs/core-concepts/icu-syntax/)

**Tools**

- **Crowdin**: Collaborative translation platform
- **i18n Ally**: VSCode extension for managing translations
- **Locize**: Translation management platform

## **Future Roadmap**

**Planned Features**

- RTL Support (Arabic)
- Advanced pluralization
- Date/number formatting
- Currency display by region
- Translation management interface

**Future Languages**

- French (fr) - European market
- German (de) - DACH market
- Italian (it) - Italian market
- Arabic (ar) - MENA market (requires RTL)

## **Complete Implementation Example**

```tsx
"use client"

import { useTranslations } from "next-intl"
import { FullLanguageSelector } from "@/components/ui/language-selector"
import { useLocale, useNumberFormatting } from "@/hooks/use-locale"

export default function I18nDemo() {
  const t = useTranslations("common")
  const { locale, localeInfo, isRTL } = useLocale()
  const { formatCurrency, formatPercent } = useNumberFormatting()

  return (
    <div className="p-6 space-y-4" dir={isRTL ? "rtl" : "ltr"}>
      <h1 className="text-2xl font-bold">
        {t("dashboard")} - {localeInfo.flag} {localeInfo.name}
      </h1>

      <div className="space-y-2">
        <p>Locale: {locale}</p>
        <p>Direction: {isRTL ? "RTL" : "LTR"}</p>
        <p>Price: {formatCurrency(99.99)}</p>
        <p>Growth: {formatPercent(0.15)}</p>
      </div>

      <FullLanguageSelector />
    </div>
  )
}
```

**Usage in different scenarios:**

```tsx
// Component with pluralization
function UserCount({ count }: { count: number }) {
  const t = useTranslations("dashboard")
  return <p>{t("stats.users", { count })}</p>
}

// Form with validation
function ContactForm() {
  const { tForm, tError, save, required } = useTranslationHelpers()
  return (
    <form>
      <label>{tForm("email")} *</label>
      <input required />
      <small>{required}</small>
      <button>{save}</button>
    </form>
  )
}

// Navigation with locale
function AdminNav() {
  const { push } = useLocalizedNavigation()
  return (
    <nav>
      <button onClick={() => push("/admin/team")}>Team</button>
    </nav>
  )
}
```

---

## **Production Status**

**FULLY OPERATIONAL SYSTEM**

- **3 Languages**: English, Portuguese, Spanish
- **450+ Translations**: Complete system coverage
- **[locale]/ Routing**: All routes localized
- **Component Integration**: All using translations
- **SEO**: Localized URLs and meta tags
- **Language Switching**: Working selector
- **Performance**: Production optimized
- **Testing**: Complete test support

> **Ready for production** - Easily expandable to new languages!
