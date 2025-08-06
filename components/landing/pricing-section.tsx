/**
 * Pricing Section - Landing Page Loved CRM
 * Seção de preços otimizada para agências brasileiras
 * Baseado na especificação do agente 08-landing-page.md
 */

'use client'

import { 
  Check, 
  Star, 
  Zap, 
  Crown, 
  ArrowRight,
  Users,
  MessageSquare,
  Bot,
  BarChart3,
  Shield,
  Headphones
} from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { useScrollAnimation, scrollAnimationVariants, staggerContainer, staggerItem, cardHoverVariants, buttonPressVariants, enhancedCardHoverVariants, iconBounceVariants } from '@/hooks/use-scroll-animation'

const pricingPlans = [
  {
    id: 'free',
    name: 'Starter',
    tagline: 'Para começar',
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: 'Ideal para agências pequenas testando o sistema',
    icon: Users,
    color: 'border-gray-200 hover:border-gray-300',
    buttonVariant: 'outline' as const,
    buttonText: 'Começar Grátis',
    features: [
      'Até 100 leads/mês',
      'Pipeline básico (5 estágios)',
      'WhatsApp integração básica',
      '1 usuário',
      'Suporte por email',
      'Relatórios básicos'
    ],
    limitations: [
      'Sem IA resumos',
      'Sem automações',
      'Sem VoIP'
    ],
    badge: null
  },
  {
    id: 'pro',
    name: 'Professional',
    tagline: 'Mais Popular',
    monthlyPrice: 97,
    yearlyPrice: 970, // 2 meses grátis
    description: 'Perfeito para agências de 5-15 pessoas em crescimento',
    icon: Zap,
    color: 'border-violet-200 hover:border-violet-300 bg-violet-50/50',
    buttonVariant: 'default' as const,
    buttonText: 'Teste 30 Dias Grátis',
    features: [
      'Leads ilimitados',
      'Pipeline completo + automações',
      'WhatsApp Business API',
      'IA resumos em português',
      'Até 15 usuários',
      'VoIP integrado',
      'Relatórios avançados',
      'Integrações (Google Ads, Facebook)',
      'Suporte prioritário',
      'App mobile'
    ],
    limitations: [],
    badge: 'MAIS POPULAR'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    tagline: 'Para grandes agências',
    monthlyPrice: 297,
    yearlyPrice: 2970,
    description: 'Agências com 15+ pessoas e necessidades avançadas',
    icon: Crown,
    color: 'border-gray-800 hover:border-gray-700 bg-gray-50/50',
    buttonVariant: 'default' as const,
    buttonText: 'Falar com Consultor',
    features: [
      'Tudo do Professional',
      'Usuários ilimitados', 
      'Multi-organizações',
      'API personalizada',
      'WhatsApp múltiplos números',
      'IA avançada + custom prompts',
      'Dashboards personalizados',
      'Integrações customizadas',
      'Gerente de conta dedicado',
      'SLA 99.9%',
      'Treinamento completo',
      'Suporte 24/7'
    ],
    limitations: [],
    badge: 'ENTERPRISE'
  }
]

const faqs = [
  {
    question: "Posso começar grátis?",
    answer: "Sim! O plano Starter é 100% gratuito para sempre, com até 100 leads por mês. Para planos pagos, oferecemos 30 dias de teste grátis."
  },
  {
    question: "Como funciona a integração com WhatsApp?",
    answer: "Usamos a API oficial do WhatsApp Business. Você conecta seu número e todas as conversas aparecem no CRM automaticamente."
  },
  {
    question: "A IA funciona em português?",
    answer: "Sim! Nossa IA é treinada especificamente para agências brasileiras e entende perfeitamente português, gírias e contexto local."
  },
  {
    question: "Posso cancelar a qualquer momento?",
    answer: "Claro! Sem multas ou taxas de cancelamento. Seus dados ficam disponíveis por 90 dias caso queira voltar."
  }
]

declare global {
  function gtag(...args: any[]): void
}

