/**
 * Templates Management Page
 * Página principal de gestão de templates de mensagem
 * Follows pattern from team/page.tsx and crm/page.tsx
 */
'use client'

import { FileText, Filter, Plus, Search } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { useTemplateSelection } from '@/hooks/use-templates'
import {
  TEMPLATE_CATEGORY_LABELS,
  TEMPLATE_CATEGORY_ICONS,
  type MessageTemplate,
  type TemplateCategory,
} from '@/types/template'

function TemplateCard({ template }: { template: MessageTemplate }): React.ReactElement {
  const categoryIcon = TEMPLATE_CATEGORY_ICONS[template.category as TemplateCategory] || '📝'
  const categoryLabel =
    TEMPLATE_CATEGORY_LABELS[template.category as TemplateCategory] || template.category

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{categoryIcon}</span>
            <div>
              <CardTitle className="text-sm font-medium">{template.name}</CardTitle>
              <CardDescription className="text-xs">{categoryLabel}</CardDescription>
            </div>
          </div>
          <Badge variant={template.is_active ? 'default' : 'secondary'} className="text-xs">
            {template.is_active ? 'Ativo' : 'Inativo'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {template.content.length > 100
            ? `${template.content.slice(0, 100)}...`
            : template.content}
        </p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{template.variables.length} variáveis</span>
          <span>Usado {template.usage_count} vezes</span>
        </div>
      </CardContent>
    </Card>
  )
}

function TemplatesGrid({
  templates,
  isLoading,
}: {
  templates: MessageTemplate[]
  isLoading: boolean
}): React.ReactElement {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }, (_, i) => (
          <Card key={`skeleton-${i}`} className="animate-pulse">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gray-200 rounded" />
                  <div>
                    <div className="w-24 h-4 bg-gray-200 rounded mb-1" />
                    <div className="w-16 h-3 bg-gray-200 rounded" />
                  </div>
                </div>
                <div className="w-12 h-5 bg-gray-200 rounded" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="w-full h-8 bg-gray-200 rounded mb-3" />
              <div className="flex justify-between">
                <div className="w-16 h-3 bg-gray-200 rounded" />
                <div className="w-20 h-3 bg-gray-200 rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (templates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileText className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum template encontrado</h3>
        <p className="text-gray-500 mb-6 max-w-sm">
          Comece criando seu primeiro template de mensagem para acelerar sua comunicação com leads.
        </p>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Criar Template
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {templates.map(template => (
        <TemplateCard key={template.id} template={template} />
      ))}
    </div>
  )
}

function TemplatesFilters({
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
}: {
  searchQuery: string
  onSearchChange: (value: string) => void
  categoryFilter: string
  onCategoryChange: (value: string) => void
}): React.ReactElement {
  return (
    <div className="flex items-center gap-4">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar templates..."
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <Select value={categoryFilter} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-48">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <SelectValue placeholder="Categoria" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as categorias</SelectItem>
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
    </div>
  )
}

function TemplatesStats({ templates }: { templates: MessageTemplate[] }): React.ReactElement {
  const activeTemplates = templates.filter(t => t.is_active).length
  const totalUsage = templates.reduce((sum, t) => sum + t.usage_count, 0)
  const categories = new Set(templates.map(t => t.category)).size

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Templates Ativos</CardDescription>
          <CardTitle className="text-2xl">{activeTemplates}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">de {templates.length} templates totais</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Uso Total</CardDescription>
          <CardTitle className="text-2xl">{totalUsage}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">vezes utilizados</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Categorias</CardDescription>
          <CardTitle className="text-2xl">{categories}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">categorias diferentes</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function TemplatesPage(): React.ReactElement {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  // Use the template selection hook
  const { templates, isLoading, error } = useTemplateSelection()

  // Filter templates based on search and category
  const filteredTemplates = templates.filter(template => {
    const matchesSearch =
      searchQuery.length === 0 ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.content.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  if (error !== null && error !== undefined && error.length > 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Erro ao carregar templates</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Templates de Mensagem</h1>
          <p className="text-muted-foreground">
            Gerencie templates para acelerar sua comunicação com leads
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Template
        </Button>
      </div>

      {/* Stats Cards */}
      <TemplatesStats templates={templates} />

      <Separator />

      {/* Filters */}
      <TemplatesFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
      />

      {/* Templates Grid */}
      <TemplatesGrid templates={filteredTemplates} isLoading={isLoading} />
    </div>
  )
}
