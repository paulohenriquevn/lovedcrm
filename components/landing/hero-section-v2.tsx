/**
 * Hero Section V2 - Landing Page Loved CRM
 * Versão alinhada com especificação 09-landing-page.md
 * Preserva headline exata do vision.md + tokens de design setoriais
 */

'use client'

import { ArrowRight, Users, Zap, Shield } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export function HeroSectionV2(): React.ReactElement {
  return (
    <section className="bg-gradient-to-b from-background via-sector-primary/5 to-background px-6 py-24">
      <div className="container mx-auto max-w-6xl text-center">
        <Badge className="mb-6 bg-sector-primary/10 text-sector-primary border-sector-primary/20 px-4 py-2">
          Agências Digitais • 5-20 Colaboradores • Brasil
        </Badge>
        
        <h1 className="mb-6 text-4xl font-bold tracking-tight lg:text-6xl leading-tight">
          O primeiro CRM que elimina a fragmentação de ferramentas para{" "}
          <span className="bg-gradient-to-r from-sector-primary to-purple-600 bg-clip-text text-transparent">
            agências digitais
          </span>, integrando pipeline visual + WhatsApp + IA em uma única plataforma
        </h1>
        
        <p className="mb-8 text-xl text-muted-foreground lg:text-2xl max-w-4xl mx-auto">
          Loved CRM é o único CRM brasileiro que integra nativamente: Pipeline Visual Avançado, 
          WhatsApp/VoIP Unificado, Inteligência Artificial e Multi-Tenant Architecture
        </p>
        
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center mb-8">
          <Button size="lg" className="h-14 px-8 text-lg bg-sector-cta hover:bg-sector-cta/90">
            Criar Organização Grátis
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          
          <Button variant="outline" size="lg" className="h-14 px-8 text-lg border-sector-primary text-sector-primary hover:bg-sector-primary/10">
            Solicitar Demo B2B
          </Button>
        </div>
        
        <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-sector-trust" />
            <span>500+ Agências</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-sector-trust" />
            <span>Setup 5min</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-sector-trust" />
            <span>LGPD Nativo</span>
          </div>
        </div>
      </div>
    </section>
  )
}