# Performance & Error Handling Patterns

**Comprehensive guide** for optimizing performance and handling errors consistently across the multi-tenant system.

> ** Related**: [Backend Style Guide](../api/CLAUDE.md) • [Frontend Style Guide](FRONTEND-IMPLEMENTATION-GUIDE.md)

---

## **Performance Guidelines**

### **Backend Performance Patterns**

#### **Database Optimization**

```python
# Always index organization_id for multi-tenant queries
__table_args__ = (
    Index('ix_table_organization_id', 'organization_id'),
    Index('ix_table_org_created', 'organization_id', 'created_at'),  # Composite index
    Index('ix_table_org_status', 'organization_id', 'is_active'),   # Filter index
)

# Use pagination for all list endpoints
@router.get("/items")
async def get_items(
    skip: int = Query(0, ge=0, description="Records to skip"),
    limit: int = Query(50, ge=1, le=100, description="Max records"),
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db)
):
    return service.get_paginated_items(organization.id, skip, limit)

# Avoid N+1 queries with eager loading
def get_users_with_organizations(self, org_id: UUID) -> List[User]:
    return self.db.query(User)\
        .options(joinedload(User.organization))\
        .filter(User.organization_id == org_id)\
        .all()

# Use select_related for specific fields
def get_user_names_only(self, org_id: UUID) -> List[dict]:
    return self.db.query(User.id, User.name)\
        .filter(User.organization_id == org_id)\
        .all()
```

#### **Caching Strategies**

```python
from functools import lru_cache
from typing import Optional
import redis

# In-memory caching for expensive operations
@lru_cache(maxsize=128)
def get_organization_settings(org_id: str) -> dict:
    """Cache organization settings (invalidate on update)."""
    # Expensive computation
    return settings

# Redis caching for shared data
class CacheService:
    def __init__(self, redis_client: redis.Redis):
        self.redis = redis_client
        self.ttl = 3600  # 1 hour

    async def get_cached_org_stats(self, org_id: UUID) -> Optional[dict]:
        cache_key = f"org_stats:{org_id}"
        cached = await self.redis.get(cache_key)
        return json.loads(cached) if cached else None

    async def cache_org_stats(self, org_id: UUID, stats: dict):
        cache_key = f"org_stats:{org_id}"
        await self.redis.setex(cache_key, self.ttl, json.dumps(stats))

# Background task processing
from celery import Celery

@celery.task
def process_organization_report(org_id: str):
    """Process heavy reports in background."""
    # Heavy computation
    generate_report(org_id)
```

#### **Query Optimization**

```python
# Batch operations instead of individual queries
def bulk_update_member_status(self, member_ids: List[UUID], status: str):
    self.db.query(OrganizationMember)\
        .filter(OrganizationMember.id.in_(member_ids))\
        .update({OrganizationMember.status: status})
    self.db.commit()

# Use exists() for boolean checks
def organization_has_members(self, org_id: UUID) -> bool:
    return self.db.query(
        self.db.query(OrganizationMember)
        .filter(OrganizationMember.organization_id == org_id)
        .exists()
    ).scalar()

# Count optimization
def get_member_count(self, org_id: UUID) -> int:
    return self.db.query(func.count(OrganizationMember.id))\
        .filter(OrganizationMember.organization_id == org_id)\
        .scalar()
```

### **Frontend Performance Patterns**

#### **Component Optimization**

```typescript
import { memo, useMemo, useCallback, lazy, Suspense } from 'react'

// Memoize expensive components
const FeatureCard = memo(({ feature, onEdit, onDelete }: FeatureCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{feature.name}</CardTitle>
      </CardHeader>
    </Card>
  )
})

// Memoize expensive calculations
function FeatureStats({ features }: { features: FeatureItem[] }) {
  const stats = useMemo(() => {
    return {
      total: features.length,
      active: features.filter(f => f.is_active).length,
      categories: features.reduce((acc, f) => {
        acc[f.category] = (acc[f.category] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    }
  }, [features])

  return <div>{/* Display stats */}</div>
}

// Memoize callback functions
function FeatureList({ features, onEdit }: FeatureListProps) {
  const handleEdit = useCallback((feature: FeatureItem) => {
    onEdit(feature)
  }, [onEdit])

  return (
    <div>
      {features.map(feature => (
        <FeatureCard key={feature.id} feature={feature} onEdit={handleEdit} />
      ))}
    </div>
  )
}
```

#### **Lazy Loading & Code Splitting**

