/**
 * Pipeline Metrics Utilities
 * Helper functions and components for metrics dashboard
 */

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// Stage colors and labels constants
export const STAGE_COLORS = {
  lead: '#ef4444', // red-500
  contato: '#f97316', // orange-500
  proposta: '#eab308', // yellow-500
  negociacao: '#3b82f6', // blue-500
  fechado: '#22c55e', // green-500
} as const

export const STAGE_LABELS = {
  lead: 'Lead',
  contato: 'Contato',
  proposta: 'Proposta',
  negociacao: 'Negociação',
  fechado: 'Fechado',
} as const

// Types
export interface MetricsData {
  stage_counts: Record<string, number>
  conversion_rate: number
  average_stage_times: Record<string, number>
  total_pipeline_value: number
  closed_pipeline_value: number
  total_leads: number
  period_start?: string
  period_end?: string
}

export interface ChartDataPoint {
  stage: string
  count: number
  fill: string
}

export interface TimeDataPoint {
  stage: string
  time: number
}

// Helper functions
export const createStageChartData = (stageCounts: Record<string, number>): ChartDataPoint[] => {
  return Object.entries(stageCounts).map(([stage, count]) => ({
    stage: STAGE_LABELS[stage as keyof typeof STAGE_LABELS] || stage,
    count,
    fill: STAGE_COLORS[stage as keyof typeof STAGE_COLORS] || '#6b7280',
  }))
}

export const createStageTimeData = (averageStageTimes: Record<string, number>): TimeDataPoint[] => {
  return Object.entries(averageStageTimes).map(([stage, time]) => ({
    stage: STAGE_LABELS[stage as keyof typeof STAGE_LABELS] || stage,
    time: Number(time.toFixed(1)),
  }))
}

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

// Loading skeleton component
export function MetricsLoadingSkeleton({ className }: { className?: string }): JSX.Element {
  return (
    <div className={className}>
      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={`skeleton-card-${i}`}>
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
