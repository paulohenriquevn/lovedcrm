/**
 * CRM Leads Service
 * Service for Lead management with organizational isolation
 * Follows template BaseService pattern with X-Org-Id headers
 */

import { BaseService } from './base'

export interface Lead {
  id: string
  organization_id: string
  name: string
  email?: string
  phone?: string
  stage: PipelineStage
  source: string
  estimated_value?: number
  tags?: string[]
  notes?: string
  assigned_user_id?: string
  last_contact_at?: string
  last_contact_channel?: string
  created_at: string
  updated_at: string
  is_closed: boolean
  days_in_current_stage?: number
  is_favorite: boolean
}

export enum PipelineStage {
  LEAD = 'lead',
  CONTATO = 'contato',
  PROPOSTA = 'proposta',
  NEGOCIACAO = 'negociacao',
  FECHADO = 'fechado',
}

export interface LeadCreate {
  name: string
  email?: string
  phone?: string
  stage?: PipelineStage
  source?: string
  estimated_value?: number
  tags?: string[]
  notes?: string
  assigned_user_id?: string
}

export interface LeadUpdate {
  name?: string
  email?: string
  phone?: string
  source?: string
  estimated_value?: number
  tags?: string[]
  notes?: string
  assigned_user_id?: string
}

export interface LeadStageUpdate {
  stage: PipelineStage
  notes?: string
}

export interface LeadListResponse {
  leads: Lead[]
  total_count: number
  page: number
  page_size: number
  has_more: boolean
}

export interface PipelineStatsResponse {
  stage_counts: Record<string, number>
  total_leads: number
  conversion_rate?: number
}

export interface LeadSearchRequest {
  query: string
  page?: number
  page_size?: number
}

class CRMLeadsService extends BaseService {
  private readonly baseUrl = '/api/crm/leads'

  /**
   * Create new lead for organization
   */
  async createLead(leadData: LeadCreate): Promise<Lead> {
    return this.post<Lead>(this.baseUrl, leadData)
  }

  /**
   * Get leads for organization with pagination
   */
  async getLeads(
    page: number = 1,
    pageSize: number = 20,
    stage?: PipelineStage
  ): Promise<LeadListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    })

    if (stage) {
      params.append('stage', stage)
    }

    return this.get<LeadListResponse>(`${this.baseUrl}?${params.toString()}`)
  }

  /**
   * Get pipeline statistics for organization
   */
  async getPipelineStatistics(): Promise<PipelineStatsResponse> {
    return this.get<PipelineStatsResponse>(`${this.baseUrl}/statistics`)
  }

  /**
   * Search leads by name, email or phone
   */
  async searchLeads(searchRequest: LeadSearchRequest): Promise<LeadListResponse> {
    return this.post<LeadListResponse>(`${this.baseUrl}/search`, searchRequest)
  }

  /**
   * Get single lead by ID
   */
  async getLead(leadId: string): Promise<Lead> {
    return this.get<Lead>(`${this.baseUrl}/${leadId}`)
  }

  /**
   * Update existing lead
   */
  async updateLead(leadId: string, leadData: LeadUpdate): Promise<Lead> {
    return this.put<Lead>(`${this.baseUrl}/${leadId}`, leadData)
  }

  /**
   * Update lead pipeline stage
   */
  async updateLeadStage(leadId: string, stageData: LeadStageUpdate): Promise<Lead> {
    return this.put<Lead>(`${this.baseUrl}/${leadId}/stage`, stageData)
  }

  /**
   * Delete lead
   */
  async deleteLead(leadId: string): Promise<void> {
    return this.delete(`${this.baseUrl}/${leadId}`)
  }

  /**
   * Get leads grouped by pipeline stage (for Kanban view)
   */
  async getLeadsByStage(): Promise<Record<PipelineStage, Lead[]>> {
    const stages = Object.values(PipelineStage)
    const stageLeads: Record<PipelineStage, Lead[]> = {} as Record<PipelineStage, Lead[]>

    // Get leads for each stage in parallel
    const stagePromises = stages.map(async stage => {
      const response = await this.getLeads(1, 100, stage) // Get up to 100 leads per stage
      return { stage, leads: response.leads }
    })

    const results = await Promise.all(stagePromises)

    // Build the grouped result
    results.forEach(({ stage, leads }) => {
      stageLeads[stage] = leads
    })

    return stageLeads
  }

  /**
   * Move lead to different stage (drag & drop support)
   */
  async moveLeadToStage(leadId: string, newStage: PipelineStage, notes?: string): Promise<Lead> {
    return this.updateLeadStage(leadId, { stage: newStage, notes })
  }

  /**
   * Get recent leads activity (for dashboard)
   */
  async getRecentLeads(limit: number = 5): Promise<Lead[]> {
    const response = await this.getLeads(1, limit)
    return response.leads
  }

  /**
   * Bulk update leads (for future use)
   */
  async bulkUpdateLeads(leadIds: string[], updates: LeadUpdate): Promise<void> {
    // For now, update one by one
    // In production, you might want to implement a bulk endpoint
    const promises = leadIds.map(id => this.updateLead(id, updates))
    await Promise.all(promises)
  }

  /**
   * Toggle lead favorite status
   */
  async toggleLeadFavorite(leadId: string, isFavorite: boolean): Promise<Lead> {
    return this.put<Lead>(`${this.baseUrl}/${leadId}/favorite`, { is_favorite: isFavorite })
  }

  /**
   * Get leads assigned to specific user
   */
  async getAssignedLeads(userId?: string): Promise<Lead[]> {
    // For now, get all leads and filter client-side
    // In production, add server-side filtering
    const response = await this.getLeads(1, 100)

    if (!userId) return response.leads

    return response.leads.filter(lead => lead.assigned_user_id === userId)
  }

  /**
   * Get pipeline filter options
   */
  async getPipelineFilters(): Promise<{
    sources: Array<{ label: string; value: string }>
    users: Array<{ label: string; value: string }>
    tags: Array<{ label: string; value: string }>
  }> {
    return this.get<{
      sources: Array<{ label: string; value: string }>
      users: Array<{ label: string; value: string }>
      tags: Array<{ label: string; value: string }>
    }>(`${this.baseUrl}/filters`)
  }

  /**
   * Get pipeline metrics
   */
  async getPipelineMetrics(params?: { startDate?: string; endDate?: string }): Promise<{
    stage_counts: Record<string, number>
    average_stage_times: Record<string, number>
    conversion_rate: number
    total_pipeline_value: number
    closed_pipeline_value: number
    total_leads: number
  }> {
    const searchParams = new URLSearchParams()
    if (params?.startDate) searchParams.append('start_date', params.startDate)
    if (params?.endDate) searchParams.append('end_date', params.endDate)

    const query = searchParams.toString()
    const url = query ? `${this.baseUrl}/metrics?${query}` : `${this.baseUrl}/metrics`

    return this.get<{
      stage_counts: Record<string, number>
      average_stage_times: Record<string, number>
      conversion_rate: number
      total_pipeline_value: number
      closed_pipeline_value: number
      total_leads: number
    }>(url)
  }
}

// Export singleton instance
export const crmLeadsService = new CRMLeadsService()
export default crmLeadsService
