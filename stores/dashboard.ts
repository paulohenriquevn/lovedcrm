/**
 * Store do dashboard usando Zustand.
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface DashboardStats {
  totalUsers: number
  activeUsers: number
  totalRevenue: number
  monthlyRevenue: number
  totalOrganizations: number
  newSignups: number
  conversionRate: number
  churnRate: number
}

interface Activity {
  id: string
  type: 'user_signup' | 'payment' | 'subscription' | 'organization'
  title: string
  description: string
  timestamp: string
  metadata?: Record<string, any>
}

interface DashboardState {
  // Estado
  stats: DashboardStats | null
  recentActivities: Activity[]
  isLoading: boolean
  error: string | null
  lastUpdated: Date | null

  // Ações
  setStats: (stats: DashboardStats) => void
  setRecentActivities: (activities: Activity[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  updateStat: (key: keyof DashboardStats, value: number) => void
  addActivity: (activity: Activity) => void
  reset: () => void
}

const initialState = {
  stats: null,
  recentActivities: [],
  isLoading: false,
  error: null,
  lastUpdated: null,
}

export const useDashboardStore = create<DashboardState>()(
  devtools(
    set => ({
      ...initialState,

      // Ações
      setStats: stats =>
        set({
          stats,
          lastUpdated: new Date(),
        }),

      setRecentActivities: activities =>
        set({
          recentActivities: activities,
        }),

      setLoading: loading => set({ isLoading: loading }),

      setError: error => set({ error }),

      updateStat: (key, value) =>
        set(state => ({
          stats: state.stats
            ? {
                ...state.stats,
                [key]: value,
              }
            : null,
        })),

      addActivity: activity =>
        set(state => ({
          recentActivities: [activity, ...state.recentActivities].slice(0, 10),
        })),

      reset: () => set(initialState),
    }),
    {
      name: 'dashboard-store', // Nome para DevTools
    }
  )
)
