/**
 * Mock data for Security Audit Trail development
 */

import type { AuditLogEntry, AuditStatistics, SecurityEvent } from './types'

export const mockAuditLogs: AuditLogEntry[] = [
  {
    id: '1',
    organizationId: 'org-1',
    tableName: 'organization_members',
    recordId: 'member-123',
    action: 'UPDATE',
    oldValues: { role: 'member' },
    newValues: { role: 'admin' },
    userId: 'user-1',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0...',
    createdAt: '2024-01-15T10:30:00Z',
    summary: 'Role changed from member to admin'
  },
  {
    id: '2',
    organizationId: 'org-1',
    tableName: 'leads',
    recordId: 'lead-456',
    action: 'CREATE',
    newValues: { name: 'New Lead', status: 'qualified' },
    userId: 'user-2',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0...',
    createdAt: '2024-01-15T09:15:00Z',
    summary: 'New lead created: New Lead'
  }
]

export const mockSecurityEvents: SecurityEvent[] = [
  {
    id: '1',
    type: 'role_change',
    severity: 'medium',
    description: 'User role elevated to Admin',
    userId: 'user-1',
    targetUser: 'user-2',
    timestamp: '2024-01-15T10:30:00Z',
    details: { oldRole: 'member', newRole: 'admin' }
  },
  {
    id: '2',
    type: 'suspicious_activity',
    severity: 'high',
    description: 'Multiple failed login attempts detected',
    userId: 'user-3',
    timestamp: '2024-01-15T08:45:00Z',
    details: { attempts: 5, ipAddress: '192.168.1.200' }
  }
]

export const mockStatistics: AuditStatistics = {
  totalAuditLogs: 1247,
  actionsDistribution: {
    'CREATE': 520,
    'UPDATE': 482,
    'DELETE': 245
  },
  tablesDistribution: {
    'leads': 678,
    'organization_members': 245,
    'communications': 324
  },
  mostActiveUsers: [
    { userId: 'user-1', userName: 'John Doe', actionCount: 234 },
    { userId: 'user-2', userName: 'Jane Smith', actionCount: 189 }
  ]
}