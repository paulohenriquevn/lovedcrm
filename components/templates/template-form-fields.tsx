/**
 * Template Form Fields
 * Reusable form field components for template creation/editing
 */

import { Control } from 'react-hook-form'

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
import {
  TEMPLATE_CATEGORIES,
  TEMPLATE_CATEGORY_LABELS,
  TEMPLATE_CATEGORY_ICONS,
} from '@/types/template'

interface TemplateFormData {
  name: string
  category: string
  content: string
}

interface FormFieldProps {
  control: Control<TemplateFormData>
}

export function TemplateNameField({ control }: FormFieldProps): React.ReactElement {
  return (
    <FormField
      control={control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Nome do Template</FormLabel>
          <FormControl>
            <Input placeholder="Ex: Saudação inicial, Follow-up, Proposta..." {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export function TemplateCategoryField({ control }: FormFieldProps): React.ReactElement {
  return (
    <FormField
      control={control}
      name="category"
      render={({ field }) => {
        const handleValueChange = (value: string): void => {
          field.onChange(value)
        }

        return (
          <FormItem>
            <FormLabel>Categoria</FormLabel>
            <Select onValueChange={handleValueChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {TEMPLATE_CATEGORIES.map(category => (
                  <SelectItem key={category} value={category}>
                    <span className="flex items-center gap-2">
                      <span>{TEMPLATE_CATEGORY_ICONS[category]}</span>
                      <span>{TEMPLATE_CATEGORY_LABELS[category]}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}

export function TemplateContentField({ control }: FormFieldProps): React.ReactElement {
  return (
    <FormField
      control={control}
      name="content"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Conteúdo do Template</FormLabel>
          <FormControl>
            <Textarea
              placeholder="Digite o conteúdo do template aqui. Use variáveis como {{nome}}, {{empresa}}, {{telefone}} para personalização automática."
              className="min-h-32 resize-y"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
