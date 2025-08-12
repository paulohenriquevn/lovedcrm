/**
 * Score Breakdown Modal Components
 * Individual components for score breakdown modal
 */
'use client'

import { Download, FileText } from 'lucide-react'
import { useMemo } from 'react'
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

import { FACTOR_CONFIG } from './score-breakdown-modal-config'

// Factor recommendations
export function FactorRecommendations({
  factors,
}: {
  factors: Record<string, number>
}): React.ReactElement {
  const recommendations = useMemo(() => {
    return Object.entries(factors)
      .map(([key, value]) => {
        const config = FACTOR_CONFIG[key]
        if (!config) {
          return null
        }

        const percentage = (value / config.maxScore) * 100
        let level: 'low' | 'medium' | 'high' = 'medium'

        if (percentage < 40) {
          level = 'low'
        } else if (percentage > 70) {
          level = 'high'
        }

        return {
          key,
          label: config.label,
          value,
          maxScore: config.maxScore,
          percentage: Math.round(percentage),
          recommendation: config.recommendations[level],
          level,
        }
      })
      .filter(Boolean)
  }, [factors])

  return (
    <div className="space-y-4">
      {recommendations.map(item => {
        if (!item) {
          return null
        }
        return (
          <Card key={item.key} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">{item.label}</h4>
              <span className="text-sm text-muted-foreground">
                {item.value}/{item.maxScore}
              </span>
            </div>
            <Progress value={item.percentage} className="mb-2" />
            <p className="text-sm text-muted-foreground">{item.recommendation}</p>
          </Card>
        )
      })}
    </div>
  )
}

// Export functionality
export function ExportOptions({
  score,
  factors,
  onClose,
}: {
  score: number
  factors: Record<string, number>
  onClose: () => void
}): React.ReactElement {
  const handleExport = (format: 'pdf' | 'csv' | 'json'): void => {
    // Mock export functionality - in real implementation, this would call an API
    const exportData = {
      score,
      factors,
      timestamp: new Date().toISOString(),
      format,
    }

    // Console log for debugging export functionality
    // eslint-disable-next-line no-console
    console.log('Exporting score breakdown:', exportData)

    // Create a mock download
    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)

    const link = document.createElement('a')
    link.href = url
    link.download = `lead-score-breakdown.${format}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)
    onClose()
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          handleExport('pdf')
        }}
        className="flex items-center gap-2"
      >
        <FileText className="h-4 w-4" />
        PDF Report
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          handleExport('csv')
        }}
        className="flex items-center gap-2"
      >
        <Download className="h-4 w-4" />
        CSV Data
      </Button>
    </div>
  )
}

// Factor breakdown chart component
export function FactorBreakdownChart({
  factors,
}: {
  factors: Record<string, number>
}): React.ReactElement {
  const chartData = useMemo(() => {
    return Object.entries(factors).map(([key, value]) => {
      const config = FACTOR_CONFIG[key]
      return {
        factor: config?.label ?? key,
        value,
        fullMark: config?.maxScore ?? 100,
      }
    })
  }, [factors])

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={chartData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="factor" />
          <PolarRadiusAxis angle={90} domain={[0, 'dataMax']} tick={false} />
          <Radar name="Score" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}

// Score breakdown grid component
export function ScoreBreakdownGrid({
  factors,
}: {
  factors: Record<string, number>
}): React.ReactElement {
  const gridData = useMemo(() => {
    return Object.entries(factors).map(([key, value]) => {
      const config = FACTOR_CONFIG[key]
      const percentage = config ? Math.round((value / config.maxScore) * 100) : 0

      return {
        key,
        label: config?.label ?? key,
        value,
        maxScore: config?.maxScore ?? 100,
        percentage,
      }
    })
  }, [factors])

  return (
    <div className="grid grid-cols-2 gap-4">
      {gridData.map(item => (
        <Card key={item.key} className="p-4">
          <div className="text-sm text-muted-foreground mb-1">{item.label}</div>
          <div className="text-2xl font-bold mb-2">
            {item.value}/{item.maxScore}
          </div>
          <Progress value={item.percentage} className="h-2" />
          <div className="text-xs text-muted-foreground mt-1">{item.percentage}%</div>
        </Card>
      ))}
    </div>
  )
}
