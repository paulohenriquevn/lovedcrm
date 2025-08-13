"use client"

/**
 * 🔍 Security Audit Trail Page - Multi-Tenant Audit Management
 * 
 * Comprehensive audit trail interface for organization security monitoring.
 * Features real-time audit log display with advanced filtering and analytics.
 */

import React, { useState } from 'react'
import { AlertTriangle, Download, Eye, Filter, RefreshCcw, Shield, TrendingUp, Users } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { OrganizationHeader } from '@/components/admin/organization-header'
import { OwnerOnlyGuard, RoleGuard } from '@/components/admin/role-guard'
import { useOrgContext } from '@/hooks/use-org-context'
import { usePermissions } from '@/hooks/use-permissions'

// Types for audit data
interface AuditLogEntry {
  id: string
  organization_id: string
  table_name: string
  record_id: string
  action: 'CREATE' | 'UPDATE' | 'DELETE'
  old_values?: Record<string, any>
  new_values?: Record<string, any>
  user_id?: string
  ip_address?: string
  user_agent?: string
  created_at: string
  summary: string
}

interface SecurityEvent {
  id: string
  type: 'role_change' | 'member_removal' | 'suspicious_activity'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  user_id?: string
  target_user?: string
  timestamp: string
  details: Record<string, any>
}

interface AuditStatistics {
  total_audit_logs: number
  actions_distribution: Record<string, number>
  tables_distribution: Record<string, number>
  most_active_users: Array<{
    user_id: string
    user_name: string
    action_count: number
  }>
}

// Mock data for development
const mockAuditLogs: AuditLogEntry[] = [
  {
    id: '1',
    organization_id: 'org-1',
    table_name: 'organization_members',
    record_id: 'member-123',
    action: 'UPDATE',
    old_values: { role: 'member' },
    new_values: { role: 'admin' },
    user_id: 'user-1',
    ip_address: '192.168.1.100',
    user_agent: 'Mozilla/5.0...',
    created_at: '2024-01-15T10:30:00Z',
    summary: 'Role changed from member to admin'
  },
  {
    id: '2',
    organization_id: 'org-1',
    table_name: 'leads',
    record_id: 'lead-456',
    action: 'CREATE',
    new_values: { name: 'New Lead', status: 'qualified' },
    user_id: 'user-2',
    ip_address: '192.168.1.101',
    user_agent: 'Mozilla/5.0...',
    created_at: '2024-01-15T09:15:00Z',
    summary: 'New lead created: New Lead'
  }
]

const mockSecurityEvents: SecurityEvent[] = [
  {
    id: '1',
    type: 'role_change',
    severity: 'medium',
    description: 'User role elevated to Admin',
    user_id: 'user-1',
    target_user: 'user-2',
    timestamp: '2024-01-15T10:30:00Z',
    details: { old_role: 'member', new_role: 'admin' }
  },
  {
    id: '2',
    type: 'suspicious_activity',
    severity: 'high',
    description: 'Multiple failed login attempts detected',
    user_id: 'user-3',
    timestamp: '2024-01-15T08:45:00Z',
    details: { attempts: 5, ip_address: '192.168.1.200' }
  }
]

const mockStatistics: AuditStatistics = {
  total_audit_logs: 1247,
  actions_distribution: {
    'CREATE': 520,
    'UPDATE': 482,
    'DELETE': 245
  },
  tables_distribution: {
    'leads': 678,
    'organization_members': 245,
    'communications': 324
  },
  most_active_users: [
    { user_id: 'user-1', user_name: 'John Doe', action_count: 234 },
    { user_id: 'user-2', user_name: 'Jane Smith', action_count: 189 }
  ]
}

