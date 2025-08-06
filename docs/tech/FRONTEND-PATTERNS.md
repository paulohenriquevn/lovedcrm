# Frontend TypeScript Patterns & Style Guide

**IMPORTANTE:** Seja EXTREMAMENTE HONESTO SEMPRE em relação à situação do projeto. Nunca inicie algo antes de ter 95% de certeza. Não faça nenhuma alteração antes que você tenha 95% de confiança sobre o que deve ser construído. Faça perguntas até ter certeza absoluta.

**Advanced patterns, TypeScript style guide, and integration standards** for the multi-tenant system.

> ** Related**: [Workflow Guide](FRONTEND-WORKFLOW.md) • [Main Guide](../CLAUDE.md) • [Multi-tenancy](MULTI-TENANCY-GUIDE.md)

## **PRINCÍPIOS FUNDAMENTAIS - EXTREMAMENTE IMPORTANTES**

### **KISS, YAGNI, DRY - NUNCA QUEBRAR**

- **KISS (Keep It Simple, Stupid)**: **SEMPRE** escolher a solução mais simples que funciona
- **YAGNI (You Aren't Gonna Need It)**: **NUNCA** implementar funcionalidades "para o futuro"
- **DRY (Don't Repeat Yourself)**: **SEMPRE** reutilizar código existente antes de criar novo
- **CRITICAL**: Quebrar estes princípios é considerado falha crítica no desenvolvimento

## Table of Contents

- [TypeScript Code Style Guide](#typescript-code-style-guide)
- [Component Architecture Patterns](#component-architecture-patterns)
- [State Management Patterns](#state-management-patterns)
- [Error Handling Patterns](#error-handling-patterns)
- [Performance Optimization](#performance-optimization)
- [Integration Standards](#integration-standards)
- [Quality Guidelines](#quality-guidelines)

---

## TypeScript Code Style Guide

> **Complete Style Standards**: See [Naming Conventions Guide](NAMING-CONVENTIONS-GUIDE.md) for cross-system naming patterns and [Performance & Error Patterns](PERFORMANCE-ERROR-PATTERNS.md) for optimization guidelines.

### Frontend-Specific Standards

**File & Directory Naming**

```typescript
// File naming: kebab-case for components, camelCase for utilities
feature-card.tsx         // Components
feature-list.tsx
user-service.ts          // Services
organization-store.ts    // Stores
use-org-context.ts       // Hooks

// Directory structure: kebab-case
components/
├── ui/                  # shadcn/ui components
├── feature-name/        # Feature-specific components
├── forms/               # Reusable form components
└── layout/              # Layout components

containers/feature-name/ # Business logic containers
stores/                  # Zustand stores
services/               # API services
hooks/                  # Custom hooks
```

**Import Organization**

```typescript
// 1. React & Next.js
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useTranslations } from "next-intl"

// 2. Third-party libraries
import { create } from "zustand"
import { toast } from "sonner"
import { z } from "zod"

// 3. Internal components (UI first, then custom)
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FeatureCard } from "@/components/feature-name/feature-card"

// 4. Services & stores
import { featureService } from "@/services/feature-name"
import { useFeatureStore } from "@/stores/feature-name"

// 5. Types & utils
import type { FeatureItem } from "@/services/feature-name"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
```

**Component Naming & Structure**

```typescript
// Component names: PascalCase
export function FeatureCard({ feature, onEdit, onDelete }: FeatureCardProps) {}
export function FeatureList({ features, loading }: FeatureListProps) {}
export function FeatureContainer({ orgId }: FeatureContainerProps) {}

// Interface names: PascalCase + Props suffix
interface FeatureCardProps {
  feature: FeatureItem
  onEdit: (feature: FeatureItem) => void
  onDelete: (feature: FeatureItem) => void
}

// Hook names: camelCase with 'use' prefix
export function useFeatureStore() {}
export function useOrgContext() {}
export function useLocalizedNavigation() {}

// Service classes: PascalCase + Service suffix
export class FeatureService extends BaseService {}
export class OrganizationService extends BaseService {}
```

---

## Component Architecture Patterns

### Component Structure Pattern

```typescript
// 1. Imports (organized as above)
// 2. Types & interfaces
// 3. Component function
// 4. Exports

'use client' // Only if needed

import { ... }

interface ComponentProps {
  // Required props first
  orgId: string
  feature: FeatureItem
  // Optional props last
  className?: string
  disabled?: boolean
}

export function ComponentName({
  orgId,
  feature,
  className,
  disabled = false
}: ComponentProps) {
  // 1. Hooks (useTranslations first, then data hooks)
  const t = useTranslations('features')
  const { organization, validateOrgAccess } = useOrgContext()

  // 2. State
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 3. Effects
  useEffect(() => {
    validateOrgAccess()
  }, [validateOrgAccess])

  // 4. Event handlers
  const handleSubmit = async (data: FormData) => {
    // Implementation
  }

  // 5. Early returns
  if (!organization) return null

  // 6. Render
  return (
    <div className={cn('default-classes', className)}>
      {/* Content */}
    </div>
  )
}
```

### Advanced Component Patterns

**Compound Components Pattern**

```typescript
// Main component with sub-components
interface FeatureCardProps {
  children: React.ReactNode
  feature: FeatureItem
}

export function FeatureCard({ children, feature }: FeatureCardProps) {
  const context = { feature }

  return (
    <FeatureContext.Provider value={context}>
      <Card className="rounded-lg border bg-card text-card-foreground shadow-sm">
        {children}
      </Card>
    </FeatureContext.Provider>
  )
}

// Sub-components
FeatureCard.Header = function FeatureCardHeader({ children }: { children: React.ReactNode }) {
  const { feature } = useFeatureContext()
  return (
    <CardHeader className="space-y-1.5 p-6">
      <CardTitle>{feature.name}</CardTitle>
      {children}
    </CardHeader>
  )
}

FeatureCard.Content = function FeatureCardContent({ children }: { children: React.ReactNode }) {
  return <CardContent className="p-6 pt-0">{children}</CardContent>
}

FeatureCard.Actions = function FeatureCardActions({ onEdit, onDelete }: ActionsProps) {
  const { feature } = useFeatureContext()
  return (
    <div className="flex justify-end space-x-2">
      <Button onClick={() => onEdit(feature)}>Edit</Button>
      <Button variant="destructive" onClick={() => onDelete(feature)}>Delete</Button>
    </div>
  )
}

// Usage
<FeatureCard feature={feature}>
  <FeatureCard.Header />
  <FeatureCard.Content>
    <p>{feature.description}</p>
  </FeatureCard.Content>
  <FeatureCard.Actions onEdit={handleEdit} onDelete={handleDelete} />
</FeatureCard>
```

**Render Props Pattern**

```typescript
interface DataFetcherProps<T> {
  url: string
  children: (data: {
    data: T | null
    loading: boolean
    error: string | null
    refetch: () => void
  }) => React.ReactNode
}

export function DataFetcher<T>({ url, children }: DataFetcherProps<T>) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(url)
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [url])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return children({ data, loading, error, refetch: fetchData })
}

// Usage
<DataFetcher<FeatureItem[]> url="/api/features">
  {({ data, loading, error, refetch }) => {
    if (loading) return <LoadingSpinner />
    if (error) return <ErrorMessage error={error} onRetry={refetch} />
    if (!data) return <EmptyState />

    return <FeatureList features={data} />
  }}
</DataFetcher>
```

---

## State Management Patterns

### Zustand Store Pattern

```typescript
interface FeatureState {
  // Data state grouped together
  features: FeatureItem[]
  currentFeature: FeatureItem | null

  // UI state grouped together
  loading: boolean
  error: string | null

  // Organization context
  currentOrgId: string | null

  // Actions grouped by operation type
  // Set operations
  setOrganization: (orgId: string) => void
  setCurrentFeature: (feature: FeatureItem | null) => void

  // Async operations
  fetchFeatures: () => Promise<void>
  createFeature: (data: CreateFeatureData) => Promise<FeatureItem>
  updateFeature: (id: string, data: UpdateFeatureData) => Promise<FeatureItem>
  deleteFeature: (id: string) => Promise<void>

  // Utility operations
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
      currentOrgId: null,

      // Implementation pattern for async actions
      fetchFeatures: async () => {
        const { currentOrgId } = get()
        if (!currentOrgId) return

        set({ loading: true, error: null })

        try {
          const features = await featureService.listFeatures()
          set({ features, loading: false })
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch features",
            loading: false,
          })
        }
      },

      // Optimistic updates pattern
      createFeature: async data => {
        set({ loading: true, error: null })

        try {
          const newFeature = await featureService.createFeature(data)
          set(state => ({
            features: [newFeature, ...state.features],
            loading: false,
          }))
          return newFeature
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to create feature",
            loading: false,
          })
          throw error
        }
      },
    })),
    { name: "feature-store" }
  )
)
```

### Store Composition Pattern

```typescript
// Separate concerns into multiple stores
export const useFeatureStore = create<FeatureState>(/* feature logic */)
export const useUIStore = create<UIState>(/* UI state logic */)
export const useAuthStore = create<AuthState>(/* auth logic */)

// Combine stores in components
export function FeatureContainer() {
  const { features, fetchFeatures } = useFeatureStore()
  const { sidebarOpen, setSidebarOpen } = useUIStore()
  const { user, organization } = useAuthStore()

  // Component logic
}
```

### Store Persistence Pattern

```typescript
import { persist, createJSONStorage } from "zustand/middleware"

export const useUserPreferencesStore = create<UserPreferencesState>()(
  persist(
    (set, get) => ({
      theme: "light",
      language: "en",
      sidebarCollapsed: false,

      setTheme: theme => set({ theme }),
      setLanguage: language => set({ language }),
      toggleSidebar: () =>
        set(state => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    }),
    {
      name: "user-preferences",
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        theme: state.theme,
        language: state.language,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
)
```

---

## Error Handling Patterns

### Component-Level Error Handling

```typescript
// Try-catch with specific error types
const handleSubmit = async (data: FormData) => {
  try {
    setLoading(true)
    const result = await featureService.createFeature(data)
    toast.success(t("messages.created"))
    onSuccess(result)
  } catch (error) {
    if (error instanceof ValidationError) {
      setFieldErrors(error.fieldErrors)
    } else if (error instanceof NetworkError) {
      toast.error(t("messages.networkError"))
    } else {
      const message =
        error instanceof Error ? error.message : t("messages.createError")
      toast.error(message)
      setError(message)
    }
  } finally {
    setLoading(false)
  }
}
```

### Error Boundary Component

```typescript
'use client'

import { Component, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: (error: Error, reset: () => void) => ReactNode
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo)
    // Send to error reporting service
  }

  reset = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset)
      }

      return (
        <div className="flex flex-col items-center justify-center p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-4">
            {this.state.error.message}
          </p>
          <Button onClick={this.reset}>Try again</Button>
        </div>
      )
    }

    return this.props.children
  }
}

// Usage
<ErrorBoundary fallback={(error, reset) => (
  <CustomErrorComponent error={error} onReset={reset} />
)}>
  <FeatureContainer />
</ErrorBoundary>
```

### Hook for Error Handling

```typescript
interface UseErrorHandlerOptions {
  showToast?: boolean
  logError?: boolean
  retryable?: boolean
}

export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
  const { showToast = true, logError = true, retryable = false } = options
  const [error, setError] = useState<Error | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const handleError = useCallback(
    (error: unknown, context?: string) => {
      const errorObj = error instanceof Error ? error : new Error(String(error))

      if (logError) {
        console.error(`Error${context ? ` in ${context}` : ""}:`, errorObj)
      }

      if (showToast) {
        toast.error(errorObj.message)
      }

      setError(errorObj)
    },
    [showToast, logError]
  )

  const retry = useCallback(() => {
    if (retryable) {
      setRetryCount(prev => prev + 1)
      setError(null)
    }
  }, [retryable])

  const clearError = useCallback(() => {
    setError(null)
    setRetryCount(0)
  }, [])

  return {
    error,
    retryCount,
    handleError,
    retry,
    clearError,
    hasError: !!error,
  }
}

// Usage
function FeatureForm() {
  const { error, handleError, clearError } = useErrorHandler({
    showToast: true,
  })

  const handleSubmit = async (data: FormData) => {
    try {
      await featureService.createFeature(data)
    } catch (error) {
      handleError(error, "feature creation")
    }
  }
}
```

---

## Performance Optimization

### Memoization Patterns

```typescript
// Memoize expensive calculations
const processedData = useMemo(() => {
  return features
    .filter(f => f.is_active)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .map(f => ({
      ...f,
      displayName: `${f.name} (${f.organization_id})`,
    }))
}, [features])

// Memoize callbacks to prevent child re-renders
const handleEdit = useCallback((feature: FeatureItem) => {
  setEditingFeature(feature)
  setShowEditDialog(true)
}, [])

const handleDelete = useCallback((feature: FeatureItem) => {
  setDeletingFeature(feature)
  setShowDeleteDialog(true)
}, [])

// Memoize components
const MemoizedFeatureCard = memo(FeatureCard, (prevProps, nextProps) => {
  return (
    prevProps.feature.id === nextProps.feature.id &&
    prevProps.feature.updated_at === nextProps.feature.updated_at
  )
})
```

### Code Splitting & Lazy Loading

```typescript
// Lazy load heavy components
const DataTable = lazy(() => import('@/components/data-table'))
const AdvancedFilters = lazy(() => import('@/components/advanced-filters'))

// Lazy load with named exports
const LazyChart = lazy(() =>
  import('@/components/charts').then(module => ({ default: module.LineChart }))
)

// Component with Suspense
export function FeatureDashboard() {
  return (
    <div>
      <Suspense fallback={<Skeleton className="h-[400px]" />}>
        <DataTable data={features} />
      </Suspense>

      <Suspense fallback={<div>Loading filters...</div>}>
        <AdvancedFilters onFilter={handleFilter} />
      </Suspense>
    </div>
  )
}

// Route-based code splitting (automatic with Next.js App Router)
// Each page in app/ directory is automatically code-split
```

### Virtual Scrolling for Large Lists

```typescript
import { FixedSizeList } from 'react-window'

interface VirtualizedFeatureListProps {
  features: FeatureItem[]
  onEdit: (feature: FeatureItem) => void
  onDelete: (feature: FeatureItem) => void
}

function FeatureRowRenderer({ index, style, data }: any) {
  const { features, onEdit, onDelete } = data
  const feature = features[index]

  return (
    <div style={style}>
      <FeatureCard
        feature={feature}
        onEdit={() => onEdit(feature)}
        onDelete={() => onDelete(feature)}
      />
    </div>
  )
}

export function VirtualizedFeatureList({ features, onEdit, onDelete }: VirtualizedFeatureListProps) {
  const itemData = { features, onEdit, onDelete }

  return (
    <FixedSizeList
      height={600}
      itemCount={features.length}
      itemSize={120}
      itemData={itemData}
    >
      {FeatureRowRenderer}
    </FixedSizeList>
  )
}
```

---

## Integration Standards

### API Service Patterns

```typescript
// Service class extending BaseService
export class FeatureService extends BaseService {
  // Methods: camelCase verbs + descriptive nouns
  async listFeatures(): Promise<FeatureItem[]> {
    const response = await this.get("/api/features")
    return response.data
  }

  async createFeature(data: CreateFeatureData): Promise<FeatureItem> {
    const response = await this.post("/api/features", data)
    return response.data
  }

  async updateFeature(
    id: string,
    data: UpdateFeatureData
  ): Promise<FeatureItem> {
    const response = await this.put(`/api/features/${id}`, data)
    return response.data
  }

  async deleteFeature(id: string): Promise<void> {
    await this.delete(`/api/features/${id}`)
  }

  // Complex operations with proper error handling
  async bulkUpdateFeatures(updates: FeatureUpdate[]): Promise<FeatureItem[]> {
    try {
      const response = await this.post("/api/features/bulk-update", { updates })
      return response.data
    } catch (error) {
      if (error instanceof ValidationError) {
        throw new Error(`Validation failed: ${error.details.join(", ")}`)
      }
      throw error
    }
  }

  // Always return typed responses
  async getFeatureAnalytics(id: string): Promise<FeatureAnalytics> {
    const response = await this.get(`/api/features/${id}/analytics`)
    return response.data as FeatureAnalytics
  }
}

// Export singleton instance
export const featureService = new FeatureService()
```

### CSS & Styling Patterns

```typescript
// Always use shadcn/ui components
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

// Component with consistent styling
export function FeatureCard({ feature }: FeatureCardProps) {
  return (
    <Card className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <CardHeader className="space-y-1.5 p-6">
        <CardTitle>{feature.name}</CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Edit className="h-4 w-4" />
          Edit
        </Button>
      </CardContent>
    </Card>
  )
}

// Conditional classes with cn utility
<div className={cn(
  'base-classes',
  isActive && 'active-classes',
  disabled && 'disabled-classes',
  className
)}>

// Responsive design patterns
<div className={cn(
  'grid gap-4',
  'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  'p-4 md:p-6 lg:p-8'
)}>
```

### i18n Integration Patterns

```typescript
// Hook usage pattern
export function FeatureForm() {
  const t = useTranslations('features.form')
  const tCommon = useTranslations('common')

  return (
    <form>
      <label>{t('name.label')}</label>
      <input placeholder={t('name.placeholder')} />
      <button>{tCommon('actions.save')}</button>
    </form>
  )
}

// Pluralization handling
const t = useTranslations('features')
const count = features.length

const message = t('count', {
  count,
  items: t('items', { count }) // Uses ICU pluralization
})

// Dynamic key generation
const statusKey = `status.${feature.status}` as const
const statusLabel = t(statusKey)

// Rich text with components
const description = t.rich('form.description', {
  link: (chunks) => <Link href="/docs">{chunks}</Link>,
  strong: (chunks) => <strong>{chunks}</strong>
})
```

---

## Quality Guidelines

### Type Safety Standards

```typescript
// Strict typing for props
interface StrictComponentProps {
  // Use specific unions instead of strings
  status: "active" | "inactive" | "pending"
  priority: "low" | "medium" | "high"

  // Use const assertions for better inference
  config: {
    readonly theme: "light" | "dark"
    readonly layout: "grid" | "list"
  }

  // Use branded types for IDs
  userId: UserId
  organizationId: OrganizationId
}

// Branded types for better type safety
type UserId = string & { readonly __brand: "UserId" }
type OrganizationId = string & { readonly __brand: "OrganizationId" }

// Type guards
function isFeatureItem(item: unknown): item is FeatureItem {
  return (
    typeof item === "object" &&
    item !== null &&
    "id" in item &&
    "organization_id" in item &&
    "name" in item
  )
}

// Utility types for forms
type CreateFeatureData = Omit<FeatureItem, "id" | "created_at" | "updated_at">
type UpdateFeatureData = Partial<CreateFeatureData>
```

### Testing Patterns

```typescript
// Component testing with org context
import { render, screen } from '@testing-library/react'
import { OrgContextProvider } from '@/hooks/use-org-context'
import { FeatureCard } from './FeatureCard'

const mockOrganization = {
  id: 'org-123',
  name: 'Test Org'
}

const mockFeature = {
  id: 'feature-123',
  organization_id: 'org-123',
  name: 'Test Feature',
  is_active: true,
  created_at: '2024-01-01'
}

function renderWithOrgContext(component: React.ReactElement) {
  return render(
    <OrgContextProvider value={{ organization: mockOrganization }}>
      {component}
    </OrgContextProvider>
  )
}

describe('FeatureCard', () => {
  it('renders feature information correctly', () => {
    const onEdit = jest.fn()
    const onDelete = jest.fn()

    renderWithOrgContext(
      <FeatureCard
        feature={mockFeature}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    )

    expect(screen.getByText('Test Feature')).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
  })
})

// Store testing
import { act, renderHook } from '@testing-library/react'
import { useFeatureStore } from './feature-store'

describe('useFeatureStore', () => {
  beforeEach(() => {
    useFeatureStore.getState().reset()
  })

  it('fetches features successfully', async () => {
    const { result } = renderHook(() => useFeatureStore())

    await act(async () => {
      await result.current.fetchFeatures()
    })

    expect(result.current.features).toHaveLength(0)
    expect(result.current.loading).toBe(false)
  })
})
```

### Accessibility Standards

```typescript
// ARIA labels and roles
<button
  aria-label={t('actions.edit', { item: feature.name })}
  aria-describedby={`feature-${feature.id}-description`}
  onClick={() => onEdit(feature)}
>
  <Edit aria-hidden="true" />
</button>

// Focus management
const dialogRef = useRef<HTMLDivElement>(null)

useEffect(() => {
  if (isOpen && dialogRef.current) {
    dialogRef.current.focus()
  }
}, [isOpen])

// Keyboard navigation
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    onClose()
  } else if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    onSubmit()
  }
}

// Screen reader announcements
const [announcement, setAnnouncement] = useState('')

const announce = (message: string) => {
  setAnnouncement(message)
  setTimeout(() => setAnnouncement(''), 1000)
}

return (
  <>
    <div aria-live="polite" aria-atomic="true" className="sr-only">
      {announcement}
    </div>
    {/* Component content */}
  </>
)
```

---

## Quick Implementation Checklist

### For Each New Feature

**File Structure**

- [ ] Service in `/services/feature-name.ts` extending BaseService
- [ ] Store in `/stores/feature-name.ts` with organization context
- [ ] Components in `/components/feature-name/` using shadcn/ui
- [ ] Container in `/containers/feature-name/` with useOrgContext
- [ ] Page in `/app/[locale]/admin/feature-name/page.tsx`
- [ ] Types exported from service and imported consistently

**Multi-tenancy**

- [ ] All API calls use BaseService (auto X-Org-Id)
- [ ] Container validates org access with useOrgContext
- [ ] Store manages organization context
- [ ] No cross-organization data leaks

**UI/UX Standards**

- [ ] Uses shadcn/ui components consistently
- [ ] Follows shadcn/ui patterns
- [ ] Implements loading and error states
- [ ] Responsive design (mobile-first)
- [ ] Accessibility compliance

**Internationalization**

- [ ] All text uses useTranslations hook
- [ ] Translation keys added to messages/en.json, pt.json, es.json
- [ ] Proper pluralization and interpolation
- [ ] Route structure follows `/[locale]/admin/` pattern

**Performance**

- [ ] Components memoized where appropriate
- [ ] Callbacks wrapped in useCallback
- [ ] Expensive calculations use useMemo
- [ ] Large lists implement virtualization

---

**Result**: Following these patterns ensures type-safe, performant, accessible, and maintainable frontend code that integrates seamlessly with our multi-tenant architecture.
