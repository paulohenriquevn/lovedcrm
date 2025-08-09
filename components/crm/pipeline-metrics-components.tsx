/**
 * Pipeline Metrics Components
 * Individual metric cards and charts
 */

import { TrendingUp, TrendingDown, DollarSign, Users } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { formatCurrency, type ChartDataPoint, type TimeDataPoint } from './pipeline-metrics-utils'

interface MetricsCardsProps {
  totalLeads: number
  conversionRate: number
  pipelineValue: number
  closedValue: number
}

export function MetricsCards({
  totalLeads,
  conversionRate,
  pipelineValue,
  closedValue,
}: MetricsCardsProps): JSX.Element {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalLeads}</div>
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
          <Badge variant={conversionRate >= 15 ? 'default' : 'destructive'}>
            {conversionRate >= 15 ? 'Boa conversão' : 'Pode melhorar'}
          </Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Valor Total Pipeline</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(pipelineValue)}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Valor Fechado</CardTitle>
          <DollarSign className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(closedValue)}</div>
          <Badge variant="outline">
            {((closedValue / pipelineValue) * 100 || 0).toFixed(1)}% do total
          </Badge>
        </CardContent>
      </Card>
    </div>
  )
}

interface StageDistributionChartProps {
  data: ChartDataPoint[]
}

export function StageDistributionChart({ data }: StageDistributionChartProps): JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuição por Estágio</CardTitle>
        <CardDescription>Número de leads em cada estágio</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="stage" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

interface AverageStageTimeChartProps {
  data: TimeDataPoint[]
}

export function AverageStageTimeChart({ data }: AverageStageTimeChartProps): JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tempo Médio por Estágio</CardTitle>
        <CardDescription>Dias médios em cada estágio</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="stage" />
            <YAxis />
            <Tooltip formatter={(value: string | number) => [`${value} dias`, 'Tempo Médio']} />
            <Line type="monotone" dataKey="time" stroke="#8884d8" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

interface PipelineDistributionChartProps {
  data: ChartDataPoint[]
}

export function PipelineDistributionChart({ data }: PipelineDistributionChartProps): JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuição do Pipeline</CardTitle>
        <CardDescription>Visualização proporcional dos estágios</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({
                stage,
                count,
                percent,
              }: {
                stage: string
                count: number
                percent: number
              }) => `${stage}: ${count} (${(percent * 100).toFixed(0)}%)`}
              outerRadius={120}
              fill="#8884d8"
              dataKey="count"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
