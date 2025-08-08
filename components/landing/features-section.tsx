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

import { Card, CardContent } from '@/components/ui/card'
import { useScrollAnimation, scrollAnimationVariants, staggerContainer } from '@/hooks/use-scroll-animation'
import { featuresImages } from '@/lib/images'

import { AdvancedFeatureCard } from './features/advanced-feature-card'
import { CoreFeatureCard } from './features/core-feature-card'
import { FeaturesHeader } from './features/features-header'
import { IntegrationsSection } from './features/integrations-section'
import { PerformanceStatsCard } from './features/performance-stats-card'

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

export function FeaturesSection(): React.ReactElement {
  const { ref: headerRef, isInView: headerInView } = useScrollAnimation()
  const { ref: coreRef, isInView: coreInView } = useScrollAnimation()
  const { ref: advancedRef, isInView: advancedInView } = useScrollAnimation()

  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <FeaturesHeader headerRef={headerRef} headerInView={headerInView} />
        <CoreFeaturesGrid coreRef={coreRef} coreInView={coreInView} />
        <AdvancedFeaturesGrid advancedRef={advancedRef} advancedInView={advancedInView} />
        <IntegrationsSection integrations={integrations} />
        <PerformanceStats />
      </div>
    </section>
  )
}

function CoreFeaturesGrid({
  coreRef,
  coreInView
}: {
  coreRef: React.RefObject<HTMLDivElement>
  coreInView: boolean
}): React.ReactElement {
  return (
    <motion.div 
      ref={coreRef}
      className="grid md:grid-cols-3 gap-8 mb-20"
      initial="hidden"
      animate={coreInView ? "visible" : "hidden"}
      variants={staggerContainer}
    >
      {coreFeatures.map((feature) => (
        <CoreFeatureCard key={`core-feature-${feature.title}`} feature={feature} />
      ))}
    </motion.div>
  )
}

function AdvancedFeaturesGrid({
  advancedRef,
  advancedInView
}: {
  advancedRef: React.RefObject<HTMLDivElement>
  advancedInView: boolean
}): React.ReactElement {
  return (
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
        {advancedFeatures.map((feature) => (
          <AdvancedFeatureCard key={`advanced-feature-${feature.title}`} feature={feature} />
        ))}
      </motion.div>
    </motion.div>
  )
}

function PerformanceStats(): React.ReactElement {
  return (
    <Card className="bg-card border border-border shadow-sm">
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
  )
}