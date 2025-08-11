/**
 * FAQ Section - Landing Page Loved CRM
 * Seção de perguntas frequentes otimizada para agências brasileiras
 * Baseado na especificação do agente 08-landing-page.md
 */

'use client'

import { motion } from 'framer-motion'
import { HelpCircle, MessageSquare, CreditCard, Shield, Smartphone, Zap } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import {
  useScrollAnimation,
  scrollAnimationVariants,
  staggerContainer,
  staggerItem,
} from '@/hooks/use-scroll-animation'

import { BottomCTA } from './faq/bottom-cta'
import { CategorySidebar } from './faq/category-sidebar'
import { FAQContent } from './faq/faq-content'

const faqCategories = [
  {
    id: 'geral',
    name: 'Geral',
    icon: HelpCircle,
    color: 'text-blue-600',
    questions: [
      {
        question: 'O que é o Loved CRM e por que é diferente?',
        answer:
          'Loved CRM é o único CRM desenvolvido 100% para agências digitais brasileiras. Diferente de ferramentas genéricas, temos WhatsApp integrado nativamente, IA que entende português e pipeline otimizado para o processo de vendas brasileiro (Lead → Contato → Proposta → Negociação → Fechado).',
      },
      {
        question: 'Funciona para agências de qualquer tamanho?',
        answer:
          'Sim! Atendemos desde freelancers até agências com 50+ pessoas. Nosso plano Free é perfeito para começar, o Pro para agências de 5-15 pessoas, e o Enterprise para grandes agências. Você pode migrar entre planos conforme cresce.',
      },
      {
        question: 'Quanto tempo leva para configurar tudo?',
        answer:
          'Configuração completa em 5 minutos! Basta conectar seu WhatsApp Business, importar contatos e pronto. Nossa IA já começa a analisar conversas automaticamente. Oferecemos onboarding gratuito para clientes Pro e Enterprise.',
      },
    ],
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: MessageSquare,
    color: 'text-green-600',
    questions: [
      {
        question: 'Como funciona a integração com WhatsApp?',
        answer:
          'Conectamos via WhatsApp Business API oficial. Todas as conversas aparecem no CRM automaticamente, organizadas por cliente. Você pode responder direto do CRM, criar templates, automatizar mensagens e até gravar chamadas de voz.',
      },
      {
        question: 'Preciso mudar meu número de WhatsApp?',
        answer:
          'Não! Você usa o mesmo número que já usa. Só precisa ter WhatsApp Business (gratuito) instalado. A integração funciona tanto no celular quanto no computador, sincronizando tudo em tempo real.',
      },
      {
        question: 'Posso usar múltiplos números de WhatsApp?',
        answer:
          'Sim, no plano Enterprise! Ideal para agências que atendem diferentes nichos ou têm múltiplas marcas. Cada número fica separado no CRM com sua própria timeline e configurações.',
      },
    ],
  },
  {
    id: 'ia',
    name: 'Inteligência Artificial',
    icon: Zap,
    color: 'text-violet-600',
    questions: [
      {
        question: 'A IA realmente entende português brasileiro?',
        answer:
          "Perfeitamente! Nossa IA é treinada especificamente para agências brasileiras. Entende gírias, contexto cultural, e até detecta urgência em mensagens como 'preciso pra ontem'. Gera resumos em português natural, não traduzido.",
      },
      {
        question: 'O que a IA faz exatamente com minhas conversas?',
        answer:
          "A IA analisa conversas e gera resumos automáticos tipo: 'Cliente interessado em marketing digital, orçamento R$ 5-8k/mês, quer começar em março'. Também sugere próximas ações e identifica oportunidades de upsell.",
      },
      {
        question: 'Meus dados ficam seguros com a IA?',
        answer:
          '100% seguros! Processamos tudo em servidores brasileiros, criptografia AES-256, e compliance total com LGPD. A IA não armazena conversas, só gera insights. Você pode desabilitar a IA a qualquer momento.',
      },
    ],
  },
  {
    id: 'precos',
    name: 'Preços & Pagamento',
    icon: CreditCard,
    color: 'text-yellow-600',
    questions: [
      {
        question: 'Posso testar antes de pagar?',
        answer:
          'Claro! Plano Free para sempre (até 100 leads/mês) e 30 dias grátis nos planos pagos. Sem cartão de crédito no Free, sem multa de cancelamento nos pagos. Risco zero para testar.',
      },
      {
        question: 'Como funcionam os preços por usuário?',
        answer:
          'Simples: Free (1 usuário), Pro (até 15 usuários por R$ 97/mês), Enterprise (ilimitado por R$ 297/mês). Não cobramos por usuário extra. Preços em real, pagamento via PIX, cartão ou boleto.',
      },
      {
        question: 'Existe desconto para pagamento anual?',
        answer:
          'Sim! Pagando anual, você ganha 2 meses grátis (desconto de 17%). Pro fica R$ 970/ano (~R$ 81/mês) e Enterprise R$ 2.970/ano (~R$ 247/mês). Sem compromisso, pode cancelar e receber proporcional.',
      },
    ],
  },
  {
    id: 'seguranca',
    name: 'Segurança & Privacidade',
    icon: Shield,
    color: 'text-red-600',
    questions: [
      {
        question: 'Meus dados ficam seguros?',
        answer:
          'Segurança bancária! Criptografia AES-256, servidores no Brasil, backup automático, monitoramento 24/7. Compliance total com LGPD. Auditoria de segurança trimestral por empresa especializada.',
      },
      {
        question: 'Vocês podem ver minhas conversas?',
        answer:
          'Jamais! Seus dados são privados. Nossa equipe não tem acesso às suas conversas ou dados de clientes. Apenas você e sua equipe veem as informações. Temos contratos rigorosos de confidencialidade.',
      },
      {
        question: 'E se eu quiser sair e levar meus dados?',
        answer:
          'Seus dados são seus! Exportação completa em Excel/CSV a qualquer momento. Se cancelar, mantemos seus dados por 90 dias para caso queira voltar. Depois disso, exclusão permanente conforme LGPD.',
      },
    ],
  },
  {
    id: 'tecnico',
    name: 'Técnico',
    icon: Smartphone,
    color: 'text-purple-600',
    questions: [
      {
        question: 'Funciona no celular?',
        answer:
          'Perfeitamente! App nativo para iOS e Android, ou versão web responsiva. Sincronização em tempo real, notificações push, funciona offline. Interface otimizada para uso mobile pelos vendedores.',
      },
      {
        question: 'Integra com outras ferramentas?',
        answer:
          'Sim! Integrações nativas: Google Ads, Facebook Ads, Gmail, Instagram, Stripe, RD Station, Hotmart, e mais. API disponível para integrações customizadas no plano Enterprise.',
      },
      {
        question: 'E se a internet cair?',
        answer:
          'App funciona offline! Conversas, anotações e atualizações ficam salvas localmente e sincronizam quando voltar a conexão. Nunca perca um lead por problema de internet.',
      },
    ],
  },
]

