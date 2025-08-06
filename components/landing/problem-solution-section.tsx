/**
 * Problem Solution Section - Landing Page Loved CRM
 * Seção problema/solução para agências digitais brasileiras
 * Baseado na especificação do agente 08-landing-page.md
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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

const problems = [
  {
    icon: MessageSquare,
    title: "WhatsApp Desorganizado",
    description: "Conversas perdidas entre grupos pessoais e profissionais. Cliente some no meio de 200 mensagens.",
    pain: "Perda de 30% dos leads por desorganização",
    color: "text-red-600 bg-red-50 border-red-200"
  },
  {
    icon: FileSpreadsheet,
    title: "Planilhas Caóticas", 
    description: "Excel corrompido, versões desatualizadas, informações duplicadas. Time trabalhando com dados errados.",
    pain: "4h/dia perdidas em retrabalho",
    color: "text-red-600 bg-red-50 border-red-200"
  },
  {
    icon: Users,
    title: "Equipe Desalinhada",
    description: "Ninguém sabe quem falou com qual cliente. Reunião de status vira interrogatório.",
    pain: "Cliente recebe 3 propostas diferentes",
    color: "text-red-600 bg-red-50 border-red-200"
  }
]

const solutions = [
  {
    icon: BarChart3,
    title: "Pipeline Visual Brasileiro",
    description: "Lead → Contato → Proposta → Negociação → Fechado. Arraste e solte. Simples assim.",
    benefit: "100% dos leads organizados",
    color: "text-emerald-600 bg-emerald-50 border-emerald-200"
  },
  {
    icon: MessageSquare,
    title: "WhatsApp Integrado",
    description: "Todas as conversas direto na timeline. IA resume automaticamente. Sem mais scroll infinito.",
    benefit: "80% menos tempo em conversas",
    color: "text-emerald-600 bg-emerald-50 border-emerald-200"
  },
  {
    icon: Bot,
    title: "IA em Português",
    description: "Resumos automáticos: 'Cliente quer começar em fevereiro, orçamento R$ 8k/mês'.",
    benefit: "Economia de 2h/dia em qualificação",
    color: "text-emerald-600 bg-emerald-50 border-emerald-200"
  }
]

export function ProblemSolutionSection() {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background to-gray-50/50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-red-50 text-red-700 border-red-200">
            😤 A Realidade das Agências Brasileiras
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Pare de{" "}
            <span className="text-red-600 line-through decoration-2">Lutar Contra Ferramentas</span>{" "}
            <br />
            <span className="text-primary">Comece a Crescer de Verdade</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Reconhece estes cenários? Você não está sozinho. 
            <strong className="text-foreground"> 90% das agências brasileiras</strong> enfrentam os mesmos problemas.
          </p>
        </div>

        {/* Problems vs Solutions Grid */}
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          
          {/* Problems Side */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <XCircle className="h-8 w-8 text-red-600" />
              <div>
                <h3 className="text-2xl font-bold text-red-600">Os Problemas</h3>
                <p className="text-red-600/80">Que matam sua produtividade</p>
              </div>
            </div>
            
            <div className="space-y-6">
              {problems.map((problem, index) => (
                <Card key={index} className={`border-2 ${problem.color} transition-all duration-300 hover:shadow-lg`}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <problem.icon className="h-6 w-6" />
                      {problem.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      {problem.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive" className="text-xs">
                        💸 {problem.pain}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pain Point Summary */}
            <div className="mt-8 p-6 bg-red-50 rounded-lg border-2 border-red-200">
              <div className="flex items-center gap-3 mb-3">
                <Zap className="h-5 w-5 text-red-600" />
                <h4 className="font-semibold text-red-800">Impacto Real:</h4>
              </div>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• <strong>6 horas/dia</strong> perdidas em retrabalho</li>
                <li>• <strong>30% dos leads</strong> perdidos por desorganização</li>
                <li>• <strong>R$ 15k/mês</strong> em faturamento perdido</li>
              </ul>
            </div>
          </div>

          {/* Solutions Side */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
              <div>
                <h3 className="text-2xl font-bold text-emerald-600">As Soluções</h3>
                <p className="text-emerald-600/80">Que transformam sua agência</p>
              </div>
            </div>
            
            <div className="space-y-6">
              {solutions.map((solution, index) => (
                <Card key={index} className={`border-2 ${solution.color} transition-all duration-300 hover:shadow-lg`}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <solution.icon className="h-6 w-6" />
                      {solution.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      {solution.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-xs">
                        ✅ {solution.benefit}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Success Summary */}
            <div className="mt-8 p-6 bg-emerald-50 rounded-lg border-2 border-emerald-200">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <h4 className="font-semibold text-emerald-800">Resultado Garantido:</h4>
              </div>
              <ul className="text-sm text-emerald-700 space-y-1">
                <li>• <strong>4 horas/dia</strong> economizadas em gestão</li>
                <li>• <strong>50% mais leads</strong> convertidos</li>
                <li>• <strong>R$ 25k/mês</strong> de faturamento adicional</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Transformation CTA */}
        <div className="mt-16 text-center">
          <Card className="max-w-4xl mx-auto bg-gradient-to-r from-violet-50 to-purple-50 border-violet-200">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                A Transformação Começa em <span className="text-primary">5 Minutos</span>
              </h3>
              <p className="text-lg text-muted-foreground mb-6">
                Mais de <strong>500 agências brasileiras</strong> já fizeram a mudança. 
                Algumas cresceram <strong>200% em 6 meses</strong>.
              </p>
              <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span>Setup em 5 minutos</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span>30 dias grátis</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span>Suporte em português</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}