/**
 * Types for Security Audit Trail
 */

export interface AuditLogEntry {
  id: string
  organizationId: string
  tableName: string
  recordId: string
  action: 'CREATE' | 'UPDATE' | 'DELETE'
  oldValues?: Record<string, unknown>
  newValues?: Record<string, unknown>
  userId?: string
  ipAddress?: string
  userAgent?: string
  createdAt: string
  summary: string
}

export interface SecurityEvent {
  id: string
  type: 'role_change' | 'member_removal' | 'suspicious_activity'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  userId?: string
  targetUser?: string
  timestamp: string
  details: Record<string, unknown>
}

export interface AuditStatistics {
  totalAuditLogs: number
  actionsDistribution: Record<string, number>
  tablesDistribution: Record<string, number>
  mostActiveUsers: Array<{
    userId: string
    userName: string
    actionCount: number
  }>
}

export interface AuditFilters {
  selectedTable: string
  selectedAction: string
  searchTerm: string
  timeframe: string
}