/**
 * Features Section - Landing Page Loved CRM
 * Seção de funcionalidades específicas para agências digitais brasileiras
 * Baseado na especificação do agente 08-landing-page.md
 */

'use client'

import { motion } from 'framer-motion'
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
import Image from 'next/image'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useScrollAnimation, scrollAnimationVariants, staggerContainer, staggerItem, cardHoverVariants } from '@/hooks/use-scroll-animation'
import { featuresImages, integrationLogos, getImageProps } from '@/lib/images'

const coreFeatures = [
  {
    icon: BarChart3,
    title: "Pipeline Visual Brasileiro",
    subtitle: "Lead → Contato → Proposta → Negociação → Fechado",
    description: "Pipeline otimizado para o processo de vendas das agências brasileiras. Arraste e solte leads entre estágios com facilidade.",
    highlights: ["Kanban intuitivo", "Automações personalizadas", "Relatórios em tempo real"],
    badge: "CORE",
    image: featuresImages.pipelineManagement
  },
  {
    icon: MessageSquare,
    title: "WhatsApp Business Integrado",
    subtitle: "Todas as conversas em um só lugar",
    description: "Integração nativa com WhatsApp Business API. Gerencie todas as conversas de clientes sem sair do CRM.",
    highlights: ["Mensagens automáticas", "Templates aprovados", "Histórico completo"],
    badge: "WHATSAPP",
    image: featuresImages.whatsappIntegration
  },
  {
    icon: Bot,
    title: "IA Resumos em Português",
    subtitle: "Inteligência artificial que entende seu negócio",
    description: "IA treinada para agências brasileiras. Resumos automáticos de conversas, qualificação de leads e sugestões de próximas ações.",
    highlights: ["GPT-4 otimizado", "Análise de sentimento", "Sugestões inteligentes"],
    badge: "IA",
    image: featuresImages.aiSummaries
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
  { name: "WhatsApp Business", key: "whatsapp", color: "bg-whatsapp" },
  { name: "Gmail", key: "gmail", color: "bg-red-500" },
  { name: "Facebook Ads", key: "facebook", color: "bg-blue-600" },
  { name: "Google Ads", key: "google", color: "bg-yellow-500" },
  { name: "Instagram", key: "instagram", color: "bg-pink-500" },
  { name: "LinkedIn", key: "linkedin", color: "bg-blue-700" },
  { name: "Stripe", key: "stripe", color: "bg-purple-600" },
  { name: "Slack", key: "slack", color: "bg-green-600" }
]

function CoreFeatureCard({ 
  feature, 
  index 
}: { 
  feature: typeof coreFeatures[0]
  index: number 
}): React.ReactElement {
  return <motion.div
    key={`core-${feature.title}-${index}`}
    variants={staggerItem}
    initial="rest"
    whileHover="hover"
  >
    <motion.div variants={cardHoverVariants}>
      <Card className="relative overflow-hidden group border-2 hover:border-primary/20 h-full">
        {/* Background Image */}
        <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
          <Image
            {...getImageProps(feature.image, 400, 300)}
            fill
            className="object-cover"
            sizes="400px"
          />
        </div>
        
        <CardContent className="p-8 relative z-10">
          {/* Badge */}
          <Badge className="absolute top-4 right-4 text-xs font-medium bg-background/90 backdrop-blur-sm">
            {feature.badge}
          </Badge>
          
          {/* Icon */}
          <div className="h-14 w-14 bg-background/90 backdrop-blur-sm rounded-lg flex items-center justify-center mb-6 group-hover:bg-primary/20 group-hover:backdrop-blur-none transition-all">
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
          <div key={`highlight-${highlight}-${idx}`} className="flex items-center gap-2 text-sm">
            <div className="h-1.5 w-1.5 bg-primary rounded-full" />
            <span className="text-muted-foreground">{highlight}</span>
          </div>
        ))}
        </div>
        </CardContent>
      </Card>
    </motion.div>
  </motion.div>
}

function AdvancedFeatureCard({ 
  feature, 
  index 
}: { 
  feature: typeof advancedFeatures[0]
  index: number 
}): React.ReactElement {
  return <Card key={`advanced-${feature.title}-${index}`} className="hover:shadow-lg transition-all duration-300 group">
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
              <div key={`item-${item}-${idx}`} className="flex items-center gap-2 text-xs">
                <div className="h-1 w-1 bg-emerald-500 rounded-full" />
                <span className="text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
}

