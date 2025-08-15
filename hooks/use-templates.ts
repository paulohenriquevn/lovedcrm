/**
 * Templates Hook with TanStack Query
 *
 * Hook for managing message templates with CRUD operations and organizational isolation.
 * Follows established patterns from use-provider-data.ts.
 *
 * @module use-templates
 * @example
 * ```tsx
 * const { templates, isLoading } = useTemplates('greeting')
 * const { createTemplate } = useTemplateActions()
 * ```
 */

import { useCallback, useState } from 'react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'

import { templateApi } from '@/services/template-api'
import { useAuthStore } from '@/stores/auth'

import type {
  MessageTemplate,
  TemplateFormData,
  TemplateUpdateData,
  TemplateUseResponse,
} from '@/types/template'

/**
 * Hook for fetching templates with optional filtering
 */
export function useTemplates(category?: string, isActive: boolean = true) {
  const { organization } = useAuthStore()

  const {
    data: templates,
    isLoading,
    error: queryError,
    refetch,
  } = useQuery<MessageTemplate[]>({
    queryKey: ['templates', organization?.id, category, isActive],
    queryFn: () => templateApi.getTemplates(category, isActive),
    enabled: !!organization?.id,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
  })

  // Convert query error to string
  const error = queryError ? String(queryError) : null

  return {
    templates: templates || [],
    isLoading,
    error,
    refetch,
  }
}

/**
 * Hook for fetching single template by ID
 */
export function useTemplate(templateId: string | null) {
  const { organization } = useAuthStore()

  const {
    data: template,
    isLoading,
    error: queryError,
    refetch,
  } = useQuery<MessageTemplate>({
    queryKey: ['templates', 'single', organization?.id, templateId],
    queryFn: () => {
      if (!templateId) throw new Error('Template ID is required')
      return templateApi.getTemplate(templateId)
    },
    enabled: !!organization?.id && !!templateId,
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false,
  })

  const error = queryError ? String(queryError) : null

  return {
    template: template || null,
    isLoading,
    error,
    refetch,
  }
}

/**
 * Hook for template CRUD operations (mutations)
 */
