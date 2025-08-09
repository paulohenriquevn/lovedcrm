'use client'

import { AlertCircle, TrendingUp } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import type { AdvancedMetricsResponse } from '@/services/crm-leads'

interface AdvancedMetricsDisplayProps {
  data: AdvancedMetricsResponse
}

export function AdvancedMetricsDisplay({ data: _data }: AdvancedMetricsDisplayProps): JSX.Element {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Métricas Avançadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <p className="text-lg font-semibold mb-2">Análise Avançada em Desenvolvimento</p>
            <p className="text-muted-foreground mb-4">
              Esta funcionalidade está sendo implementada e estará disponível em breve.
            </p>
            <Badge variant="outline">Em breve</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
