/**
 * Problem Solution Section - Landing Page Loved CRM
 * Seção problema/solução para agências digitais brasileiras
 * Baseado na especificação do agente 08-landing-page.md
 */

'use client'

import { motion } from 'framer-motion'
import { 
  MessageSquare, 
  FileSpreadsheet, 
  Users, 
  Zap, 
  Bot, 
  BarChart3,
  CheckCircle,
  XCircle 
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useScrollAnimation, scrollAnimationVariants, staggerContainer, staggerItem } from '@/hooks/use-scroll-animation'

const problems = [
  {
    icon: MessageSquare,
    title: "Conversas Perdidas",
    description: "Leads importantes se perdem entre mensagens pessoais e profissionais no WhatsApp, resultando em oportunidades perdidas.",
    metric: "30% dos leads perdidos",
    impact: "R$ 12k/mês em vendas perdidas"
  },
  {
    icon: FileSpreadsheet,
    title: "Dados Desorganizados", 
    description: "Planilhas desatualizadas e informações espalhadas criam retrabalho constante e decisões baseadas em dados incorretos.",
    metric: "4.5h/dia em retrabalho",
    impact: "35% menos produtividade"
  },
  {
    icon: Users,
    title: "Equipe Desalinhada",
    description: "Falta de visibilidade sobre o status dos leads gera duplicação de esforços e experiência inconsistente para o cliente.",
    metric: "40% dos processos duplicados",
    impact: "Perda de credibilidade"
  }
]

const solutions = [
  {
    icon: BarChart3,
    title: "Pipeline Visual Completo",
    description: "Sistema Kanban intuitivo que centraliza todos os leads em um fluxo visual claro, com atualizações em tempo real para toda equipe.",
    benefit: "100% dos leads organizados",
    time: "Implementação em 5 minutos"
  },
  {
    icon: MessageSquare,
    title: "WhatsApp Business Integrado",
    description: "Centralize todas as conversas de WhatsApp em uma interface profissional com histórico completo e contexto do cliente.",
    benefit: "80% menos tempo buscando conversas",
    time: "Sincronização automática"
  },
  {
    icon: Bot,
    title: "Resumos Inteligentes por IA",
    description: "IA processa conversas automaticamente e entrega resumos estruturados: perfil do cliente, necessidades e próximas ações.",
    benefit: "3x mais leads qualificados",
    time: "Análise instantânea"
  }
]

