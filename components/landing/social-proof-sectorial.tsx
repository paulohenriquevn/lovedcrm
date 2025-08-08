/**
 * Social Proof Sectorial - Landing Page Loved CRM
 * Prova social específica para agências digitais brasileiras
 * Baseado na especificação do agente 09-landing-page.md
 */

'use client'

import { Card, CardContent } from '@/components/ui/card'

export function SocialProofSectorial(): JSX.Element {
  return (
    <section className="bg-muted/50 px-6 py-16">
      <div className="container mx-auto max-w-6xl text-center">
        <h2 className="mb-12 text-3xl font-bold">
          Confiado por Agências Digitais em Todo Brasil
        </h2>
        
        <div className="grid gap-8 md:grid-cols-3 mb-12">
          <Card className="border-sector-trust/20">
            <CardContent className="p-6 text-center">
              <div className="mb-4 text-4xl font-bold text-sector-trust">
                +300%
              </div>
              <p className="text-muted-foreground">
                Aumento na conversão de leads eliminando fragmentação
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-collaborative/20">
            <CardContent className="p-6 text-center">
              <div className="mb-4 text-4xl font-bold text-collaborative">
                60%
              </div>
              <p className="text-muted-foreground">
                Redução no tempo de resposta com comunicação centralizada
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-sector-cta/20">
            <CardContent className="p-6 text-center">
              <div className="mb-4 text-4xl font-bold text-sector-cta">
                5min
              </div>
              <p className="text-muted-foreground">
                Setup completo vs semanas dos concorrentes
              </p>
            </CardContent>
          </Card>
        </div>

        <blockquote className="text-lg italic text-muted-foreground mb-4 max-w-2xl mx-auto">
          &ldquo;Finalmente um CRM brasileiro que entende agências. Eliminamos 6 ferramentas e aumentamos nossa conversão em 400%. O WhatsApp nativo foi um game changer.&rdquo;
        </blockquote>
        <cite className="text-sm font-medium">
          — Carlos Silva, Founder @ Digital Growth Agency (15 colaboradores)
        </cite>
      </div>
    </section>
  )
}