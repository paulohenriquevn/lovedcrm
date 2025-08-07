/**
 * PRD Features Sections - Landing Page Loved CRM
 * Todas as 15 funcionalidades do PRD mapeadas individualmente
 * Baseado na especificação do agente 09-landing-page.md
 */

'use client'

import { CheckCircle } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

export function PipelineVisualSection() {
  return (
    <section className="px-6 py-16">
      <div className="container mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <Badge className="mb-4 bg-organization/10 text-organization border-organization/20">
              MVP Core • Essencial
            </Badge>
            
            <h2 className="mb-4 text-3xl font-bold">
              Pipeline Visual com Drag & Drop Inteligente
            </h2>
            
            <p className="mb-6 text-lg text-muted-foreground">
              Funil drag-and-drop com mínimo 5 estágios configuráveis, 
              filtros por origem, responsável, período e métricas de conversão 
              por estágio em tempo real - tudo isolado por organização.
            </p>
            
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-sector-trust flex-shrink-0" />
                <span>5+ estágios customizáveis (Lead → Contact → Proposal → Negotiation → Closed)</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-sector-trust flex-shrink-0" />
                <span>Filtros avançados por origem, responsável e período</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-sector-trust flex-shrink-0" />
                <span>Métricas de conversão em tempo real por estágio</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-sector-trust flex-shrink-0" />
                <span>Isolamento multi-tenant completo por organização</span>
              </li>
            </ul>
          </div>
          
          <Card className="border-sector-primary/20 bg-sector-primary/5">
            <CardContent className="p-6">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="grid grid-cols-5 gap-2 text-xs">
                  {['Lead', 'Contato', 'Proposta', 'Negociação', 'Fechado'].map((stage, i) => (
                    <div key={stage} className="bg-gray-50 rounded p-2">
                      <div className="font-medium text-center mb-2">{stage}</div>
                      <div className="space-y-1">
                        {Array.from({length: i + 1}).map((_, j) => (
                          <div key={j} className="bg-sector-primary/20 rounded p-1 text-center">
                            Lead {j + 1}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

export function WhatsAppIntegrationSection() {
  return (
    <section className="px-6 py-16 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <Badge className="mb-4 bg-whatsapp/10 text-whatsapp border-whatsapp/20">
              MVP Core • WhatsApp Nativo
            </Badge>
            
            <h2 className="mb-4 text-3xl font-bold">
              WhatsApp Business API + Web API Dual
            </h2>
            
            <p className="mb-6 text-lg text-muted-foreground">
              Chat integrado com histórico completo, anexos (imagens, documentos, áudios), 
              status de entrega e leitura, sincronização bidirecional - arquitetura dual provider única.
            </p>
            
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-sector-trust flex-shrink-0" />
                <span>Business API oficial + Web API não-oficial (dual provider)</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-sector-trust flex-shrink-0" />
                <span>Anexos completos: imagens, documentos, áudios, vídeos</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-sector-trust flex-shrink-0" />
                <span>Status de entrega/leitura em tempo real</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-sector-trust flex-shrink-0" />
                <span>Sincronização bidirecional com WhatsApp Web</span>
              </li>
            </ul>
          </div>
          
          <Card className="border-whatsapp/20 bg-whatsapp/5">
            <CardContent className="p-6">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-4 pb-3 border-b">
                  <div className="w-10 h-10 bg-whatsapp rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">W</span>
                  </div>
                  <div>
                    <div className="font-medium">Cliente Lead</div>
                    <div className="text-xs text-muted-foreground">Online</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                    <div className="text-sm">Olá! Preciso de um site para minha empresa...</div>
                    <div className="text-xs text-muted-foreground mt-1">14:23 ✓✓</div>
                  </div>
                  <div className="bg-whatsapp text-white rounded-lg p-3 max-w-xs ml-auto">
                    <div className="text-sm">Oi! Que tipo de site você está buscando?</div>
                    <div className="text-xs text-whatsapp-light mt-1">14:25 ✓✓</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

export function LeadsManagementSection() {
  return (
    <section className="px-6 py-16">
      <div className="container mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <Badge className="mb-4 bg-ai-summary/10 text-ai-summary border-ai-summary/20">
              MVP Core • IA Powered
            </Badge>
            
            <h2 className="mb-4 text-3xl font-bold">
              Lead Scoring Automático com IA
            </h2>
            
            <p className="mb-6 text-lg text-muted-foreground">
              Captura automática de múltiplas fontes, qualificação por score automático, 
              distribuição inteligente por responsável e prevenção de duplicatas com ML.
            </p>
            
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-sector-trust flex-shrink-0" />
                <span>Captura multi-fonte: WhatsApp, forms, Facebook, Google Ads</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-sector-trust flex-shrink-0" />
                <span>Score automático 0-100 com ML pipeline</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-sector-trust flex-shrink-0" />
                <span>Distribuição inteligente round-robin + workload</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-sector-trust flex-shrink-0" />
                <span>Deduplicação automática 95%+ accuracy</span>
              </li>
            </ul>
          </div>
          
          <Card className="border-ai-summary/20 bg-ai-summary/5">
            <CardContent className="p-6">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <div className="font-medium">João Silva</div>
                      <div className="text-sm text-muted-foreground">joao@empresa.com.br</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sector-trust">Score: 85</div>
                      <div className="text-xs text-muted-foreground">Alta qualificação</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <div className="font-medium">Maria Santos</div>
                      <div className="text-sm text-muted-foreground">maria@startup.com</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-yellow-600">Score: 62</div>
                      <div className="text-xs text-muted-foreground">Média qualificação</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <div className="font-medium">Pedro Costa</div>
                      <div className="text-sm text-muted-foreground">pedro@gmail.com</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-red-600">Score: 23</div>
                      <div className="text-xs text-muted-foreground">Baixa qualificação</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}