/**
 * Social Proof Section - Landing Page Loved CRM (Refactored)
 * Seção de prova social e depoimentos de agências brasileiras
 * Baseado na especificação do agente 08-landing-page.md
 */

'use client'

import { motion, type Variants } from 'framer-motion'
import { TrendingUp, Users, Award, Calendar } from 'lucide-react'
import { useState } from 'react'

import { useScrollAnimation, staggerContainer } from '@/hooks/use-scroll-animation'
import { testimonialImages } from '@/lib/images'

import {
  TestimonialCard,
  SocialProofHeader,
  SocialProofMetrics,
  SocialProofFooter,
} from './social-proof-components'

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

const testimonials = [
  {
    id: 1,
    name: 'Carlos Eduardo',
    role: 'CEO',
    company: 'Pixel Creative',
    location: 'São Paulo, SP',
    avatar: testimonialImages.carlos,
    rating: 5,
    quote:
      'Loved CRM transformou nossa agência. Antes perdíamos 30% dos leads no WhatsApp bagunçado. Agora convertemos 90% dos leads qualificados. A IA em português é impressionante!',
    results: 'De R$ 45k para R$ 120k/mês em 6 meses',
    tier: 'PRO',
    teamSize: '12 pessoas',
  },
  {
    id: 2,
    name: 'Marina Santos',
    role: 'Diretora Comercial',
    company: 'Growth Hub',
    location: 'Rio de Janeiro, RJ',
    avatar: testimonialImages.marina,
    rating: 5,
    quote:
      'O pipeline visual e as automações mudaram nosso jogo. Economizamos 15h/semana em tarefas manuais. O ROI foi de 340% no primeiro trimestre.',
    results: '+340% ROI em 3 meses',
    tier: 'ENTERPRISE',
    teamSize: '25 pessoas',
  },
  {
    id: 3,
    name: 'Rafael Oliveira',
    role: 'Fundador',
    company: 'Digital First',
    location: 'Belo Horizonte, MG',
    avatar: testimonialImages.rafael,
    rating: 5,
    quote:
      'Implementação super rápida e suporte em português excelente. Em 2 semanas já estava 100% operacional. A integração com WhatsApp é perfeita.',
    results: '+67% eficiência operacional',
    tier: 'PRO',
    teamSize: '8 pessoas',
  },
]

const metrics = [
  {
    icon: TrendingUp,
    value: '+186%',
    description: 'Aumento médio de conversão',
    color: 'bg-emerald-100 text-emerald-600',
  },
  {
    icon: Users,
    value: '500+',
    description: 'Agências ativas',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: Award,
    value: '4.9/5',
    description: 'Avaliação média',
    color: 'bg-yellow-100 text-yellow-600',
  },
  {
    icon: Calendar,
    value: '5min',
    description: 'Tempo de setup',
    color: 'bg-purple-100 text-purple-600',
  },
]

export function SocialProofSection(): JSX.Element {
  const [imageLoading, setImageLoading] = useState<boolean[]>(Array.from({ length: 6 }, () => true))
  const { ref } = useScrollAnimation()

  const handleImageLoad = (index: number): void => {
    setImageLoading(prev => prev.map((loading, i) => (i === index ? false : loading)))
  }

  return (
    <section
      ref={ref}
      className="py-20 px-4 bg-gradient-to-b from-emerald-50/30 via-background to-background"
    >
      <div className="max-w-7xl mx-auto">
        <SocialProofHeader />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer ?? fallbackStaggerContainer}
        >
          <SocialProofMetrics metrics={metrics} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {testimonials.map(testimonial => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </div>

          <SocialProofFooter imageLoading={imageLoading} handleImageLoad={handleImageLoad} />
        </motion.div>
      </div>
    </section>
  )
}
