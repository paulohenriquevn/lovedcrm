/**
 * Assignment Dialog Component
 * Separated dialog component for assigning leads to team members
 */

import { BarChart, Zap, RotateCcw, TrendingUp } from 'lucide-react'
import React from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

import {
  useAssignmentDialogLogic,
  type AssignmentStrategy,
  type LeadAssignmentProps,
} from './assignment-dialog-hooks'

interface TeamMember {
  user_id: string
  user_name: string
  active_leads: number
  recent_assignments: number
  recent_conversions: number
  conversion_rate: number
  performance_score: number
}

const STRATEGY_CONFIG = {
  roundRobin: {
    label: 'Round Robin',
    description: 'Equal distribution rotation - fair opportunity for all',
    icon: <RotateCcw className="h-4 w-4" />,
    color: 'text-blue-600',
  },
  workloadBalanced: {
    label: 'Workload Balanced',
    description: 'Based on current active lead counts - balance the load',
    icon: <BarChart className="h-4 w-4" />,
    color: 'text-green-600',
  },
  scoreBased: {
    label: 'Score Based',
    description: 'High-value leads to top performers - maximize conversion',
    icon: <TrendingUp className="h-4 w-4" />,
    color: 'text-purple-600',
  },
} as const

function StrategySelectionGrid({
  selectedStrategy,
  onStrategyChange,
}: {
  selectedStrategy: AssignmentStrategy
  onStrategyChange: (strategy: AssignmentStrategy) => void
}): React.ReactElement {
  return (
    <div className="space-y-3">
      <h3 className="font-medium text-sm">Assignment Strategy</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {Object.entries(STRATEGY_CONFIG).map(([key, config]) => (
          <Card
            key={key}
            className={cn(
              'cursor-pointer transition-all hover:shadow-md border-2',
              selectedStrategy === key
                ? 'border-primary bg-primary/5'
                : 'border-muted hover:border-primary/50'
            )}
            onClick={() => onStrategyChange(key as AssignmentStrategy)}
          >
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-3">
                <div className={config.color}>{config.icon}</div>
                <div>
                  <div className="font-medium text-sm">{config.label}</div>
                  <div className="text-xs text-muted-foreground">{config.description}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function TeamMemberSelection({
  teamData,
  selectedUsers,
  onUserToggle,
}: {
  teamData: TeamMember[]
  selectedUsers: string[]
  onUserToggle: (userId: string) => void
}): React.ReactElement {
  return (
    <div className="space-y-3">
      <h3 className="font-medium text-sm">Assign to Specific Members (Optional)</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {teamData.map(member => (
          <div key={member.user_id} className="flex items-center space-x-2">
            <Checkbox
              id={`user-${member.user_id}`}
              checked={selectedUsers.includes(member.user_id)}
              onCheckedChange={() => onUserToggle(member.user_id)}
            />
            <Label htmlFor={`user-${member.user_id}`} className="text-sm">
              {member.user_name}
              <Badge variant="outline" className="ml-2 text-xs">
                {member.active_leads} active
              </Badge>
            </Label>
          </div>
        ))}
      </div>
    </div>
  )
}

function LeadSelectionTable({
  unassignedLeads,
  selectedLeads,
  onLeadToggle,
  onSelectAll,
}: {
  unassignedLeads: LeadAssignmentProps['availableLeads']
  selectedLeads: string[]
  onLeadToggle: (leadId: string) => void
  onSelectAll: () => void
}): React.ReactElement {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm">
          Select Leads to Assign ({selectedLeads.length}/{unassignedLeads.length})
        </h3>
        <Button variant="outline" size="sm" onClick={onSelectAll}>
          {selectedLeads.length === unassignedLeads.length ? 'Deselect All' : 'Select All'}
        </Button>
      </div>

      <div className="border rounded-md max-h-64 overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12" />
              <TableHead>Lead</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Est. Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {unassignedLeads.map(lead => (
              <TableRow key={lead.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedLeads.includes(lead.id)}
                    onCheckedChange={() => onLeadToggle(lead.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">{lead.name}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{lead.email ?? '-'}</TableCell>
                <TableCell>
                  {lead.lead_score !== null && lead.lead_score !== undefined ? (
                    <Badge variant="outline">{lead.lead_score}</Badge>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {lead.estimated_value !== null && lead.estimated_value !== undefined ? (
                    <span className="font-mono text-green-600">
                      R$ {lead.estimated_value.toLocaleString()}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function AssignmentDialogContent({
  selectedStrategy,
  selectedUsers,
  selectedLeads,
  isAssigning,
  teamData,
  unassignedLeads,
  setSelectedStrategy,
  handleUserToggle,
  handleLeadToggle,
  handleSelectAll,
  handleAssign,
  onOpenChange,
}: {
  selectedStrategy: AssignmentStrategy
  selectedUsers: string[]
  selectedLeads: string[]
  isAssigning: boolean
  teamData: TeamMember[]
  unassignedLeads: LeadAssignmentProps['availableLeads']
  setSelectedStrategy: (strategy: AssignmentStrategy) => void
  handleUserToggle: (userId: string) => void
  handleLeadToggle: (leadId: string) => void
  handleSelectAll: () => void
  handleAssign: () => Promise<void>
  onOpenChange: (open: boolean) => void
}): React.ReactElement {
  return (
    <div className="space-y-6">
      <StrategySelectionGrid
        selectedStrategy={selectedStrategy}
        onStrategyChange={setSelectedStrategy}
      />

      <Separator />

      <TeamMemberSelection
        teamData={teamData}
        selectedUsers={selectedUsers}
        onUserToggle={handleUserToggle}
      />

      <Separator />

      <LeadSelectionTable
        unassignedLeads={unassignedLeads}
        selectedLeads={selectedLeads}
        onLeadToggle={handleLeadToggle}
        onSelectAll={handleSelectAll}
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button
          onClick={() => void handleAssign()}
          disabled={selectedLeads.length === 0 || isAssigning}
        >
          {isAssigning ? 'Assigning...' : `Assign ${selectedLeads.length} Leads`}
        </Button>
      </div>
    </div>
  )
}

export function AssignmentDialog({
  isOpen,
  onOpenChange,
  availableLeads,
  teamData,
  onAssign,
}: {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  availableLeads: LeadAssignmentProps['availableLeads']
  teamData: TeamMember[]
  onAssign: (leadIds: string[], strategy: string, userIds?: string[]) => Promise<void>
}): React.ReactElement {
  const logic = useAssignmentDialogLogic(availableLeads, onAssign, onOpenChange)
  const unassignedLeads = availableLeads.filter(lead => lead.stage !== 'assigned')

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Assign Leads to Team
          </DialogTitle>
          <DialogDescription>
            Select leads and assignment strategy to distribute work intelligently across your team.
          </DialogDescription>
        </DialogHeader>

        <AssignmentDialogContent
          selectedStrategy={logic.selectedStrategy}
          selectedUsers={logic.selectedUsers}
          selectedLeads={logic.selectedLeads}
          isAssigning={logic.isAssigning}
          teamData={teamData}
          unassignedLeads={unassignedLeads}
          setSelectedStrategy={logic.setSelectedStrategy}
          handleUserToggle={logic.handleUserToggle}
          handleLeadToggle={logic.handleLeadToggle}
          handleSelectAll={logic.handleSelectAll}
          handleAssign={logic.handleAssign}
          onOpenChange={onOpenChange}
        />
      </DialogContent>
    </Dialog>
  )
}

export type { TeamMember }
