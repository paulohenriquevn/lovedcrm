/**
 * FAQ Section - Landing Page Loved CRM
 * Seção de perguntas frequentes otimizada para agências brasileiras
 * Baseado na especificação do agente 08-landing-page.md
 */

'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  ChevronDown, 
  ChevronUp, 
  HelpCircle,
  MessageSquare,
  CreditCard,
  Shield,
  Smartphone,
  Users,
  Zap,
  ArrowRight
} from 'lucide-react'

const faqCategories = [
  {
    id: 'geral',
    name: 'Geral',
    icon: HelpCircle,
    color: 'text-blue-600',
    questions: [
      {
        question: "O que é o Loved CRM e por que é diferente?",
        answer: "Loved CRM é o único CRM desenvolvido 100% para agências digitais brasileiras. Diferente de ferramentas genéricas, temos WhatsApp integrado nativamente, IA que entende português e pipeline otimizado para o processo de vendas brasileiro (Lead → Contato → Proposta → Negociação → Fechado)."
      },
      {
        question: "Funciona para agências de qualquer tamanho?",
        answer: "Sim! Atendemos desde freelancers até agências com 50+ pessoas. Nosso plano Free é perfeito para começar, o Pro para agências de 5-15 pessoas, e o Enterprise para grandes agências. Você pode migrar entre planos conforme cresce."
      },
      {
        question: "Quanto tempo leva para configurar tudo?",
        answer: "Configuração completa em 5 minutos! Basta conectar seu WhatsApp Business, importar contatos e pronto. Nossa IA já começa a analisar conversas automaticamente. Oferecemos onboarding gratuito para clientes Pro e Enterprise."
      }
    ]
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: MessageSquare,
    color: 'text-green-600',
    questions: [
      {
        question: "Como funciona a integração com WhatsApp?",
        answer: "Conectamos via WhatsApp Business API oficial. Todas as conversas aparecem no CRM automaticamente, organizadas por cliente. Você pode responder direto do CRM, criar templates, automatizar mensagens e até gravar chamadas de voz."
      },
      {
        question: "Preciso mudar meu número de WhatsApp?",
        answer: "Não! Você usa o mesmo número que já usa. Só precisa ter WhatsApp Business (gratuito) instalado. A integração funciona tanto no celular quanto no computador, sincronizando tudo em tempo real."
      },
      {
        question: "Posso usar múltiplos números de WhatsApp?",
        answer: "Sim, no plano Enterprise! Ideal para agências que atendem diferentes nichos ou têm múltiplas marcas. Cada número fica separado no CRM com sua própria timeline e configurações."
      }
    ]
  },
  {
    id: 'ia',
    name: 'Inteligência Artificial',
    icon: Zap,
    color: 'text-violet-600',
    questions: [
      {
        question: "A IA realmente entende português brasileiro?",
        answer: "Perfeitamente! Nossa IA é treinada especificamente para agências brasileiras. Entende gírias, contexto cultural, e até detecta urgência em mensagens como 'preciso pra ontem'. Gera resumos em português natural, não traduzido."
      },
      {
        question: "O que a IA faz exatamente com minhas conversas?",
        answer: "A IA analisa conversas e gera resumos automáticos tipo: 'Cliente interessado em marketing digital, orçamento R$ 5-8k/mês, quer começar em março'. Também sugere próximas ações e identifica oportunidades de upsell."
      },
      {
        question: "Meus dados ficam seguros com a IA?",
        answer: "100% seguros! Processamos tudo em servidores brasileiros, criptografia AES-256, e compliance total com LGPD. A IA não armazena conversas, só gera insights. Você pode desabilitar a IA a qualquer momento."
      }
    ]
  },
  {
    id: 'precos',
    name: 'Preços & Pagamento',
    icon: CreditCard,
    color: 'text-yellow-600',
    questions: [
      {
        question: "Posso testar antes de pagar?",
        answer: "Claro! Plano Free para sempre (até 100 leads/mês) e 30 dias grátis nos planos pagos. Sem cartão de crédito no Free, sem multa de cancelamento nos pagos. Risco zero para testar."
      },
      {
        question: "Como funcionam os preços por usuário?",
        answer: "Simples: Free (1 usuário), Pro (até 15 usuários por R$ 97/mês), Enterprise (ilimitado por R$ 297/mês). Não cobramos por usuário extra. Preços em real, pagamento via PIX, cartão ou boleto."
      },
      {
        question: "Existe desconto para pagamento anual?",
        answer: "Sim! Pagando anual, você ganha 2 meses grátis (desconto de 17%). Pro fica R$ 970/ano (~R$ 81/mês) e Enterprise R$ 2.970/ano (~R$ 247/mês). Sem compromisso, pode cancelar e receber proporcional."
      }
    ]
  },
  {
    id: 'seguranca',
    name: 'Segurança & Privacidade',
    icon: Shield,
    color: 'text-red-600',
    questions: [
      {
        question: "Meus dados ficam seguros?",
        answer: "Segurança bancária! Criptografia AES-256, servidores no Brasil, backup automático, monitoramento 24/7. Compliance total com LGPD. Auditoria de segurança trimestral por empresa especializada."
      },
      {
        question: "Vocês podem ver minhas conversas?",
        answer: "Jamais! Seus dados são privados. Nossa equipe não tem acesso às suas conversas ou dados de clientes. Apenas você e sua equipe veem as informações. Temos contratos rigorosos de confidencialidade."
      },
      {
        question: "E se eu quiser sair e levar meus dados?",
        answer: "Seus dados são seus! Exportação completa em Excel/CSV a qualquer momento. Se cancelar, mantemos seus dados por 90 dias para caso queira voltar. Depois disso, exclusão permanente conforme LGPD."
      }
    ]
  },
  {
    id: 'tecnico',
    name: 'Técnico',
    icon: Smartphone,
    color: 'text-purple-600',
    questions: [
      {
        question: "Funciona no celular?",
        answer: "Perfeitamente! App nativo para iOS e Android, ou versão web responsiva. Sincronização em tempo real, notificações push, funciona offline. Interface otimizada para uso mobile pelos vendedores."
      },
      {
        question: "Integra com outras ferramentas?",
        answer: "Sim! Integrações nativas: Google Ads, Facebook Ads, Gmail, Instagram, Stripe, RD Station, Hotmart, e mais. API disponível para integrações customizadas no plano Enterprise."
      },
      {
        question: "E se a internet cair?",
        answer: "App funciona offline! Conversas, anotações e atualizações ficam salvas localmente e sincronizam quando voltar a conexão. Nunca perca um lead por problema de internet."
      }
    ]
  }
]

