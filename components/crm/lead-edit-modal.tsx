/**
 * Lead Edit Modal - Modal para edição de leads
 * Modal completo para editar leads existentes com validação
 * Baseado no LeadCreateModal com dados pré-preenchidos
 */

'use client'

import { useState, useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import crmLeadsService, { PipelineStage, type Lead, type LeadUpdate } from '@/services/crm-leads'

interface LeadEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  lead: Lead | null
}

const leadEditSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(255, 'Nome muito longo'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().max(50, 'Telefone muito longo').optional().or(z.literal('')),
  stage: z.nativeEnum(PipelineStage),
  source: z.string().max(100, 'Source muito longo').optional().or(z.literal('')),
  estimated_value: z.coerce.number().min(0, 'Valor deve ser positivo').optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional().or(z.literal('')),
  is_favorite: z.boolean().optional()
})

type LeadEditForm = z.infer<typeof leadEditSchema>

const STAGE_LABELS: Record<PipelineStage, string> = {
  [PipelineStage.LEAD]: 'Lead',
  [PipelineStage.CONTATO]: 'Contato',
  [PipelineStage.PROPOSTA]: 'Proposta',
  [PipelineStage.NEGOCIACAO]: 'Negociação',
  [PipelineStage.FECHADO]: 'Fechado'
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
  'Outros'
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
  'proposal-sent'
]

export function LeadEditModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  lead 
}: LeadEditModalProps): React.ReactElement {
  const [isLoading, setIsLoading] = useState(false)
  const [currentTags, setCurrentTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const { toast } = useToast()

  const form = useForm<LeadEditForm>({
    resolver: zodResolver(leadEditSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      stage: PipelineStage.LEAD,
      source: '',
      estimated_value: undefined,
      tags: [],
      notes: '',
      is_favorite: false
    }
  })

  // Preenche o formulário quando o lead muda
  useEffect(() => {
    if (lead && isOpen) {
      form.reset({
        name: lead.name,
        email: lead.email || '',
        phone: lead.phone || '',
        stage: lead.stage,
        source: lead.source || '',
        estimated_value: lead.estimated_value || undefined,
        tags: lead.tags || [],
        notes: lead.notes || '',
        is_favorite: lead.is_favorite
      })
      
      setCurrentTags(lead.tags || [])
    }
  }, [lead, isOpen, form])

  const handleClose = (): void => {
    form.reset()
    setCurrentTags([])
    setTagInput('')
    onClose()
  }

  const addTag = (tag: string): void => {
    const trimmedTag = tag.trim().toLowerCase()
    if (trimmedTag && !currentTags.includes(trimmedTag)) {
      const newTags = [...currentTags, trimmedTag]
      setCurrentTags(newTags)
      form.setValue('tags', newTags)
    }
    setTagInput('')
  }

  const removeTag = (tagToRemove: string): void => {
    const newTags = currentTags.filter(tag => tag !== tagToRemove)
    setCurrentTags(newTags)
    form.setValue('tags', newTags)
  }

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      if (tagInput.trim()) {
        addTag(tagInput)
      }
    }
  }

  const onSubmit = async (data: LeadEditForm): Promise<void> => {
    if (!lead) return

    try {
      setIsLoading(true)

      // Prepare update data - only include changed fields
      const updateData: LeadUpdate = {}
      
      if (data.name !== lead.name) updateData.name = data.name
      if ((data.email || '') !== (lead.email || '')) updateData.email = data.email || undefined
      if ((data.phone || '') !== (lead.phone || '')) updateData.phone = data.phone || undefined
      if ((data.source || '') !== (lead.source || '')) updateData.source = data.source || undefined
      if (data.estimated_value !== lead.estimated_value) updateData.estimated_value = data.estimated_value
      if (JSON.stringify(currentTags) !== JSON.stringify(lead.tags || [])) updateData.tags = currentTags.length > 0 ? currentTags : undefined
      if ((data.notes || '') !== (lead.notes || '')) updateData.notes = data.notes || undefined

      // Update the lead
      await crmLeadsService.updateLead(lead.id, updateData)

      // Handle favorite status separately if changed
      if (data.is_favorite !== lead.is_favorite) {
        await crmLeadsService.toggleLeadFavorite(lead.id, data.is_favorite!)
      }

      // Handle stage change separately if changed
      if (data.stage !== lead.stage) {
        await crmLeadsService.moveLeadToStage(lead.id, data.stage, 'Estágio alterado via edição')
      }

      toast({
        title: 'Lead atualizado com sucesso!',
        description: `${data.name} foi atualizado no pipeline.`
      })

      handleClose()
      onSuccess()
    } catch (error) {
      console.error('Erro ao atualizar lead:', error)
      toast({
        title: 'Erro ao atualizar lead',
        description: 'Não foi possível atualizar o lead. Tente novamente.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!lead) return <></>

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Lead</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Nome (obrigatório) */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Nome do lead"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Contato */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="email@exemplo.com"
                        disabled={isLoading}
                      />
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
                      <Input
                        {...field}
                        placeholder="(11) 99999-9999"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Estágio e Source */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="stage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estágio do Pipeline</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Como nos encontrou?" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {COMMON_SOURCES.map((source) => (
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

            {/* Valor estimado e Favorito */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="estimated_value"
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
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_favorite"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 space-y-0 pt-8">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        disabled={isLoading}
                        className="rounded"
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">
                      Marcar como favorito
                    </FormLabel>
                  </FormItem>
                )}
              />
            </div>

            {/* Tags */}
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <div className="space-y-2">
                {/* Tags já adicionadas */}
                {currentTags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {currentTags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 text-muted-foreground hover:text-foreground"
                          disabled={isLoading}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                
                {/* Input para adicionar tags */}
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  placeholder="Digite uma tag e pressione Enter"
                  disabled={isLoading}
                />
                
                {/* Tags sugeridas */}
                <div className="flex flex-wrap gap-1">
                  {COMMON_TAGS.filter(tag => !currentTags.includes(tag)).map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => addTag(tag)}
                      className="text-xs text-muted-foreground hover:text-primary"
                      disabled={isLoading}
                    >
                      +{tag}
                    </button>
                  ))}
                </div>
              </div>
            </FormItem>

            {/* Notas */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Informações adicionais sobre o lead..."
                      className="min-h-[100px]"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Botões */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}