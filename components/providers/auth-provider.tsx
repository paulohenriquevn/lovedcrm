'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

import { QueryProvider } from '@/components/providers/query-provider'
import { useAuthStore } from '@/stores/auth'

interface AuthProviderProps {
  children: React.ReactNode
}

// Routes where AuthProvider should NOT try to load user data
const AUTH_ROUTES = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',
]

// Helper function to check if user should be loaded
function shouldLoadUser(user: unknown, isAuthenticated: boolean): boolean {
  // Se já tem usuário, não precisa recarregar
  // Se explicitamente não autenticado (após logout), não recarregar
  return !(user !== null && user !== undefined) && !(isAuthenticated === false && user === null)
}

// Helper function to handle user authentication
async function handleUserAuth(authActions: {
  setUser: (user: unknown) => void
  setIsAuthenticated: (auth: boolean) => void
  setLoading: (loading: boolean) => void
}): Promise<void> {
  authActions.setLoading(true)

  try {
    // Using authService for consistent API calls
    const { authService } = await import('@/services/auth')
    const userData = await authService.getCurrentUser()

    if (userData !== null && userData !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
      authActions.setUser(userData as any)
      authActions.setIsAuthenticated(true)
    } else {
      // Sem dados do usuário válidos
      authActions.setUser(null)
      authActions.setIsAuthenticated(false)
    }
  } catch {
    authActions.setUser(null)
    authActions.setIsAuthenticated(false)
  } finally {
    authActions.setLoading(false)
  }
}

export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  const pathname = usePathname()
  const { user, setUser, setIsAuthenticated, setLoading, isAuthenticated } = useAuthStore()

  useEffect(() => {
    // Skip user loading on auth pages to prevent redirect loops
    if (AUTH_ROUTES.some(route => pathname.startsWith(route))) {
      return
    }

    if (shouldLoadUser(user, isAuthenticated)) {
      void handleUserAuth({ setUser, setIsAuthenticated, setLoading })
    }
  }, [pathname, user, setUser, setIsAuthenticated, setLoading, isAuthenticated])

  return <QueryProvider>{children}</QueryProvider>
}