// Component for displaying audit log entries
function AuditLogTable({ logs, isLoading }: { logs: AuditLogEntry[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {logs.map((log) => (
        <Card key={log.id} className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Badge 
                  variant={
                    log.action === 'DELETE' ? 'destructive' :
                    log.action === 'CREATE' ? 'default' : 'secondary'
                  }
                >
                  {log.action}
                </Badge>
                <span className="text-sm text-muted-foreground">{log.table_name}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(log.created_at).toLocaleString()}
                </span>
              </div>
              
              <p className="text-sm font-medium mb-1">{log.summary}</p>
              
              {log.ip_address && (
                <p className="text-xs text-muted-foreground">
                  IP: {log.ip_address}
                </p>
              )}
            </div>
            
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  )
}

// Component for security events
function SecurityEventsPanel({ events, isLoading }: { events: SecurityEvent[]; isLoading: boolean }) {
  const getSeverityColor = (severity: SecurityEvent['severity']) => {
    switch (severity) {
      case 'critical': return 'destructive'
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'outline'
    }
  }

  if (isLoading) {
    return <Skeleton className="h-32 w-full" />
  }

  return (
    <div className="space-y-3">
      {events.map((event) => (
        <Card key={event.id} className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <Badge variant={getSeverityColor(event.severity)}>
                  {event.severity.toUpperCase()}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(event.timestamp).toLocaleString()}
                </span>
              </div>
              
              <p className="text-sm font-medium">{event.description}</p>
              
              {event.details && Object.keys(event.details).length > 0 && (
                <div className="mt-2 text-xs text-muted-foreground">
                  {Object.entries(event.details).map(([key, value]) => (
                    <span key={key} className="mr-3">
                      {key}: {String(value)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

// Statistics cards component
function StatisticsCards({ statistics, isLoading }: { statistics: AuditStatistics; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Audit Logs</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statistics.total_audit_logs.toLocaleString()}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Most Active Action</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {Object.entries(statistics.actions_distribution)
              .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}
          </div>
          <p className="text-xs text-muted-foreground">
            {Object.entries(statistics.actions_distribution)
              .sort(([,a], [,b]) => b - a)[0]?.[1] || 0} occurrences
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Most Active Table</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {Object.entries(statistics.tables_distribution)
              .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}
          </div>
          <p className="text-xs text-muted-foreground">
            {Object.entries(statistics.tables_distribution)
              .sort(([,a], [,b]) => b - a)[0]?.[1] || 0} modifications
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top User Activity</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {statistics.most_active_users[0]?.action_count || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            {statistics.most_active_users[0]?.user_name || 'No data'}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SecurityAuditPage() {
  const { organization } = useOrgContext()
  const { canViewAuditLogs, user } = usePermissions()
  
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTable, setSelectedTable] = useState<string>('')
  const [selectedAction, setSelectedAction] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [timeframe, setTimeframe] = useState('7d')
  
  const auditLogs = mockAuditLogs
  const securityEvents = mockSecurityEvents
  const statistics = mockStatistics

  const handleRefresh = () => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => setIsLoading(false), 1000)
  }

  const handleExport = () => {
    // Export functionality would be implemented here
    console.log('Exporting audit data...')
  }

  // Permission check - only users with audit log access can see this page
  if (!canViewAuditLogs) {
    return (
      <div className="container mx-auto py-6">
        <OrganizationHeader 
          organization={organization}
          user={user}
          className="mb-6"
        />
        
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Shield className="h-5 w-5" />
              Access Denied
            </CardTitle>
            <CardDescription>
              You don't have permission to view audit logs. Contact your organization admin for access.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <OrganizationHeader 
        organization={organization}
        user={user}
        className="mb-6"
      />

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Security Audit Trail
          </h1>
          <p className="text-muted-foreground">
            Monitor organization security events and audit trail
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCcw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <RoleGuard requiredPermission="export_data">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </RoleGuard>
        </div>
      </div>

      {/* Statistics Overview */}
      <StatisticsCards statistics={statistics} isLoading={isLoading} />

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span className="text-sm font-medium">Filters:</span>
          </div>
          
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedTable} onValueChange={setSelectedTable}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Table" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Tables</SelectItem>
              <SelectItem value="leads">Leads</SelectItem>
              <SelectItem value="organization_members">Members</SelectItem>
              <SelectItem value="communications">Communications</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedAction} onValueChange={setSelectedAction}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Actions</SelectItem>
              <SelectItem value="CREATE">Create</SelectItem>
              <SelectItem value="UPDATE">Update</SelectItem>
              <SelectItem value="DELETE">Delete</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="Search audit logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="audit-logs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="audit-logs">Audit Logs</TabsTrigger>
          <TabsTrigger value="security-events">Security Events</TabsTrigger>
          
          <OwnerOnlyGuard>
            <TabsTrigger value="integrity">Data Integrity</TabsTrigger>
          </OwnerOnlyGuard>
        </TabsList>

        <TabsContent value="audit-logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Audit Activity</CardTitle>
              <CardDescription>
                Detailed log of all actions performed in your organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AuditLogTable logs={auditLogs} isLoading={isLoading} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security-events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Events</CardTitle>
              <CardDescription>
                Important security-related events requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SecurityEventsPanel events={securityEvents} isLoading={isLoading} />
            </CardContent>
          </Card>
        </TabsContent>

        <OwnerOnlyGuard>
          <TabsContent value="integrity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Data Integrity Checks</CardTitle>
                <CardDescription>
                  Advanced integrity verification and maintenance tools
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Verify Audit Integrity</h4>
                    <p className="text-sm text-muted-foreground">
                      Check for orphaned logs and validate references
                    </p>
                  </div>
                  <Button variant="outline">
                    Run Check
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Cleanup Old Logs</h4>
                    <p className="text-sm text-muted-foreground">
                      Remove audit logs older than retention period
                    </p>
                  </div>
                  <Button variant="outline">
                    Configure
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </OwnerOnlyGuard>
      </Tabs>
    </div>
  )
}