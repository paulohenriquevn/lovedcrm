import { createNavigation } from 'next-intl/navigation'

export const locales = ['en', 'pt', 'es'] as const
export const defaultLocale = 'en'

export const { Link, redirect, usePathname, useRouter } = createNavigation({ locales })
