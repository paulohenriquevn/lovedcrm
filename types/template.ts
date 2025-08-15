/**
 * Template Types
 * TypeScript types for Message Template functionality
 */

export type TemplateCategory = 'greeting' | 'follow-up' | 'objection' | 'closing' | 'custom'

export interface MessageTemplate {
  id: string
  organization_id: string
  name: string
  category: TemplateCategory
  content: string
  variables: string[]
  is_active: boolean
  is_favorite?: boolean
  usage_count: number
  created_by_id?: string
  created_at: string
  updated_at: string
}

export interface TemplateFormData {
  name: string
  category: TemplateCategory
  content: string
}

export interface TemplateUpdateData {
  name?: string
  category?: TemplateCategory
  content?: string
  is_active?: boolean
}

export interface TemplateUseContext {
  // Lead variables
  lead_name?: string
  company?: string
  value?: string
  phone?: string
  email?: string
  source?: string

  // User variables
  user_name?: string
  user_title?: string
  organization?: string

  // System variables
  current_date?: string
  current_time?: string

  // Index signature for dynamic variable access
  [key: string]: string | undefined
}

export interface TemplateUseResponse {
  template_id: string
  rendered_content: string
  original_content: string
  variables_used: string[]
}

export interface TemplateListResponse {
  templates: MessageTemplate[]
  total: number
  page: number
  page_size: number
  has_next: boolean
  has_prev: boolean
}

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  'greeting',
  'follow-up',
  'objection',
  'closing',
  'custom',
]

export const TEMPLATE_CATEGORY_LABELS: Record<TemplateCategory, string> = {
  greeting: 'Saudação',
  'follow-up': 'Follow-up',
  objection: 'Objeção',
  closing: 'Fechamento',
  custom: 'Personalizado',
}

export const TEMPLATE_CATEGORY_ICONS: Record<TemplateCategory, string> = {
  greeting: '🎯',
  'follow-up': '📧',
  objection: '💬',
  closing: '🎉',
  custom: '⚙️',
}

export const AVAILABLE_VARIABLES = [
  'lead_name',
  'company',
  'value',
  'phone',
  'email',
  'source',
  'user_name',
  'user_title',
  'organization',
  'current_date',
  'current_time',
] as const

export type AvailableVariable = (typeof AVAILABLE_VARIABLES)[number]

export const VARIABLE_DESCRIPTIONS: Record<AvailableVariable, string> = {
  lead_name: 'Nome do lead',
  company: 'Nome da empresa',
  value: 'Valor estimado',
  phone: 'Telefone do lead',
  email: 'Email do lead',
  source: 'Origem do lead',
  user_name: 'Nome do usuário',
  user_title: 'Cargo do usuário',
  organization: 'Nome da organização',
  current_date: 'Data atual',
  current_time: 'Hora atual',
}
