# Multi-Tenancy Template Guide & Copy-Paste Patterns

**IMPORTANTE:** Seja EXTREMAMENTE HONESTO SEMPRE em relação à situação do projeto. Nunca inicie algo antes de ter 95% de certeza. Não faça nenhuma alteração antes que você tenha 95% de confiança sobre o que deve ser construído. Faça perguntas até ter certeza absoluta.

> **Comprehensive guide with copy-paste templates for developing YOUR features using the Multi-Tenant SaaS Starter Template**

## 🎯 **TEMPLATE CUSTOMIZATION PRINCIPLES - EXTREMELY IMPORTANT**

### **KISS, YAGNI, DRY - NEVER BREAK WHEN EXTENDING TEMPLATE**

- **KISS (Keep It Simple, Stupid)**: **ALWAYS** choose the simplest solution that works for YOUR SaaS
- **YAGNI (You Aren't Gonna Need It)**: **NEVER** implement features "for the future" - focus on your MVP
- **DRY (Don't Repeat Yourself)**: **ALWAYS** reuse template patterns before creating new ones
- **🔴 CRITICAL**: Breaking these principles when customizing the template is considered critical failure

## 📚 Table of Contents

- [Template Overview](#template-overview)
- [Template Architecture Principles](#template-architecture-principles)
- [SAAS Mode System](#saas-mode-system)
- [Backend Template Extension](#backend-template-extension)
- [Frontend Template Extension](#frontend-template-extension)
- [Template Security Rules](#template-security-rules)
- [Testing Your Customizations](#testing-your-customizations)
- [Template Patterns to Copy](#template-patterns-to-copy)
- [Troubleshooting Template Issues](#troubleshooting-template-issues)

> 🎯 **For ready-to-use copy-paste templates**: See [MULTI-TENANCY-TEMPLATES.md](MULTI-TENANCY-TEMPLATES.md)

---

## 🏗️ Template Overview

This starter template implements **header-based multi-tenancy** with **organization-centric design** that YOUR features inherit:

- **Every operation is organization-scoped** (org_id required via X-Org-Id header)
- **User registration automatically creates organization** (shared in B2B mode)
- **Complete data isolation between organizations** (middleware validation)
- **Secure by default** - all routes protected with organization context unless explicitly public

### Key Concepts

- **Organization**: The tenant unit - each organization has isolated data (personal or shared)
- **X-Org-Id Header**: Required header for all multi-tenant operations (validated by middleware)
- **JWT with org_id**: Authentication tokens include organization context
- **organization_middleware.py**: Core middleware that validates X-Org-Id against JWT
- **Repository Pattern**: Data access with automatic org_id filtering
- **Secure by Default**: New routes automatically protected with organization validation

---

## 🏗️ Template Architecture Principles

### 1. **Organization-Centric Design**

```
User Registration -> Auto-Create Org -> User = Owner -> JWT with org_id -> All Operations Scoped
```

### 2. **Data Isolation Levels**

- ** Public**: No authentication (health, docs, auth endpoints)
- **Auth-Only**: Authentication required, no org validation (user profile)
- **Multi-Tenant**: Organization context required (business operations)

### 3. **Security Model**

- **Middleware-First**: organization_middleware.py intercepts and validates all requests
- **Header Validation**: X-Org-Id header must match JWT org_id claim
- **Repository Filtering**: Automatic org_id filtering in all database queries
- **Zero Cross-Org Access**: Architecture prevents cross-organization data access
- **BaseService Integration**: Frontend service automatically adds X-Org-Id headers

---

## 🎯 SAAS Mode System

This template supports **two operation modes** configurable via environment variables:

### **Available Modes**

- **B2B Mode**: Team collaboration with shared organizations, roles, and team features
- **B2C Mode**: Individual usage with personal organizations (auto-created), simplified interface

### **Configuration**

**Environment Variables:**

```bash
# Backend Configuration
SAAS_MODE=B2B  # or B2C (configures behavior mode)

# Frontend Configuration
NEXT_PUBLIC_SAAS_MODE=B2B  # or B2C (configures UI features)
```

**Important Notes:**

- Both modes maintain **organization-centric isolation** (org_id always required)
- B2C mode uses personal organizations (1 user per org) for simplified experience
- B2B mode uses shared organizations (multiple users per org) for collaboration
- **Header-based multi-tenancy** (X-Org-Id) applies to both modes

**Backend Implementation:**

```python
# api/core/config.py
from pydantic import Field, validator

class Settings(BaseSettings):
    SAAS_MODE: str = Field(default="B2C", description="SaaS mode: B2B or B2C")

    @property
    def is_b2b_mode(self) -> bool:
        return self.SAAS_MODE.upper() == "B2B"

    @property
    def is_b2c_mode(self) -> bool:
        return self.SAAS_MODE.upper() == "B2C"

    @validator("SAAS_MODE")
    def validate_saas_mode(cls, v):
        if v.upper() not in ["B2B", "B2C"]:
            raise ValueError("SAAS_MODE must be either 'B2B' or 'B2C'")
        return v.upper()
```

**Frontend Hook:**

```typescript
// hooks/use-saas-mode.ts
export function useSaasMode() {
  const mode = (process.env.NEXT_PUBLIC_SAAS_MODE || "B2C") as SaasMode
  const validMode = mode === "B2B" || mode === "B2C" ? mode : "B2C"

  return {
    mode: validMode,
    isB2C: validMode === "B2C",
    isB2B: validMode === "B2B",
  }
}
```

### **Mode-Specific Behavior**

**Registration Logic:**

- **B2C**: Creates "Personal Workspace"
- **B2B**: Creates personalized organization name

**UI Adaptations:**

- **B2C**: "My Dashboard", Teams menu hidden, Organization info hidden
- **B2B**: "Team Dashboard", Teams menu visible, Organization info displayed

**Verification:**

```bash
# Check configuration
./check-saas-mode.sh
```

---

## 🚀 Backend Development

### Multi-Tenant Middleware

Our `OrganizationContextMiddleware` automatically handles tenant validation:

```python
class OrganizationContextMiddleware:
    def __init__(self, app: ASGIApp):
        #  PUBLIC ROUTES: No authentication required
        self.public_routes = [
            "/",  # Root endpoint
            "/auth/",  # All auth endpoints
            "/health", "/docs", "/openapi.json",
            "/billing/available-plans",  # Public data
            "/billing/stripe-webhook",  # External webhooks
            "/invites/",  # Public invite operations
        ]

        # AUTH-ONLY: Authentication required, no org validation
        self.auth_only_routes = [
            "/auth/me", "/auth/logout", "/auth/refresh",
            "/users/me",  # Cross-org user profile
            "/users/me/organizations",  # User's org list
        ]

        #  SECURE BY DEFAULT: All other routes require org validation
```

### Creating New Multi-Tenant Endpoints

#### 1. **Standard Multi-Tenant Endpoint**

```python
# api/routers/your_feature.py
from fastapi import APIRouter, Depends
from ..core.deps import get_current_organization
from ..models.organization import Organization

router = APIRouter(prefix="/your-feature", tags=["Your Feature"])

@router.get("/items")
async def get_items(
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db)
):
    """Get items for current organization."""
    #  Automatically org-scoped via get_current_organization
    items = db.query(YourModel).filter(
        YourModel.organization_id == organization.id
    ).all()

    return items
```

#### 2. **Public Endpoint (No Auth)**

If you need a truly public endpoint, add it to middleware:

```python
# api/core/organization_middleware.py
self.public_routes = [
    # ... existing routes ...
    "/your-feature/public-data",  # Add your public route
]
```

#### 3. **Auth-Only Endpoint (No Org)**

For cross-organization user data:

```python
# Add to auth_only_routes in middleware
self.auth_only_routes = [
    # ... existing routes ...
    "/your-feature/user-settings",  # User-specific, not org-specific
]

# In your router
@router.get("/user-settings")
async def get_user_settings(
    current_user: User = Depends(get_current_active_user)  # No org dependency
):
    return user.settings
```

### Database Models

All business models MUST include `organization_id`:

```python
# api/models/your_model.py
from sqlalchemy import Column, String, UUID, ForeignKey
from sqlalchemy.orm import relationship

class YourModel(Base):
    __tablename__ = "your_table"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    name = Column(String(255), nullable=False)

    # Relationship to organization
    organization = relationship("Organization", back_populates="your_models")

    #  Add index for performance
    __table_args__ = (
        Index('ix_your_table_organization_id', 'organization_id'),
    )
```

### Repository Pattern

Use organization-scoped repositories:

```python
# api/repositories/your_repository.py
from .base import SQLRepository

class YourRepository(SQLRepository[YourModel]):
    def get_by_organization(self, org_id: UUID) -> List[YourModel]:
        """Get all items for organization."""
        return self.db.query(YourModel).filter(
            YourModel.organization_id == org_id
        ).all()

    def create_for_organization(self, org_id: UUID, data: dict) -> YourModel:
        """Create item for organization."""
        item = YourModel(**data, organization_id=org_id)
        self.db.add(item)
        self.db.commit()
        self.db.refresh(item)
        return item
```

### Service Layer

Business logic with organization context:

```python
# api/services/your_service.py
class YourService:
    def __init__(self, db: Session):
        self.db = db
        self.repository = YourRepository(db)

    def create_item(self, organization: Organization, data: YourCreateSchema) -> YourModel:
        """Create item with automatic org scoping."""
        #  Organization context automatically passed
        return self.repository.create_for_organization(
            org_id=organization.id,
            data=data.dict()
        )

    def get_organization_items(self, organization: Organization) -> List[YourModel]:
        """Get items for organization."""
        return self.repository.get_by_organization(organization.id)
```

### Pydantic Schemas

Include organization validation:

```python
# api/schemas/your_schema.py
from pydantic import BaseModel
from uuid import UUID
from typing import Optional

class YourCreateSchema(BaseModel):
    name: str
    description: Optional[str] = None
    #  Don't include organization_id - it's set automatically

class YourResponseSchema(BaseModel):
    id: UUID
    organization_id: UUID  #  Include in response for verification
    name: str
    description: Optional[str] = None

    class Config:
        from_attributes = True
```

---

## 🌐 Frontend Development

### Current Route Structure

All business routes use the **`/[locale]/admin/`** structure:

```typescript
// app/[locale]/admin/your-feature/page.tsx
interface PageProps {
  params: {
    locale: string
  }
}

export default function YourFeaturePage({ params }: PageProps) {
  return <YourFeatureContainer locale={params.locale} />
}
```

### API Service Layer

All API calls use **BaseService** which automatically includes organization context:

```typescript
// services/your-feature.ts
import { BaseService } from "./base"

export interface YourItem {
  id: string
  organization_id: string
  name: string
  description?: string
}

class YourFeatureService extends BaseService {
  async getItems(): Promise<YourItem[]> {
    // X-Org-Id header automatically added by BaseService
    return this.get("/your-feature/items")
  }

  async createItem(data: Partial<YourItem>): Promise<YourItem> {
    return this.post("/your-feature/items", data)
  }
}

export const yourFeatureService = new YourFeatureService()
```

### State Management (Zustand)

Organization-aware global state using **BaseService**:

```typescript
// stores/your-feature.ts
import { create } from "zustand"
import { yourFeatureService } from "@/services/your-feature"

interface YourFeatureState {
  items: YourItem[]
  loading: boolean
  error: string | null

  // Actions
  fetchItems: () => Promise<void>
  createItem: (data: Partial<YourItem>) => Promise<void>
  clearError: () => void
}

export const useYourFeatureStore = create<YourFeatureState>((set, get) => ({
  items: [],
  loading: false,
  error: null,

  fetchItems: async () => {
    set({ loading: true, error: null })
    try {
      // Organization context handled by BaseService automatically
      const items = await yourFeatureService.getItems()
      set({ items, loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  createItem: async data => {
    set({ error: null })
    try {
      const newItem = await yourFeatureService.createItem(data)
      set(state => ({
        items: [...state.items, newItem],
      }))
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },

  clearError: () => set({ error: null }),
}))
```

### Container Components

Organization context handled via **useOrgContext** hook:

```typescript
// containers/your-feature/YourFeatureContainer.tsx
'use client';

import { useEffect } from 'react';
import { useOrgContext } from '@/hooks/use-org-context';
import { useYourFeatureStore } from '@/stores/your-feature';
import { YourFeatureList } from '@/components/your-feature/YourFeatureList';

interface Props {
  locale: string;
}

export function YourFeatureContainer({ locale }: Props) {
  const { organization, validateOrgAccess } = useOrgContext();
  const { items, loading, fetchItems } = useYourFeatureStore();

  useEffect(() => {
    validateOrgAccess();
    fetchItems(); // Organization context automatically included
  }, [validateOrgAccess, fetchItems]);

  return (
    <div>
      <h1>Your Feature</h1>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <YourFeatureList items={items} />
      )}
    </div>
  );
}
```

### Custom Hooks

Organization-aware hooks using **useOrgContext**:

```typescript
// hooks/use-your-feature.ts
import { useEffect } from "react"
import { useOrgContext } from "./use-org-context"
import { useYourFeatureStore } from "@/stores/your-feature"

export function useYourFeature() {
  const { organization } = useOrgContext()
  const store = useYourFeatureStore()

  useEffect(() => {
    if (organization) {
      store.fetchItems() // Organization context handled by BaseService
    }
  }, [organization, store])

  return {
    ...store,
    createItem: (data: Partial<YourItem>) => store.createItem(data),
    refreshItems: () => store.fetchItems(),
  }
}
```

### Component Props

Organization context with **next-intl navigation**:

```typescript
// components/your-feature/YourFeatureList.tsx
import { useRouter } from '@/next-intl.config';

interface Props {
  items: YourItem[];
}

export function YourFeatureList({ items }: Props) {
  const router = useRouter();

  const handleEdit = (item: YourItem) => {
    // Navigation includes locale automatically via next-intl
    router.push(`/admin/your-feature/${item.id}/edit`);
  };

  return (
    <div>
      {items.map(item => (
        <YourFeatureCard
          key={item.id}
          item={item}
          onEdit={() => handleEdit(item)}
        />
      ))}
    </div>
  );
}
```

---

## Security Rules

### **DO's**

1. **Always validate organization access**

   ```python
   #  Use get_current_organization dependency
   organization = Depends(get_current_organization)
   ```

2. **Include org_id in all business queries**

   ```python
   #  Organization-scoped query
   items = db.query(YourModel).filter(
       YourModel.organization_id == org_id
   ).all()
   ```

3. **Use BaseService in frontend**

   ```typescript
   // BaseService automatically includes X-Org-Id header
   return this.get("/your-endpoint") // X-Org-Id auto-added
   ```

4. **Validate data ownership before operations**
   ```python
   #  Verify item belongs to organization
   if item.organization_id != organization.id:
       raise HTTPException(403, "Access denied")
   ```

### **DON'Ts**

1. **Never skip organization validation**

   ```python
   #  Cross-organization data leak
   items = db.query(YourModel).all()  # DANGEROUS!
   ```

2. **Don't expose org_id in URLs for security**

   ```typescript
   // ❌ Wrong: Org ID in URL (security risk)
   ;/api/aagiinnoorstz / 123 / items

   // ✅ Correct: Org ID in header via BaseService
   yourService.getItems() // X-Org-Id auto-added by BaseService
   ```

3. **Don't trust client-provided org_id**

   ```python
   #  Using request org_id without validation
   org_id = request.json.get('org_id')  # DANGEROUS!

   #  Use validated organization from dependency
   organization = Depends(get_current_organization)
   ```

---

## Testing Guidelines

### Backend Tests

Test organization isolation:

```python
# tests/test_your_feature.py
def test_organization_isolation(authenticated_user, other_organization):
    """Test that users cannot access other organization's data."""
    # Create item in user's organization
    item = create_item(authenticated_user['organization']['id'])

    # Try to access with different org header
    headers = {
        'Authorization': f"Bearer {authenticated_user['tokens']['access_token']}",
        'X-Org-Id': other_organization['id']  # Different org!
    }

    response = client.get('/your-feature/items', headers=headers)

    # Should return 403 (organization mismatch)
    assert response.status_code == 403
    assert "organization mismatch" in response.json()['detail']
```

### Frontend Tests

Test organization context with **useOrgContext**:

```typescript
// tests/your-feature.test.tsx
describe('YourFeature', () => {
  it('should fetch items using organization context', async () => {
    const mockItems = [{ id: '1', organization_id: 'org-123', name: 'Test' }];

    // Mock organization context
    jest.mocked(useOrgContext).mockReturnValue({
      organization: { id: 'org-123', name: 'Test Org' },
      validateOrgAccess: jest.fn()
    });

    // Mock API call
    jest.spyOn(yourFeatureService, 'getItems')
        .mockResolvedValue(mockItems);

    render(<YourFeatureContainer locale="en" />);

    // Verify API called (org context handled by BaseService)
    expect(yourFeatureService.getItems).toHaveBeenCalled();
  });
});
```

---

## Common Patterns

### 1. **Organization-Scoped CRUD**

```python
# Standard pattern for all business operations
@router.post("/items", response_model=YourResponseSchema)
async def create_item(
    item_data: YourCreateSchema,
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db)
):
    service = YourService(db)
    return service.create_item(organization, item_data)

@router.get("/items", response_model=List[YourResponseSchema])
async def get_items(
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db)
):
    service = YourService(db)
    return service.get_organization_items(organization)
```

### 2. **Frontend Organization Context**

```typescript
// Standard pattern for all business components
export function YourBusinessComponent({ locale }: { locale: string }) {
  // 1. Get organization context automatically
  const { data, loading, error, actions } = useYourFeature();
  const router = useRouter();  // from next-intl.config
  const { isB2B, isB2C } = useSaasMode();

  // 2. Handle organization-specific operations
  const handleCreate = async (data: CreateData) => {
    await actions.create(data); // Organization context handled by BaseService
  };

  // 3. Navigation includes locale automatically via next-intl
  const handleEdit = (id: string) => {
    router.push(`/admin/your-feature/${id}/edit`);
  };

  return (
    <div>
      {/* SAAS mode-aware components */}
      {isB2B && <OrganizationInfo />}
    </div>
  );
}
```

### 3. **Database Migration Pattern**

```sql
-- migrations/XXX_add_your_feature.sql
CREATE TABLE your_table (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

--  Always add organization index for performance
CREATE INDEX ix_your_table_organization_id ON your_table(organization_id);

--  Add to schema_versions for tracking
INSERT INTO schema_versions (version, description)
VALUES (XXX, 'Add your feature tables');
```

---

## Troubleshooting

### Common Issues

#### 1. **403 Forbidden on New Endpoints**

```
Error: {"detail": "Missing or invalid authorization header"}
```

**Solution**: Your endpoint is automatically protected. Add to public routes if needed:

```python
# api/core/organization_middleware.py
self.public_routes = [
    # ... existing routes ...
    "/your-feature/public-endpoint",  # Add here
]
```

#### 2. **Organization Mismatch**

```
Error: {"detail": "Access denied: organization mismatch"}
```

**Solution**: Ensure X-Org-Id header matches JWT org_id:

```typescript
// Verify user's organization ID
const { user } = useAuth()
const orgId = user.organization.id // Use this, not arbitrary orgId
```

#### 3. **Cross-Organization Data Leak**

```
Error: User seeing other organization's data
```

**Solution**: Always filter by organization_id:

```python
#  Wrong
items = db.query(YourModel).all()

#  Correct
items = db.query(YourModel).filter(
    YourModel.organization_id == organization.id
).all()
```

#### 4. **Frontend Route Not Found**

```
Error: 404 on /dashboard/feature
```

**Solution**: Use correct route structure:

```typescript
// ❌ Wrong structure
;/dashboard/aeefrtu /
  // ✅ Correct structure
  [locale] /
  admin /
  feature
```

### Debugging Tips

1. **Check middleware logs** for organization validation
2. **Verify X-Org-Id header** in browser dev tools (auto-added by BaseService)
3. **Test with different organizations** to ensure isolation
4. **Use organization fixtures** in tests for consistent data

---

## Additional Resources

- **Architecture**: See `/CLAUDE.md` for complete system overview
- **API Documentation**: Visit `/docs` for interactive API explorer
- **Database Schema**: Check `/migrations/` for current structure
- **Test Examples**: Review `/tests/e2e/api/` for testing patterns

---

## Quick Start Checklist

When creating a new feature:

- [ ] **Backend**: Add organization_id to models
- [ ] **Backend**: Use get_current_organization dependency
- [ ] **Backend**: Create organization-scoped service/repository
- [ ] **Frontend**: Use `/[locale]/admin/` route structure
- [ ] **Frontend**: Use BaseService for all API calls (auto X-Org-Id)
- [ ] **Frontend**: Use useOrgContext() + useSaasMode() hooks
- [ ] **Tests**: Test organization isolation
- [ ] **Tests**: Verify X-Org-Id header requirement
- [ ] **Security**: Review for cross-organization data leaks

**🔒 Remember: Security by default - every new route is protected unless explicitly made public!**

**🎯 SAAS Mode: Always use useSaasMode() hook for B2B/B2C adaptations!**

---

_For questions or clarifications, refer to the existing codebase patterns or create an issue for discussion._
