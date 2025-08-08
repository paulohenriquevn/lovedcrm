/**
 * Competitive Differentiation Section - Landing Page Loved CRM
 * Comparação setorial com RD Station, HubSpot e Pipedrive
 * Baseado na especificação do agente 09-landing-page.md
 */

'use client'

import { CheckCircle } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'

interface CompetitorProps {
  title: string
  subtitle: string
  features: Array<{ text: string; available: boolean }>
  borderColor: string
  titleColor: string
  highlight?: boolean
}

function CompetitorCard({
  title,
  subtitle,
  features,
  borderColor,
  titleColor,
  highlight = false,
}: CompetitorProps): React.ReactElement {
  return (
    <Card className={`${borderColor} ${highlight ? 'shadow-lg' : ''}`}>
      <CardContent className="p-6">
        <div className="text-center mb-4">
          <h3 className={`font-semibold ${titleColor}`}>{title}</h3>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <div className="space-y-2 text-sm">
          {features.map(feature => (
            <div
              key={`${title}-feature-${feature.text.slice(0, 15)}`}
              className={`flex items-center gap-2 ${feature.available ? '' : 'text-red-600'}`}
            >
              {feature.available ? (
                <CheckCircle className="h-4 w-4 text-sector-trust" />
              ) : (
                <span className="w-4 h-4 text-center">✗</span>
              )}
              <span>{feature.text}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function CompetitionHeader(): React.ReactElement {
  return (
    <div className="text-center mb-12">
      <h2 className="mb-4 text-3xl font-bold">Por Que Escolher Loved CRM vs Concorrentes?</h2>
      <p className="text-lg text-muted-foreground">
        Comparação honesta com RD Station, HubSpot e Pipedrive
      </p>
    </div>
  )
}

const competitors: CompetitorProps[] = [
  {
    title: 'RD Station',
    subtitle: 'Líder brasileiro',
    borderColor: 'border-competitor-rd/20',
    titleColor: 'text-competitor-rd',
    features: [
      { text: 'Empresa brasileira', available: true },
      { text: 'Integração WhatsApp', available: true },
      { text: 'Sem multi-tenancy real', available: false },
      { text: 'Sem IA conversacional', available: false },
    ],
  },
  {
    title: 'HubSpot',
    subtitle: 'Líder global',
    borderColor: 'border-competitor-hubspot/20',
    titleColor: 'text-competitor-hubspot',
    features: [
      { text: 'Plataforma completa', available: true },
      { text: 'Landing pages avançadas', available: true },
      { text: 'WhatsApp via terceiros', available: false },
      { text: 'Preço premium (USD)', available: false },
    ],
  },
  {
    title: 'Loved CRM',
    subtitle: 'Único completo',
    borderColor: 'border-sector-primary',
    titleColor: 'text-sector-primary',
    highlight: true,
    features: [
      { text: 'WhatsApp nativo dual', available: true },
      { text: 'IA conversacional BR', available: true },
      { text: 'Multi-tenancy real', available: true },
      { text: 'Preço justo (BRL)', available: true },
    ],
  },
]

export function CompetitiveDifferentiationSection(): React.ReactElement {
  return (
    <section className="px-6 py-16">
      <div className="container mx-auto max-w-6xl">
        <CompetitionHeader />
        <CompetitorsGrid />
      </div>
    </section>
  )
}

function CompetitorsGrid(): React.ReactElement {
  return (
    <div className="grid gap-8 md:grid-cols-3">
      {competitors.map(competitor => (
        <CompetitorCard key={competitor.title} {...competitor} />
      ))}
    </div>
  )
}
