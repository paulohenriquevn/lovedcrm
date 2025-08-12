/**
 * Duplicate Leads Management Panel
 *
 * Interface for viewing, reviewing and merging duplicate leads detected
 * by the fuzzy matching algorithms from the backend deduplication service.
 */

'use client'

import { AlertTriangle, CheckCircle, GitMerge, Mail, Phone, User, Calendar } from 'lucide-react'
import React, { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import { MergeDialog, CONFIDENCE_CONFIG, ACTION_CONFIG } from './duplicate-leads-dialog'

import type { DuplicatePair, DuplicateLead } from './duplicate-leads-dialog-hooks'

interface DuplicateLeadsPanelProps {
  duplicates: DuplicatePair[]
  onMergeLeads: (
    primaryId: string,
    duplicateId: string,
    strategy: string,
    notes?: string
  ) => Promise<void>
  onRefreshDuplicates: () => Promise<void>
  isLoading?: boolean
}

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

function LoadingState(): React.ReactElement {
  return (
    <Card>
      <CardContent className="py-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          <span className="ml-3">Scanning for duplicates...</span>
        </div>
      </CardContent>
    </Card>
  )
}

function NoDuplicatesFound({ onRefresh }: { onRefresh: () => Promise<void> }): React.ReactElement {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          No Duplicates Found
        </CardTitle>
        <CardDescription>
          Great! No potential duplicate leads were detected in your database.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={() => void onRefresh()} variant="outline">
          Scan Again
        </Button>
      </CardContent>
    </Card>
  )
}

function DuplicateCard({
  duplicate,
  onMergeClick,
}: {
  duplicate: DuplicatePair
  onMergeClick: (duplicate: DuplicatePair) => void
}): React.ReactElement {
  return (
    <Card className="relative">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Header with confidence and action */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge
                className={cn(
                  'text-sm font-medium',
                  CONFIDENCE_CONFIG[duplicate.confidence_level].color
                )}
              >
                {CONFIDENCE_CONFIG[duplicate.confidence_level].icon} {duplicate.similarity_score}%
                Match
              </Badge>
              <Badge
                variant="outline"
                className={ACTION_CONFIG[duplicate.recommended_action].color}
              >
                {ACTION_CONFIG[duplicate.recommended_action].label}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => onMergeClick(duplicate)}>
                <GitMerge className="h-4 w-4 mr-2" />
                Merge
              </Button>
            </div>
          </div>

          {/* Lead comparison */}
          <div className="grid md:grid-cols-2 gap-4">
            <DuplicateLeadCard lead={duplicate.original_lead} />
            <DuplicateLeadCard lead={duplicate.potential_duplicate} />
          </div>

          {/* Matching factors */}
          <div className="pt-3 border-t">
            <div className="text-sm font-medium text-muted-foreground mb-2">Matching Factors:</div>
            <div className="flex flex-wrap gap-2">
              {duplicate.matching_factors.map(factor => (
                <Badge key={factor} variant="secondary" className="text-xs">
                  {factor.replaceAll('_', ' ').replaceAll(/\b\w/g, l => l.toUpperCase())}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function DuplicateLeadsPanel({
  duplicates,
  onMergeLeads,
  onRefreshDuplicates,
  isLoading = false,
}: DuplicateLeadsPanelProps): React.ReactElement {
  const [selectedDuplicate, setSelectedDuplicate] = useState<DuplicatePair | null>(null)
  const [showMergeDialog, setShowMergeDialog] = useState(false)

  const handleMergeClick = (duplicate: DuplicatePair): void => {
    setSelectedDuplicate(duplicate)
    setShowMergeDialog(true)
  }

  const handleMerge = async (
    primaryId: string,
    duplicateId: string,
    strategy: string
  ): Promise<void> => {
    await onMergeLeads(primaryId, duplicateId, strategy)
    await onRefreshDuplicates() // Refresh the list after merge
  }

  if (isLoading) {
    return <LoadingState />
  }

  if (duplicates.length === 0) {
    return <NoDuplicatesFound onRefresh={onRefreshDuplicates} />
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Potential Duplicates Found ({duplicates.length})
          </CardTitle>
          <CardDescription>
            Review these potential duplicate leads and merge them to maintain data quality.
          </CardDescription>
        </CardHeader>
      </Card>

      {duplicates.map(duplicate => (
        <DuplicateCard
          key={`${duplicate.original_lead.id}-${duplicate.potential_duplicate.id}`}
          duplicate={duplicate}
          onMergeClick={handleMergeClick}
        />
      ))}

      {/* Merge Dialog */}
      {selectedDuplicate !== null && (
        <MergeDialog
          duplicate={selectedDuplicate}
          onMerge={handleMerge}
          isOpen={showMergeDialog}
          onOpenChange={setShowMergeDialog}
        />
      )}
    </div>
  )
}