```typescript
// Lazy load heavy components
const DataVisualization = lazy(() => import('@/components/data-visualization'))
const ReportGenerator = lazy(() => import('@/components/report-generator'))

// Use in component with Suspense
function Dashboard() {
  return (
    <div>
      <Suspense fallback={<Skeleton className="h-[400px]" />}>
        <DataVisualization />
      </Suspense>

      <Suspense fallback={<div>Loading reports...</div>}>
        <ReportGenerator />
      </Suspense>
    </div>
  )
}

// Dynamic imports for conditional loading
function AdvancedSettings() {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [AdvancedPanel, setAdvancedPanel] = useState<React.ComponentType | null>(null)

  const loadAdvancedPanel = async () => {
    const module = await import('@/components/advanced-panel')
    setAdvancedPanel(() => module.AdvancedPanel)
  }

  return (
    <div>
      <Button onClick={() => {
        setShowAdvanced(true)
        loadAdvancedPanel()
      }}>
        Show Advanced
      </Button>
      {showAdvanced && AdvancedPanel && <AdvancedPanel />}
    </div>
  )
}
```

#### **API & State Optimization**

```typescript
// Debounce API calls
import { debounce } from 'lodash'

const debouncedSearch = useMemo(
  () => debounce(async (query: string) => {
    if (query.length >= 3) {
      const results = await searchService.search(query)
      setSearchResults(results)
    }
  }, 300),
  []
)

// Implement optimistic updates
const useOptimisticFeatureStore = create<FeatureState>((set, get) => ({
  // ... other state

  createFeature: async (data: CreateFeatureData) => {
    // Optimistic update
    const tempId = `temp-${Date.now()}`
    const optimisticFeature = { ...data, id: tempId, organization_id: get().currentOrgId }

    set(state => ({
      features: [...state.features, optimisticFeature],
      loading: true
    }))

    try {
      const realFeature = await featureService.createFeature(data)

      // Replace optimistic with real data
      set(state => ({
        features: state.features.map(f =>
          f.id === tempId ? realFeature : f
        ),
        loading: false
      }))
    } catch (error) {
      // Remove optimistic update on error
      set(state => ({
        features: state.features.filter(f => f.id !== tempId),
        loading: false,
        error: error.message
      }))
      throw error
    }
  }
}))

// Implement data prefetching
function FeatureDetailPage({ featureId }: { featureId: string }) {
  const { prefetchFeature } = useFeatureStore()

  // Prefetch related data
  useEffect(() => {
    prefetchFeature(featureId)
  }, [featureId, prefetchFeature])

  return <FeatureDetail id={featureId} />
}
```

---

## **Error Handling Patterns**

### **Backend Error Handling**

#### **HTTP Exception Patterns**

```python
from fastapi import HTTPException, status
from typing import Optional
import logging

logger = logging.getLogger(__name__)

class OrganizationError(Exception):
    """Base exception for organization-related errors."""
    pass

class OrganizationNotFoundError(OrganizationError):
    """Organization not found or access denied."""
    pass

class OrganizationPermissionError(OrganizationError):
    """Insufficient permissions for organization operation."""
    pass

# Centralized error handling
def handle_organization_error(error: Exception, org_id: UUID, user_id: UUID) -> HTTPException:
    """Convert domain errors to HTTP exceptions with logging."""

    context = {
        "organization_id": str(org_id),
        "user_id": str(user_id),
        "error_type": type(error).__name__,
        "error_message": str(error)
    }

    if isinstance(error, OrganizationNotFoundError):
        logger.warning("Organization not found", extra=context)
        return HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found"
        )
    elif isinstance(error, OrganizationPermissionError):
        logger.warning("Organization permission denied", extra=context)
        return HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
    else:
        logger.error("Unexpected organization error", extra=context, exc_info=True)
        return HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

# Service layer error handling
class OrganizationService:
    async def get_organization(self, org_id: UUID, user_id: UUID) -> Organization:
        try:
            org = await self.repository.get_by_id(org_id)
            if not org:
                raise OrganizationNotFoundError(f"Organization {org_id} not found")

            # Check permissions
            if not await self.has_access(user_id, org_id):
                raise OrganizationPermissionError("Access denied to organization")

            return org

        except (OrganizationNotFoundError, OrganizationPermissionError):
            raise  # Re-raise domain errors
        except Exception as e:
            logger.error(
                "Failed to get organization",
                extra={"org_id": str(org_id), "user_id": str(user_id)},
                exc_info=True
            )
            raise OrganizationError("Failed to retrieve organization") from e

# Router error handling
@router.get("/organizations/{org_id}")
async def get_organization(
    org_id: UUID,
    current_user: User = Depends(get_current_active_user),
    service: OrganizationService = Depends()
):
    try:
        return await service.get_organization(org_id, current_user.id)
    except OrganizationError as e:
        raise handle_organization_error(e, org_id, current_user.id)
```