export function ProblemSolutionSection() {
  const { ref: headerRef, isInView: headerInView } = useScrollAnimation()
  const { ref: problemsRef, isInView: problemsInView } = useScrollAnimation()
  const { ref: solutionsRef, isInView: solutionsInView } = useScrollAnimation()
  const { ref: ctaRef, isInView: ctaInView } = useScrollAnimation()

  return (
    <section className="py-24 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          ref={headerRef}
          className="text-center mb-20"
          initial="hidden"
          animate={headerInView ? "visible" : "hidden"}
          variants={scrollAnimationVariants}
        >
          <Badge className="mb-6 bg-muted text-muted-foreground border-border px-4 py-2">
            Problemas Reais de Agências Brasileiras
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
            Transforme Caos em{" "}
            <span className="text-primary bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Resultados Mensuráveis
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Pesquisa com 500+ agências brasileiras revelou: 
            <strong className="text-foreground"> 73% perdem leads por desorganização</strong>. 
            Veja como resolver definitivamente.
          </p>
        </motion.div>

        {/* Problems Section */}
        <motion.div
          ref={problemsRef}
          className="mb-20"
          initial="hidden"
          animate={problemsInView ? "visible" : "hidden"}
          variants={scrollAnimationVariants}
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-foreground mb-4">
              Os Principais Desafios Identificados
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Baseado em análise de 500+ agências brasileiras que implementaram nossa solução
            </p>
          </div>
          
          <motion.div 
            className="grid md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            animate={problemsInView ? "visible" : "hidden"}
          >
            {problems.map((problem, index) => (
              <motion.div key={index} variants={staggerItem}>
                <Card className="h-full bg-background border border-border hover:border-red-300 hover:shadow-lg transition-all duration-300 group">
                  <CardContent className="p-8">
                    <div className="flex items-center justify-center w-16 h-16 bg-red-50 rounded-xl mb-6 group-hover:bg-red-100 transition-colors">
                      <problem.icon className="h-8 w-8 text-red-600" />
                    </div>
                    
                    <h4 className="text-xl font-semibold text-foreground mb-4">
                      {problem.title}
                    </h4>
                    
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      {problem.description}
                    </p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <span className="text-sm font-medium text-muted-foreground">Impacto:</span>
                        <span className="text-sm font-semibold text-red-700">{problem.metric}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span className="text-sm font-medium text-muted-foreground">Custo:</span>
                        <span className="text-sm font-semibold text-foreground">{problem.impact}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Solutions Section */}
        <motion.div
          ref={solutionsRef}
          className="mb-20"
          initial="hidden"
          animate={solutionsInView ? "visible" : "hidden"}
          variants={scrollAnimationVariants}
        >
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
              <h3 className="text-3xl font-bold text-foreground">
                Nossa Solução Comprovada
              </h3>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Sistema desenvolvido especificamente para resolver os problemas das agências brasileiras
            </p>
          </div>
          
          <motion.div 
            className="grid md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            animate={solutionsInView ? "visible" : "hidden"}
          >
            {solutions.map((solution, index) => (
              <motion.div key={index} variants={staggerItem}>
                <Card className="h-full bg-background border border-border hover:border-emerald-300 hover:shadow-lg transition-all duration-300 group">
                  <CardContent className="p-8">
                    <div className="flex items-center justify-center w-16 h-16 bg-emerald-50 rounded-xl mb-6 group-hover:bg-emerald-100 transition-colors">
                      <solution.icon className="h-8 w-8 text-emerald-600" />
                    </div>
                    
                    <h4 className="text-xl font-semibold text-foreground mb-4">
                      {solution.title}
                    </h4>
                    
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      {solution.description}
                    </p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                        <span className="text-sm font-medium text-muted-foreground">Resultado:</span>
                        <span className="text-sm font-semibold text-emerald-700">{solution.benefit}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span className="text-sm font-medium text-muted-foreground">Implementação:</span>
                        <span className="text-sm font-semibold text-foreground">{solution.time}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Success Summary */}
          <motion.div 
            className="mt-12 p-8 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200"
            initial={{ opacity: 0, y: 20 }}
            animate={solutionsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-6">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
                <h4 className="text-2xl font-bold text-foreground">Transformação Garantida</h4>
              </div>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-emerald-700 mb-2">4h</div>
                  <p className="text-muted-foreground">Economizadas por dia</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-emerald-700 mb-2">2x</div>
                  <p className="text-muted-foreground">Mais conversões</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-emerald-700 mb-2">R$ 25k+</div>
                  <p className="text-muted-foreground">Extras por mês</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Professional CTA Section */}
        <motion.div 
          ref={ctaRef}
          className="text-center"
          initial="hidden"
          animate={ctaInView ? "visible" : "hidden"}
          variants={scrollAnimationVariants}
        >
          <Card className="max-w-5xl mx-auto bg-gradient-to-br from-slate-50 via-white to-violet-50 border border-border shadow-xl">
            <CardContent className="p-12">
              <Badge className="mb-6 bg-violet-100 text-violet-700 border-violet-200 px-4 py-2">
                Teste Grátis por 30 Dias
              </Badge>
              
              <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-6 leading-tight">
                Pronto para Transformar sua{" "}
                <span className="text-primary bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                  Agência Hoje?
                </span>
              </h3>
              
              <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
                Junte-se a mais de <strong>500 agências brasileiras</strong> que já eliminaram o caos, 
                organizaram seus processos e <strong>aumentaram o faturamento em até 200%</strong>.
              </p>
              
              <motion.div 
                className="grid md:grid-cols-3 gap-6 mb-8 text-center"
                variants={staggerContainer}
                initial="hidden"
                animate={ctaInView ? "visible" : "hidden"}
              >
                <motion.div 
                  className="flex flex-col items-center gap-3 p-6 bg-background rounded-xl border border-border"
                  variants={staggerItem}
                >
                  <CheckCircle className="h-8 w-8 text-emerald-600" />
                  <div>
                    <div className="font-semibold text-foreground">Setup Instantâneo</div>
                    <div className="text-sm text-muted-foreground">Funcionando em 5 minutos</div>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="flex flex-col items-center gap-3 p-6 bg-background rounded-xl border border-border"
                  variants={staggerItem}
                >
                  <CheckCircle className="h-8 w-8 text-emerald-600" />
                  <div>
                    <div className="font-semibold text-foreground">Sem Compromisso</div>
                    <div className="text-sm text-muted-foreground">Cancele quando quiser</div>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="flex flex-col items-center gap-3 p-6 bg-background rounded-xl border border-border"
                  variants={staggerItem}
                >
                  <CheckCircle className="h-8 w-8 text-emerald-600" />
                  <div>
                    <div className="font-semibold text-foreground">Suporte Premium</div>
                    <div className="text-sm text-muted-foreground">Em português, sempre</div>
                  </div>
                </motion.div>
              </motion.div>
              
              <motion.div 
                className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-6 border border-emerald-200"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={ctaInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <p className="text-sm text-muted-foreground mb-2">
                  <strong>Garantia de Satisfação:</strong>
                </p>
                <p className="text-xs text-slate-500">
                  30 dias para testar completamente. Se não conseguir organizar seus leads e aumentar as conversões, 
                  devolvemos 100% do seu investimento. Sem perguntas, sem burocracia.
                </p>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}