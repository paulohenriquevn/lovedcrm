'use client'

import { useQuery } from '@tanstack/react-query'
import { AlertCircle, TrendingUp, TrendingDown, DollarSign, Users } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { crmLeadsService } from '@/services/crm-leads'

interface PipelineMetricsProps {
  startDate?: string
  endDate?: string
  className?: string
}

interface MetricsData {
  stage_counts: Record<string, number>
  conversion_rate: number
  average_stage_times: Record<string, number>
  total_pipeline_value: number
  closed_pipeline_value: number
  total_leads: number
  period_start?: string
  period_end?: string
}

const STAGE_COLORS = {
  lead: '#ef4444',      // red-500
  contato: '#f97316',   // orange-500
  proposta: '#eab308',  // yellow-500
  negociacao: '#3b82f6', // blue-500
  fechado: '#22c55e'    // green-500
}

const STAGE_LABELS = {
  lead: 'Lead',
  contato: 'Contato',
  proposta: 'Proposta',
  negociacao: 'Negociação',
  fechado: 'Fechado'
}

export function PipelineMetrics({ startDate, endDate, className }: PipelineMetricsProps) {
  const { data: metrics, isLoading, error } = useQuery({
    queryKey: ['pipeline-metrics', startDate, endDate],
    queryFn: () => crmLeadsService.getPipelineMetrics({ startDate, endDate }),
    refetchInterval: 60_000 // Refresh every minute
  })

  if (isLoading) {
    return (
      <div className={className}>
        <div className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={className}>
        <Card>
          <CardContent className="flex items-center gap-2 p-6">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-red-600">Erro ao carregar métricas do pipeline</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!metrics) {return null}

  const stageChartData = Object.entries(metrics.stage_counts).map(([stage, count]) => ({
    stage: STAGE_LABELS[stage as keyof typeof STAGE_LABELS] || stage,
    count,
    fill: STAGE_COLORS[stage as keyof typeof STAGE_COLORS] || '#6b7280'
  }))

  const stageTimeData = Object.entries(metrics.average_stage_times).map(([stage, time]) => ({
    stage: STAGE_LABELS[stage as keyof typeof STAGE_LABELS] || stage,
    time: Number(time.toFixed(1))
  }))

  const conversionRate = metrics.conversion_rate || 0
  const pipelineValue = metrics.total_pipeline_value || 0
  const closedValue = metrics.closed_pipeline_value || 0

  return (
    <div className={className}>
      <div className="grid gap-6">
        {/* Key Metrics Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.total_leads}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
              {conversionRate >= 15 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{conversionRate.toFixed(1)}%</div>
              <Badge variant={conversionRate >= 15 ? "default" : "destructive"}>
                {conversionRate >= 15 ? "Boa conversão" : "Pode melhorar"}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total Pipeline</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(pipelineValue)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Fechado</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(closedValue)}
              </div>
              <Badge variant="outline">
                {((closedValue / pipelineValue) * 100 || 0).toFixed(1)}% do total
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Stage Distribution Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Estágio</CardTitle>
              <CardDescription>Número de leads em cada estágio</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stageChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="stage" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Average Stage Time Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Tempo Médio por Estágio</CardTitle>
              <CardDescription>Dias médios em cada estágio</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stageTimeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="stage" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} dias`, 'Tempo Médio']} />
                  <Line type="monotone" dataKey="time" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Pipeline Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição do Pipeline</CardTitle>
            <CardDescription>Visualização proporcional dos estágios</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={stageChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ stage, count, percent }) => 
                    `${stage}: ${count} (${(percent * 100).toFixed(0)}%)`
                  }
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {stageChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}