export function PricingSection() {
  const [isYearly, setIsYearly] = useState(false)
  const { ref: headerRef, isInView: headerInView } = useScrollAnimation()
  const { ref: plansRef, isInView: plansInView } = useScrollAnimation()
  const { ref: roiRef, isInView: roiInView } = useScrollAnimation()
  const { ref: faqRef, isInView: faqInView } = useScrollAnimation()

  const handlePlanSelect = (planId: string) => {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'pricing_plan_select', { 
        plan_id: planId,
        billing: isYearly ? 'yearly' : 'monthly' 
      })
    }
  }

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
Preços Transparentes
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Planos que{" "}
            <span className="text-primary bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Cabem no seu Bolso
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Preços honestos para agências brasileiras. Sem pegadinhas, sem taxas ocultas.
            <strong className="text-foreground"> Comece grátis e cresça no seu ritmo.</strong>
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className={`text-sm ${isYearly ? 'text-muted-foreground' : 'text-foreground font-medium'}`}>
              Mensal
            </span>
            <Switch 
              checked={isYearly}
              onCheckedChange={setIsYearly}
              className="data-[state=checked]:bg-primary"
            />
            <span className={`text-sm ${isYearly ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
              Anual
            </span>
            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 ml-2">
              2 meses grátis!
            </Badge>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div 
          ref={plansRef}
          className="grid md:grid-cols-3 gap-8 mb-16"
          initial="hidden"
          animate={plansInView ? "visible" : "hidden"}
          variants={staggerContainer}
        >
          {pricingPlans.map((plan, index) => {
            const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice
            const isPopular = plan.id === 'pro'
            
            return (
              <motion.div
                key={plan.id}
                variants={staggerItem}
                initial="rest"
                whileHover="hover"
              >
                <motion.div
                  variants={enhancedCardHoverVariants}
                >
                  <Card className={`relative ${plan.color} ${isPopular ? 'scale-105 shadow-xl' : ''} h-full ${plan.badge ? 'mt-4' : ''}`}>
                {plan.badge ? <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground z-10">
                    {plan.badge}
                  </Badge> : null}
                
                <CardHeader className="text-center pb-2">
                  <div className="flex items-center justify-center mb-4">
                    <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${isPopular ? 'bg-primary/20' : 'bg-muted'}`}>
                      <plan.icon className={`h-6 w-6 ${isPopular ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                  </div>
                  
                  <CardTitle className="text-xl font-bold">
                    {plan.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mb-4">
                    {plan.description}
                  </p>
                  
                  <div className="mb-6">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-sm text-muted-foreground">R$</span>
                      <span className="text-4xl font-bold text-foreground">{price}</span>
                      {plan.monthlyPrice > 0 && (
                        <span className="text-muted-foreground">/{isYearly ? 'ano' : 'mês'}</span>
                      )}
                    </div>
                    {plan.monthlyPrice > 0 && isYearly ? <p className="text-xs text-emerald-600 mt-1">
                        ~R$ {Math.round(price/12)}/mês
                      </p> : null}
                    {plan.monthlyPrice === 0 && (
                      <p className="text-sm text-muted-foreground mt-1">Para sempre</p>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <motion.div
                    variants={buttonPressVariants}
                    initial="rest"
                    whileHover="hover"
                    whileTap="press"
                  >
                    <Button 
                      className="w-full mb-6" 
                      variant={plan.buttonVariant}
                      size="lg"
                      onClick={() => handlePlanSelect(plan.id)}
                    >
                      {plan.buttonText}
                      <motion.div
                        variants={iconBounceVariants}
                        className="ml-2"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </motion.div>
                    </Button>
                  </motion.div>

                  {/* Features */}
                  <div className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                    
                    {plan.limitations.map((limitation, index) => (
                      <div key={index} className="flex items-center gap-3 opacity-60">
                        <div className="h-4 w-4 rounded-full border border-gray-300 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground line-through">{limitation}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* ROI Calculator */}
        <motion.div
          ref={roiRef}
          initial="hidden"
          animate={roiInView ? "visible" : "hidden"}
          variants={scrollAnimationVariants}
        >
          <Card className="mb-16 bg-gradient-to-r from-violet-50 to-purple-50 border-violet-200">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Calculadora de ROI
              </h3>
              <p className="text-muted-foreground">
                Veja quanto o Loved CRM pode economizar para sua agência
              </p>
            </div>

            <motion.div 
              className="grid md:grid-cols-3 gap-6"
              variants={staggerContainer}
              initial="hidden"
              animate={roiInView ? "visible" : "hidden"}
            >
              <motion.div className="text-center" variants={staggerItem}>
                <div className="bg-white rounded-lg p-6 mb-4">
                  <BarChart3 className="h-8 w-8 text-primary mx-auto mb-3" />
                  <div className="text-2xl font-bold text-primary mb-2">4h/dia</div>
                  <p className="text-sm text-muted-foreground">Tempo economizado em gestão</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  R$ 80/hora × 4h × 22 dias = <strong>R$ 7.040/mês</strong>
                </p>
              </motion.div>

              <motion.div className="text-center" variants={staggerItem}>
                <div className="bg-white rounded-lg p-6 mb-4">
                  <Users className="h-8 w-8 text-emerald-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-emerald-600 mb-2">30%</div>
                  <p className="text-sm text-muted-foreground">Aumento em conversões</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  100 leads × 30% × R$ 3.000 = <strong>R$ 90.000/mês</strong>
                </p>
              </motion.div>

              <motion.div className="text-center" variants={staggerItem}>
                <div className="bg-white rounded-lg p-6 mb-4">
                  <Star className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-yellow-600 mb-2">ROI</div>
                  <p className="text-sm text-muted-foreground">Retorno do investimento</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  <strong className="text-2xl text-emerald-600">32,000%</strong> no primeiro ano
                </p>
              </motion.div>
            </motion.div>
          </CardContent>
          </Card>
        </motion.div>

        {/* FAQ */}
        <motion.div 
          ref={faqRef}
          className="max-w-3xl mx-auto"
          initial="hidden"
          animate={faqInView ? "visible" : "hidden"}
          variants={scrollAnimationVariants}
        >
          <h3 className="text-2xl font-bold text-center mb-8">
            Perguntas Frequentes
          </h3>
          <motion.div 
            className="space-y-6"
            variants={staggerContainer}
            initial="hidden"
            animate={faqInView ? "visible" : "hidden"}
          >
            {faqs.map((faq, index) => (
              <motion.div key={index} variants={staggerItem}>
                <Card>
                  <CardContent className="p-6">
                    <h4 className="font-semibold text-foreground mb-2">
                      {faq.question}
                    </h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {faq.answer}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

      </div>
    </section>
  )
}