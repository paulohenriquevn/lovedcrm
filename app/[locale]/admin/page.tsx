/**
 * Admin Dashboard Page - Main CRM Dashboard
 * Dashboard principal do CRM com visão geral organizacional
 * Baseado na especificação do agente 09-ui-ux-designer.md
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MainLayout } from '@/components/layout/main-layout'
import { PipelineStage } from '@/components/crm/pipeline-stage'
import { AISummaryCompact } from '@/components/crm/ai-summary'
import { CommunicationChannelBadge } from '@/components/crm/communication-channel'
import { 
  TrendingUp, 
  Users, 
  Target,
  Calendar,
  DollarSign,
  Activity,
  Clock,
  ArrowUp,
  ArrowDown,
  Plus
} from 'lucide-react'

// Mock data - in real app, this would come from API
const dashboardMetrics = {
  totalLeads: {
    value: 247,
    change: +12,
    changeType: 'increase' as const,
    period: 'this month'
  },
  activeDeals: {
    value: 23,
    change: +3,
    changeType: 'increase' as const,
    period: 'this week'
  },
  revenue: {
    value: 89500,
    change: -2.5,
    changeType: 'decrease' as const,
    period: 'this month'
  },
  conversionRate: {
    value: 24.8,
    change: +1.2,
    changeType: 'increase' as const,
    period: 'vs last month'
  }
}

const pipelineStats = [
  { stage: 'lead', count: 45, value: 180000 },
  { stage: 'contact', count: 23, value: 156000 },
  { stage: 'proposal', count: 12, value: 98000 },
  { stage: 'negotiation', count: 8, value: 67000 },
  { stage: 'closed', count: 159, value: 892000 }
] as const

const recentActivity = [
  {
    id: '1',
    type: 'lead_added',
    title: 'Novo lead: Maria Silva',
    description: 'Via WhatsApp • Interessada em marketing digital',
    time: '5 min atrás',
    channel: 'whatsapp' as const
  },
  {
    id: '2',
    type: 'deal_moved',
    title: 'Carlos Oliveira → Proposta',
    description: 'Movido por Ana Costa • Valor: R$ 12.500',
    time: '15 min atrás',
    channel: 'note' as const
  },
  {
    id: '3',
    type: 'ai_summary',
    title: 'Resumo IA gerado',
    description: 'Conversa com TechStart analisada',
    time: '30 min atrás',
    channel: 'note' as const
  },
  {
    id: '4',
    type: 'email_sent',
    title: 'Proposta enviada',
    description: 'Para Creative Studio • Por Pedro Santos',
    time: '1 hora atrás',
    channel: 'email' as const
  }
]

const upcomingTasks = [
  {
    id: '1',
    title: 'Call com Maria Silva',
    description: 'Primeira apresentação da agência',
    time: 'Hoje, 15:30',
    priority: 'high' as const
  },
  {
    id: '2',
    title: 'Enviar proposta TechStart',
    description: 'Proposta de marketing digital completo',
    time: 'Hoje, 16:00',
    priority: 'high' as const
  },
  {
    id: '3',
    title: 'Follow-up Creative Studio',
    description: 'Retorno sobre proposta de branding',
    time: 'Amanhã, 10:00',
    priority: 'medium' as const
  },
  {
    id: '4',
    title: 'Reunião de alinhamento',
    description: 'Review semanal da equipe',
    time: 'Amanhã, 14:00',
    priority: 'low' as const
  }
]

export default function AdminDashboard() {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(value)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">
              Visão geral da Silva Digital Agency
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Hoje
            </Button>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Novo Lead
            </Button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Leads
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardMetrics.totalLeads.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {dashboardMetrics.totalLeads.changeType === 'increase' ? (
                  <ArrowUp className="mr-1 h-3 w-3 text-green-600" />
                ) : (
                  <ArrowDown className="mr-1 h-3 w-3 text-red-600" />
                )}
                <span className={dashboardMetrics.totalLeads.changeType === 'increase' ? 'text-green-600' : 'text-red-600'}>
                  {Math.abs(dashboardMetrics.totalLeads.change)}%
                </span>
                <span className="ml-1">{dashboardMetrics.totalLeads.period}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Negócios Ativos
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardMetrics.activeDeals.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <ArrowUp className="mr-1 h-3 w-3 text-green-600" />
                <span className="text-green-600">
                  +{dashboardMetrics.activeDeals.change}
                </span>
                <span className="ml-1">{dashboardMetrics.activeDeals.period}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Receita do Mês
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(dashboardMetrics.revenue.value)}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <ArrowDown className="mr-1 h-3 w-3 text-red-600" />
                <span className="text-red-600">
                  {dashboardMetrics.revenue.change}%
                </span>
                <span className="ml-1">{dashboardMetrics.revenue.period}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Taxa de Conversão
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardMetrics.conversionRate.value}%</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <ArrowUp className="mr-1 h-3 w-3 text-green-600" />
                <span className="text-green-600">
                  +{dashboardMetrics.conversionRate.change}%
                </span>
                <span className="ml-1">{dashboardMetrics.conversionRate.period}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          
          {/* Pipeline Overview */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Pipeline de Vendas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-5">
                  {pipelineStats.map((stat) => (
                    <div key={stat.stage} className="text-center">
                      <PipelineStage 
                        stage={stat.stage}
                        count={stat.count}
                        variant="compact"
                      />
                      <div className="mt-2">
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(stat.value)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 pt-4 border-t border-border">
                  <Button variant="outline" className="w-full">
                    Ver Pipeline Completo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            
            {/* AI Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Insights Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <AISummaryCompact 
                  summary="12 leads qualificados esta semana. Maria Silva e Carlos Oliveira com alta probabilidade de conversão. Foco em marketing digital crescendo 40%."
                  confidence={94}
                />
              </CardContent>
            </Card>

            {/* Upcoming Tasks */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Próximas Tarefas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingTasks.map((task) => (
                    <div key={task.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50">
                      <div className={`h-2 w-2 rounded-full mt-2 ${getPriorityColor(task.priority).split(' ')[2]}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{task.title}</p>
                        <p className="text-xs text-muted-foreground">{task.description}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{task.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Atividade Recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50">
                  <CommunicationChannelBadge channel={activity.channel} />
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.description}</p>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    {activity.time}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
