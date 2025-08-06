/**
 * Service do dashboard.
 */

import { BaseService } from './base'

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

interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    color?: string
  }[]
}

class DashboardService extends BaseService {
  /**
   * Obtém estatísticas do dashboard.
   */
  async getStats(): Promise<DashboardStats> {
    return this.get<DashboardStats>('/api/admin/stats')
  }

  /**
   * Obtém atividades recentes.
   */
  async getRecentActivities(limit: number = 10): Promise<Activity[]> {
    return this.get<Activity[]>(`/api/admin/activities?limit=${limit}`)
  }

  /**
   * Obtém dados para gráfico de receita.
   */
  async getRevenueChart(period: 'week' | 'month' | 'year' = 'month'): Promise<ChartData> {
    return this.get<ChartData>(`/api/admin/charts/revenue?period=${period}`)
  }

  /**
   * Obtém dados para gráfico de usuários.
   */
  async getUserGrowthChart(period: 'week' | 'month' | 'year' = 'month'): Promise<ChartData> {
    return this.get<ChartData>(`/api/admin/charts/users?period=${period}`)
  }

  /**
   * Obtém métricas de performance.
   */
  async getPerformanceMetrics(): Promise<{
    responseTime: number
    uptime: number
    errorRate: number
    requestsPerMinute: number
  }> {
    return this.get('/api/admin/metrics/performance')
  }
}

export const dashboardService = new DashboardService()
