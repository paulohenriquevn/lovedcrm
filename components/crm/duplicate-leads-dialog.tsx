/**
 * Merge Dialog Component
 * Separated dialog component for merging duplicate leads
 */

import { GitMerge, Mail, Phone, User, Calendar } from 'lucide-react'
import React from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

import {
  useMergeDialogLogic,
  type DuplicateLead,
  type DuplicatePair,
} from './duplicate-leads-dialog-hooks'

const CONFIDENCE_CONFIG = {
  veryHigh: {
    color: 'text-red-700 bg-red-50 border-red-200',
    label: 'Very High',
    icon: '🚨',
  },
  high: {
    color: 'text-orange-700 bg-orange-50 border-orange-200',
    label: 'High',
    icon: '⚠️',
  },
  medium: {
    color: 'text-yellow-700 bg-yellow-50 border-yellow-200',
    label: 'Medium',
    icon: '⚡',
  },
  low: {
    color: 'text-blue-700 bg-blue-50 border-blue-200',
    label: 'Low',
    icon: '💡',
  },
} as const

const ACTION_CONFIG = {
  autoMerge: {
    color: 'text-red-600',
    label: 'Auto Merge',
    description: 'Exact match - merge immediately',
  },
  mergeRecommended: {
    color: 'text-orange-600',
    label: 'Merge Recommended',
    description: 'Very likely duplicate - review and merge',
  },
  reviewRequired: {
    color: 'text-yellow-600',
    label: 'Review Required',
    description: 'Possible duplicate - manual review needed',
  },
  monitor: {
    color: 'text-blue-600',
    label: 'Monitor',
    description: 'Low similarity - keep watching',
  },
} as const

const MERGE_STRATEGIES = [
  {
    value: 'keep_original',
    label: 'Keep Original',
    description: 'Keep primary lead data, merge supplementary info',
  },
  {
    value: 'keep_recent',
    label: 'Keep Recent',
    description: 'Use most recently updated lead data',
  },
  {
    value: 'keep_best_data',
    label: 'Keep Best Data',
    description: 'Intelligently merge best quality data from both',
  },
] as const

function DuplicateLeadCard({
  lead,
  isPrimary,
}: {
  lead: DuplicateLead
  isPrimary?: boolean
}): React.ReactElement {
  return (
    <Card className={cn('relative', isPrimary === true && 'ring-2 ring-blue-200 bg-blue-50/30')}>
      {isPrimary === true && (
        <Badge className="absolute -top-2 -right-2 bg-blue-100 text-blue-700 border-blue-200">
          Primary
        </Badge>
      )}
      <CardContent className="pt-4 pb-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <User className="h-4 w-4" />
              {lead.name}
            </h4>
            <Badge variant="outline" className="text-xs">
              Score: {lead.lead_score}
            </Badge>
          </div>

          {lead.email.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-3 w-3" />
              <span className="truncate">{lead.email}</span>
            </div>
          )}

          {lead.phone.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-3 w-3" />
              <span>{lead.phone}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>Created: {new Date(lead.created_at).toLocaleDateString('pt-BR')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function SimilarityAnalysis({ duplicate }: { duplicate: DuplicatePair }): React.ReactElement {
  return (
    <div className="space-y-3">
      <h3 className="font-medium text-sm">Similarity Analysis</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">{duplicate.similarity_score}%</div>
          <div className="text-xs text-muted-foreground">Similarity</div>
        </div>
        <div className="text-center">
          <Badge className={cn('text-xs', CONFIDENCE_CONFIG[duplicate.confidence_level].color)}>
            {CONFIDENCE_CONFIG[duplicate.confidence_level].icon}{' '}
            {CONFIDENCE_CONFIG[duplicate.confidence_level].label}
          </Badge>
          <div className="text-xs text-muted-foreground mt-1">Confidence</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-medium">{duplicate.matching_factors.length}</div>
          <div className="text-xs text-muted-foreground">Matching Factors</div>
        </div>
        <div className="text-center">
          <Badge className={cn('text-xs', ACTION_CONFIG[duplicate.recommended_action].color)}>
            {ACTION_CONFIG[duplicate.recommended_action].label}
          </Badge>
          <div className="text-xs text-muted-foreground mt-1">Recommendation</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {duplicate.matching_factors.map(factor => (
          <Badge key={factor} variant="outline" className="text-xs">
            {factor.replaceAll('_', ' ').replaceAll(/\b\w/g, l => l.toUpperCase())}
          </Badge>
        ))}
      </div>
    </div>
  )
}

function MergeStrategySelection({
  selectedStrategy,
  onStrategyChange,
}: {
  selectedStrategy: string
  onStrategyChange: (strategy: string) => void
}): React.ReactElement {
  return (
    <div className="space-y-3">
      <h3 className="font-medium text-sm">Merge Strategy</h3>
      <Select value={selectedStrategy} onValueChange={onStrategyChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {MERGE_STRATEGIES.map(strategy => (
            <SelectItem key={strategy.value} value={strategy.value}>
              <div>
                <div className="font-medium">{strategy.label}</div>
                <div className="text-xs text-muted-foreground">{strategy.description}</div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function MergeDialogContent({
  duplicate,
  selectedStrategy,
  notes,
  isLoading,
  setSelectedStrategy,
  setNotes,
  handleMerge,
  onOpenChange,
}: {
  duplicate: DuplicatePair
  selectedStrategy: string
  notes: string
  isLoading: boolean
  setSelectedStrategy: (strategy: string) => void
  setNotes: (notes: string) => void
  handleMerge: () => Promise<void>
  onOpenChange: (open: boolean) => void
}): React.ReactElement {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <h3 className="font-medium text-sm mb-3 text-green-700">Original Lead (Will Keep)</h3>
          <DuplicateLeadCard lead={duplicate.original_lead} isPrimary />
        </div>
        <div>
          <h3 className="font-medium text-sm mb-3 text-red-700">Duplicate Lead (Will Merge)</h3>
          <DuplicateLeadCard lead={duplicate.potential_duplicate} />
        </div>
      </div>

      <Separator />
      <SimilarityAnalysis duplicate={duplicate} />
      <Separator />

      <MergeStrategySelection
        selectedStrategy={selectedStrategy}
        onStrategyChange={setSelectedStrategy}
      />

      <div className="space-y-3">
        <h3 className="font-medium text-sm">Merge Notes (Optional)</h3>
        <Textarea
          placeholder="Add any notes about this merge..."
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button onClick={() => void handleMerge()} disabled={isLoading}>
          {isLoading ? 'Merging...' : 'Merge Leads'}
        </Button>
      </div>
    </div>
  )
}

export function MergeDialog({
  duplicate,
  onMerge,
  isOpen,
  onOpenChange,
}: {
  duplicate: DuplicatePair
  onMerge: (primaryId: string, duplicateId: string, strategy: string) => Promise<void>
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}): React.ReactElement {
  const logic = useMergeDialogLogic(duplicate, onMerge, onOpenChange)

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitMerge className="h-5 w-5" />
            Merge Duplicate Leads
          </DialogTitle>
          <DialogDescription>
            Review the duplicate leads and choose a merge strategy. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <MergeDialogContent
          duplicate={duplicate}
          selectedStrategy={logic.selectedStrategy}
          notes={logic.notes}
          isLoading={logic.isLoading}
          setSelectedStrategy={logic.setSelectedStrategy}
          setNotes={logic.setNotes}
          handleMerge={logic.handleMerge}
          onOpenChange={onOpenChange}
        />
      </DialogContent>
    </Dialog>
  )
}

export { CONFIDENCE_CONFIG, ACTION_CONFIG }
