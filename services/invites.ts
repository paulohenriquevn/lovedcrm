/**
 * Service para gerenciamento de convites de organização.
 */
import { BaseService } from './base'

import type {
  OrganizationInvite,
  OrganizationInviteCreate,
  OrganizationInviteStats,
} from '@/types/organization'

class InvitesService extends BaseService {
  /**
   * Cria novo convite para organização.
   */
  async createInvite(data: OrganizationInviteCreate): Promise<OrganizationInvite> {
    return this.post<OrganizationInvite>('/api/organizations/invites', data)
  }

  /**
   * Lista convites da organização atual.
   */
  async listInvites(statusFilter?: string, limit = 50, offset = 0): Promise<OrganizationInvite[]> {
    const params = new URLSearchParams()
    if (statusFilter) params.append('status_filter', statusFilter)
    params.append('limit', limit.toString())
    params.append('offset', offset.toString())

    return this.get<OrganizationInvite[]>(`/api/organizations/invites?${params}`)
  }

  /**
   * Cancela convite pendente.
   */
  async cancelInvite(inviteId: string, reason?: string): Promise<void> {
    return this.delete(
      `/api/organizations/invites/${inviteId}`,
      reason
        ? {
            body: JSON.stringify({ reason }),
          }
        : undefined
    )
  }

  /**
   * Obtém estatísticas de convites.
   */
  async getInviteStats(): Promise<OrganizationInviteStats> {
    return this.get<OrganizationInviteStats>('/api/organizations/invites/stats')
  }

  /**
   * Obtém informações públicas de um convite (não requer auth).
   */
  async getPublicInviteInfo(token: string): Promise<{
    organization_name: string
    organization_slug: string
    invited_by_name: string
    role: string
    created_at: string
    expires_at: string
    is_expired: boolean
    message?: string
    invited_email: string
  }> {
    return this.get<any>(`/api/invites/${token}`)
  }

  /**
   * Aceita convite usando token.
   */
  async acceptInvite(token: string): Promise<{
    message: string
    organization_id: string
    role: string
  }> {
    return this.post<any>(`/api/invites/${token}/accept`, { token })
  }

  /**
   * Rejeita convite usando token.
   */
  async rejectInvite(
    token: string,
    reason?: string
  ): Promise<{
    message: string
    organization_name: string
  }> {
    return this.post<any>(`/api/invites/${token}/reject`, { token, reason })
  }
}

export const invitesService = new InvitesService()
