'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'

import { useAuthStore } from '@/stores/auth'

interface AuthGuardProps {
  children: React.ReactNode
}

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password', 
  '/auth/reset-password',
  '/auth/verify-email',
  // Add other public routes like landing page, pricing, etc.
]

// Routes that require authentication
const PROTECTED_ROUTES = [
  '/admin',
]

// Helper function to check if route is public
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => pathname.startsWith(route))
}

// Helper function to check if route is protected
function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => pathname.includes(route))
}

// Loading spinner component
function AuthLoadingSpinner(): JSX.Element {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  )
}

export function AuthGuard({ children }: AuthGuardProps): JSX.Element {
  const { user, isAuthenticated, loading } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Wait for auth state to load
    if (loading) {
      return
    }

    // Get pathname without locale for route matching
    const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}(?:-[A-Z]{2})?/, '') || '/'
    
    // If user is not authenticated and trying to access protected route
    if (!isAuthenticated && !user && isProtectedRoute(pathWithoutLocale)) {
      console.log('🚨 Unauthorized access attempt to:', pathWithoutLocale)
      // Redirect to login with return URL
      const returnUrl = encodeURIComponent(pathname)
      router.push(`/auth/login?returnUrl=${returnUrl}`)
      return
    }

    // If user is authenticated and trying to access auth pages, redirect to admin
    if (isAuthenticated && user && isPublicRoute(pathWithoutLocale)) {
      console.log('✅ Authenticated user accessing auth page, redirecting to admin')
      router.push('/admin')
      return
    }
  }, [user, isAuthenticated, loading, router, pathname])

  // Show loading spinner while auth state is being determined
  if (loading) {
    return <AuthLoadingSpinner />
  }

  // Get pathname without locale for route matching
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}(?:-[A-Z]{2})?/, '') || '/'

  // Block access to protected routes for unauthenticated users
  if (!isAuthenticated && !user && isProtectedRoute(pathWithoutLocale)) {
    return <AuthLoadingSpinner />
  }

  return <>{children}</>
}