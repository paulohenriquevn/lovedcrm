/**
 * Store para gerenciamento de organizações.
 */
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { Organization, OrganizationMember } from '@/types/organization'

interface OrganizationsState {
  // Estado
  organizations: Organization[]
  currentOrganization: Organization | null
  members: OrganizationMember[]
  isLoading: boolean
  isLoadingMembers: boolean
  error: string | null

  // Ações
  setOrganizations: (organizations: Organization[]) => void
  setCurrentOrganization: (organization: Organization | null) => void
  setMembers: (members: OrganizationMember[]) => void
  addOrganization: (organization: Organization) => void
  updateOrganization: (id: string, updates: Partial<Organization>) => void
  removeOrganization: (id: string) => void
  addMember: (member: OrganizationMember) => void
  updateMember: (memberId: string, updates: Partial<OrganizationMember>) => void
  removeMember: (memberId: string) => void
  setLoading: (isLoading: boolean) => void
  setLoadingMembers: (isLoading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

export const useOrganizationsStore = create<OrganizationsState>()(
  devtools(
    persist(
      set => ({
        // Estado inicial
        organizations: [],
        currentOrganization: null,
        members: [],
        isLoading: false,
        isLoadingMembers: false,
        error: null,

        // Ações
        setOrganizations: organizations => set({ organizations }),

        setCurrentOrganization: organization =>
          set({
            currentOrganization: organization,
            members: [], // Limpar membros ao trocar de organização
          }),

        setMembers: members => set({ members }),

        addOrganization: organization =>
          set(state => ({
            organizations: [...state.organizations, organization],
          })),

        updateOrganization: (id, updates) =>
          set(state => ({
            organizations: state.organizations.map(org =>
              org.id === id ? { ...org, ...updates } : org
            ),
            currentOrganization:
              state.currentOrganization?.id === id
                ? { ...state.currentOrganization, ...updates }
                : state.currentOrganization,
          })),

        removeOrganization: id =>
          set(state => ({
            organizations: state.organizations.filter(org => org.id !== id),
            currentOrganization:
              state.currentOrganization?.id === id ? null : state.currentOrganization,
          })),

        addMember: member =>
          set(state => ({
            members: [...state.members, member],
          })),

        updateMember: (memberId, updates) =>
          set(state => ({
            members: state.members.map(member =>
              member.id === memberId ? { ...member, ...updates } : member
            ),
          })),

        removeMember: memberId =>
          set(state => ({
            members: state.members.filter(member => member.id !== memberId),
          })),

        setLoading: isLoading => set({ isLoading }),
        setLoadingMembers: isLoadingMembers => set({ isLoadingMembers }),
        setError: error => set({ error }),

        reset: () =>
          set({
            organizations: [],
            currentOrganization: null,
            members: [],
            isLoading: false,
            isLoadingMembers: false,
            error: null,
          }),
      }),
      {
        name: 'organizations-store',
        partialize: state => ({
          currentOrganization: state.currentOrganization,
        }),
      }
    )
  )
)
