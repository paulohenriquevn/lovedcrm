/**
 * Score Breakdown Modal Content
 * Extracted main content to reduce function size
 */
import { DialogContent } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'

import { FactorBreakdownChart, ScoreBreakdownGrid } from './score-breakdown-modal-components'

interface ModalContentProps {
  score: number
  factors: Record<string, number>
  leadId?: string
  trendDirection?: string
  trendValue?: number
}

export function ScoreBreakdownModalContent({
  score: _score,
  factors,
  leadId,
  trendDirection: _trendDirection,
  trendValue: _trendValue,
}: ModalContentProps): React.ReactElement {
  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
        {/* Left Panel: Chart */}
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-3">Factor Contribution</h3>
            <FactorBreakdownChart factors={factors} />
          </div>

          {Boolean(leadId) && (
            <div className="text-xs text-muted-foreground">Lead ID: {leadId}</div>
          )}
        </div>

        <Separator orientation="vertical" className="hidden lg:block" />

        {/* Right Panel: Details */}
        <div className="space-y-4 overflow-y-auto">
          <div>
            <h3 className="font-semibold mb-3">Detailed Breakdown</h3>
            <ScoreBreakdownGrid factors={factors} />
          </div>
        </div>
      </div>
    </DialogContent>
  )
}
