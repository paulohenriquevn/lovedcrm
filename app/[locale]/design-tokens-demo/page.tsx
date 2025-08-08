/**
 * Design Tokens Demo Page
 * Página de demonstração do sistema de design tokens Loved CRM
 * Para testar todos os componentes e tokens implementados
 */

'use client'

import { useState } from "react"

import { type TimelineEntry } from "@/components/crm/timeline"

import { DemoFooter } from "./components/DemoFooter"
import { DemoHeader } from "./components/DemoHeader"
import { DemoTabs } from "./components/DemoTabs"

// Constants
const DEMO_ORG_NAME = 'Agência Demo'
const DEMO_LEAD_NAME = 'João Silva'
const DEMO_LEAD_ID = 'lead-1'
const DEMO_USER_NAME = 'Maria Santos'

function DesignTokensDemo(): JSX.Element {
  const [selectedTier, setSelectedTier] = useState<'free' | 'pro' | 'enterprise'>('pro')
  const [selectedStage, setSelectedStage] = useState<'lead' | 'contact' | 'proposal' | 'negotiation' | 'closed'>('contact')

  // Demo timeline data
  const demoTimelineEntries: TimelineEntry[] = [
    {
      id: '1',
      type: 'whatsapp',
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 min ago
      content: 'Olá! Tenho interesse nos seus serviços de marketing digital.',
      direction: 'inbound',
      status: 'read',
      leadName: DEMO_LEAD_NAME,
      leadId: DEMO_LEAD_ID
    },
    {
      id: '2',
      type: 'ai_summary',
      timestamp: new Date(Date.now() - 1000 * 60 * 10), // 10 min ago
      summary: 'Cliente demonstrou interesse genuíno em serviços de marketing digital. Menciona urgência para começar projeto ainda este mês.',
      confidence: 87,
      sentiment: 'positive',
      leadName: DEMO_LEAD_NAME,
      leadId: DEMO_LEAD_ID
    },
    {
      id: '3',
      type: 'email',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      content: 'Segue proposta comercial conforme conversamos. Prazo: 30 dias úteis.',
      direction: 'outbound',
      status: 'delivered',
      userName: DEMO_USER_NAME,
      leadName: DEMO_LEAD_NAME,
      leadId: DEMO_LEAD_ID,
      attachmentCount: 1
    },
    {
      id: '4',
      type: 'lead_update',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
      field: 'stage',
      oldValue: 'lead',
      newValue: 'contact',
      description: 'Lead movido para estágio "Contato" após primeiro retorno',
      leadName: DEMO_LEAD_NAME,
      leadId: DEMO_LEAD_ID
    }
  ]

  return (
    <div className="container mx-auto p-6 space-y-8">
      <DemoHeader selectedTier={selectedTier} demoOrgName={DEMO_ORG_NAME} />
      
      <DemoTabs
        selectedTier={selectedTier}
        selectedStage={selectedStage}
        onTierChange={setSelectedTier}
        onStageChange={setSelectedStage}
        demoTimelineEntries={demoTimelineEntries}
      />

      <DemoFooter />
    </div>
  )
}

export default DesignTokensDemo