export function FAQSection(): React.ReactElement {
  const [openItems, setOpenItems] = useState<string[]>(['geral-0'])
  const [activeCategory, setActiveCategory] = useState('geral')
  const { ref: headerRef, isInView: headerInView } = useScrollAnimation()
  const { ref: contentRef, isInView: contentInView } = useScrollAnimation()
  const { ref: ctaRef, isInView: ctaInView } = useScrollAnimation()

  const toggleItem = (categoryId: string, questionIndex: number): void => {
    const itemId = `${categoryId}-${questionIndex}`
    setOpenItems(prev =>
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    )
  }

  const activeCategoryData =
    faqCategories.find(cat => cat.id === activeCategory) ?? faqCategories[0] ?? null

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          ref={headerRef}
          className="text-center mb-16"
          initial="hidden"
          animate={headerInView ? 'visible' : 'hidden'}
          variants={scrollAnimationVariants}
        >
          <Badge className="mb-4 bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20">
            Dúvidas Frequentes
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Tire Todas as suas{' '}
            <span className="text-primary bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Dúvidas
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Respostas diretas para as perguntas mais comuns sobre o Loved CRM. Não encontrou sua
            dúvida? <strong className="text-foreground">Nossa equipe responde em minutos!</strong>
          </p>
        </motion.div>

        <motion.div
          ref={contentRef}
          className="flex flex-col lg:flex-row gap-8 w-full"
          initial="hidden"
          animate={contentInView ? 'visible' : 'hidden'}
          variants={staggerContainer}
        >
          <motion.div variants={staggerItem} className="lg:w-1/4 w-full">
            <CategorySidebar
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              categories={faqCategories}
            />
          </motion.div>

          <motion.div variants={staggerItem} className="lg:w-3/4 w-full">
            {activeCategoryData !== null && (
              <FAQContent
                activeCategoryData={activeCategoryData}
                activeCategory={activeCategory}
                openItems={openItems}
                toggleItem={toggleItem}
              />
            )}
          </motion.div>
        </motion.div>

        <BottomCTA ctaRef={ctaRef} ctaInView={ctaInView} />
      </div>
    </section>
  )
}
