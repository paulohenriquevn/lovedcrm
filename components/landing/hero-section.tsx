/**
 * Hero Section - Landing Page Loved CRM
 * Seção principal da landing page para agências digitais brasileiras
 * Baseado na especificação do agente 08-landing-page.md
 */

'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Play, Users, Zap, Shield } from 'lucide-react'

declare global {
  function gtag(...args: any[]): void
}

export function HeroSection() {
  return (
    <section className="py-20 px-4 text-center bg-gradient-to-b from-background via-violet-50/30 to-background">
      <div className="max-w-7xl mx-auto">
        {/* Badge Setor-Específico */}
        <Badge className="mb-6 bg-violet-50 text-violet-700 border-violet-200 px-4 py-2 text-sm font-medium">
          🚀 Especializado para Agências de 5-20 Colaboradores
        </Badge>
        
        {/* Headline Principal */}
        <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
          O Único CRM que{" "}
          <span className="text-primary bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Agências Digitais Brasileiras
          </span>{" "}
          Realmente Precisam
        </h1>
        
        {/* Subheadline */}
        <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
          Transforme a gestão da sua agência com{" "}
          <strong className="text-primary">pipeline visual</strong>,{" "}
          <strong className="text-whatsapp">WhatsApp integrado</strong> e{" "}
          <strong className="text-ai-summary">IA em português</strong> - 
          tudo em uma única plataforma moderna.
        </p>
        
        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button 
            size="lg" 
            className="h-14 px-8 text-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl"
            onClick={() => {
              if (typeof gtag !== 'undefined') {
                gtag('event', 'cta_click', { 
                  cta_position: 'hero', 
                  cta_text: 'criar_organizacao_gratis',
                  sector: 'agencias_digitais' 
                })
              }
            }}
          >
            Criar Organização Grátis
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="h-14 px-8 text-lg border-primary text-primary hover:bg-primary/10 transition-all duration-300"
            onClick={() => {
              if (typeof gtag !== 'undefined') {
                gtag('event', 'demo_request', { source: 'hero' })
              }
            }}
          >
            <Play className="mr-2 h-5 w-5" />
            Ver Demonstração
          </Button>
        </div>

        {/* Trust Indicators */}
        <div className="flex items-center justify-center gap-8 mb-12 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>500+ Agências</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            <span>Setup em 5min</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span>LGPD Nativo</span>
          </div>
        </div>
        
        {/* Visual/Mockup */}
        <div className="mt-12 relative">
          <div className="relative max-w-5xl mx-auto">
            {/* Dashboard Mockup Placeholder */}
            <div className="bg-white rounded-2xl shadow-2xl border border-border w-full aspect-[16/10] relative overflow-hidden">
              {/* Header do Dashboard */}
              <div className="bg-gray-50 px-6 py-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-sm">L</span>
                  </div>
                  <span className="font-semibold">Silva Digital Agency</span>
                  <Badge className="bg-tier-pro text-white text-xs">PRO</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                  <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
                  <div className="h-8 w-8 bg-gray-400 rounded-full"></div>
                </div>
              </div>

              {/* Dashboard Content */}
              <div className="p-6">
                {/* Pipeline Cards */}
                <div className="grid grid-cols-5 gap-4 mb-6">
                  {['Lead', 'Contato', 'Proposta', 'Negociação', 'Fechado'].map((stage, index) => (
                    <div key={stage} className="bg-gray-50 rounded-lg p-3">
                      <h4 className="text-xs font-medium mb-2">{stage}</h4>
                      <div className="space-y-2">
                        {[...Array(index + 1)].map((_, i) => (
                          <div key={i} className="bg-white rounded border h-12 flex items-center px-2">
                            <div className="h-2 w-2 bg-primary rounded-full mr-2"></div>
                            <div className="text-xs text-gray-600">Lead {i + 1}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Timeline Mockup */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium mb-3">Timeline Recente</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-whatsapp rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">W</span>
                      </div>
                      <div className="flex-1 text-xs text-gray-600">
                        Cliente interessado em marketing digital...
                      </div>
                      <span className="text-xs text-gray-400">5min</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-ai-summary rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">IA</span>
                      </div>
                      <div className="flex-1 text-xs text-gray-600">
                        Resumo automático gerado: Lead qualificado, orçamento R$ 5k/mês
                      </div>
                      <span className="text-xs text-gray-400">8min</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Overlay com destaques */}
            <div className="absolute top-20 left-4 bg-primary text-primary-foreground px-3 py-1 rounded-lg text-sm font-medium animate-pulse">
              Pipeline Kanban
            </div>
            <div className="absolute top-20 right-4 bg-whatsapp text-white px-3 py-1 rounded-lg text-sm font-medium animate-pulse">
              WhatsApp Integrado
            </div>
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-ai-summary text-white px-3 py-1 rounded-lg text-sm font-medium animate-pulse">
              IA Resumos Automáticos
            </div>
          </div>
        </div>

        {/* Social Proof Básico */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Confiado por agências em todo Brasil
          </p>
          <div className="flex items-center justify-center gap-8 opacity-60">
            <div className="bg-gray-100 rounded h-8 w-24"></div>
            <div className="bg-gray-100 rounded h-8 w-24"></div>
            <div className="bg-gray-100 rounded h-8 w-24"></div>
            <div className="bg-gray-100 rounded h-8 w-24"></div>
          </div>
        </div>
      </div>
    </section>
  )
}