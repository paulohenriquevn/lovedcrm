/**
 * Social Proof Section - Landing Page Loved CRM
 * Seção de prova social e depoimentos de agências brasileiras
 * Baseado na especificação do agente 08-landing-page.md
 */

'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { 
  Star, 
  Quote, 
  TrendingUp, 
  Users, 
  Award,
  MapPin,
  Calendar
} from 'lucide-react'

const testimonials = [
  {
    id: 1,
    name: "Carlos Eduardo",
    role: "CEO",
    company: "Pixel Creative",
    location: "São Paulo, SP",
    avatar: "/api/placeholder/64/64",
    rating: 5,
    quote: "Loved CRM transformou nossa agência. Antes perdíamos 30% dos leads no WhatsApp bagunçado. Agora convertemos 90% dos leads qualificados. A IA em português é impressionante!",
    results: "De R$ 45k para R$ 120k/mês em 6 meses",
    tier: "PRO",
    teamSize: "12 pessoas"
  },
  {
    id: 2,
    name: "Marina Santos",
    role: "Diretora Comercial",
    company: "Growth Hub",
    location: "Rio de Janeiro, RJ",
    avatar: "/api/placeholder/64/64",
    rating: 5,
    quote: "O pipeline visual mudou tudo. Minha equipe agora vê exatamente onde cada lead está. As automações do WhatsApp economizam 3 horas por dia. ROI de 400% no primeiro trimestre.",
    results: "Team de 6 para 15 pessoas",
    tier: "ENTERPRISE",
    teamSize: "15 pessoas"
  },
  {
    id: 3,
    name: "Rafael Oliveira",
    role: "Fundador",
    company: "Digital First",
    location: "Belo Horizonte, MG",
    avatar: "/api/placeholder/64/64",
    rating: 5,
    quote: "Setup em 5 minutos, sem complicação. A timeline unificada é genial - vejo todo histórico do cliente numa tela. Fechamos 60% mais negócios só com melhor organização.",
    results: "200% aumento em conversões",
    tier: "PRO",
    teamSize: "8 pessoas"
  }
]

const companyLogos = [
  { name: "Pixel Creative", industry: "Design & Branding" },
  { name: "Growth Hub", industry: "Performance Marketing" },
  { name: "Digital First", industry: "Marketing Digital" },
  { name: "Creative Lab", industry: "Conteúdo & Social" },
  { name: "Scale Agency", industry: "Growth Hacking" },
  { name: "Brand Boost", industry: "Branding & UX" }
]

const stats = [
  {
    icon: Users,
    value: "500+",
    label: "Agências Ativas",
    sublabel: "Crescimento de 40%/mês"
  },
  {
    icon: TrendingUp,
    value: "R$ 50M+",
    label: "Faturamento Gerado",
    sublabel: "Pelos nossos clientes"
  },
  {
    icon: Award,
    value: "98%",
    label: "Taxa de Satisfação",
    sublabel: "NPS de +87"
  },
  {
    icon: Calendar,
    value: "2 anos",
    label: "No Mercado",
    sublabel: "Empresa 100% brasileira"
  }
]

const caseStudyHighlight = {
  company: "Growth Hub - RJ",
  period: "Janeiro a Junho 2024",
  before: {
    revenue: "R$ 80k/mês",
    conversion: "12%",
    team: "6 pessoas",
    leads: "200/mês"
  },
  after: {
    revenue: "R$ 180k/mês", 
    conversion: "28%",
    team: "15 pessoas",
    leads: "350/mês"
  }
}

declare global {
  function gtag(...args: any[]): void
}

