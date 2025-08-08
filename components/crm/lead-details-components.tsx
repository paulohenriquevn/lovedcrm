/**
 * Lead Details Components
 * Extracted components for lead details modal
 */

import {
  Star,
  StarOff,
  Mail,
  Phone,
  Building2,
  Calendar,
  DollarSign,
  Edit,
  Trash,
  ExternalLink,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Lead, PipelineStage } from '@/services/crm-leads'

// Helper functions
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('pt-BR')
}

export const STAGE_LABELS: Record<PipelineStage, string> = {
  [PipelineStage.LEAD]: 'Lead',
  [PipelineStage.CONTATO]: 'Contato',
  [PipelineStage.PROPOSTA]: 'Proposta',
  [PipelineStage.NEGOCIACAO]: 'Negociação',
  [PipelineStage.FECHADO]: 'Fechado',
}

export const STAGE_COLORS: Record<PipelineStage, string> = {
  [PipelineStage.LEAD]: 'bg-gray-100 text-gray-800',
  [PipelineStage.CONTATO]: 'bg-blue-100 text-blue-800',
  [PipelineStage.PROPOSTA]: 'bg-yellow-100 text-yellow-800',
  [PipelineStage.NEGOCIACAO]: 'bg-orange-100 text-orange-800',
  [PipelineStage.FECHADO]: 'bg-green-100 text-green-800',
}

// Header Components
export function LeadDetailsHeader({
  lead,
  isToggleLoading,
  onFavoriteToggle,
  onEdit,
  onDelete,
  onClose,
}: {
  lead: Lead
  isToggleLoading: boolean
  onFavoriteToggle: () => void
  onEdit: (lead: Lead) => void
  onDelete: (lead: Lead) => void
  onClose: () => void
}): React.ReactElement {
  return (
    <div className="flex items-start justify-between">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold">{lead.name}</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void onFavoriteToggle()}
            disabled={isToggleLoading}
            className="h-8 w-8 p-0"
          >
            {lead.is_favorite ? (
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            ) : (
              <StarOff className="h-4 w-4 text-gray-400" />
            )}
          </Button>
        </div>
        <Badge className={STAGE_COLORS[lead.stage]} variant="secondary">
          {STAGE_LABELS[lead.stage]}
        </Badge>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(lead)}>
          <Edit className="h-4 w-4 mr-2" />
          Editar
        </Button>
        <Button variant="outline" size="sm" onClick={() => onDelete(lead)}>
          <Trash className="h-4 w-4 mr-2" />
          Excluir
        </Button>
        <Button variant="ghost" size="sm" onClick={onClose}>
          ×
        </Button>
      </div>
    </div>
  )
}

// Contact Information Card Components
function EmailContactInfo({ email }: { email: string }): React.ReactElement {
  return (
    <div className="flex items-center gap-2">
      <Mail className="h-4 w-4 text-gray-500" />
      <span>{email}</span>
      <Button variant="ghost" size="sm" asChild>
        <a href={`mailto:${email}`}>
          <ExternalLink className="h-3 w-3" />
        </a>
      </Button>
    </div>
  )
}

function PhoneContactInfo({ phone }: { phone: string }): React.ReactElement {
  return (
    <div className="flex items-center gap-2">
      <Phone className="h-4 w-4 text-gray-500" />
      <span>{phone}</span>
      <Button variant="ghost" size="sm" asChild>
        <a href={`tel:${phone}`}>
          <ExternalLink className="h-3 w-3" />
        </a>
      </Button>
    </div>
  )
}

function SourceContactInfo({ source }: { source: string }): React.ReactElement {
  return (
    <div className="flex items-center gap-2">
      <Building2 className="h-4 w-4 text-gray-500" />
      <span>Origem: {source}</span>
    </div>
  )
}

// Helper function to check if a field has a valid value
function hasValidValue(value: string | undefined | null): value is string {
  return value !== null && value !== undefined && value.trim() !== ''
}

// Contact Information Card Content
function ContactInfoCardContent({ lead }: { lead: Lead }): React.ReactElement {
  return (
    <div className="space-y-4">
      {hasValidValue(lead.email) ? <EmailContactInfo email={lead.email} /> : null}
      {hasValidValue(lead.phone) ? <PhoneContactInfo phone={lead.phone} /> : null}
      {hasValidValue(lead.source) ? <SourceContactInfo source={lead.source} /> : null}
    </div>
  )
}

// Contact Information Card
export function ContactInfoCard({ lead }: { lead: Lead }): React.ReactElement {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Informações de Contato
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ContactInfoCardContent lead={lead} />
      </CardContent>
    </Card>
  )
}

// Lead Value Card
export function LeadValueCard({ lead }: { lead: Lead }): React.ReactElement {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Valor do Negócio
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-green-600">
          {lead.estimated_value !== null &&
          lead.estimated_value !== undefined &&
          lead.estimated_value > 0
            ? formatCurrency(lead.estimated_value)
            : 'Não informado'}
        </div>
        {lead.days_in_current_stage !== null && lead.days_in_current_stage !== undefined && (
          <p className="text-sm text-gray-500 mt-2">
            {lead.days_in_current_stage} dias neste estágio
          </p>
        )}
      </CardContent>
    </Card>
  )
}

// Timeline Card
export function TimelineCard({ lead }: { lead: Lead }): React.ReactElement {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Histórico
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Criado em:</span>
          <span>{formatDate(lead.created_at)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Atualizado em:</span>
          <span>{formatDate(lead.updated_at)}</span>
        </div>
        {lead.last_contact_at !== null && lead.last_contact_at !== undefined && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Último contato:</span>
            <span>{formatDate(lead.last_contact_at)}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Tags Section
export function TagsSection({ lead }: { lead: Lead }): React.ReactElement | null {
  if (lead.tags === null || lead.tags === undefined || lead.tags.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tags</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {lead.tags.map(tag => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Notes Section
export function NotesSection({ lead }: { lead: Lead }): React.ReactElement | null {
  if (lead.notes === null || lead.notes === undefined || lead.notes.trim().length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Anotações</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap">{lead.notes}</p>
      </CardContent>
    </Card>
  )
}
