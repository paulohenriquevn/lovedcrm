/**
 * Pricing Components - Extracted pricing components for better maintainability
 * Reduces pricing-section.tsx complexity and file length
 */

'use client'

import { motion } from 'framer-motion'
import { Check, Star, Zap, Crown, ArrowRight } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { enhancedCardHoverVariants, iconBounceVariants } from '@/hooks/use-scroll-animation'

interface PricingPlan {
  id: string
  name: string
  tagline: string
  monthlyPrice: number
  yearlyPrice: number
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  buttonVariant: 'default' | 'outline' | 'secondary'
  buttonText: string
  features: string[]
  badge?: string
  badgeColor?: string
  popular?: boolean
  yearlyDiscount?: string
  billingNote?: string
}

const FREE_PLAN_TEXT = 'Grátis'
const MONTHLY_BILLING_TEXT = '/mês'
const YEARLY_BILLING_TEXT = '/ano'
const BG_PRIMARY_CLASS = 'bg-primary/10'
const TEXT_PRIMARY_CLASS = 'text-primary'
const BG_MUTED_CLASS = 'bg-muted'
const TEXT_MUTED_FOREGROUND_CLASS = 'text-muted-foreground'
const TEXT_SM_MUTED_FOREGROUND_CLASS = 'text-sm text-muted-foreground'
const TEXT_XS_MUTED_FOREGROUND_CLASS = 'text-xs text-muted-foreground'

interface PricingCardProps {
  plan: PricingPlan
  isYearly: boolean
  index: number
}

const getIconContainerClass = (isPopular: boolean): string => {
  return `p-3 rounded-full ${isPopular ? BG_PRIMARY_CLASS : BG_MUTED_CLASS}`
}

const getIconClass = (isPopular: boolean): string => {
  return `h-8 w-8 ${isPopular ? TEXT_PRIMARY_CLASS : TEXT_MUTED_FOREGROUND_CLASS}`
}

function PricingCardHeader({ plan, price, isYearly }: { plan: PricingPlan; price: number; isYearly: boolean }): JSX.Element {
  const Icon = plan.icon
  const displayPrice = price === 0 ? FREE_PLAN_TEXT : `R$ ${price}`
  const isPopular = plan.popular === true
  
  return (
    <CardHeader className="text-center pb-4">
      <div className="flex justify-center mb-4">
        <div className={getIconContainerClass(isPopular)}>
          <Icon className={getIconClass(isPopular)} />
        </div>
      </div>
      
      <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
      <p className={TEXT_SM_MUTED_FOREGROUND_CLASS}>{plan.tagline}</p>
      
      <div className="mt-4">
        <div className="flex items-baseline justify-center gap-2">
          <span className="text-4xl font-bold text-foreground">
            {displayPrice}
          </span>
          {price > 0 && (
            <span className={TEXT_MUTED_FOREGROUND_CLASS}>
              {isYearly ? YEARLY_BILLING_TEXT : MONTHLY_BILLING_TEXT}
            </span>
          )}
        </div>
        
        {Boolean(isYearly && plan.yearlyDiscount) && (
          <p className="text-sm text-emerald-600 font-medium mt-2">
            {plan.yearlyDiscount}
          </p>
        )}
        
        {Boolean(plan.billingNote) && (
          <p className={`${TEXT_XS_MUTED_FOREGROUND_CLASS} mt-1`}>
            {plan.billingNote}
          </p>
        )}
      </div>
    </CardHeader>
  )
}