export function SocialProofSection() {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-gray-50/50 to-background">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-emerald-50 text-emerald-700 border-emerald-200">
            ⭐ Agências que Cresceram com a Gente
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Resultados{" "}
            <span className="text-primary bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Reais e Comprovados
            </span>{" "}
            de Agências Brasileiras
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Mais de 500 agências já transformaram seus processos e cresceram significativamente. 
            Veja os resultados que elas alcançaram.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="font-semibold text-foreground mb-1">{stat.label}</div>
                <div className="text-sm text-muted-foreground">{stat.sublabel}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <Card key={testimonial.id} className="relative overflow-hidden hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-6">
                {/* Quote Icon */}
                <Quote className="h-8 w-8 text-primary/20 mb-4" />
                
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-muted-foreground mb-6 leading-relaxed italic">
                  "{testimonial.quote}"
                </p>

                {/* Results Highlight */}
                <div className="bg-emerald-50 rounded-lg p-3 mb-6 border border-emerald-200">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-semibold text-emerald-800">Resultado:</span>
                  </div>
                  <p className="text-sm text-emerald-700 font-medium">{testimonial.results}</p>
                </div>

                {/* Author Info */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={testimonial.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role}, {testimonial.company}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{testimonial.location}</span>
                      <Badge className="text-xs bg-violet-100 text-violet-700">
                        {testimonial.tier}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Case Study Highlight */}
        <Card className="mb-16 bg-gradient-to-r from-violet-50 to-purple-50 border-violet-200">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <Badge className="mb-3 bg-violet-100 text-violet-700">
                📊 CASE STUDY
              </Badge>
              <h3 className="text-2xl font-bold text-foreground mb-2">
                Como a {caseStudyHighlight.company} Duplicou o Faturamento
              </h3>
              <p className="text-muted-foreground">
                Período: {caseStudyHighlight.period}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Before */}
              <div className="text-center">
                <h4 className="text-lg font-semibold text-red-700 mb-4">❌ Antes do Loved CRM</h4>
                <div className="space-y-3">
                  <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                    <div className="text-2xl font-bold text-red-700">{caseStudyHighlight.before.revenue}</div>
                    <div className="text-sm text-red-600">Faturamento mensal</div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-white rounded p-2 border">
                      <div className="font-bold text-red-700">{caseStudyHighlight.before.conversion}</div>
                      <div className="text-xs text-muted-foreground">Conversão</div>
                    </div>
                    <div className="bg-white rounded p-2 border">
                      <div className="font-bold text-red-700">{caseStudyHighlight.before.team}</div>
                      <div className="text-xs text-muted-foreground">Equipe</div>
                    </div>
                    <div className="bg-white rounded p-2 border">
                      <div className="font-bold text-red-700">{caseStudyHighlight.before.leads}</div>
                      <div className="text-xs text-muted-foreground">Leads</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* After */}
              <div className="text-center">
                <h4 className="text-lg font-semibold text-emerald-700 mb-4">✅ Depois do Loved CRM</h4>
                <div className="space-y-3">
                  <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                    <div className="text-2xl font-bold text-emerald-700">{caseStudyHighlight.after.revenue}</div>
                    <div className="text-sm text-emerald-600">Faturamento mensal</div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-white rounded p-2 border">
                      <div className="font-bold text-emerald-700">{caseStudyHighlight.after.conversion}</div>
                      <div className="text-xs text-muted-foreground">Conversão</div>
                    </div>
                    <div className="bg-white rounded p-2 border">
                      <div className="font-bold text-emerald-700">{caseStudyHighlight.after.team}</div>
                      <div className="text-xs text-muted-foreground">Equipe</div>
                    </div>
                    <div className="bg-white rounded p-2 border">
                      <div className="font-bold text-emerald-700">{caseStudyHighlight.after.leads}</div>
                      <div className="text-xs text-muted-foreground">Leads</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mt-8">
              <Button 
                variant="outline" 
                onClick={() => {
                  if (typeof gtag !== 'undefined') {
                    gtag('event', 'case_study_interest', { source: 'social_proof' })
                  }
                }}
              >
                Ver Case Completo
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Company Logos */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-muted-foreground mb-8">
            Agências que confiam no Loved CRM
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-6 opacity-60">
            {companyLogos.map((company, index) => (
              <div key={index} className="text-center">
                <div className="h-12 w-24 bg-gray-100 rounded-lg flex items-center justify-center mb-2 mx-auto">
                  <span className="text-xs font-medium text-gray-600">{company.name}</span>
                </div>
                <p className="text-xs text-muted-foreground">{company.industry}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}