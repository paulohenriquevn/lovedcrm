'use client'

import {
  MetricsCards,
  StageDistributionChart,
  AverageStageTimeChart,
  PipelineDistributionChart,
} from './pipeline-metrics-components'
import { createStageChartData, createStageTimeData } from './pipeline-metrics-utils'

import type { MetricsResponse } from './pipeline-metrics-hooks'

interface BasicMetricsDisplayProps {
  data: MetricsResponse
}

export function BasicMetricsDisplay({ data }: BasicMetricsDisplayProps): JSX.Element {
  const stageChartData = createStageChartData(data.stage_counts)
  const stageTimeData = createStageTimeData(data.average_stage_times)

  return (
    <div className="grid gap-6">
      {/* Key Metrics Cards */}
      <MetricsCards
        totalLeads={data.total_leads}
        conversionRate={data.conversion_rate}
        pipelineValue={data.total_pipeline_value}
        closedValue={data.closed_pipeline_value}
      />

      {/* Charts - Mobile optimized */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="w-full">
          <StageDistributionChart data={stageChartData} />
        </div>
        <div className="w-full">
          <AverageStageTimeChart data={stageTimeData} />
        </div>
      </div>

      {/* Pipeline Distribution Chart - Full width */}
      <div className="w-full">
        <PipelineDistributionChart data={stageChartData} />
      </div>
    </div>
  )
}
