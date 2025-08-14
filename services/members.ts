/**
 * Service dedicado para gerenciamento de membros da organização.
 * Todos os endpoints usam X-Org-Id header para multi-tenancy.
 */

import { BaseService } from './base'
import type { OrganizationMember } from '@/types/organization'

export interface MemberInviteData {
  email: string
  role: 'owner' | 'admin' | 'member'
  message?: string
}

export interface MemberUpdateData {
  role: 'owner' | 'admin' | 'member'
}

export interface MemberStats {
  total: number
  active: number
  pending_invites: number
  by_role: {
    owners: number
    admins: number
    members: number
  }
}

class MembersService extends BaseService {
  /**
   * Lista todos os membros da organização atual.
   */
  async listMembers(): Promise<OrganizationMember[]> {
    return this.get<OrganizationMember[]>('/api/organizations/members')
  }

  /**
   * Busca membro específico da organização.
   */
  async getMember(memberId: string): Promise<OrganizationMember> {
    return this.get<OrganizationMember>(`/api/organizations/members/${memberId}`)
  }

  /**
   * Convida novo membro para a organização.
   */
  async inviteMember(data: MemberInviteData): Promise<{ message: string; invite_id: string }> {
    return this.post<{ message: string; invite_id: string }>('/api/organizations/invite', data)
  }

  /**
   * Atualiza role de um membro.
   */
  async updateMemberRole(memberId: string, data: MemberUpdateData): Promise<OrganizationMember> {
    return this.patch<OrganizationMember>(`/api/organizations/members/${memberId}`, data)
  }

  /**
   * Remove membro da organização.
   */
  async removeMember(memberId: string): Promise<void> {
    return this.delete<void>(`/api/organizations/members/${memberId}`)
  }

  /**
   * Lista convites pendentes da organização.
   */
  async listInvites(): Promise<any[]> {
    return this.get<any[]>('/api/members/invites')
  }

  /**
   * Reenviar convite pendente.
   */
  async resendInvite(inviteId: string): Promise<{ message: string }> {
    return this.post<{ message: string }>(`/api/members/invites/${inviteId}/resend`)
  }

  /**
   * Cancelar convite pendente.
   */
  async cancelInvite(inviteId: string): Promise<void> {
    return this.delete<void>(`/api/members/invites/${inviteId}`)
  }

  /**
   * Estatísticas dos membros da organização.
   */
  async getMemberStats(): Promise<MemberStats> {
    return this.get<MemberStats>('/api/members/stats')
  }

  /**
   * Buscar membros com filtros.
   */
  async searchMembers(params: {
    query?: string
    role?: string
    status?: 'active' | 'inactive'
    limit?: number
    offset?: number
  }): Promise<{
    members: OrganizationMember[]
    total: number
    has_more: boolean
  }> {
    const searchParams = new URLSearchParams()

    if (params.query) searchParams.set('query', params.query)
    if (params.role) searchParams.set('role', params.role)
    if (params.status) searchParams.set('status', params.status)
    if (params.limit) searchParams.set('limit', params.limit.toString())
    if (params.offset) searchParams.set('offset', params.offset.toString())

    const queryString = searchParams.toString()
    const endpoint = queryString ? `/api/members/search?${queryString}` : '/api/members/search'

    return this.get<{
      members: OrganizationMember[]
      total: number
      has_more: boolean
    }>(endpoint)
  }

  /**
   * Validar se email pode ser convidado (não é membro já).
   */
  async validateInviteEmail(email: string): Promise<{ valid: boolean; reason?: string }> {
    return this.post<{ valid: boolean; reason?: string }>('/api/members/validate-invite', { email })
  }

  /**
   * Bulk operations - convidar múltiplos membros.
   */
  async bulkInviteMembers(invites: MemberInviteData[]): Promise<{
    successful: number
    failed: number
    results: Array<{
      email: string
      success: boolean
      error?: string
      invite_id?: string
    }>
  }> {
    return this.post('/api/members/bulk-invite', { invites })
  }
}

export const membersService = new MembersService()

// Hooks específicos para members
export interface UseMembersOptions {
  autoRefresh?: boolean
  refreshInterval?: number
}

/**
 * Hook para listar membros com React Query integration (se disponível).
 */
export function useMembers(options: UseMembersOptions = {}) {
  // Por enquanto, retorna apenas o service
  // REMOVE: Integrate with React Query when proper caching is needed
  return {
    listMembers: () => membersService.listMembers(),
    inviteMember: (data: MemberInviteData) => membersService.inviteMember(data),
    removeMember: (memberId: string) => membersService.removeMember(memberId),
    updateRole: (memberId: string, role: string) =>
      membersService.updateMemberRole(memberId, { role: role as any }),
  }
}
