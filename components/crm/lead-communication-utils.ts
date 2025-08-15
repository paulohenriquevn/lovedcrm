/**
 * Lead Communication Utility Functions
 * Helper functions for lead communication
 */

import type { Lead } from '@/services/crm-leads'
import type { TemplateUseContext } from '@/types/template'

const FALLBACK_NOT_INFORMED = 'Não informado'

export function createLeadContext(lead: Lead): TemplateUseContext {
  return {
    // eslint-disable-next-line camelcase
    lead_name: lead.name,
    company: lead.email?.split('@')[1] ?? 'Empresa',
    value:
      lead.estimated_value !== null &&
      lead.estimated_value !== undefined &&
      lead.estimated_value > 0
        ? `R$ ${lead.estimated_value.toLocaleString()}`
        : FALLBACK_NOT_INFORMED,
    phone: lead.phone ?? FALLBACK_NOT_INFORMED,
    email: lead.email ?? FALLBACK_NOT_INFORMED,
    source: lead.source ?? FALLBACK_NOT_INFORMED,
    // eslint-disable-next-line camelcase
    user_name: 'Você', // This would come from user context
    // eslint-disable-next-line camelcase
    user_title: 'Consultor de Vendas',
    organization: 'LovedCRM',
    // eslint-disable-next-line camelcase
    current_date: new Date().toLocaleDateString('pt-BR'),
    // eslint-disable-next-line camelcase
    current_time: new Date().toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  }
}
