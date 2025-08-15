/**
 * Template Validation Schemas
 * Zod schemas for Message Template validation
 */

import { z } from 'zod'

const templateCategories = ['greeting', 'follow-up', 'objection', 'closing', 'custom'] as const

export const templateCreateSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(255, 'Nome deve ter no máximo 255 caracteres')
    .trim(),
  category: z.enum(templateCategories, {
    errorMap: () => ({ message: 'Categoria inválida' }),
  }),
  content: z
    .string()
    .min(1, 'Conteúdo é obrigatório')
    .max(5000, 'Conteúdo deve ter no máximo 5000 caracteres')
    .trim(),
})

export const templateUpdateSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(255, 'Nome deve ter no máximo 255 caracteres')
    .trim()
    .optional(),
  category: z
    .enum(templateCategories, {
      errorMap: () => ({ message: 'Categoria inválida' }),
    })
    .optional(),
  content: z
    .string()
    .min(1, 'Conteúdo é obrigatório')
    .max(5000, 'Conteúdo deve ter no máximo 5000 caracteres')
    .trim()
    .optional(),
  is_active: z.boolean().optional(),
})

export const templateUseContextSchema = z
  .record(z.string(), z.any())
  .refine(data => Object.keys(data).length > 0, {
    message: 'Pelo menos uma variável deve ser fornecida',
  })

export const templateFiltersSchema = z.object({
  category: z.enum(templateCategories).optional(),
  search: z.string().max(255, 'Busca deve ter no máximo 255 caracteres').trim().optional(),
  is_active: z.boolean().optional(),
})

// Type inference from schemas
export type TemplateCreateInput = z.infer<typeof templateCreateSchema>
export type TemplateUpdateInput = z.infer<typeof templateUpdateSchema>
export type TemplateUseContextInput = z.infer<typeof templateUseContextSchema>
export type TemplateFiltersInput = z.infer<typeof templateFiltersSchema>
