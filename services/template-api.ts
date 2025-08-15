/**
 * Template API Service
 * Service for Message Template management with organizational isolation
 * Follows template BaseService pattern with X-Org-Id headers
 */

import { BaseService } from './base'
import type {
  MessageTemplate,
  TemplateFormData,
  TemplateUpdateData,
  TemplateUseResponse,
} from '@/types/template'

export interface TemplateUseRequest {
  context: Record<string, any>
}

export interface TemplateListResponse {
  templates: MessageTemplate[]
  total: number
  page: number
  page_size: number
  has_next: boolean
  has_prev: boolean
}

export class TemplateAPI extends BaseService {
  private readonly endpoint = '/templates'

  /**
   * Get organization templates with optional filtering
   */
  async getTemplates(category?: string, isActive: boolean = true): Promise<MessageTemplate[]> {
    const params = new URLSearchParams()
    if (category) params.append('category', category)
    params.append('is_active', isActive.toString())

    const queryString = params.toString()
    const url = queryString ? `${this.endpoint}?${queryString}` : this.endpoint

    const response = await this.request<MessageTemplate[]>(url, {
      method: 'GET',
    })

    return response
  }

  /**
   * Get template by ID with organization validation
   */
  async getTemplate(templateId: string): Promise<MessageTemplate> {
    const response = await this.request<MessageTemplate>(`${this.endpoint}/${templateId}`, {
      method: 'GET',
    })

    return response
  }

  /**
   * Create new template with organization isolation
   */
  async createTemplate(template: TemplateFormData): Promise<MessageTemplate> {
    const response = await this.request<MessageTemplate>(this.endpoint, {
      method: 'POST',
      body: JSON.stringify(template),
    })

    return response
  }

  /**
   * Update template with organization validation
   */
  async updateTemplate(templateId: string, template: TemplateUpdateData): Promise<MessageTemplate> {
    const response = await this.request<MessageTemplate>(`${this.endpoint}/${templateId}`, {
      method: 'PUT',
      body: JSON.stringify(template),
    })

    return response
  }

  /**
   * Delete template with organization validation
   */
  async deleteTemplate(templateId: string): Promise<void> {
    await this.request<void>(`${this.endpoint}/${templateId}`, {
      method: 'DELETE',
    })
  }

  /**
   * Use template with variable substitution + increment usage
   */
  async useTemplate(
    templateId: string,
    context: Record<string, any>
  ): Promise<TemplateUseResponse> {
    const useRequest: TemplateUseRequest = { context }

    const response = await this.request<TemplateUseResponse>(`${this.endpoint}/${templateId}/use`, {
      method: 'POST',
      body: JSON.stringify(useRequest),
    })

    return response
  }

  /**
   * Get available template categories for organization
   */
  async getTemplateCategories(): Promise<string[]> {
    const response = await this.request<string[]>(`${this.endpoint}/categories/list`, {
      method: 'GET',
    })

    return response
  }

  /**
   * Get list of available variables for template creation
   */
  async getAvailableVariables(): Promise<string[]> {
    const response = await this.request<string[]>(`${this.endpoint}/variables/available`, {
      method: 'GET',
    })

    return response
  }
}

// Export singleton instance
export const templateApi = new TemplateAPI()