#### **Database Error Handling**

```python
from sqlalchemy.exc import IntegrityError, DataError
from sqlalchemy.orm.exc import NoResultFound

class DatabaseService:
    def safe_create(self, model_class, data: dict):
        """Safely create database record with error handling."""
        try:
            instance = model_class(**data)
            self.db.add(instance)
            self.db.commit()
            self.db.refresh(instance)
            return instance

        except IntegrityError as e:
            self.db.rollback()
            if "unique_constraint" in str(e.orig):
                raise ValueError("Record already exists")
            elif "foreign_key_constraint" in str(e.orig):
                raise ValueError("Referenced record does not exist")
            else:
                raise ValueError("Database constraint violation")

        except DataError as e:
            self.db.rollback()
            raise ValueError(f"Invalid data format: {e.orig}")

        except Exception as e:
            self.db.rollback()
            logger.error("Database operation failed", exc_info=True)
            raise RuntimeError("Database operation failed") from e
```

### **Frontend Error Handling**

#### **Error Boundary Patterns**

```typescript
import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error boundary caught an error:', error, errorInfo)
    this.props.onError?.(error, errorInfo)

    // Send to error reporting service
    if (process.env.NODE_ENV === 'production') {
      reportError(error, errorInfo)
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <details>
            <summary>Error details</summary>
            <pre>{this.state.error?.stack}</pre>
          </details>
          <Button onClick={() => this.setState({ hasError: false })}>
            Try again
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}

// Usage
function App() {
  return (
    <ErrorBoundary
      fallback={<ErrorFallback />}
      onError={(error, errorInfo) => {
        // Log to external service
        errorReporter.captureError(error, errorInfo)
      }}
    >
      <Dashboard />
    </ErrorBoundary>
  )
}
```

#### **API Error Handling**

```typescript
// Centralized error types
export enum ErrorType {
  NETWORK = "NETWORK",
  AUTHENTICATION = "AUTHENTICATION",
  AUTHORIZATION = "AUTHORIZATION",
  VALIDATION = "VALIDATION",
  NOT_FOUND = "NOT_FOUND",
  SERVER = "SERVER",
  UNKNOWN = "UNKNOWN",
}

export interface ApiError {
  type: ErrorType
  message: string
  statusCode?: number
  details?: unknown
}

// Error factory
export class ErrorFactory {
  static fromHttpError(error: any): ApiError {
    if (error.response) {
      const { status, data } = error.response

      switch (status) {
        case 401:
          return {
            type: ErrorType.AUTHENTICATION,
            message: "Authentication required",
            statusCode: status,
          }
        case 403:
          return {
            type: ErrorType.AUTHORIZATION,
            message: data.detail || "Access denied",
            statusCode: status,
          }
        case 404:
          return {
            type: ErrorType.NOT_FOUND,
            message: data.detail || "Resource not found",
            statusCode: status,
          }
        case 422:
          return {
            type: ErrorType.VALIDATION,
            message: "Validation failed",
            statusCode: status,
            details: data.detail,
          }
        default:
          return {
            type: ErrorType.SERVER,
            message: data.detail || "Server error",
            statusCode: status,
          }
      }
    } else if (error.request) {
      return {
        type: ErrorType.NETWORK,
        message: "Network error - please check your connection",
      }
    } else {
      return {
        type: ErrorType.UNKNOWN,
        message: error.message || "An unexpected error occurred",
      }
    }
  }
}

// Service error handling
export class BaseService {
  protected async handleRequest<T>(request: Promise<T>): Promise<T> {
    try {
      return await request
    } catch (error) {
      const apiError = ErrorFactory.fromHttpError(error)

      // Log error for debugging
      console.error("API Error:", apiError)

      // Handle authentication errors globally
      if (apiError.type === ErrorType.AUTHENTICATION) {
        authStore.getState().logout()
        router.push("/auth/login")
      }

      throw apiError
    }
  }

  async get<T>(url: string): Promise<T> {
    return this.handleRequest(axios.get(url))
  }
}
```

#### **Form Error Handling**

