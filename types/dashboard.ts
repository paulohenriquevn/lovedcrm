/**
 * Dashboard types and interfaces
 */

import type { ComponentType } from 'react'

export interface DashboardStats {
  totalUsers: number
  activeUsers: number
  totalRevenue: number
  monthlyRevenue: number
  totalOrganizations: number
  newSignups: number
  conversionRate: number
  churnRate: number
}

export interface StatCard {
  title: string
  value: string | number
  change: number
  icon: ComponentType<{ className?: string }>
  color: string
}

export interface Activity {
  id: string
  type: 'user_signup' | 'payment' | 'subscription' | 'organization'
  title: string
  description: string
  timestamp: string
  metadata?: Record<string, unknown>
}

export interface RecentActivity {
  id: string
  type: 'user_signup' | 'subscription' | 'payment' | 'support'
  description: string
  timestamp: string
  user?: {
    id: string
    name: string
    email: string
  }
}

export interface DashboardData {
  stats: DashboardStats
  recentActivities: RecentActivity[]
}
