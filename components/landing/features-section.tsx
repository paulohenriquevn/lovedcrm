/**
 * Features Section - Landing Page Loved CRM
 * Seção de funcionalidades específicas para agências digitais brasileiras
 * Baseado na especificação do agente 08-landing-page.md
 */

'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  MessageSquare, 
  Bot, 
  Users, 
  Clock, 
  Shield,
  Smartphone,
  Headphones,
  FileText,
  Zap
} from 'lucide-react'

const coreFeatures = [
  {
    icon: BarChart3,
    title: "Pipeline Visual Brasileiro",
    subtitle: "Lead → Contato → Proposta → Negociação → Fechado",
    description: "Pipeline otimizado para o processo de vendas das agências brasileiras. Arraste e solte leads entre estágios com facilidade.",
    highlights: ["Kanban intuitivo", "Automações personalizadas", "Relatórios em tempo real"],
    badge: "🎯 CORE"
  },
  {
    icon: MessageSquare,
    title: "WhatsApp Business Integrado",
    subtitle: "Todas as conversas em um só lugar",
    description: "Integração nativa com WhatsApp Business API. Gerencie todas as conversas de clientes sem sair do CRM.",
    highlights: ["Mensagens automáticas", "Templates aprovados", "Histórico completo"],
    badge: "📱 WHATSAPP"
  },
  {
    icon: Bot,
    title: "IA Resumos em Português",
    subtitle: "Inteligência artificial que entende seu negócio",
    description: "IA treinada para agências brasileiras. Resumos automáticos de conversas, qualificação de leads e sugestões de próximas ações.",
    highlights: ["GPT-4 otimizado", "Análise de sentimento", "Sugestões inteligentes"],
    badge: "🤖 IA"
  }
]

const advancedFeatures = [
  {
    icon: Users,
    title: "Gestão de Equipe",
    description: "Controle de permissões, distribuição de leads e acompanhamento de performance individual.",
    items: ["Roles personalizados", "Distribuição automática", "Métricas por usuário"]
  },
  {
    icon: Clock,
    title: "Timeline Unificada",
    description: "Histórico completo de todas as interações com cada cliente em ordem cronológica.",
    items: ["Todas as comunicações", "Marcos importantes", "Filtros avançados"]
  },
  {
    icon: Shield,
    title: "Segurança LGPD",
    description: "Conformidade total com LGPD. Dados criptografados e políticas de retenção configuráveis.",
    items: ["Criptografia AES-256", "Auditoria completa", "Backup automático"]
  },
  {
    icon: Smartphone,
    title: "App Mobile",
    description: "Acesse seu CRM de qualquer lugar. App nativo para iOS e Android com sincronização em tempo real.",
    items: ["Offline ready", "Push notifications", "Interface otimizada"]
  },
  {
    icon: Headphones,
    title: "VoIP Integrado",
    description: "Ligue diretamente do CRM. Gravação automática de chamadas e integração com timeline.",
    items: ["Click-to-call", "Gravação automática", "Transcrição por IA"]
  },
  {
    icon: FileText,
    title: "Propostas Automáticas",
    description: "Gere propostas personalizadas baseadas no perfil do lead. Templates pré-aprovados para agilidade.",
    items: ["Templates customizáveis", "Assinatura digital", "Acompanhamento de status"]
  }
]

const integrations = [
  { name: "WhatsApp Business", logo: "W", color: "bg-whatsapp" },
  { name: "Gmail", logo: "G", color: "bg-red-500" },
  { name: "Facebook Ads", logo: "F", color: "bg-blue-600" },
  { name: "Google Ads", logo: "GA", color: "bg-yellow-500" },
  { name: "Instagram", logo: "I", color: "bg-pink-500" },
  { name: "LinkedIn", logo: "Li", color: "bg-blue-700" },
  { name: "Stripe", logo: "S", color: "bg-purple-600" },
  { name: "Slack", logo: "Sl", color: "bg-green-600" }
]

export function FeaturesSection() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-violet-50 text-violet-700 border-violet-200">
            🚀 Funcionalidades Exclusivas
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Tudo que sua{" "}
            <span className="text-primary bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Agência Brasileira
            </span>{" "}
            Precisa
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Desenvolvido especificamente para o mercado brasileiro. 
            Cada funcionalidade pensada para resolver problemas reais das agências digitais.
          </p>
        </div>

        {/* Core Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {coreFeatures.map((feature, index) => (
            <Card key={index} className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20">
              <CardContent className="p-8">
                {/* Badge */}
                <Badge className="absolute top-4 right-4 text-xs font-medium">
                  {feature.badge}
                </Badge>
                
                {/* Icon */}
                <div className="h-14 w-14 bg-primary/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>

                {/* Title & Subtitle */}
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-primary font-medium mb-4">
                  {feature.subtitle}
                </p>

                {/* Description */}
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {feature.description}
                </p>

                {/* Highlights */}
                <div className="space-y-2">
                  {feature.highlights.map((highlight, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <div className="h-1.5 w-1.5 bg-primary rounded-full"></div>
                      <span className="text-muted-foreground">{highlight}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Advanced Features Grid */}
        <div className="mb-20">
          <h3 className="text-2xl font-bold text-center mb-12">Recursos Avançados</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {advancedFeatures.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground mb-2">
                        {feature.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        {feature.description}
                      </p>
                      <div className="space-y-1">
                        {feature.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs">
                            <div className="h-1 w-1 bg-emerald-500 rounded-full"></div>
                            <span className="text-muted-foreground">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Integrations */}
        <div className="text-center mb-12">
          <h3 className="text-2xl font-bold mb-4">Integrações Nativas</h3>
          <p className="text-muted-foreground mb-8">
            Conecte com as ferramentas que sua agência já usa
          </p>
          
          <div className="grid grid-cols-4 md:grid-cols-8 gap-4 max-w-4xl mx-auto mb-8">
            {integrations.map((integration, index) => (
              <div key={index} className="group">
                <div className={`h-14 w-14 mx-auto ${integration.color} rounded-lg flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform`}>
                  {integration.logo}
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  {integration.name}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Stats */}
        <Card className="bg-gradient-to-r from-violet-50 to-purple-50 border-violet-200">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-foreground mb-2">
                Performance Comprovada
              </h3>
              <p className="text-muted-foreground">
                Resultados reais de agências brasileiras usando Loved CRM
              </p>
            </div>
            
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Zap className="h-5 w-5 text-primary" />
                  <span className="text-3xl font-bold text-primary">200%</span>
                </div>
                <p className="text-sm text-muted-foreground">Aumento médio em conversões</p>
              </div>
              
              <div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-emerald-600" />
                  <span className="text-3xl font-bold text-emerald-600">4h</span>
                </div>
                <p className="text-sm text-muted-foreground">Economizadas por dia</p>
              </div>
              
              <div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span className="text-3xl font-bold text-blue-600">500+</span>
                </div>
                <p className="text-sm text-muted-foreground">Agências ativas</p>
              </div>
              
              <div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <BarChart3 className="h-5 w-5 text-orange-600" />
                  <span className="text-3xl font-bold text-orange-600">98%</span>
                </div>
                <p className="text-sm text-muted-foreground">Taxa de satisfação</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}