```typescript
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

// Schema with custom error messages
const featureSchema = z.object({
  name: z.string()
    .min(3, 'Name must be at least 3 characters')
    .max(255, 'Name must be less than 255 characters')
    .regex(/^[a-zA-Z0-9\s-]+$/, 'Name contains invalid characters'),
  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  is_active: z.boolean()
})

// Form with comprehensive error handling
function FeatureForm({ onSubmit }: FeatureFormProps) {
  const t = useTranslations('features.form')
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm<FeatureFormData>({
    resolver: zodResolver(featureSchema),
    defaultValues: {
      name: '',
      description: '',
      is_active: true
    }
  })

  const handleSubmit = async (data: FeatureFormData) => {
    setSubmitError(null)

    try {
      await onSubmit(data)
      form.reset()
      toast.success(t('messages.success'))
    } catch (error) {
      if (error instanceof ApiError) {
        switch (error.type) {
          case ErrorType.VALIDATION:
            // Handle field-specific validation errors
            if (error.details) {
              Object.entries(error.details).forEach(([field, message]) => {
                form.setError(field as keyof FeatureFormData, {
                  message: String(message)
                })
              })
            }
            break
          case ErrorType.AUTHORIZATION:
            setSubmitError(t('errors.permission'))
            break
          default:
            setSubmitError(error.message)
        }
      } else {
        setSubmitError(t('errors.unknown'))
      }

      toast.error(t('messages.error'))
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        {submitError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        {/* Form fields */}

        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? t('submitting') : t('submit')}
        </Button>
      </form>
    </Form>
  )
}
```

#### **Global Error Handling**

```typescript
// Global error store
interface ErrorState {
  errors: ApiError[]
  addError: (error: ApiError) => void
  removeError: (id: string) => void
  clearErrors: () => void
}

export const useErrorStore = create<ErrorState>((set) => ({
  errors: [],

  addError: (error) => set((state) => ({
    errors: [...state.errors, { ...error, id: Date.now().toString() }]
  })),

  removeError: (id) => set((state) => ({
    errors: state.errors.filter(error => error.id !== id)
  })),

  clearErrors: () => set({ errors: [] })
}))

// Global error component
function GlobalErrorHandler() {
  const { errors, removeError } = useErrorStore()

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {errors.map((error) => (
        <Alert
          key={error.id}
          variant={error.type === ErrorType.SERVER ? 'destructive' : 'default'}
        >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>
            {error.type === ErrorType.NETWORK && 'Connection Error'}
            {error.type === ErrorType.SERVER && 'Server Error'}
            {error.type === ErrorType.VALIDATION && 'Validation Error'}
          </AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeError(error.id)}
          >
            Dismiss
          </Button>
        </Alert>
      ))}
    </div>
  )
}
```

---

## **Monitoring & Debugging**

### **Performance Monitoring**

```python
# Backend performance monitoring
import time
from functools import wraps

def monitor_performance(func):
    @wraps(func)
    async def wrapper(*args, **kwargs):
        start_time = time.time()
        try:
            result = await func(*args, **kwargs)
            duration = time.time() - start_time

            logger.info(
                f"Function {func.__name__} completed",
                extra={
                    "function": func.__name__,
                    "duration_ms": round(duration * 1000, 2),
                    "status": "success"
                }
            )
            return result
        except Exception as e:
            duration = time.time() - start_time
            logger.error(
                f"Function {func.__name__} failed",
                extra={
                    "function": func.__name__,
                    "duration_ms": round(duration * 1000, 2),
                    "status": "error",
                    "error": str(e)
                }
            )
            raise
    return wrapper

# Usage
@monitor_performance
async def get_organization_stats(org_id: UUID) -> dict:
    # Expensive operation
    return stats
```

```typescript
// Frontend performance monitoring
export function withPerformanceMonitoring<T extends object>(
  Component: React.ComponentType<T>
) {
  return function PerformanceMonitoredComponent(props: T) {
    useEffect(() => {
      const startTime = performance.now()

      return () => {
        const endTime = performance.now()
        const renderTime = endTime - startTime

        if (renderTime > 100) { // Log slow renders
          console.warn(`Slow render detected: ${Component.name} took ${renderTime}ms`)
        }
      }
    }, [])

    return <Component {...props} />
  }
}

// Usage
export default withPerformanceMonitoring(FeatureCard)
```

---

** Result**: Com estes patterns de performance e error handling, o sistema mantém alta performance e robustez, proporcionando uma experiência de usuário consistente mesmo em cenários de erro ou alta carga.
