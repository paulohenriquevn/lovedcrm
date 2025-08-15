/**
 * Template Edit Dialog Helper Components
 * Additional components specific to template editing
 */

import React, { useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  TEMPLATE_CATEGORY_LABELS,
  TEMPLATE_CATEGORY_ICONS,
  type MessageTemplate,
  type TemplateUpdateData,
  type TemplateCategory,
} from '@/types/template'

import type { Control, UseFormReturn } from 'react-hook-form'

interface TemplateStatusSectionProps {
  template: MessageTemplate
  control: Control<TemplateUpdateData>
  isLoading: boolean
}

interface TemplateFormFieldsProps {
  control: Control<TemplateUpdateData>
  isLoading: boolean
  contentValue: string
}

interface TemplateActionButtonsProps {
  isLoading: boolean
  onCancel: () => void
}

interface TemplateEditHandlersProps {
  form: UseFormReturn<TemplateUpdateData>
  template: MessageTemplate | null
  updateTemplate: (id: string, data: TemplateUpdateData) => Promise<MessageTemplate>
  isLoading: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function TemplateStatusSection({
  template,
  control,
  isLoading,
}: TemplateStatusSectionProps): React.ReactElement {
  return (
    <Card className="border-dashed">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Status do Template</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        <FormField
          control={control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Template Ativo</FormLabel>
                <FormDescription>
                  Templates ativos aparecem nas sugestões e podem ser usados na comunicação
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange} // eslint-disable-line react/jsx-handler-names
                  disabled={isLoading}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div>
            <span className="font-medium">Criado em:</span>
            <br />
            {new Date(template.created_at).toLocaleDateString('pt-BR')}
          </div>
          <div>
            <span className="font-medium">Vezes usado:</span>
            <br />
            {template.usage_count} vezes
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function TemplateFormFields({
  control,
  isLoading,
}: TemplateFormFieldsProps): React.ReactElement {
  return (
    <>
      {/* Name Field */}
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome do Template</FormLabel>
            <FormControl>
              <Input
                placeholder="Ex: Primeira abordagem para leads B2B"
                {...field}
                disabled={isLoading}
              />
            </FormControl>
            <FormDescription>Um nome descritivo para identificar o template</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <TemplateCategoryField control={control} isLoading={isLoading} />
      <TemplateContentField control={control} isLoading={isLoading} />
    </>
  )
}

export function TemplateCategoryField({
  control,
  isLoading,
}: {
  control: Control<TemplateUpdateData>
  isLoading: boolean
}): React.ReactElement {
  return (
    <FormField
      control={control}
      name="category"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Categoria</FormLabel>
          <Select
            onValueChange={(value: string) => field.onChange(value)}
            defaultValue={field.value}
            disabled={isLoading}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {Object.entries(TEMPLATE_CATEGORY_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  <div className="flex items-center gap-2">
                    <span>{TEMPLATE_CATEGORY_ICONS[value as TemplateCategory]}</span>
                    <span>{label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormDescription>Categoria para organizar seus templates</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export function TemplateContentField({
  control,
  isLoading,
}: {
  control: Control<TemplateUpdateData>
  isLoading: boolean
}): React.ReactElement {
  return (
    <FormField
      control={control}
      name="content"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Conteúdo do Template</FormLabel>
          <FormControl>
            <Textarea
              placeholder="Olá {{lead_name}}, espero que esteja bem! 

Sou {{user_name}} da {{organization}} e gostaria de conversar sobre {{company}}.

Temos uma solução que pode ajudar sua empresa a..."
              className="min-h-[120px]"
              {...field}
              disabled={isLoading}
            />
          </FormControl>
          <FormDescription>Use {`{{variável}}`} para inserir dados dinâmicos</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export function TemplateActionButtons({
  isLoading,
  onCancel,
}: TemplateActionButtonsProps): React.ReactElement {
  return (
    <div className="flex justify-end gap-2 pt-4">
      <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
        Cancelar
      </Button>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Salvando...' : 'Salvar Alterações'}
      </Button>
    </div>
  )
}

export function useTemplateEditHandlers({
  form,
  template,
  updateTemplate,
  isLoading: _isLoading,
  onOpenChange,
  onSuccess,
}: TemplateEditHandlersProps): {
  contentValue: string
  handleCancel: () => void
  handleFormSubmit: (e: React.FormEvent) => void
} {
  // Update form when template changes
  useEffect(() => {
    if (template !== null) {
      form.reset({
        name: template.name,
        category: template.category,
        content: template.content,
        is_active: template.is_active,
      })
    }
  }, [template, form])

  const contentValue = form.watch('content')

  const handleSubmit = async (data: TemplateUpdateData): Promise<void> => {
    if (template === null) {
      return
    }

    try {
      await updateTemplate(template.id, data)
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      // Error is handled by the hook
      // TODO: Show error toast instead of console.error
      // eslint-disable-next-line no-console
      console.error('Failed to update template:', error)
    }
  }

  const handleCancel = (): void => {
    if (template !== null) {
      form.reset({
        name: template.name,
        category: template.category,
        content: template.content,
        is_active: template.is_active,
      })
    }
    onOpenChange(false)
  }

  const handleFormSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    void form.handleSubmit(handleSubmit)(e)
  }

  return {
    contentValue,
    handleCancel,
    handleFormSubmit,
  }
}
