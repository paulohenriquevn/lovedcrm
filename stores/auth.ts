/**
 * Auth store using Zustand for authentication state management.
 */

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

import type { User } from '@/types/user'
import { UserStatus } from '@/types/user'
import type { Organization } from '@/types/organization'
import { type Locale, defaultLocale } from '@/lib/i18n/config'
import { setStoredLocale } from '@/lib/i18n/utils'

export type { User }

interface AuthState {
  // Estado
  user: User | null
  organization: Organization | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // i18n preferences
  userLocale: Locale | null

  // Ações
  setUser: (user: User | null) => void
  setOrganization: (organization: Organization | null) => void
  setTokens: (token: string | null, refreshToken?: string | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setIsAuthenticated: (authenticated: boolean) => void
  login: (user: User, organization: Organization, token: string, refreshToken?: string) => void
  loginAsync: (email: string, password: string, recaptchaToken?: string) => Promise<void>
  registerAsync: (
    fullName: string,
    email: string,
    password: string,
    termsAccepted: boolean,
    recaptchaToken?: string
  ) => Promise<{ user: User; message: string }>
  logout: () => Promise<void>
  clearError: () => void
  updateUser: (updates: Partial<User>) => void

  // i18n actions
  setUserLocale: (locale: Locale) => void
  updateUserLanguage: (locale: Locale) => Promise<void>
  getUserPreferredLocale: () => Locale
}

const initialState = {
  user: null,
  organization: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  userLocale: null,
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Ações básicas
        setUser: user =>
          set(state => {
            // Extract user locale preference when setting user
            const userLocale = (user?.language as Locale) || null

            // Sync with localStorage if we have a valid locale
            if (userLocale) {
              setStoredLocale(userLocale)
            }

            return {
              user,
              userLocale,
              isAuthenticated: !!user,
            }
          }),

        setOrganization: organization =>
          set({
            organization,
          }),

        setTokens: (token, refreshToken) =>
          set({
            token,
            refreshToken: refreshToken || get().refreshToken,
            isAuthenticated: !!token,
          }),

        setLoading: loading => set({ isLoading: loading }),

        setError: error => set({ error }),

        setIsAuthenticated: authenticated => set({ isAuthenticated: authenticated }),

        clearError: () => set({ error: null }),

        // Ações complexas
        login: (user, organization, token, refreshToken) =>
          set({
            user,
            organization,
            token,
            refreshToken: refreshToken || null,
            isAuthenticated: true,
            error: null,
          }),

        loginAsync: async (email: string, password: string, recaptchaToken?: string) => {
          set({ isLoading: true, error: null })
          try {
            // Use authService for consistent API calls
            const { authService } = await import('../services/auth')
            const response = await authService.login({
              email,
              password,
              recaptcha_token: recaptchaToken,
            })

            console.log('Auth Store - Login response:', response)

            // Check if we got user data back
            if (response.user) {
              console.log('Auth Store - Setting authenticated state')

              // Ensure user has all required fields
              const typedUser: User = {
                ...response.user,
                status:
                  (response.user.status as UserStatus) ||
                  (response.user.is_active ? UserStatus.ACTIVE : UserStatus.INACTIVE),
                is_email_verified:
                  response.user.is_email_verified ?? response.user.is_verified ?? true,
              }

              // Ensure organization has all required fields
              const typedOrganization = response.organization
                ? {
                    ...response.organization,
                    updated_at: response.organization.updated_at || new Date().toISOString(),
                  }
                : null

              set({
                user: typedUser,
                organization: typedOrganization,
                token: response.access_token,
                refreshToken: response.refresh_token,
                isAuthenticated: true,
                isLoading: false,
                error: null,
              })
              console.log('Auth Store - State updated successfully')
            } else {
              console.error('Auth Store - No user in response')
              throw new Error('Invalid login response format')
            }
          } catch (error) {
            set({
              user: null,
              organization: null,
              token: null,
              refreshToken: null,
              isAuthenticated: false,
              isLoading: false,
              error: error instanceof Error ? error.message : 'Login failed',
            })
            throw error
          }
        },

        registerAsync: async (
          fullName: string,
          email: string,
          password: string,
          termsAccepted: boolean,
          recaptchaToken?: string
        ) => {
          set({ isLoading: true, error: null })
          try {
            // Use authService for consistent API calls
            const { authService } = await import('../services/auth')
            const response = await authService.register({
              full_name: fullName,
              email,
              password,
              terms_accepted: termsAccepted,
              recaptcha_token: recaptchaToken,
            })

            // Registration might not return tokens immediately (depending on email verification)
            // For now, just return the response and let the UI handle next steps
            set({
              isLoading: false,
              error: null,
            })

            return {
              ...response,
              user: {
                ...response.user,
                status: (response.user.status as UserStatus) ?? UserStatus.ACTIVE,
                is_email_verified:
                  response.user.is_email_verified ?? response.user.is_verified ?? false,
              },
            }
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Registration failed',
            })
            throw error
          }
        },

        logout: async () => {
          set({ isLoading: true })
          try {
            // Using authService for consistent API calls
            const { authService } = await import('../services/auth')
            await authService.logout()
          } catch (error) {
            // Continue com logout local mesmo se backend falhar
            console.warn('Backend logout failed:', error)
          } finally {
            // Limpar estado local
            set({
              ...initialState,
            })

            // Force clear localStorage (Zustand persist doesn't clear automatically)
            if (typeof window !== 'undefined') {
              localStorage.removeItem('auth-store')
              console.log('Auth store cleared from localStorage')
            }
          }
        },

        updateUser: updates =>
          set(state => {
            const updatedUser = state.user ? { ...state.user, ...updates } : null

            // If language was updated, sync locale state
            const userLocale = (updates.language as Locale) || state.userLocale
            if (updates.language && userLocale) {
              setStoredLocale(userLocale)
            }

            return {
              user: updatedUser,
              userLocale: updates.language ? (updates.language as Locale) : state.userLocale,
            }
          }),

        // i18n actions
        setUserLocale: (locale: Locale) =>
          set(state => {
            setStoredLocale(locale)
            return { userLocale: locale }
          }),

        updateUserLanguage: async (locale: Locale) => {
          const { user } = get()
          if (!user) {
            throw new Error('User not authenticated')
          }

          set({ isLoading: true, error: null })

          try {
            // Update user language in backend
            const { userService } = await import('../services/users')
            const updatedUser = await userService.updateProfile({ language: locale })

            // Update local state
            set(state => ({
              user: updatedUser,
              userLocale: locale,
              isLoading: false,
              error: null,
            }))

            // Sync with localStorage
            setStoredLocale(locale)
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to update language',
            })
            throw error
          }
        },

        getUserPreferredLocale: (): Locale => {
          const { user, userLocale } = get()

          // Priority: explicit userLocale > user.language > localStorage > default
          if (userLocale) return userLocale
          if (user?.language) return user.language as Locale

          // Fallback to stored locale or default
          const { getStoredLocale, getBrowserLocale } = require('@/lib/i18n/utils')
          return getStoredLocale() || getBrowserLocale() || defaultLocale
        },
      }),
      {
        name: 'auth-store',
        // Only persist user, organization and tokens, not loading/error states
        partialize: state => ({
          user: state.user,
          organization: state.organization,
          token: state.token,
          refreshToken: state.refreshToken,
          isAuthenticated: state.isAuthenticated,
          userLocale: state.userLocale,
        }),
      }
    ),
    {
      name: 'auth-store', // Nome para DevTools
    }
  )
)