function IntegrationItem({ 
  integration, 
  index 
}: { 
  integration: typeof integrations[0]
  index: number 
}): React.ReactElement {
  const logoConfig = integrationLogos[integration.key as keyof typeof integrationLogos]
  
  return <div key={`integration-${integration.name}-${index}`} className="group">
    <div className="h-14 w-14 mx-auto bg-background rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 group-hover:shadow-lg transition-all duration-300 border border-border">
      {logoConfig ? (
        <Image
          {...getImageProps(logoConfig, 40, 40)}
          width={40}
          height={40}
          className="rounded-md object-contain"
        />
      ) : (
        <div className={`h-10 w-10 ${integration.color} rounded flex items-center justify-center text-white font-bold text-xs`}>
          {integration.name.charAt(0)}
        </div>
      )}
    </div>
    <p className="text-xs text-muted-foreground mt-2 text-center">
      {integration.name}
    </p>
  </div>
}

function PerformanceStatsCard({ 
  icon: Icon, 
  value, 
  label, 
  color 
}: { 
  icon: React.ComponentType<{ className?: string }>
  value: string
  label: string
  color: string 
}): React.ReactElement {
  return <div>
    <div className="flex items-center justify-center gap-2 mb-2">
      <Icon className={`h-5 w-5 ${color}`} />
      <span className={`text-3xl font-bold ${color}`}>{value}</span>
    </div>
    <p className="text-sm text-muted-foreground">{label}</p>
  </div>
}

export function FeaturesSection(): React.ReactElement {
  const { ref: headerRef, isInView: headerInView } = useScrollAnimation()
  const { ref: coreRef, isInView: coreInView } = useScrollAnimation()
  const { ref: advancedRef, isInView: advancedInView } = useScrollAnimation()

  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          ref={headerRef}
          className="text-center mb-16"
          initial="hidden"
          animate={headerInView ? "visible" : "hidden"}
          variants={scrollAnimationVariants}
        >
          <Badge className="mb-4 bg-violet-50 text-violet-700 border-violet-200">
Funcionalidades Exclusivas
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
        </motion.div>

        {/* Core Features */}
        <motion.div 
          ref={coreRef}
          className="grid md:grid-cols-3 gap-8 mb-20"
          initial="hidden"
          animate={coreInView ? "visible" : "hidden"}
          variants={staggerContainer}
        >
          {coreFeatures.map((feature, index) => (
            <CoreFeatureCard key={`core-feature-${index}`} feature={feature} index={index} />
          ))}
        </motion.div>

        {/* Advanced Features Grid */}
        <motion.div 
          ref={advancedRef}
          className="mb-20"
          initial="hidden"
          animate={advancedInView ? "visible" : "hidden"}
          variants={scrollAnimationVariants}
        >
          <h3 className="text-2xl font-bold text-center mb-12">Recursos Avançados</h3>
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={staggerContainer}
          >
            {advancedFeatures.map((feature, index) => (
              <AdvancedFeatureCard key={`advanced-feature-${index}`} feature={feature} index={index} />
            ))}
          </motion.div>
        </motion.div>

        {/* Integrations */}
        <div className="text-center mb-12">
          <h3 className="text-2xl font-bold mb-4">Integrações Nativas</h3>
          <p className="text-muted-foreground mb-8">
            Conecte com as ferramentas que sua agência já usa
          </p>
          
          <div className="grid grid-cols-4 md:grid-cols-8 gap-4 max-w-4xl mx-auto mb-8">
            {integrations.map((integration, index) => (
              <IntegrationItem key={`integration-${index}`} integration={integration} index={index} />
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
              <PerformanceStatsCard 
                icon={Zap}
                value="200%"
                label="Aumento médio em conversões"
                color="text-primary"
              />
              
              <PerformanceStatsCard 
                icon={Clock}
                value="4h"
                label="Economizadas por dia"
                color="text-emerald-600"
              />
              
              <PerformanceStatsCard 
                icon={Users}
                value="500+"
                label="Agências ativas"
                color="text-blue-600"
              />
              
              <PerformanceStatsCard 
                icon={BarChart3}
                value="98%"
                label="Taxa de satisfação"
                color="text-orange-600"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}