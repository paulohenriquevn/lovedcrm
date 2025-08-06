/**
 * Hook for localized navigation
 * Automatically includes current locale in navigation paths
 */

import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'

export function useLocalizedRouter() {
  const router = useRouter()
  const locale = useLocale()

  const push = (path: string) => {
    const localizedPath = path.startsWith('/') ? `/${locale}${path}` : `/${locale}/${path}`
    router.push(localizedPath)
  }

  const replace = (path: string) => {
    const localizedPath = path.startsWith('/') ? `/${locale}${path}` : `/${locale}/${path}`
    router.replace(localizedPath)
  }

  const createLocalizedPath = (path: string) => {
    return path.startsWith('/') ? `/${locale}${path}` : `/${locale}/${path}`
  }

  return {
    ...router,
    push,
    replace,
    createLocalizedPath,
    locale,
  }
}
