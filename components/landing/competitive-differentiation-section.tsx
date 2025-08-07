/**
 * Competitive Differentiation Section - Landing Page Loved CRM
 * Comparação setorial com RD Station, HubSpot e Pipedrive
 * Baseado na especificação do agente 09-landing-page.md
 */

'use client'

import { CheckCircle } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

export function CompetitiveDifferentiationSection() {
  return (
    <section className="px-6 py-16">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="mb-4 text-3xl font-bold">
            Por Que Escolher Loved CRM vs Concorrentes?
          </h2>
          <p className="text-lg text-muted-foreground">
            Comparação honesta com RD Station, HubSpot e Pipedrive
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <Card className="border-competitor-rd/20">
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <h3 className="font-semibold text-competitor-rd">RD Station</h3>
                <p className="text-sm text-muted-foreground">Líder brasileiro</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-sector-trust" />
                  <span>Empresa brasileira</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-sector-trust" />
                  <span>Integração WhatsApp</span>
                </div>
                <div className="flex items-center gap-2 text-red-600">
                  <span className="w-4 h-4 text-center">✗</span>
                  <span>Sem multi-tenancy real</span>
                </div>
                <div className="flex items-center gap-2 text-red-600">
                  <span className="w-4 h-4 text-center">✗</span>
                  <span>Sem IA conversacional</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-competitor-hubspot/20">
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <h3 className="font-semibold text-competitor-hubspot">HubSpot</h3>
                <p className="text-sm text-muted-foreground">Líder global</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-sector-trust" />
                  <span>Plataforma completa</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-sector-trust" />
                  <span>Landing pages avançadas</span>
                </div>
                <div className="flex items-center gap-2 text-red-600">
                  <span className="w-4 h-4 text-center">✗</span>
                  <span>WhatsApp via terceiros</span>
                </div>
                <div className="flex items-center gap-2 text-red-600">
                  <span className="w-4 h-4 text-center">✗</span>
                  <span>Preço premium (USD)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-sector-primary shadow-lg">
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <h3 className="font-semibold text-sector-primary">Loved CRM</h3>
                <p className="text-sm text-muted-foreground">Único completo</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-sector-trust" />
                  <span>WhatsApp nativo dual</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-sector-trust" />
                  <span>IA conversacional BR</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-sector-trust" />
                  <span>Multi-tenancy real</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-sector-trust" />
                  <span>Preço justo (BRL)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}