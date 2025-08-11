/**
 * Problem Solution Section - Landing Page Loved CRM (Refactored)
 * Seção problema/solução para agências digitais brasileiras
 * Baseado na especificação do agente 08-landing-page.md
 */

'use client'

import { motion, type Variants } from 'framer-motion'
import { MessageSquare, FileSpreadsheet, Users, Bot, BarChart3 } from 'lucide-react'

import { useScrollAnimation, staggerContainer } from '@/hooks/use-scroll-animation'

import {
  ProblemCard,
  SolutionCard,
  ProblemSolutionHeader,
  TransformationBridge,
  ProblemSolutionFooter,
} from './problem-solution-components'

// Local fallback variant with proper typing
const fallbackStaggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

const problems = [
  {
    icon: MessageSquare,
    title: 'Conversas Perdidas',
    description:
      'Leads importantes se perdem entre mensagens pessoais e profissionais no WhatsApp, resultando em oportunidades perdidas.',
    metric: '30% dos leads perdidos',
    impact: 'R$ 12k/mês em vendas perdidas',
  },
  {
    icon: FileSpreadsheet,
    title: 'Dados Desorganizados',
    description:
      'Planilhas desatualizadas e informações espalhadas criam retrabalho constante e decisões baseadas em dados incorretos.',
    metric: '4.5h/dia em retrabalho',
    impact: '35% menos produtividade',
  },
  {
    icon: Users,
    title: 'Equipe Desalinhada',
    description:
      'Falta de visibilidade sobre o status dos leads gera duplicação de esforços e experiência inconsistente para o cliente.',
    metric: '40% dos processos duplicados',
    impact: 'Perda de credibilidade',
  },
]

const solutions = [
  {
    icon: MessageSquare,
    title: 'WhatsApp Business Integrado',
    description:
      'Centralize todas as conversas profissionais em um único lugar, com histórico completo e distribuição automática.',
    features: [
      'Chat unificado com histórico completo',
      'Distribuição automática de leads',
      'Status de leitura e entrega',
      'Templates de mensagens',
    ],
    benefit: 'Zero leads perdidos',
    improvement: '+73% taxa de conversão',
  },
  {
    icon: BarChart3,
    title: 'Pipeline Visual Inteligente',
    description:
      'Visualize todo o funil de vendas em tempo real, com métricas automáticas e insights acionáveis.',
    features: [
      'Drag & drop visual intuitivo',
      'Métricas em tempo real',
      'Filtros avançados por período/origem',
      'Alertas de leads parados',
    ],
    benefit: 'Dados sempre atualizados',
    improvement: '90% menos retrabalho',
  },
  {
    icon: Bot,
    title: 'Automação & IA Nativa',
    description:
      'IA em português analisa conversas e gera resumos automáticos, além de automatizar tarefas repetitivas.',
    features: [
      'Resumos automáticos de conversas',
      'Análise de sentiment em português',
      'Distribuição inteligente de leads',
      'Follow-ups automáticos',
    ],
    benefit: 'Equipe sempre sincronizada',
    improvement: '+156% produtividade',
  },
]

export function ProblemSolutionSection(): JSX.Element {
  const { ref } = useScrollAnimation()

  return (
    <section
      ref={ref}
      className="py-20 px-4 bg-gradient-to-b from-background via-red-50/20 to-emerald-50/20"
    >
      <div className="max-w-7xl mx-auto">
        <ProblemSolutionHeader />

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer ?? fallbackStaggerContainer}
        >
          {problems.map((problem, index) => (
            <ProblemCard key={problem.title} problem={problem} index={index} />
          ))}
        </motion.div>

        <TransformationBridge />

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer ?? fallbackStaggerContainer}
        >
          {solutions.map((solution, index) => (
            <SolutionCard key={solution.title} solution={solution} index={index} />
          ))}
        </motion.div>

        <ProblemSolutionFooter />
      </div>
    </section>
  )
}
