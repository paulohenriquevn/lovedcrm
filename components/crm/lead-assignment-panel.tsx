/**
 * Lead Assignment Management Panel
 *
 * Interface for intelligent lead assignment with multiple strategies,
 * workload balancing, and performance-based distribution.
 */

'use client'

import { Users, Zap, TrendingUp, UserCheck, Award, Clock } from 'lucide-react'
import React, { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { AssignmentDialog, type TeamMember } from './assignment-dialog'

interface AssignmentAnalytics {
  organization_id: string
  analysis_period_days: number
  team_performance: TeamMember[]
  summary: {
    total_team_members: number
    total_active_leads: number
    total_recent_assignments: number
    total_recent_conversions: number
    average_conversion_rate: number
    workload_distribution: {
      min_active_leads: number
      max_active_leads: number
      avg_active_leads: number
    }
  }
  generated_at: string
}

interface LeadAssignmentPanelProps {
  availableLeads: Array<{
    id: string
    name: string
    email?: string
    lead_score?: number
    estimated_value?: number
    stage: string
  }>
  analytics: AssignmentAnalytics | null
  onAssignLeads: (leadIds: string[], strategy: string, userIds?: string[]) => Promise<void>
  onRefreshAnalytics: () => Promise<void>
  isLoading?: boolean
}

function TeamPerformanceTable({ teamData }: { teamData: TeamMember[] }): React.ReactElement {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Team Member</TableHead>
          <TableHead>Active Leads</TableHead>
          <TableHead>Recent Assignments</TableHead>
          <TableHead>Conversions</TableHead>
          <TableHead>Conversion Rate</TableHead>
          <TableHead>Performance Score</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {teamData.map(member => (
          <TableRow key={member.user_id}>
            <TableCell>
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{member.user_name}</span>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline" className="font-mono">
                {member.active_leads}
              </Badge>
            </TableCell>
            <TableCell>
              <span className="text-muted-foreground">{member.recent_assignments}</span>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <span className="font-medium text-green-600">{member.recent_conversions}</span>
                {member.recent_conversions > 0 && <Award className="h-3 w-3 text-yellow-500" />}
              </div>
            </TableCell>
            <TableCell>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{(member.conversion_rate * 100).toFixed(1)}%</span>
                </div>
                <Progress value={member.conversion_rate * 100} className="h-1.5" />
              </div>
            </TableCell>
            <TableCell>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{(member.performance_score * 100).toFixed(1)}%</span>
                  {member.performance_score >= 0.7 && (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  )}
                </div>
                <Progress value={member.performance_score * 100} className="h-1.5" />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function LoadingState(): React.ReactElement {
  return (
    <Card>
      <CardContent className="py-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          <span className="ml-3">Loading assignment analytics...</span>
        </div>
      </CardContent>
    </Card>
  )
}

function OverviewCards({
  unassignedCount,
  analytics,
}: {
  unassignedCount: number
  analytics: AssignmentAnalytics | null
}): React.ReactElement {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Unassigned Leads</p>
              <p className="text-2xl font-bold">{unassignedCount}</p>
            </div>
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      {analytics !== null && (
        <>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Team Members</p>
                  <p className="text-2xl font-bold">{analytics.summary.total_team_members}</p>
                </div>
                <UserCheck className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Leads</p>
                  <p className="text-2xl font-bold">{analytics.summary.total_active_leads}</p>
                </div>
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                  <p className="text-2xl font-bold">
                    {(analytics.summary.average_conversion_rate * 100).toFixed(1)}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

function WorkloadDistributionSummary({
  analytics,
}: {
  analytics: AssignmentAnalytics
}): React.ReactElement {
  return (
    <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
      <div className="text-center">
        <div className="text-lg font-bold">
          {analytics.summary.workload_distribution.min_active_leads}
        </div>
        <div className="text-xs text-muted-foreground">Min Active</div>
      </div>
      <div className="text-center">
        <div className="text-lg font-bold">
          {analytics.summary.workload_distribution.avg_active_leads}
        </div>
        <div className="text-xs text-muted-foreground">Avg Active</div>
      </div>
      <div className="text-center">
        <div className="text-lg font-bold">
          {analytics.summary.workload_distribution.max_active_leads}
        </div>
        <div className="text-xs text-muted-foreground">Max Active</div>
      </div>
    </div>
  )
}

export function LeadAssignmentPanel({
  availableLeads,
  analytics,
  onAssignLeads,
  onRefreshAnalytics,
  isLoading = false,
}: LeadAssignmentPanelProps): React.ReactElement {
  const [showAssignDialog, setShowAssignDialog] = useState(false)

  const unassignedCount = availableLeads.filter(lead => lead.stage !== 'assigned').length

  if (isLoading) {
    return <LoadingState />
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <OverviewCards unassignedCount={unassignedCount} analytics={analytics} />

      {/* Assignment Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Lead Assignment
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => void onRefreshAnalytics()}>
                Refresh Data
              </Button>
              <Button onClick={() => setShowAssignDialog(true)} disabled={unassignedCount === 0}>
                Assign Leads ({unassignedCount})
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Intelligently distribute leads across your team using performance-based algorithms.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Team Performance Analytics */}
      {analytics !== null && (
        <Card>
          <CardHeader>
            <CardTitle>Team Performance Analytics</CardTitle>
            <CardDescription>
              Performance data from the last {analytics.analysis_period_days} days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Workload Distribution Summary */}
              <WorkloadDistributionSummary analytics={analytics} />

              {/* Team Performance Table */}
              <TeamPerformanceTable teamData={analytics.team_performance} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assignment Dialog */}
      <AssignmentDialog
        isOpen={showAssignDialog}
        onOpenChange={setShowAssignDialog}
        availableLeads={availableLeads}
        teamData={analytics?.team_performance ?? []}
        onAssign={onAssignLeads}
      />
    </div>
  )
}
