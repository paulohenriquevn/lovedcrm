/**
 * Pricing Section - Landing Page Loved CRM (Refactored)
 * Seção de preços otimizada para agências brasileiras
 * Baseado na especificação do agente 08-landing-page.md
 */

'use client'

import { motion } from 'framer-motion'
import { Users, BarChart3 } from 'lucide-react'
import { useState } from 'react'

import { useScrollAnimation, staggerContainer, staggerItem } from '@/hooks/use-scroll-animation'

import { PricingCard, PricingHeader, PricingFooter } from './pricing-components'

const pricingPlans = [
  {
    id: 'free',
    name: 'Starter',
    tagline: 'Para começar',
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: 'Ideal para agências pequenas testando o sistema',
    icon: Users,
    color: 'border-border hover:border-border/80',
    buttonVariant: 'outline' as const,
    buttonText: 'Começar Grátis',
    features: [
      'Até 100 leads/mês',
      'Pipeline básico (5 estágios)',
      'WhatsApp integração básica',
      '1 usuário',
      'Suporte por email',
      'Relatórios básicos'
    ]
  },
  {
    id: 'pro',
    name: 'Professional',
    tagline: 'Mais popular',
    monthlyPrice: 197,
    yearlyPrice: 1576, 
    yearlyDiscount: 'Economize R$ 788/ano',
    description: 'Perfeito para agências em crescimento',
    icon: BarChart3,
    color: 'border-primary/20 hover:border-primary/40',
    buttonVariant: 'default' as const,
    buttonText: 'Começar Teste Grátis',
    badge: 'Mais Popular',
    badgeColor: 'bg-primary text-primary-foreground border-primary',
    popular: true,
    billingNote: 'Cobrado anualmente',
    features: [
      'Leads ilimitados',
      'Pipeline personalizado',
      'WhatsApp Business API',
      'Até 5 usuários',
      'Automações avançadas',
      'IA para resumos',
      'Integrações (Zapier, etc)',
      'Suporte prioritário',
      'Relatórios avançados',
      'White-label disponível'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    tagline: 'Para grandes agências',
    monthlyPrice: 497,
    yearlyPrice: 3976,
    yearlyDiscount: 'Economize R$ 1.988/ano',
    description: 'Solução completa para agências estabelecidas',
    icon: Users,
    color: 'border-purple-500/20 hover:border-purple-500/40',
    buttonVariant: 'outline' as const,
    buttonText: 'Falar com Vendas',
    billingNote: 'Cobrado anualmente',
    features: [
      'Tudo do Professional',
      'Usuários ilimitados',
      'API personalizada',
      'Gerente de conta dedicado',
      'Treinamento personalizado',
      'SLA 99.9% uptime',
      'Backup diário',
      'Integrações customizadas',
      'Relatórios personalizados',
      'Suporte 24/7'
    ]
  }
]

export function PricingSection(): JSX.Element {
  const [isYearly, setIsYearly] = useState(true)
  const { ref } = useScrollAnimation()

  const handleToggle = (checked: boolean): void => {
    setIsYearly(checked)
  }

  return (
    <section 
      ref={ref}
      className="py-20 px-4 bg-gradient-to-b from-muted/30 via-background to-background"
    >
      <motion.div 
        className="max-w-7xl mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
      >
        <PricingHeader isYearly={isYearly} onToggle={handleToggle} />
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12"
          variants={staggerContainer}
        >
          {pricingPlans.map((plan, index) => (
            <motion.div key={plan.id} variants={staggerItem}>
              <PricingCard plan={plan} isYearly={isYearly} index={index} />
            </motion.div>
          ))}
        </motion.div>
        
        <PricingFooter />
      </motion.div>
    </section>
  )
}