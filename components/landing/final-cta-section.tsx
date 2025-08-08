/**
 * Final CTA Section - Landing Page Loved CRM
 * CTA final para conversão máxima baseado em 09-landing-page.md
 * Aplica design tokens setoriais para diferenciação visual
 */

'use client'

import { ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'

export function FinalCTASection(): React.ReactElement {
  return (
    <section className="bg-gradient-to-r from-sector-primary to-purple-600 px-6 py-20 text-white">
      <div className="container mx-auto max-w-4xl text-center">
        <h2 className="mb-6 text-4xl font-bold">Pare de Perder 40% dos Seus Leads</h2>
        <p className="mb-8 text-xl opacity-90">
          Junte-se às 500+ agências que eliminaram a fragmentação e aumentaram a conversão em 300%
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            className="h-14 px-8 text-lg bg-white text-sector-primary hover:bg-white/90"
          >
            Criar Organização Grátis
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-14 px-8 text-lg border-white text-white hover:bg-white/10"
          >
            Agendar Demo (15min)
          </Button>
        </div>
        <p className="mt-4 text-sm opacity-75">
          Setup em 5 minutos • Sem cartão de crédito • Suporte em português
        </p>
      </div>
    </section>
  )
}
