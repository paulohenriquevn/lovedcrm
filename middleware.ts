import { NextResponse, NextRequest } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'

import { locales, defaultLocale } from '@/lib/i18n/config'

// Create i18n middleware with simplified configuration
const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always', // Always use locale prefix to avoid conflicts
})

/**
 * Simplified middleware - only handle i18n routing
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  // Handle i18n routing
  return intlMiddleware(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
