'use client'

import { useCallback, useEffect } from 'react'

import { membersService } from '@/services/members'
import { organizationsService } from '@/services/organizations'
import { useAuthStore } from '@/stores/auth'
import { useOrganizationsStore } from '@/stores/organizations'

import type { Organization, OrganizationMember } from '@/types/organization'

export function useOrganizationData() {
  // MULTI-TENANT: Pegar organização do auth store (JWT), não da URL
  const { organization: authOrganization } = useAuthStore()
  const organizationId = authOrganization?.id

  const store = useOrganizationsStore()
  const { currentOrganization, members, isLoading, isLoadingMembers, error } = store

  const { loadOrganization, loadMembers } = useOrganizationLoaders(organizationId, store)

  useEffect(() => {
    if (organizationId !== null && organizationId !== undefined && organizationId !== '') {
      void loadOrganization()
      void loadMembers()
    }
  }, [loadOrganization, loadMembers, organizationId])

  return {
    organizationId,
    currentOrganization: currentOrganization ?? authOrganization, // Fallback para auth store
    members,
    isLoading,
    isLoadingMembers,
    error,
    reloadOrganization: loadOrganization,
    reloadMembers: loadMembers,
  }
}

interface OrganizationStore {
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setCurrentOrganization: (org: Organization) => void
  setMembers: (members: OrganizationMember[]) => void
}

function useOrganizationLoaders(organizationId: string | undefined, store: OrganizationStore) {
  const { setLoading, setError, setCurrentOrganization, setMembers } = store

  const loadOrganization = useCallback(async () => {
    if (organizationId === null || organizationId === undefined || organizationId === '') {
      // eslint-disable-next-line no-console
      console.log('🚫 No organizationId available from auth store')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // eslint-disable-next-line no-console
      console.log('🔍 Loading organization from auth store:', organizationId)
      const organization = await organizationsService.getCurrentOrganization()
      setCurrentOrganization(organization)
      // eslint-disable-next-line no-console
      console.log('Organization loaded successfully:', organization.name)
    } catch (error_) {
      // eslint-disable-next-line no-console
      console.error('Error loading organization:', error_)
      setError(error_ instanceof Error ? error_.message : 'Erro ao carregar organização')
    } finally {
      setLoading(false)
    }
  }, [organizationId, setLoading, setError, setCurrentOrganization])

  const loadMembers = useCallback(async () => {
    if (organizationId === null || organizationId === undefined || organizationId === '') {
      // eslint-disable-next-line no-console
      console.log('🚫 No organizationId available for loading members')
      return
    }

    try {
      // eslint-disable-next-line no-console
      console.log('👥 Loading members for organization:', organizationId)
      const membersData = await membersService.listMembers()
      setMembers(membersData)
      // eslint-disable-next-line no-console
      console.log('Members loaded successfully:', membersData.length, 'members')
    } catch (error_) {
      // eslint-disable-next-line no-console
      console.error('Error loading members:', error_)
      setError(error_ instanceof Error ? error_.message : 'Erro ao carregar membros')
    }
  }, [organizationId, setMembers, setError])

  return { loadOrganization, loadMembers }
}
