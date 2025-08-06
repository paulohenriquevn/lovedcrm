/**
 * Admin service for dashboard operations
 */

import { BaseService } from './base'
import type {
  AdminStats,
  SystemMetrics,
  AdminUser,
  AdminOrganization,
  AdminActivity,
} from '@/types/admin'

class AdminService extends BaseService {
  /**
   * Get admin dashboard stats
   */
  async getStats(): Promise<AdminStats> {
    return this.get<AdminStats>('/api/admin/stats')
  }

  /**
   * Get system metrics
   */
  async getSystemMetrics(): Promise<SystemMetrics> {
    return this.get<SystemMetrics>('/api/admin/metrics')
  }

  /**
   * Get users for admin management
   */
  async getUsers(
    page: number = 1,
    limit: number = 20
  ): Promise<{ users: AdminUser[]; total: number }> {
    return this.get<{ users: AdminUser[]; total: number }>(
      `/api/admin/users?page=${page}&limit=${limit}`
    )
  }

  /**
   * Get organizations for admin management
   */
  async getOrganizations(
    page: number = 1,
    limit: number = 20
  ): Promise<{ organizations: AdminOrganization[]; total: number }> {
    return this.get<{ organizations: AdminOrganization[]; total: number }>(
      `/api/admin/organizations?page=${page}&limit=${limit}`
    )
  }

  /**
   * Get recent activity
   */
  async getActivity(limit: number = 50): Promise<AdminActivity[]> {
    return this.get<AdminActivity[]>(`/api/admin/activity?limit=${limit}`)
  }

  /**
   * Get recent activities (alias for backward compatibility)
   */
  async getRecentActivities(limit: number = 50): Promise<AdminActivity[]> {
    return this.getActivity(limit)
  }

  /**
   * Update user status
   */
  async updateUserStatus(userId: string, status: string): Promise<void> {
    return this.put<void>(`/api/admin/users/${userId}/status`, { status })
  }

  /**
   * Update organization status
   */
  async updateOrganizationStatus(orgId: string, is_active: boolean): Promise<void> {
    return this.put<void>(`/api/admin/organizations/${orgId}/status`, { is_active })
  }
}

export const adminService = new AdminService()
export const dashboardService = adminService // Alias for backward compatibility