export function FAQSection() {
  const [openItems, setOpenItems] = useState<string[]>(['geral-0']) // Primeira pergunta aberta por padrão
  const [activeCategory, setActiveCategory] = useState('geral')

  const toggleItem = (categoryId: string, questionIndex: number) => {
    const itemId = `${categoryId}-${questionIndex}`
    setOpenItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const activeCategoryData = faqCategories.find(cat => cat.id === activeCategory) || faqCategories[0]

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background to-gray-50/50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-blue-50 text-blue-700 border-blue-200">
            ❓ Dúvidas Frequentes
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Tire Todas as suas{" "}
            <span className="text-primary bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Dúvidas
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Respostas diretas para as perguntas mais comuns sobre o Loved CRM. 
            Não encontrou sua dúvida? <strong className="text-foreground">Nossa equipe responde em minutos!</strong>
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Category Sidebar */}
          <div className="lg:col-span-1">
            <h3 className="font-semibold text-foreground mb-4">Categorias</h3>
            <div className="space-y-2">
              {faqCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-all duration-200 ${
                    activeCategory === category.id
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'hover:bg-gray-50 text-muted-foreground'
                  }`}
                >
                  <category.icon className={`h-4 w-4 ${category.color}`} />
                  <span className="font-medium">{category.name}</span>
                </button>
              ))}
            </div>

            {/* Contact CTA */}
            <Card className="mt-8 bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200">
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 text-primary mx-auto mb-3" />
                <h4 className="font-semibold text-sm mb-2">Ainda com dúvidas?</h4>
                <p className="text-xs text-muted-foreground mb-4">
                  Fale com nossa equipe especializada em agências
                </p>
                <Button size="sm" className="w-full">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Chat ao Vivo
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Content */}
          <div className="lg:col-span-3">
            <div className="flex items-center gap-3 mb-6">
              <activeCategoryData.icon className={`h-6 w-6 ${activeCategoryData.color}`} />
              <h3 className="text-xl font-bold text-foreground">
                {activeCategoryData.name}
              </h3>
            </div>

            <div className="space-y-4">
              {activeCategoryData.questions.map((faq, index) => {
                const itemId = `${activeCategory}-${index}`
                const isOpen = openItems.includes(itemId)

                return (
                  <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-0">
                      <button
                        onClick={() => toggleItem(activeCategory, index)}
                        className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50/50 transition-colors"
                      >
                        <h4 className="font-semibold text-foreground pr-4">
                          {faq.question}
                        </h4>
                        {isOpen ? (
                          <ChevronUp className="h-5 w-5 text-primary flex-shrink-0" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        )}
                      </button>
                      
                      {isOpen && (
                        <div className="px-6 pb-6 border-t bg-gray-50/30">
                          <p className="text-muted-foreground leading-relaxed pt-4">
                            {faq.answer}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <Card className="max-w-4xl mx-auto bg-gradient-to-r from-violet-50 to-purple-50 border-violet-200">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Não Encontrou sua Dúvida?
              </h3>
              <p className="text-muted-foreground mb-6 text-lg">
                Nossa equipe especializada em agências digitais está aqui para ajudar. 
                <br />
                <strong className="text-foreground">Resposta garantida em até 2 horas!</strong>
              </p>

              <div className="grid md:grid-cols-3 gap-4 mb-8">
                <div className="text-center">
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <MessageSquare className="h-6 w-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold mb-1">WhatsApp</h4>
                  <p className="text-sm text-muted-foreground">Chat direto com especialista</p>
                </div>
                
                <div className="text-center">
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <HelpCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold mb-1">Central de Ajuda</h4>
                  <p className="text-sm text-muted-foreground">Documentação completa</p>
                </div>
                
                <div className="text-center">
                  <div className="h-12 w-12 bg-violet-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Users className="h-6 w-6 text-violet-600" />
                  </div>
                  <h4 className="font-semibold mb-1">Consultoria</h4>
                  <p className="text-sm text-muted-foreground">Call gratuita de 30min</p>
                </div>
              </div>

              <Button size="lg" className="mr-4">
                <MessageSquare className="mr-2 h-5 w-5" />
                Falar com Especialista
              </Button>
              
              <Button size="lg" variant="outline">
                Agendar Demo Gratuita
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}