# 🎨 Frontend Template Customization Workflow

**IMPORTANTE:** Seja EXTREMAMENTE HONESTO SEMPRE em relação à situação do projeto. Nunca inicie algo antes de ter 95% de certeza. Não faça nenhuma alteração antes que você tenha 95% de confiança sobre o que deve ser construído. Faça perguntas até ter certeza absoluta.

**Step-by-step workflow** for implementing YOUR frontend features using the multi-tenant starter template.

> 🎯 **Related Template Guides**: [Template Guide](../CLAUDE.md) • [Multi-tenancy Templates](MULTI-TENANCY-GUIDE.md) • [Template Patterns](FRONTEND-PATTERNS.md)

## 🎯 **TEMPLATE CUSTOMIZATION PRINCIPLES - EXTREMELY IMPORTANT**

### **KISS, YAGNI, DRY - NEVER BREAK WHEN EXTENDING TEMPLATE**

- **KISS (Keep It Simple, Stupid)**: **ALWAYS** choose the simplest solution that works for YOUR SaaS
- **YAGNI (You Aren't Gonna Need It)**: **NEVER** implement features "for the future" - focus on your MVP
- **DRY (Don't Repeat Yourself)**: **ALWAYS** reuse template patterns before creating new ones
- **🔴 CRITICAL**: Breaking these principles when customizing the template is considered critical failure

## 🏗️ **Template 5-Phase Implementation (Copy This Pattern)**

1. **Service Layer** -> Copy template BaseService pattern for YOUR APIs
2. **State Management** -> Extend template Zustand stores with YOUR data
3. **Components** -> Use template shadcn/ui components for YOUR UI
4. **Container** -> Copy template business logic patterns + org validation for YOUR features
5. **Page Integration** -> Follow template Next.js routing + i18n for YOUR pages

---

## 🎨 **Template Customization Workflow**

### **Phase 1: Service Layer (Copy Template Pattern)**

**Create YOUR API service** using template BaseService pattern for automatic X-Org-Id headers:

```typescript
// services/feature-name.ts
import { BaseService } from "./base"

export interface FeatureItem {
  id: string
  organization_id: string
  name: string
  description?: string
  is_active: boolean
  created_at: string
  updated_at?: string
}

export class FeatureService extends BaseService {
  async listFeatures(): Promise<FeatureItem[]> {
    const response = await this.get("/api/features") // X-Org-Id auto-added
    return response.data
  }

  async createFeature(data: CreateFeatureData): Promise<FeatureItem> {
    return (await this.post("/api/features", data)).data
  }

  async updateFeature(
    id: string,
    data: UpdateFeatureData
  ): Promise<FeatureItem> {
    return (await this.put(`/api/features/${id}`, data)).data
  }

  async deleteFeature(id: string): Promise<void> {
    await this.delete(`/api/features/${id}`)
  }
}

export const featureService = new FeatureService()
```

---

### **Phase 2: State Management (Zustand)**

**Create organization-aware Zustand store**:

```typescript
// stores/feature-store.ts
import { create } from "zustand"
import { devtools, subscribeWithSelector } from "zustand/middleware"
import { featureService, type FeatureItem } from "@/services/feature-name"

interface FeatureState {
  // Data
  features: FeatureItem[]
  currentFeature: FeatureItem | null

  // UI State
  loading: boolean
  error: string | null
  searchTerm: string
  filters: FeatureFilters

  // Actions
  fetchFeatures: (orgId: string) => Promise<void>
  createFeature: (
    orgId: string,
    data: CreateFeatureData
  ) => Promise<FeatureItem>
  updateFeature: (
    orgId: string,
    id: string,
    data: UpdateFeatureData
  ) => Promise<FeatureItem>
  deleteFeature: (orgId: string, id: string) => Promise<void>
  setCurrentFeature: (feature: FeatureItem | null) => void
  setSearchTerm: (term: string) => void
  setFilters: (filters: Partial<FeatureFilters>) => void
  clearError: () => void
  reset: () => void
}

export const useFeatureStore = create<FeatureState>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // Initial state
      features: [],
      currentFeature: null,
      loading: false,
      error: null,
      searchTerm: "",
      filters: { status: "all", category: "all" },

      // Async actions
      fetchFeatures: async (orgId: string) => {
        set({ loading: true, error: null })
        try {
          const features = await featureService.listFeatures()
          set({ features, loading: false })
        } catch (error) {
          set({ error: error.message, loading: false })
          throw error
        }
      },

      createFeature: async (orgId: string, data: CreateFeatureData) => {
        set({ loading: true, error: null })
        try {
          const newFeature = await featureService.createFeature(data)
          set(state => ({
            features: [newFeature, ...state.features],
            loading: false,
          }))
          return newFeature
        } catch (error) {
          set({ error: error.message, loading: false })
          throw error
        }
      },

      updateFeature: async (
        orgId: string,
        id: string,
        data: UpdateFeatureData
      ) => {
        set({ loading: true, error: null })
        try {
          const updatedFeature = await featureService.updateFeature(id, data)
          set(state => ({
            features: state.features.map(f =>
              f.id === id ? updatedFeature : f
            ),
            currentFeature:
              state.currentFeature?.id === id
                ? updatedFeature
                : state.currentFeature,
            loading: false,
          }))
          return updatedFeature
        } catch (error) {
          set({ error: error.message, loading: false })
          throw error
        }
      },

      deleteFeature: async (orgId: string, id: string) => {
        set({ loading: true, error: null })
        try {
          await featureService.deleteFeature(id)
          set(state => ({
            features: state.features.filter(f => f.id !== id),
            currentFeature:
              state.currentFeature?.id === id ? null : state.currentFeature,
            loading: false,
          }))
        } catch (error) {
          set({ error: error.message, loading: false })
          throw error
        }
      },

      // Sync actions
      setCurrentFeature: feature => set({ currentFeature: feature }),
      setSearchTerm: searchTerm => set({ searchTerm }),
      setFilters: newFilters =>
        set(state => ({
          filters: { ...state.filters, ...newFilters },
        })),
      clearError: () => set({ error: null }),
      reset: () =>
        set({
          features: [],
          currentFeature: null,
          loading: false,
          error: null,
          searchTerm: "",
          filters: { status: "all", category: "all" },
        }),
    })),
    { name: "feature-store" }
  )
)
```

---

### **Phase 3: Component Architecture**

**Create reusable components** with shadcn/ui:

```typescript
// components/features/FeatureCard.tsx
'use client'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MoreHorizontal, Edit, Trash } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useTranslations } from 'next-intl'
import type { FeatureItem } from '@/services/feature-name'

interface FeatureCardProps {
  feature: FeatureItem
  onEdit: (feature: FeatureItem) => void
  onDelete: (feature: FeatureItem) => void
}

export function FeatureCard({ feature, onEdit, onDelete }: FeatureCardProps) {
  const t = useTranslations('features')

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg">{feature.name}</CardTitle>
          {feature.description && (
            <CardDescription>{feature.description}</CardDescription>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(feature)}>
              <Edit className="h-4 w-4" />
              {t('actions.edit')}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(feature)}
              className="text-destructive"
            >
              <Trash className="h-4 w-4" />
              {t('actions.delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent>
        <div className="flex items-center justify-between">
          <Badge variant={feature.is_active ? 'default' : 'secondary'}>
            {feature.is_active ? t('status.active') : t('status.inactive')}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {new Date(feature.created_at).toLocaleDateString()}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
```

```typescript
// components/features/FeatureForm.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useTranslations } from 'next-intl'
import type { FeatureItem } from '@/services/feature-name'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().optional(),
  is_active: z.boolean().default(true)
})

type FormData = z.infer<typeof formSchema>

interface FeatureFormProps {
  feature?: FeatureItem
  onSubmit: (data: FormData) => Promise<void>
  loading?: boolean
}

export function FeatureForm({ feature, onSubmit, loading }: FeatureFormProps) {
  const t = useTranslations('features.form')

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: feature?.name || '',
      description: feature?.description || '',
      is_active: feature?.is_active ?? true
    }
  })

  const handleSubmit = async (data: FormData) => {
    try {
      await onSubmit(data)
      if (!feature) {
        form.reset()
      }
    } catch (error) {
      // Error handling is done in the container
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('name.label')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('name.placeholder')}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('description.label')}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t('description.placeholder')}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">{t('active.label')}</FormLabel>
                <div className="text-sm text-muted-foreground">
                  {t('active.description')}
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="submit" loading={loading}>
            {feature ? t('actions.update') : t('actions.create')}
          </Button>
        </div>
      </form>
    </Form>
  )
}
```

---

### **Phase 4: Container Layer**

**Create business logic container** with org validation:

```typescript
// containers/features/FeatureContainer.tsx
'use client'

import { useEffect, useState } from 'react'
import { useOrgContext } from '@/hooks/use-org-context'
import { useFeatureStore } from '@/stores/feature-store'
import { FeatureCard } from '@/components/features/FeatureCard'
import { FeatureForm } from '@/components/features/FeatureForm'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import type { FeatureItem } from '@/services/feature-name'

interface FeatureContainerProps {
  locale: string
}

export function FeatureContainer({ locale }: FeatureContainerProps) {
  const t = useTranslations('features')
  const { organization, validateOrgAccess } = useOrgContext()
  const [editingFeature, setEditingFeature] = useState<FeatureItem | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const {
    features,
    loading,
    error,
    fetchFeatures,
    createFeature,
    updateFeature,
    deleteFeature,
    clearError
  } = useFeatureStore()

  // Initialize data
  useEffect(() => {
    validateOrgAccess()
    fetchFeatures(organization.id)
  }, [organization.id, fetchFeatures, validateOrgAccess])

  // Clear errors when component unmounts
  useEffect(() => {
    return () => clearError()
  }, [clearError])

  const handleCreate = async (data: CreateFeatureData) => {
    try {
      await createFeature(organization.id, data)
      setShowCreateDialog(false)
      toast.success(t('messages.created'))
    } catch (error) {
      toast.error(t('messages.createError'))
      throw error
    }
  }

  const handleUpdate = async (data: UpdateFeatureData) => {
    if (!editingFeature) return

    try {
      await updateFeature(organization.id, editingFeature.id, data)
      setEditingFeature(null)
      toast.success(t('messages.updated'))
    } catch (error) {
      toast.error(t('messages.updateError'))
      throw error
    }
  }

  const handleDelete = async (feature: FeatureItem) => {
    if (!confirm(t('messages.confirmDelete'))) return

    try {
      await deleteFeature(organization.id, feature.id)
      toast.success(t('messages.deleted'))
    } catch (error) {
      toast.error(t('messages.deleteError'))
    }
  }

  if (loading && features.length === 0) {
    return <div className="flex justify-center p-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" />
              {t('actions.create')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('dialogs.create.title')}</DialogTitle>
              <DialogDescription>{t('dialogs.create.description')}</DialogDescription>
            </DialogHeader>
            <FeatureForm onSubmit={handleCreate} loading={loading} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Features grid */}
      {features.length > 0 ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {features.map(feature => (
            <FeatureCard
              key={feature.id}
              feature={feature}
              onEdit={setEditingFeature}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t('empty.message')}</p>
        </div>
      )}

      {/* Edit dialog */}
      <Dialog open={!!editingFeature} onOpenChange={() => setEditingFeature(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('dialogs.edit.title')}</DialogTitle>
            <DialogDescription>{t('dialogs.edit.description')}</DialogDescription>
          </DialogHeader>
          {editingFeature && (
            <FeatureForm
              feature={editingFeature}
              onSubmit={handleUpdate}
              loading={loading}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
```

---

### **Phase 5: Page Integration**

**Create Next.js page** with proper routing and i18n:

```typescript
// app/[locale]/admin/features/page.tsx
import { FeatureContainer } from '@/containers/features/FeatureContainer'
import { useTranslations } from 'next-intl'
import { Metadata } from 'next'

interface PageProps {
  params: {
    locale: string
  }
}

export function generateMetadata({ params }: PageProps): Metadata {
  return {
    title: 'Features | Admin Dashboard',
    description: 'Manage your organization features'
  }
}

export default function FeaturesPage({ params }: PageProps) {
  return <FeatureContainer locale={params.locale} />
}
```

**Add i18n translations** in messages files:

```json
// messages/en.json
{
  "features": {
    "title": "Features",
    "description": "Manage your organization features",
    "empty": {
      "message": "No features found. Create your first feature to get started."
    },
    "form": {
      "name": {
        "label": "Feature Name",
        "placeholder": "Enter feature name"
      },
      "description": {
        "label": "Description",
        "placeholder": "Enter feature description"
      },
      "active": {
        "label": "Active",
        "description": "Enable this feature for your organization"
      }
    },
    "actions": {
      "create": "Create Feature",
      "edit": "Edit",
      "delete": "Delete",
      "update": "Update Feature"
    },
    "status": {
      "active": "Active",
      "inactive": "Inactive"
    },
    "dialogs": {
      "create": {
        "title": "Create New Feature",
        "description": "Add a new feature to your organization"
      },
      "edit": {
        "title": "Edit Feature",
        "description": "Update feature information"
      }
    },
    "messages": {
      "created": "Feature created successfully",
      "updated": "Feature updated successfully",
      "deleted": "Feature deleted successfully",
      "createError": "Failed to create feature",
      "updateError": "Failed to update feature",
      "deleteError": "Failed to delete feature",
      "confirmDelete": "Are you sure you want to delete this feature?"
    }
  }
}
```

---

## **Complete Implementation Checklist**

### **Backend (api/CLAUDE.md JÁ DOCUMENTADO)**

- [ ] Model with organization_id FK
- [ ] Repository with org filtering
- [ ] Service with org validation
- [ ] Router with get_current_organization dependency

### **Frontend (AGORA 100% DOCUMENTADO)**

- [ ] **Service**: BaseService extension with proper types
- [ ] **Store**: Zustand with org context and error handling
- [ ] **Components**: shadcn/ui components
- [ ] **Container**: Business logic with useOrgContext
- [ ] **Page**: Next.js routing with i18n support
- [ ] **Translations**: Complete i18n key coverage

### **Quality Assurance**

- [ ] **Type Safety**: Full TypeScript coverage
- [ ] **Error Handling**: User-friendly error messages
- [ ] **Loading States**: Proper UX feedback
- [ ] **Accessibility**: ARIA labels and keyboard navigation
- [ ] **Testing**: Unit tests for components and stores

---

## **Key Integration Points**

### **1. BaseService Integration**

- Automatic X-Org-Id headers
- Consistent error handling
- Type-safe API responses

### **2. useOrgContext Integration**

```typescript
const { organization, validateOrgAccess } = useOrgContext()
// Always validate before data operations
validateOrgAccess()
```

### **3. shadcn/ui Components Integration**

```typescript
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
// Use shadcn/ui components for consistent styling
```

### **4. i18n Integration**

```typescript
const t = useTranslations("features")
// All user-facing text must be translatable
```

---

## **Quick Start Command**

```bash
# Generate complete feature implementation
npx create-feature feature-name
# This would scaffold all files following this workflow
```

---

** Continue with advanced patterns:** [FRONTEND-PATTERNS.md](FRONTEND-PATTERNS.md)
