/**
 * Design Tokens Demo Page
 * Página de demonstração do sistema de design tokens Loved CRM
 * Para testar todos os componentes e tokens implementados
 */

'use client'

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OrganizationBadge, CurrentOrganizationBadge } from "@/components/ui/organization-badge"
import { PipelineStage, PipelineProgress } from "@/components/crm/pipeline-stage"
import { AISummary, AISummaryCompact } from "@/components/crm/ai-summary"
import { CommunicationChannelBadge, MessageBubble, WhatsAppMessage } from "@/components/crm/communication-channel"
import { Timeline, TimelineStats } from "@/components/crm/timeline"
import type { TimelineEntry } from "@/components/crm/timeline"
import { designTokens } from "@/types/design-tokens"
import { 
  Sparkles, 
  Palette, 
  Layers, 
  MessageCircle, 
  BarChart3,
  Smartphone
} from "lucide-react"

export default function DesignTokensDemo() {
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
      leadName: 'João Silva',
      leadId: 'lead-1'
    },
    {
      id: '2',
      type: 'ai_summary',
      timestamp: new Date(Date.now() - 1000 * 60 * 10), // 10 min ago
      summary: 'Cliente demonstrou interesse genuíno em serviços de marketing digital. Menciona urgência para começar projeto ainda este mês.',
      confidence: 87,
      sentiment: 'positive',
      leadName: 'João Silva',
      leadId: 'lead-1'
    },
    {
      id: '3',
      type: 'email',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      content: 'Segue proposta comercial conforme conversamos. Prazo: 30 dias úteis.',
      direction: 'outbound',
      status: 'delivered',
      userName: 'Maria Santos',
      leadName: 'João Silva',
      leadId: 'lead-1',
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
      leadName: 'João Silva',
      leadId: 'lead-1'
    }
  ]

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Sparkles className="h-8 w-8 text-primary animate-pulse" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Loved CRM Design System
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Sistema completo de design tokens para CRM B2B brasileiro com paleta Loved Purple e componentes específicos para agências digitais.
        </p>
        <div className="flex items-center justify-center gap-2">
          <CurrentOrganizationBadge orgName="Agência Demo" tier={selectedTier} />
        </div>
      </div>

      <Tabs defaultValue="colors" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="colors" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Cores
          </TabsTrigger>
          <TabsTrigger value="organization" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Organização
          </TabsTrigger>
          <TabsTrigger value="pipeline" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Pipeline
          </TabsTrigger>
          <TabsTrigger value="communication" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Comunicação
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            IA
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            Timeline
          </TabsTrigger>
        </TabsList>

        {/* Colors Tab */}
        <TabsContent value="colors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Paleta Principal - Loved Purple</CardTitle>
              <CardDescription>
                Cores primárias do sistema baseadas na psicologia de cores para agências brasileiras
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="h-20 rounded-lg bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground font-medium">Primary</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Loved Purple - Criatividade e IA</p>
                </div>
                <div className="space-y-2">
                  <div className="h-20 rounded-lg bg-accent flex items-center justify-center">
                    <span className="text-accent-foreground font-medium">Accent</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Emerald - Sucesso e crescimento</p>
                </div>
                <div className="space-y-2">
                  <div className="h-20 rounded-lg bg-destructive flex items-center justify-center">
                    <span className="text-destructive-foreground font-medium">Destructive</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Red - Alertas e ações críticas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cores de Contexto</CardTitle>
              <CardDescription>
                Cores específicas para diferentes contextos do CRM
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <div className="h-16 rounded-lg bg-whatsapp flex items-center justify-center">
                    <span className="text-white font-medium text-sm">WhatsApp</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-16 rounded-lg bg-communication-email flex items-center justify-center">
                    <span className="text-white font-medium text-sm">Email</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-16 rounded-lg bg-communication-voip flex items-center justify-center">
                    <span className="text-white font-medium text-sm">VoIP</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-16 rounded-lg bg-communication-note flex items-center justify-center">
                    <span className="text-white font-medium text-sm">Notas</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Organization Tab */}
        <TabsContent value="organization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tiers de Organização</CardTitle>
              <CardDescription>
                Badges e indicadores para diferentes níveis de assinatura
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <OrganizationBadge tier="free" showLabel />
                <OrganizationBadge tier="pro" showLabel />
                <OrganizationBadge tier="enterprise" showLabel />
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Seletor de Tier:</p>
                <div className="flex gap-2">
                  {(['free', 'pro', 'enterprise'] as const).map((tier) => (
                    <Button
                      key={tier}
                      variant={selectedTier === tier ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedTier(tier)}
                    >
                      <OrganizationBadge tier={tier} />
                    </Button>
                  ))}
                </div>
              </div>

              <div className="org-scope-indicator p-4 rounded-lg">
                <p className="text-sm font-medium mb-2">Indicador de Contexto Organizacional</p>
                <p className="text-xs text-muted-foreground">
                  Esta borda indica que você está no contexto de uma organização específica
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pipeline Tab */}
        <TabsContent value="pipeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Estágios do Pipeline</CardTitle>
              <CardDescription>
                Pipeline brasileiro: Lead → Contato → Proposta → Negociação → Fechado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {(['lead', 'contact', 'proposal', 'negotiation', 'closed'] as const).map((stage) => (
                  <PipelineStage 
                    key={stage}
                    stage={stage} 
                    count={Math.floor(Math.random() * 10) + 1}
                    variant="kanban"
                    interactive
                    onClick={() => setSelectedStage(stage)}
                    className={selectedStage === stage ? 'ring-2 ring-primary' : ''}
                  />
                ))}
              </div>

              <div className="space-y-4">
                <p className="text-sm font-medium">Progresso do Pipeline:</p>
                <PipelineProgress currentStage={selectedStage} />
              </div>

              <div className="space-y-4">
                <p className="text-sm font-medium">Variantes Compactas:</p>
                <div className="flex flex-wrap gap-3">
                  {(['lead', 'contact', 'proposal', 'negotiation', 'closed'] as const).map((stage) => (
                    <PipelineStage 
                      key={stage}
                      stage={stage} 
                      count={5}
                      variant="compact"
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Communication Tab */}
        <TabsContent value="communication" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Canais de Comunicação</CardTitle>
              <CardDescription>
                Badges e componentes para diferentes canais de comunicação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <p className="text-sm font-medium">Badges de Canal:</p>
                <div className="flex flex-wrap gap-3">
                  <CommunicationChannelBadge channel="whatsapp" showLabel />
                  <CommunicationChannelBadge channel="email" showLabel />
                  <CommunicationChannelBadge channel="voip" showLabel />
                  <CommunicationChannelBadge channel="note" showLabel />
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-sm font-medium">Mensagens Exemplo:</p>
                <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                  <MessageBubble
                    content="Olá! Gostaria de saber mais sobre seus serviços de marketing digital."
                    direction="inbound"
                    channel="whatsapp"
                    timestamp={new Date()}
                    status="read"
                    senderName="João Silva"
                  />
                  <MessageBubble
                    content="Claro! Vou te enviar nossa apresentação. Qual o melhor horário para conversarmos?"
                    direction="outbound"
                    channel="whatsapp"
                    timestamp={new Date(Date.now() - 60000)}
                    status="delivered"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-sm font-medium">Mensagens WhatsApp Nativas:</p>
                <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                  <WhatsAppMessage
                    content="Oi! Vi que vocês trabalham com agências. Tenho uma empresa e preciso de ajuda com marketing."
                    direction="inbound"
                    timestamp={new Date()}
                    status="read"
                    senderName="Maria Santos"
                  />
                  <WhatsAppMessage
                    content="Perfeito! Vamos agendar uma conversa para entender melhor suas necessidades. Você tem disponibilidade amanhã?"
                    direction="outbound"
                    timestamp={new Date(Date.now() - 120000)}
                    status="delivered"
                    attachmentCount={1}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Tab */}
        <TabsContent value="ai" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumos com IA</CardTitle>
              <CardDescription>
                Componentes para exibir resumos gerados por inteligência artificial
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <AISummary
                summary="O cliente demonstrou forte interesse nos serviços de marketing digital. Mencionou ter uma agência pequena e busca parceria para escalar. Orçamento estimado entre R$ 5-10k/mês. Urgência alta - quer começar ainda este mês."
                confidence={92}
                sentiment="positive"
                nextActions={[
                  "Agendar call para entender melhor as necessidades",
                  "Preparar proposta customizada para agências",
                  "Enviar cases similares de sucesso"
                ]}
                modelUsed="gpt-4"
                tokensUsed={1247}
                expandable
                onRegenerate={() => alert('Regenerar resumo')}
                onCopy={() => alert('Resumo copiado!')}
              />

              <div className="space-y-4">
                <p className="text-sm font-medium">Versão Compacta:</p>
                <AISummaryCompact 
                  summary="Cliente interessado em parceria. Budget R$ 5-10k/mês, urgência alta."
                  confidence={85}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Timeline Unificada</CardTitle>
              <CardDescription>
                Timeline completa com todos os tipos de interações do CRM
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <TimelineStats entries={demoTimelineEntries} />
              <Timeline 
                entries={demoTimelineEntries}
                groupByDate={false}
                showLeadContext
                onEntryClick={(entry) => console.log('Clicked entry:', entry)}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Diferenciação Competitiva
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Paleta Única no Mercado</h4>
              <p className="text-sm text-muted-foreground">
                Loved Purple (#8B5CF6) é única entre CRMs brasileiros, associada com criatividade e IA
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Componentes B2B Específicos</h4>
              <p className="text-sm text-muted-foreground">
                Pipeline brasileiro, WhatsApp nativo, resumos com IA em português
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Acolhimento Brasileiro</h4>
              <p className="text-sm text-muted-foreground">
                Tons mais quentes que concorrentes internacionais, linguagem local
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Multi-tenant Visual</h4>
              <p className="text-sm text-muted-foreground">
                Indicadores visuais de contexto organizacional e isolamento de dados
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}