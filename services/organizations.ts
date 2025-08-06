/**
 * Service para gerenciamento de organizações (Header-based Multi-Tenancy).
 * Todos os métodos usam X-Org-Id header para identificar a organização.
 */
import { BaseService } from './base'

import type {
  Organization,
  OrganizationCreate,
  OrganizationUpdate,
  OrganizationMember,
} from '@/types/organization'

class OrganizationsService extends BaseService {
  /**
   * Lista organizações do usuário (não precisa de X-Org-Id).
   */
  async listOrganizations(): Promise<Organization[]> {
    return this.get<Organization[]>('/api/organizations', { skipOrgHeader: true })
  }

  /**
   * Busca organização atual (multi-tenant via X-Org-Id header).
   */
  async getCurrentOrganization(): Promise<Organization> {
    return this.get<Organization>('/api/organizations/current')
  }

  /**
   * Cria nova organização (não precisa de X-Org-Id - será a primeira org do user).
   */
  async createOrganization(data: OrganizationCreate): Promise<Organization> {
    return this.post<Organization>('/api/organizations', data, { skipOrgHeader: true })
  }

  /**
   * Atualiza organização atual (multi-tenant via X-Org-Id header).
   */
  async updateCurrentOrganization(data: OrganizationUpdate): Promise<Organization> {
    return this.put<Organization>('/api/organizations/current', data)
  }

  /**
   * Deleta organização atual (multi-tenant via X-Org-Id header).
   */
  async deleteCurrentOrganization(): Promise<void> {
    return this.delete('/api/organizations/current')
  }

  /**
   * Lista membros da organização atual (multi-tenant via X-Org-Id header).
   * DEPRECATED: Use MembersService.listMembers() instead.
   */
  async listCurrentMembers(): Promise<OrganizationMember[]> {
    return this.get<OrganizationMember[]>('/api/organizations/current/members')
  }

  /**
   * Aceita convite para organização (não precisa de X-Org-Id - user ainda não é membro).
   */
  async acceptInvite(token: string): Promise<Organization> {
    return this.post<Organization>('/api/invites/accept', { token }, { skipOrgHeader: true })
  }

  /**
   * Transfere propriedade da organização atual (multi-tenant via X-Org-Id header).
   */
  async transferOwnership(newOwnerId: string): Promise<Organization> {
    return this.post<Organization>('/api/organizations/current/transfer-ownership', {
      new_owner_id: newOwnerId,
    })
  }
}

export const organizationsService = new OrganizationsService()