export function PricingCard({ plan, isYearly }: PricingCardProps): JSX.Element {
  const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice
  
  return (
    <motion.div
      className={`relative ${plan.popular === true ? 'md:scale-105 z-10' : ''}`}
      variants={enhancedCardHoverVariants}
      initial="rest"
      whileHover="hover"
      whileTap="press"
    >
      {plan.badge !== undefined && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
          <Badge className={`${plan.badgeColor ?? ''} px-4 py-1 font-semibold text-sm`}>
            {plan.badge}
          </Badge>
        </div>
      )}
      
      <Card className={`h-full ${plan.color} transition-all duration-300 ${plan.popular === true ? 'ring-2 ring-primary/20 shadow-xl' : 'hover:shadow-lg'}`}>
        <PricingCardHeader plan={plan} price={price} isYearly={isYearly} />
        
        <CardContent>
          <p className={`text-center ${TEXT_MUTED_FOREGROUND_CLASS} mb-6`}>
            {plan.description}
          </p>
          
          <motion.div
            variants={iconBounceVariants}
            whileHover="hover"
            whileTap="press"
            className="mb-6"
          >
            <Button 
              className="w-full" 
              variant={plan.buttonVariant}
              size="lg"
            >
              {plan.buttonText}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
          
          <div className="space-y-3">
            <h4 className={`font-semibold text-sm uppercase tracking-wide ${TEXT_MUTED_FOREGROUND_CLASS}`}>
              Funcionalidades incluídas:
            </h4>
            
            <ul className="space-y-2">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span className={TEXT_SM_MUTED_FOREGROUND_CLASS}>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

interface PricingHeaderProps {
  isYearly: boolean
  onToggle: (checked: boolean) => void
}

export function PricingHeader({ isYearly, onToggle }: PricingHeaderProps): JSX.Element {
  return (
    <div className="text-center mb-16">
      <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 px-4 py-2 text-sm font-medium">
        Preços Transparentes • Sem Pegadinhas
      </Badge>
      
      <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
        Planos que Crescem 
        <span className="text-primary bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
          {" "}com sua Agência
        </span>
      </h2>
      
      <p className={`text-xl ${TEXT_MUTED_FOREGROUND_CLASS} mb-8 max-w-3xl mx-auto`}>
        Escolha o plano ideal para sua agência. Sem compromisso de longo prazo, 
        cancele quando quiser. Teste grátis por 14 dias.
      </p>
      
      <div className="flex items-center justify-center gap-4 mb-2">
        <span className={`text-sm ${isYearly ? TEXT_MUTED_FOREGROUND_CLASS : 'font-semibold text-foreground'}`}>
          Mensal
        </span>
        <div className="relative">
          <Switch 
            checked={isYearly}
            onCheckedChange={onToggle}
            className="data-[state=checked]:bg-primary"
          />
        </div>
        <span className={`text-sm ${isYearly ? 'font-semibold text-foreground' : TEXT_MUTED_FOREGROUND_CLASS}`}>
          Anual
        </span>
        <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20">
          -20%
        </Badge>
      </div>
      
      <p className="text-xs text-muted-foreground">
        Economize 20% pagando anualmente
      </p>
    </div>
  )
}

export function PricingFooter(): JSX.Element {
  return (
    <div className="mt-16 text-center">
      <div className="bg-muted/30 rounded-2xl p-8 max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold mb-4">
          Não encontrou o plano ideal?
        </h3>
        <p className="text-muted-foreground mb-6">
          Entre em contato conosco para um plano customizado para sua agência
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button size="lg" variant="outline">
            Falar com Vendas
          </Button>
          <div className={`flex items-center gap-2 ${TEXT_SM_MUTED_FOREGROUND_CLASS}`}>
            <Crown className="h-4 w-4" />
            <span>Planos enterprise disponíveis</span>
          </div>
        </div>
      </div>
      
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        <div className="text-center">
          <Star className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
          <h4 className="font-semibold mb-2">14 dias grátis</h4>
          <p className="text-sm text-muted-foreground">
            Teste todos os recursos sem compromisso
          </p>
        </div>
        
        <div className="text-center">
          <Zap className="h-8 w-8 text-blue-500 mx-auto mb-3" />
          <h4 className="font-semibold mb-2">Setup em 5 minutos</h4>
          <p className="text-sm text-muted-foreground">
            Configure sua conta rapidamente
          </p>
        </div>
        
        <div className="text-center">
          <Crown className="h-8 w-8 text-purple-500 mx-auto mb-3" />
          <h4 className="font-semibold mb-2">Suporte premium</h4>
          <p className="text-sm text-muted-foreground">
            Atendimento especializado em português
          </p>
        </div>
      </div>
    </div>
  )
}