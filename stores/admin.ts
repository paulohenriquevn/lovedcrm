/**
 * Admin store using Zustand for admin dashboard state management.
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import type {
  AdminStats,
  SystemMetrics,
  AdminUser,
  AdminOrganization,
  AdminActivity,
} from '@/types/admin'

interface AdminState {
  // Estado
  stats: AdminStats | null
  metrics: SystemMetrics | null
  users: AdminUser[]
  organizations: AdminOrganization[]
  activities: AdminActivity[]
  recentActivities: AdminActivity[]
  isLoading: boolean
  error: string | null

  // Ações
  setStats: (stats: AdminStats | null) => void
  setMetrics: (metrics: SystemMetrics | null) => void
  setUsers: (users: AdminUser[]) => void
  setOrganizations: (organizations: AdminOrganization[]) => void
  setActivities: (activities: AdminActivity[]) => void
  setRecentActivities: (activities: AdminActivity[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  updateUserInList: (userId: string, updates: Partial<AdminUser>) => void
  updateOrganizationInList: (orgId: string, updates: Partial<AdminOrganization>) => void
  clearData: () => void
}

const initialState = {
  stats: null,
  metrics: null,
  users: [],
  organizations: [],
  activities: [],
  recentActivities: [],
  isLoading: false,
  error: null,
}

export const useAdminStore = create<AdminState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setStats: stats => set({ stats }),
      setMetrics: metrics => set({ metrics }),
      setUsers: users => set({ users }),
      setOrganizations: organizations => set({ organizations }),
      setActivities: activities => set({ activities }),
      setRecentActivities: recentActivities => set({ recentActivities }),
      setLoading: isLoading => set({ isLoading }),
      setError: error => set({ error }),

      updateUserInList: (userId, updates) => {
        const { users } = get()
        const updatedUsers = users.map(user =>
          user.id === userId ? { ...user, ...updates } : user
        )
        set({ users: updatedUsers })
      },

      updateOrganizationInList: (orgId, updates) => {
        const { organizations } = get()
        const updatedOrganizations = organizations.map(org =>
          org.id === orgId ? { ...org, ...updates } : org
        )
        set({ organizations: updatedOrganizations })
      },

      clearData: () => set(initialState),
    }),
    { name: 'admin-store' }
  )
)

// Alias for backward compatibility
export const useDashboardStore = useAdminStore
