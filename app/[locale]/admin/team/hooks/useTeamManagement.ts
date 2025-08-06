/**
 * Custom hook for team management logic
 */

import { useState, useEffect, useMemo, useCallback } from 'react'

import { membersService } from '@/services/members'
import { OrganizationMember, OrganizationRole } from '@/types/organization'

import { useTeamActions } from './useTeamActions'

interface UseTeamManagementProps {
  user: { id?: string } | null
  toast: {
    (props: { title: string; description?: string; variant?: 'default' | 'destructive' }): void
  }
}

export const useTeamManagement = ({ user, toast }: UseTeamManagementProps) => {
  // State
  const [members, setMembers] = useState<OrganizationMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')

  // Team actions hook
  const teamActions = useTeamActions({ toast, setMembers })

  const loadMembers = useCallback(async () => {
    try {
      setIsLoading(true)
      const membersData = await membersService.listMembers()
      setMembers(membersData)
    } catch (error) {
      toast({
        title: 'Erro ao carregar membros',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  // Load members on mount
  useEffect(() => {
    void loadMembers()
  }, [loadMembers])

  // Get current user's role (memoized to avoid setState during render)
  const currentUserMember = useMemo(
    () => members.find(m => m.user_id === user?.id),
    [members, user?.id]
  )

  const currentUserRole = currentUserMember?.role

  const canManageMembers = useMemo(
    () => currentUserRole === OrganizationRole.OWNER || currentUserRole === OrganizationRole.ADMIN,
    [currentUserRole]
  )

  // Helper functions for filtering
  const isValidString = useCallback((value: string | null | undefined): value is string => {
    return value !== null && value !== undefined && value !== ''
  }, [])

  const matchesSearchQuery = useCallback(
    (member: OrganizationMember, query: string): boolean => {
      if (query === '') {
        return true
      }

      const searchLower = query.toLowerCase()
      const fullName = member.user?.full_name
      const email = member.user?.email

      const matchesName = isValidString(fullName) && fullName.toLowerCase().includes(searchLower)
      const matchesEmail = isValidString(email) && email.toLowerCase().includes(searchLower)

      return matchesName || matchesEmail
    },
    [isValidString]
  )

  const matchesRoleFilter = useCallback((member: OrganizationMember, filter: string): boolean => {
    return filter === 'all' || String(member.role) === filter
  }, [])

  const filteredMembers = useMemo(() => {
    return members.filter(
      member => matchesSearchQuery(member, searchQuery) && matchesRoleFilter(member, roleFilter)
    )
  }, [members, searchQuery, roleFilter, matchesSearchQuery, matchesRoleFilter])

  return {
    // State
    members,
    isLoading,
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,
    // Computed values
    canManageMembers,
    filteredMembers,
    // Functions
    loadMembers,
    // Team actions
    ...teamActions,
  }
}
