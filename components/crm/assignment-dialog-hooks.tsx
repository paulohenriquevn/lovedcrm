/**
 * Assignment Dialog Hooks
 * Custom hooks for assignment dialog logic
 */

import { useState } from 'react'

interface LeadAssignmentProps {
  availableLeads: Array<{
    id: string
    name: string
    email?: string
    lead_score?: number
    estimated_value?: number
    stage: string
  }>
}

type AssignmentStrategy = 'roundRobin' | 'workloadBalanced' | 'scoreBased'

interface AssignmentDialogLogic {
  selectedLeads: string[]
  selectedStrategy: AssignmentStrategy
  selectedUsers: string[]
  isAssigning: boolean
  setSelectedStrategy: (strategy: AssignmentStrategy) => void
  handleLeadToggle: (leadId: string) => void
  handleUserToggle: (userId: string) => void
  handleSelectAll: () => void
  handleAssign: () => Promise<void>
}

export function useAssignmentDialogLogic(
  availableLeads: LeadAssignmentProps['availableLeads'],
  onAssign: (leadIds: string[], strategy: string, userIds?: string[]) => Promise<void>,
  onOpenChange: (open: boolean) => void
): AssignmentDialogLogic {
  const [selectedLeads, setSelectedLeads] = useState<string[]>([])
  const [selectedStrategy, setSelectedStrategy] = useState<AssignmentStrategy>('workloadBalanced')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [isAssigning, setIsAssigning] = useState(false)

  const handleLeadToggle = (leadId: string): void => {
    setSelectedLeads(prev =>
      prev.includes(leadId) ? prev.filter(id => id !== leadId) : [...prev, leadId]
    )
  }

  const handleUserToggle = (userId: string): void => {
    setSelectedUsers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    )
  }

  const handleSelectAll = (): void => {
    const unassignedLeads = availableLeads.filter(lead => lead.stage !== 'assigned')
    if (selectedLeads.length === unassignedLeads.length) {
      setSelectedLeads([])
    } else {
      setSelectedLeads(unassignedLeads.map(lead => lead.id))
    }
  }

  const handleAssign = async (): Promise<void> => {
    if (selectedLeads.length === 0) {
      return
    }

    setIsAssigning(true)
    try {
      await onAssign(
        selectedLeads,
        selectedStrategy,
        selectedUsers.length > 0 ? selectedUsers : undefined
      )
      onOpenChange(false)
      setSelectedLeads([])
      setSelectedUsers([])
    } catch (error) {
      throw new Error(
        `Assignment failed: ${error instanceof Error ? error.message : String(error)}`
      )
    } finally {
      setIsAssigning(false)
    }
  }

  return {
    selectedLeads,
    selectedStrategy,
    selectedUsers,
    isAssigning,
    setSelectedStrategy,
    handleLeadToggle,
    handleUserToggle,
    handleSelectAll,
    handleAssign,
  }
}

export type { AssignmentStrategy, LeadAssignmentProps }