export function useTemplateActions() {
  const { organization } = useAuthStore()
  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Invalidate template queries helper
  const invalidateTemplateQueries = useCallback(async () => {
    if (organization?.id) {
      await queryClient.invalidateQueries({
        queryKey: ['templates', organization.id],
      })
    }
  }, [organization?.id, queryClient])

  // Create template mutation
  const createTemplateMutation = useMutation({
    mutationFn: (templateData: TemplateFormData) => templateApi.createTemplate(templateData),
    onSuccess: () => {
      invalidateTemplateQueries()
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || error.message || 'Failed to create template'
      setError(errorMessage)
    },
  })

  // Update template mutation
  const updateTemplateMutation = useMutation({
    mutationFn: ({ templateId, data }: { templateId: string; data: TemplateUpdateData }) =>
      templateApi.updateTemplate(templateId, data),
    onSuccess: () => {
      invalidateTemplateQueries()
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || error.message || 'Failed to update template'
      setError(errorMessage)
    },
  })

  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: (templateId: string) => templateApi.deleteTemplate(templateId),
    onSuccess: () => {
      invalidateTemplateQueries()
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || error.message || 'Failed to delete template'
      setError(errorMessage)
    },
  })

  // Use template mutation (variable substitution)
  const useTemplateMutation = useMutation({
    mutationFn: ({ templateId, context }: { templateId: string; context: Record<string, any> }) =>
      templateApi.useTemplate(templateId, context),
    onSuccess: () => {
      // Invalidate to update usage count
      invalidateTemplateQueries()
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to use template'
      setError(errorMessage)
    },
  })

  // Create template function
  const createTemplate = useCallback(
    async (templateData: TemplateFormData): Promise<MessageTemplate> => {
      if (!organization?.id) {
        throw new Error('No organization selected')
      }

      setIsLoading(true)
      setError(null)

      try {
        const result = await createTemplateMutation.mutateAsync(templateData)
        return result
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.detail || err.message || 'Failed to create template'
        setError(errorMessage)
        throw new Error(errorMessage)
      } finally {
        setIsLoading(false)
      }
    },
    [organization?.id, createTemplateMutation]
  )

  // Update template function
  const updateTemplate = useCallback(
    async (templateId: string, templateData: TemplateUpdateData): Promise<MessageTemplate> => {
      if (!organization?.id) {
        throw new Error('No organization selected')
      }

      setIsLoading(true)
      setError(null)

      try {
        const result = await updateTemplateMutation.mutateAsync({ templateId, data: templateData })
        return result
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.detail || err.message || 'Failed to update template'
        setError(errorMessage)
        throw new Error(errorMessage)
      } finally {
        setIsLoading(false)
      }
    },
    [organization?.id, updateTemplateMutation]
  )

  // Delete template function
  const deleteTemplate = useCallback(
    async (templateId: string): Promise<void> => {
      if (!organization?.id) {
        throw new Error('No organization selected')
      }

      setIsLoading(true)
      setError(null)

      try {
        await deleteTemplateMutation.mutateAsync(templateId)
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.detail || err.message || 'Failed to delete template'
        setError(errorMessage)
        throw new Error(errorMessage)
      } finally {
        setIsLoading(false)
      }
    },
    [organization?.id, deleteTemplateMutation]
  )

  // Use template with variable substitution
  const applyTemplate = useCallback(
    async (templateId: string, context: Record<string, any>): Promise<TemplateUseResponse> => {
      if (!organization?.id) {
        throw new Error('No organization selected')
      }

      setIsLoading(true)
      setError(null)

      try {
        const result = await useTemplateMutation.mutateAsync({ templateId, context })
        return result
      } catch (err: any) {
        const errorMessage = err.response?.data?.detail || err.message || 'Failed to use template'
        setError(errorMessage)
        throw new Error(errorMessage)
      } finally {
        setIsLoading(false)
      }
    },
    [organization?.id, useTemplateMutation]
  )

  return {
    createTemplate,
    updateTemplate,
    deleteTemplate,
    applyTemplate,
    invalidateTemplateQueries,
    isLoading:
      isLoading ||
      createTemplateMutation.isPending ||
      updateTemplateMutation.isPending ||
      deleteTemplateMutation.isPending ||
      useTemplateMutation.isPending,
    error,
  }
}

/**
 * Hook for template metadata (categories, variables)
 */
export function useTemplateMetadata() {
  const { organization } = useAuthStore()

  // Fetch available categories
  const {
    data: categories,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useQuery<string[]>({
    queryKey: ['templates', 'categories', organization?.id],
    queryFn: () => templateApi.getTemplateCategories(),
    enabled: !!organization?.id,
    staleTime: 300000, // 5 minutes (rarely changes)
    refetchOnWindowFocus: false,
  })

  // Fetch available variables
  const {
    data: variables,
    isLoading: variablesLoading,
    error: variablesError,
  } = useQuery<string[]>({
    queryKey: ['templates', 'variables', organization?.id],
    queryFn: () => templateApi.getAvailableVariables(),
    enabled: !!organization?.id,
    staleTime: 300000, // 5 minutes (rarely changes)
    refetchOnWindowFocus: false,
  })

  return {
    categories: categories || [],
    variables: variables || [],
    isLoading: categoriesLoading || variablesLoading,
    error: categoriesError || variablesError ? String(categoriesError || variablesError) : null,
  }
}

/**
 * Simplified hook for template selection in components
 */
export function useTemplateSelection(initialCategory?: string) {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(initialCategory)
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null)

  const { templates, isLoading, error } = useTemplates(selectedCategory, true)
  const { categories } = useTemplateMetadata()

  const selectTemplate = useCallback((template: MessageTemplate | null) => {
    setSelectedTemplate(template)
  }, [])

  const selectCategory = useCallback((category: string | undefined) => {
    setSelectedCategory(category)
    setSelectedTemplate(null) // Clear selected template when category changes
  }, [])

  return {
    // Data
    templates,
    categories,
    selectedCategory,
    selectedTemplate,

    // Actions
    selectTemplate,
    selectCategory,

    // State
    isLoading,
    error,
  }
}
