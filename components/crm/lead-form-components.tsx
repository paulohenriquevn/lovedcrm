/**
 * Lead Form Components - Reusable form field components
 * Extracted to reduce complexity in form field files
 */

'use client'

import { X } from 'lucide-react'
import { UseFormReturn } from 'react-hook-form'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { PipelineStage } from '@/services/crm-leads'

interface BaseFormData {
  name: string
  email?: string
  phone?: string
  stage: PipelineStage
  source?: string
  estimatedValue?: number
  tags?: string[]
  notes?: string
}

interface ContactFieldsProps {
  form: UseFormReturn<BaseFormData>
  isLoading: boolean
}

interface StageSourceFieldsProps {
  form: UseFormReturn<BaseFormData>
  isLoading: boolean
}

interface TagsFieldProps {
  currentTags: string[]
  tagInput: string
  isLoading: boolean
  onTagInputChange: (value: string) => void
  onAddTag: (tag: string) => void
  onRemoveTag: (tag: string) => void
  onTagKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void
}

interface EstimatedValueFieldProps {
  form: UseFormReturn<BaseFormData>
  isLoading: boolean
}

interface NotesFieldProps {
  form: UseFormReturn<BaseFormData>
  isLoading: boolean
}

const STAGE_LABELS: Record<PipelineStage, string> = {
  [PipelineStage.LEAD]: 'Lead',
  [PipelineStage.CONTATO]: 'Contato',
  [PipelineStage.PROPOSTA]: 'Proposta',
  [PipelineStage.NEGOCIACAO]: 'Negociação',
  [PipelineStage.FECHADO]: 'Fechado',
}

const COMMON_SOURCES = [
  'Website',
  'Google Ads',
  'Facebook',
  'Instagram',
  'LinkedIn',
  'Indicação',
  'WhatsApp',
  'Email Marketing',
  'Telefone',
  'Outros',
]

const COMMON_TAGS = [
  'hot-lead',
  'warm-lead',
  'cold-lead',
  'vip',
  'follow-up',
  'qualified',
  'high-value',
  'urgent',
  'meeting-scheduled',
  'proposal-sent',
]

export function ContactFields({ form, isLoading }: ContactFieldsProps): React.ReactElement {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input {...field} type="email" placeholder="email@exemplo.com" disabled={isLoading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Telefone</FormLabel>
            <FormControl>
              <Input {...field} type="tel" placeholder="(11) 99999-9999" disabled={isLoading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}

export function StageSourceFields({ form, isLoading }: StageSourceFieldsProps): React.ReactElement {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="stage"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Estágio do Pipeline</FormLabel>
            <Select
              onValueChange={value => field.onChange(value)}
              defaultValue={field.value}
              disabled={isLoading}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o estágio" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {Object.entries(STAGE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="source"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Origem</FormLabel>
            <Select
              onValueChange={value => field.onChange(value)}
              defaultValue={field.value}
              disabled={isLoading}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Como nos encontrou?" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {COMMON_SOURCES.map(source => (
                  <SelectItem key={source} value={source}>
                    {source}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}

export function EstimatedValueField({
  form,
  isLoading,
}: EstimatedValueFieldProps): React.ReactElement {
  return (
    <FormField
      control={form.control}
      name="estimatedValue"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Valor Estimado (R$)</FormLabel>
          <FormControl>
            <Input
              {...field}
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              disabled={isLoading}
              onChange={e =>
                field.onChange(e.target.value ? Number.parseFloat(e.target.value) : undefined)
              }
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export function TagsField({
  currentTags,
  tagInput,
  isLoading,
  onTagInputChange,
  onAddTag,
  onRemoveTag,
  onTagKeyPress,
}: TagsFieldProps): React.ReactElement {
  return (
    <div>
      <FormLabel className="text-sm font-medium">Tags</FormLabel>
      <div className="mt-2 space-y-2">
        {/* Input para adicionar tags */}
        <div className="flex gap-2">
          <Input
            placeholder="Digite uma tag..."
            value={tagInput}
            onChange={e => onTagInputChange(e.target.value)}
            onKeyDown={onTagKeyPress}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => onAddTag(tagInput)}
            disabled={isLoading || tagInput.trim() === ''}
          >
            Adicionar
          </Button>
        </div>

        {/* Tags comuns sugeridas */}
        <div className="flex flex-wrap gap-1">
          {COMMON_TAGS.map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => onAddTag(tag)}
              disabled={isLoading || currentTags.includes(tag)}
              className="px-2 py-1 text-xs bg-muted hover:bg-muted/80 rounded text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Tags selecionadas */}
        {currentTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {currentTags.map(tag => (
              <Badge key={tag} variant="secondary" className="gap-1">
                {tag}
                <X className="h-3 w-3 cursor-pointer" onClick={() => onRemoveTag(tag)} />
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function NotesField({ form, isLoading }: NotesFieldProps): React.ReactElement {
  return (
    <FormField
      control={form.control}
      name="notes"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Observações</FormLabel>
          <FormControl>
            <Textarea
              {...field}
              placeholder="Observações sobre o lead..."
              disabled={isLoading}
              rows={3}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
