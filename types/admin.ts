/**
 * Admin dashboard types
 */

export interface AdminStats {
  totalUsers: number
  totalOrganizations: number
  activeUsers: number
  newSignups: number
  totalRevenue?: number
  monthlyRevenue?: number
  conversionRate?: number
  churnRate?: number
}

export interface SystemMetrics {
  cpuUsage: number
  memoryUsage: number
  diskUsage: number
  uptime: number
}

export interface AdminUser {
  id: string
  email: string
  full_name?: string
  status: string
  is_email_verified: boolean
  organization_id?: string
  created_at: string
  last_login?: string
}

export interface AdminOrganization {
  id: string
  name: string
  slug: string
  owner_id: string
  is_active: boolean
  max_members: string
  member_count: number
  created_at: string
}

export interface AdminActivity {
  id: string
  user_id: string
  action: string
  resource: string
  timestamp: string
  details?: Record<string, unknown>
  description?: string
  title?: string
  type?: string
}

// Aliases for backward compatibility
export interface DashboardStats extends AdminStats {}
export interface Activity extends AdminActivity {}
