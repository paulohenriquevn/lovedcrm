# Multi-Tenancy Templates & Quick Reference

**IMPORTANTE:** Seja EXTREMAMENTE HONESTO SEMPRE em relação à situação do projeto. Nunca inicie algo antes de ter 95% de certeza. Não faça nenhuma alteração antes que você tenha 95% de confiança sobre o que deve ser construído. Faça perguntas até ter certeza absoluta.

> **Copy-paste templates for developing multi-tenant features quickly and consistently**

## **PRINCÍPIOS FUNDAMENTAIS - EXTREMAMENTE IMPORTANTES**

### **KISS, YAGNI, DRY - NUNCA QUEBRAR**

- **KISS (Keep It Simple, Stupid)**: **SEMPRE** escolher a solução mais simples que funciona
- **YAGNI (You Aren't Gonna Need It)**: **NUNCA** implementar funcionalidades "para o futuro"
- **DRY (Don't Repeat Yourself)**: **SEMPRE** reutilizar código existente antes de criar novo
- **CRITICAL**: Quebrar estes princípios é considerado falha crítica no desenvolvimento

## Table of Contents

- [SAAS Mode Configuration](#saas-mode-configuration)
- [Backend Templates](#backend-templates)
- [Frontend Templates](#frontend-templates)
- [Quick Commands](#quick-commands)
- [Common Mistakes](#common-mistakes)

---

## SAAS Mode Configuration

### **Overview**

O sistema suporta dois modos de operação:

- **B2B Mode**: Team collaboration, organization management, roles/permissions
- **B2C Mode**: Individual/personal usage, simplified interface

### **Environment Variables**

**Required Variables:**

```bash
# Backend Configuration
SAAS_MODE=B2B  # or B2C

# Frontend Configuration
NEXT_PUBLIC_SAAS_MODE=B2B  # or B2C
```

**Docker Compose Configuration:**

```yaml
# docker-compose.yml
services:
  api:
    environment:
      SAAS_MODE: "B2B"

  frontend:
    environment:
      NEXT_PUBLIC_SAAS_MODE: "B2B"
```

### **Backend SAAS Mode Implementation**

**Configuration Template:**

```python
# api/core/config.py
from pydantic import Field

class Settings(BaseSettings):
    SAAS_MODE: str = Field(default="B2C", description="SaaS mode: B2B or B2C")

    @property
    def is_b2b_mode(self) -> bool:
        """Check if system is in B2B mode."""
        return self.SAAS_MODE.upper() == "B2B"

    @property
    def is_b2c_mode(self) -> bool:
        """Check if system is in B2C mode."""
        return self.SAAS_MODE.upper() == "B2C"

    @validator("SAAS_MODE")
    def validate_saas_mode(cls, v):
        """Validate SAAS_MODE is either B2B or B2C."""
        if v.upper() not in ["B2B", "B2C"]:
            raise ValueError("SAAS_MODE must be either 'B2B' or 'B2C'")
        return v.upper()
```

**Mode-Specific Registration Logic:**

```python
# api/services/auth_simple.py
from ..core.config import settings

class SimpleAuthService:
    def register_user(self, email: str, password: str, full_name: str = None, terms_accepted: bool = False):
        # Create user
        user = self._create_user(email, password, full_name, terms_accepted)

        # Create organization based on SAAS mode
        if settings.is_b2c_mode:
            org_name = "Personal Workspace"
        else:  # B2B mode
            org_name = f"{full_name or email.split('@')[0]}'s Organization"

        organization = self._create_organization(
            name=org_name,
            owner_id=user.id
        )

        return user, organization
```

### **Frontend SAAS Mode Implementation**

**useSaasMode Hook:**

```typescript
// hooks/use-saas-mode.ts
export type SaasMode = "B2B" | "B2C"

export interface UseSaasModeReturn {
  mode: SaasMode
  isB2C: boolean
  isB2B: boolean
}

export function useSaasMode(): UseSaasModeReturn {
  const mode = (process.env.NEXT_PUBLIC_SAAS_MODE || "B2C") as SaasMode
  const validMode = mode === "B2B" || mode === "B2C" ? mode : "B2C"

  return {
    mode: validMode,
    isB2C: validMode === "B2C",
    isB2B: validMode === "B2B",
  }
}
```

**Mode-Specific Navigation:**

```typescript
// components/layout/admin-navigation.tsx
import { useSaasMode } from '@/hooks/use-saas-mode'

export function AdminNavigation(): JSX.Element {
  const { isB2C, isB2B } = useSaasMode()

  return (
    <div>
      {navigationItems
        .filter(item => {
          // Hide team navigation in B2C mode
          if (item.nameKey === 'team' && isB2C) {
            return false
          }
          return true
        })
        .map(item => (
          // Navigation items
        ))}
    </div>
  )
}
```

**Mode-Specific Dashboard:**

```typescript
// components/dashboard/DashboardHeader.tsx
import { useSaasMode } from '@/hooks/use-saas-mode'

export function DashboardHeader({ organization }: DashboardHeaderProps) {
  const { isB2C, isB2B } = useSaasMode()
  const t = useTranslations('dashboard')

  return (
    <div>
      <h1>{isB2C ? t('myDashboard') : t('teamDashboard')}</h1>
      {isB2B && organization && (
        <p>{organization.name}</p>
      )}
    </div>
  )
}
```

**Mode-Specific Organization Info:**

```typescript
// components/layout/admin-layout.tsx
export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { organization } = useOrgContext()
  const { isB2B } = useSaasMode()

  return (
    <div>
      {organization !== null && isB2B && (
        <OrganizationInfo organization={organization} />
      )}
      {children}
    </div>
  )
}
```

### **Testing SAAS Mode**

**Backend Mode Detection:**

```python
# tests/e2e/api/conftest.py
def is_api_in_b2b_mode():
    """Detect if API is running in B2B mode by testing registration behavior."""
    try:
        import uuid
        unique_id = str(uuid.uuid4())[:8]
        test_data = {
            "email": f"mode_test_{unique_id}@example.com",
            "password": "TestPassword123!",
            "full_name": "Mode Test User",
            "terms_accepted": True
        }

        response = requests.post(f"{TEST_BASE_URL}/auth/register", json=test_data, timeout=5)
        if response.status_code == 201:
            data = response.json()
            org_name = data.get("organization", {}).get("name", "")
            return org_name != "Personal Workspace" and "Organization" in org_name
        return False
    except Exception:
        return False

# Conditional test execution
@pytest.mark.skipif(not is_api_in_b2b_mode(), reason="B2B mode only - API is in B2C mode")
def test_b2b_specific_feature(api_client, authenticated_user):
    # B2B-specific test logic
    pass

@pytest.mark.skipif(is_api_in_b2b_mode(), reason="B2C mode only - API is in B2B mode")
def test_b2c_specific_feature(api_client, authenticated_user):
    # B2C-specific test logic
    pass
```

**Frontend Mode Testing:**

```typescript
// tests/frontend/hooks/useSaasMode.test.ts
import { useSaasMode } from "@/hooks/use-saas-mode"

describe("useSaasMode", () => {
  it("should return B2B mode when NEXT_PUBLIC_SAAS_MODE=B2B", () => {
    process.env.NEXT_PUBLIC_SAAS_MODE = "B2B"
    const { mode, isB2B, isB2C } = useSaasMode()

    expect(mode).toBe("B2B")
    expect(isB2B).toBe(true)
    expect(isB2C).toBe(false)
  })

  it("should default to B2C when NEXT_PUBLIC_SAAS_MODE is not set", () => {
    delete process.env.NEXT_PUBLIC_SAAS_MODE
    const { mode, isB2B, isB2C } = useSaasMode()

    expect(mode).toBe("B2C")
    expect(isB2B).toBe(false)
    expect(isB2C).toBe(true)
  })
})
```

### **Configuration Verification**

**Check Script Usage:**

```bash
# Verify SAAS mode configuration
./check-saas-mode.sh

# Expected output for B2B:
# Backend SAAS_MODE: B2B
# Frontend NEXT_PUBLIC_SAAS_MODE: B2B
# Teams menu: ✅ VISIBLE
# Dashboard title: 'Team Dashboard'
# Organization info: ✅ VISIBLE
```

**Troubleshooting:**

- **Menu Teams not showing**: Check `NEXT_PUBLIC_SAAS_MODE` is set correctly
- **Mode mismatch**: Ensure backend and frontend have same mode configured
- **Tests failing**: Use conditional test execution with `@pytest.mark.skipif`

---

## Backend Templates

### **1. Complete Multi-Tenant Endpoint**

```python
# api/routers/your_feature.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from ..core.database import get_db
from ..core.deps import get_current_organization
from ..models.organization import Organization
from ..schemas.your_schema import YourCreateSchema, YourResponseSchema
from ..services.your_service import YourService

router = APIRouter(prefix="/your-feature", tags=["Your Feature"])

@router.get("/items", response_model=List[YourResponseSchema])
async def get_items(
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
    limit: int = 50,
    offset: int = 0
):
    """Get items for current organization."""
    service = YourService(db)
    return service.get_organization_items(organization, limit=limit, offset=offset)

@router.post("/items", response_model=YourResponseSchema, status_code=status.HTTP_201_CREATED)
async def create_item(
    item_data: YourCreateSchema,
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db)
):
    """Create new item for current organization."""
    service = YourService(db)
    return service.create_item(organization, item_data)

@router.get("/items/{item_id}", response_model=YourResponseSchema)
async def get_item(
    item_id: UUID,
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db)
):
    """Get specific item for current organization."""
    service = YourService(db)
    item = service.get_item_by_id(organization, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

@router.put("/items/{item_id}", response_model=YourResponseSchema)
async def update_item(
    item_id: UUID,
    item_data: YourCreateSchema,
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db)
):
    """Update item for current organization."""
    service = YourService(db)
    item = service.update_item(organization, item_id, item_data)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

@router.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item(
    item_id: UUID,
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db)
):
    """Delete item for current organization."""
    service = YourService(db)
    success = service.delete_item(organization, item_id)
    if not success:
        raise HTTPException(status_code=404, detail="Item not found")
```

### **2. Database Model Template**

```python
# api/models/your_model.py
import uuid
from sqlalchemy import Column, String, Text, DateTime, UUID, ForeignKey, Index, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from ..core.database import Base

class YourModel(Base):
    __tablename__ = "your_table"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # REQUIRED: Organization foreign key for multi-tenancy
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)

    # Business fields
    name = Column(String(255), nullable=False)
    description = Column(Text)
    is_active = Column(Boolean, default=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    organization = relationship("Organization", back_populates="your_models")

    # REQUIRED: Index for organization queries performance
    __table_args__ = (
        Index('ix_your_table_organization_id', 'organization_id'),
        Index('ix_your_table_organization_name', 'organization_id', 'name'),  # Composite index
    )

    def __repr__(self):
        return f"<YourModel(id={self.id}, name='{self.name}', org={self.organization_id})>"
```

### **3. Service Layer Template**

```python
# api/services/your_service.py
from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session

from ..models.your_model import YourModel
from ..models.organization import Organization
from ..schemas.your_schema import YourCreateSchema, YourUpdateSchema
from ..repositories.your_repository import YourRepository

class YourService:
    def __init__(self, db: Session):
        self.db = db
        self.repository = YourRepository(db)

    def get_organization_items(
        self,
        organization: Organization,
        limit: int = 50,
        offset: int = 0
    ) -> List[YourModel]:
        """Get items for organization with pagination."""
        return self.repository.get_by_organization(
            org_id=organization.id,
            limit=limit,
            offset=offset
        )

    def get_item_by_id(self, organization: Organization, item_id: UUID) -> Optional[YourModel]:
        """Get specific item for organization."""
        return self.repository.get_by_id_and_organization(
            item_id=item_id,
            org_id=organization.id
        )

    def create_item(self, organization: Organization, data: YourCreateSchema) -> YourModel:
        """Create new item for organization."""
        item_data = data.dict()
        item_data['organization_id'] = organization.id

        return self.repository.create(item_data)

    def update_item(
        self,
        organization: Organization,
        item_id: UUID,
        data: YourUpdateSchema
    ) -> Optional[YourModel]:
        """Update item for organization."""
        # Verify item belongs to organization
        item = self.get_item_by_id(organization, item_id)
        if not item:
            return None

        update_data = data.dict(exclude_unset=True)
        return self.repository.update(item, update_data)

    def delete_item(self, organization: Organization, item_id: UUID) -> bool:
        """Delete item for organization."""
        item = self.get_item_by_id(organization, item_id)
        if not item:
            return False

        return self.repository.delete(item)
```

### **4. Repository Template**

```python
# api/repositories/your_repository.py
from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session

from .base import SQLRepository
from ..models.your_model import YourModel

class YourRepository(SQLRepository[YourModel]):
    def __init__(self, db: Session):
        super().__init__(db, YourModel)

    def get_by_organization(
        self,
        org_id: UUID,
        limit: int = 50,
        offset: int = 0
    ) -> List[YourModel]:
        """Get all items for organization."""
        return self.db.query(YourModel)\
            .filter(YourModel.organization_id == org_id)\
            .filter(YourModel.is_active == True)\
            .offset(offset)\
            .limit(limit)\
            .all()

    def get_by_id_and_organization(self, item_id: UUID, org_id: UUID) -> Optional[YourModel]:
        """Get item by ID within organization scope."""
        return self.db.query(YourModel)\
            .filter(YourModel.id == item_id)\
            .filter(YourModel.organization_id == org_id)\
            .first()

    def search_by_name(self, org_id: UUID, name_query: str) -> List[YourModel]:
        """Search items by name within organization."""
        return self.db.query(YourModel)\
            .filter(YourModel.organization_id == org_id)\
            .filter(YourModel.name.ilike(f"%{name_query}%"))\
            .all()
```

### **5. Pydantic Schemas Template**

```python
# api/schemas/your_schema.py
from pydantic import BaseModel, Field, validator
from uuid import UUID
from datetime import datetime
from typing import Optional

class YourBaseSchema(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)

class YourCreateSchema(YourBaseSchema):
    #  Don't include organization_id - it's set automatically
    pass

class YourUpdateSchema(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    is_active: Optional[bool] = None

class YourResponseSchema(YourBaseSchema):
    id: UUID
    organization_id: UUID  #  Include in response for verification
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# List response
class YourListResponseSchema(BaseModel):
    items: List[YourResponseSchema]
    total: int
    limit: int
    offset: int
```

### **6. Migration Template**

```sql
-- migrations/XXX_add_your_feature.sql

-- Create main table
CREATE TABLE your_table (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- REQUIRED: Organization index for performance
CREATE INDEX ix_your_table_organization_id ON your_table(organization_id);

-- Additional indexes for common queries
CREATE INDEX ix_your_table_organization_name ON your_table(organization_id, name);
CREATE INDEX ix_your_table_organization_active ON your_table(organization_id, is_active);

--  Add to schema_versions for tracking
INSERT INTO schema_versions (version, description)
VALUES (XXX, 'Add your feature tables');
```

---

## Frontend Templates

### **1. Next.js Page Template**

```typescript
// app/[locale]/admin/your-feature/page.tsx
import { YourFeatureContainer } from '@/containers/your-feature/YourFeatureContainer'

interface PageProps {
  params: {
    locale: string
  }
}

export default function YourFeaturePage({ params }: PageProps) {
  return <YourFeatureContainer locale={params.locale} />
}
```

### **2. API Service Template**

```typescript
// services/your-feature.ts
import { BaseService } from "./base"

export interface CreateYourItem {
  name: string
  description?: string
}

export interface UpdateYourItem extends Partial<CreateYourItem> {
  is_active?: boolean
}

export interface YourItem {
  id: string
  organization_id: string
  name: string
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

class YourFeatureService extends BaseService {
  async getItems(limit = 50, offset = 0): Promise<YourItem[]> {
    return this.get(`/your-feature/items?limit=${limit}&offset=${offset}`)
  }

  async getItem(itemId: string): Promise<YourItem> {
    return this.get(`/your-feature/items/${itemId}`)
  }

  async createItem(data: CreateYourItem): Promise<YourItem> {
    return this.post("/your-feature/items", data)
  }

  async updateItem(itemId: string, data: UpdateYourItem): Promise<YourItem> {
    return this.put(`/your-feature/items/${itemId}`, data)
  }

  async deleteItem(itemId: string): Promise<void> {
    return this.delete(`/your-feature/items/${itemId}`)
  }
}

export const yourFeatureService = new YourFeatureService()
```

### **3. Zustand Store Template**

```typescript
// stores/your-feature-store.ts
import { create } from "zustand"
import { devtools } from "zustand/middleware"
import {
  yourFeatureService,
  YourItem,
  CreateYourItem,
  UpdateYourItem,
} from "@/services/your-feature"

interface YourFeatureState {
  // State
  items: YourItem[]
  currentItem: YourItem | null
  loading: boolean
  error: string | null
  total: number

  // Actions
  fetchItems: (orgId: string, limit?: number, offset?: number) => Promise<void>
  fetchItem: (orgId: string, itemId: string) => Promise<void>
  createItem: (orgId: string, data: CreateYourItem) => Promise<YourItem>
  updateItem: (
    orgId: string,
    itemId: string,
    data: UpdateYourItem
  ) => Promise<YourItem>
  deleteItem: (orgId: string, itemId: string) => Promise<void>
  clearError: () => void
  reset: () => void
}

export const useYourFeatureStore = create<YourFeatureState>()(
  devtools(
    (set, get) => ({
      // Initial state
      items: [],
      currentItem: null,
      loading: false,
      error: null,
      total: 0,

      // Actions
      fetchItems: async (orgId: string, limit = 50, offset = 0) => {
        set({ loading: true, error: null })
        try {
          const items = await yourFeatureService.getItems(limit, offset)
          set({ items, loading: false, total: items.length })
        } catch (error) {
          set({ error: error.message, loading: false })
        }
      },

      createItem: async (orgId: string, data: CreateYourItem) => {
        set({ loading: true, error: null })
        try {
          const newItem = await yourFeatureService.createItem(data)
          set(state => ({
            items: [newItem, ...state.items],
            loading: false,
          }))
          return newItem
        } catch (error) {
          set({ error: error.message, loading: false })
          throw error
        }
      },

      updateItem: async (
        orgId: string,
        itemId: string,
        data: UpdateYourItem
      ) => {
        set({ loading: true, error: null })
        try {
          const updatedItem = await yourFeatureService.updateItem(itemId, data)
          set(state => ({
            items: state.items.map(item =>
              item.id === itemId ? updatedItem : item
            ),
            currentItem:
              state.currentItem?.id === itemId
                ? updatedItem
                : state.currentItem,
            loading: false,
          }))
          return updatedItem
        } catch (error) {
          set({ error: error.message, loading: false })
          throw error
        }
      },

      deleteItem: async (orgId: string, itemId: string) => {
        set({ loading: true, error: null })
        try {
          await yourFeatureService.deleteItem(itemId)
          set(state => ({
            items: state.items.filter(item => item.id !== itemId),
            currentItem:
              state.currentItem?.id === itemId ? null : state.currentItem,
            loading: false,
          }))
        } catch (error) {
          set({ error: error.message, loading: false })
          throw error
        }
      },

      clearError: () => set({ error: null }),
      reset: () =>
        set({
          items: [],
          currentItem: null,
          loading: false,
          error: null,
          total: 0,
        }),
    }),
    {
      name: "your-feature-store",
    }
  )
)
```

### **4. Container Component Template**

```typescript
// containers/your-feature/YourFeatureContainer.tsx
'use client'

import { useEffect } from 'react'
import { useOrgContext } from '@/hooks/use-org-context'
import { useYourFeatureStore } from '@/stores/your-feature-store'
import { YourFeatureList } from '@/components/your-feature/YourFeatureList'
import { YourFeatureForm } from '@/components/your-feature/YourFeatureForm'

interface YourFeatureContainerProps {
  locale: string
}

export function YourFeatureContainer({ locale }: YourFeatureContainerProps) {
  const { organization, validateOrgAccess } = useOrgContext()
  const {
    items,
    loading,
    error,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    clearError
  } = useYourFeatureStore()

  useEffect(() => {
    validateOrgAccess()
    fetchItems(organization.id)
  }, [organization.id, fetchItems, validateOrgAccess])

  const handleCreate = async (data: CreateYourItem) => {
    try {
      await createItem(organization.id, data)
    } catch (error) {
      console.error('Failed to create item:', error)
    }
  }

  const handleUpdate = async (itemId: string, data: UpdateYourItem) => {
    try {
      await updateItem(organization.id, itemId, data)
    } catch (error) {
      console.error('Failed to update item:', error)
    }
  }

  const handleDelete = async (itemId: string) => {
    try {
      await deleteItem(organization.id, itemId)
    } catch (error) {
      console.error('Failed to delete item:', error)
    }
  }

  return (
    <div className="space-y-6">
      <YourFeatureForm onSubmit={handleCreate} />
      <YourFeatureList
        items={items}
        loading={loading}
        error={error}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onClearError={clearError}
      />
    </div>
  )
}
```

### **5. Custom Hook Template**

```typescript
// hooks/use-your-feature.ts
import { useCallback } from "react"
import { useOrgContext } from "./use-org-context"
import { useYourFeatureStore } from "@/stores/your-feature-store"

export function useYourFeature() {
  const { organization } = useOrgContext()
  const store = useYourFeatureStore()

  const orgId = organization.id

  // Initialize on mount
  useEffect(() => {
    if (orgId) {
      store.fetchItems(orgId)
    }
  }, [orgId, store])

  return {
    // State
    items: store.items,
    currentItem: store.currentItem,
    loading: store.loading,
    error: store.error,
    total: store.total,

    // Actions with orgId bound
    createItem: (data: CreateYourItem) => store.createItem(orgId, data),
    updateItem: (itemId: string, data: UpdateYourItem) =>
      store.updateItem(orgId, itemId, data),
    deleteItem: (itemId: string) => store.deleteItem(orgId, itemId),
    refreshItems: () => store.fetchItems(orgId),
    loadItem: (itemId: string) => store.fetchItem(orgId, itemId),

    // Utilities
    clearError: store.clearError,
  }
}
```

---

## Quick Commands

### **Add to public routes (no auth required):**

```python
# api/core/organization_middleware.py
self.public_routes = [
    # ... existing routes ...
    "/your-feature/public-endpoint",
]
```

### **Add to auth-only routes (auth required, no org):**

```python
# api/core/organization_middleware.py
self.auth_only_routes = [
    # ... existing routes ...
    "/your-feature/user-settings",
]
```

### **Test organization isolation:**

```python
def test_organization_isolation(authenticated_user, other_organization):
    headers = {
        'Authorization': f"Bearer {authenticated_user['tokens']['access_token']}",
        'X-Org-Id': other_organization['id']  # Wrong org!
    }
    response = client.get('/your-feature/items', headers=headers)
    assert response.status_code == 403
```

---

## Common Mistakes to Avoid

### **Multi-Tenancy Mistakes**

1. **Missing organization_id in models**
2. **Not using get_current_organization dependency**
3. **Forgetting X-Org-Id header in API calls**
4. **Missing organization indexes in database**
5. **Not testing cross-organization access**
6. **Using URL parameters instead of headers for org_id**
7. **Trusting client-provided organization IDs**

### **SAAS Mode Mistakes**

8. **Missing NEXT_PUBLIC_SAAS_MODE in frontend** - Menu Teams won't show in B2B
9. **Mode mismatch between backend and frontend** - Inconsistent behavior
10. **Not using useSaasMode hook** - Components won't adapt to mode
11. **Hardcoding B2B/B2C behavior** - Should use mode detection
12. **Missing conditional test execution** - Tests fail in wrong mode
13. **Not validating SAAS_MODE in backend** - Invalid configurations
14. **Forgetting to restart containers** - Environment changes don't apply

---

## Quick Development Checklist

When creating a new multi-tenant feature:

### Backend

- [ ] **Model**: Add `organization_id` FK + indexes
- [ ] **Repository**: Filter by `organization_id`
- [ ] **Service**: Use `get_current_organization` dependency
- [ ] **Router**: Include organization validation
- [ ] **Schema**: Exclude `organization_id` from create, include in response
- [ ] **Migration**: Add version tracking
- [ ] **SAAS Mode**: Consider B2B vs B2C behavior differences

### Frontend

- [ ] **Page**: Use `/[locale]/admin/` structure
- [ ] **Container**: Use `useOrgContext()` hook
- [ ] **Service**: Extend `BaseService` (auto X-Org-Id)
- [ ] **Store**: Include `orgId` in all actions
- [ ] **Components**: Pass org-aware props
- [ ] **Tests**: Verify organization isolation
- [ ] **SAAS Mode**: Use `useSaasMode()` hook for conditional behavior

### Security

- [ ] **Cross-org access**: Test with different organization
- [ ] **Header validation**: Verify X-Org-Id requirement
- [ ] **Data isolation**: Confirm no data leaks
- [ ] **Authentication**: Ensure proper auth flow

### SAAS Mode Configuration

- [ ] **Environment**: Set both `SAAS_MODE` and `NEXT_PUBLIC_SAAS_MODE`
- [ ] **Validation**: Backend validates SAAS_MODE (B2B|B2C only)
- [ ] **Registration**: Mode-specific organization naming
- [ ] **Navigation**: Conditional menu items (Teams in B2B only)
- [ ] **Dashboard**: Mode-specific titles and info display
- [ ] **Testing**: Use `@pytest.mark.skipif` for mode-specific tests
- [ ] **Verification**: Run `./check-saas-mode.sh` to verify configuration

---

## Quick Reference Commands

### **SAAS Mode Verification**

```bash
# Check current configuration
./check-saas-mode.sh

# Switch to B2B mode
# 1. Update docker-compose.yml:
#    SAAS_MODE: "B2B"
#    NEXT_PUBLIC_SAAS_MODE: 'B2B'
# 2. Restart containers:
make dev-stop && make dev-start

# Switch to B2C mode
# 1. Update docker-compose.yml:
#    SAAS_MODE: "B2C"
#    NEXT_PUBLIC_SAAS_MODE: 'B2C'
# 2. Restart containers:
make dev-stop && make dev-start
```

### **Testing Mode-Specific Features**

```bash
# Test B2B-specific features
SAAS_MODE=B2B npm run test:e2e:api

# Test B2C-specific features
SAAS_MODE=B2C npm run test:e2e:api

# Test frontend mode switching
npm run test -- useSaasMode.test.ts
```

### **Troubleshooting**

```bash
# Debug mode detection
docker exec saas-api-dev python -c "from api.core.config import settings; print(f'Mode: {settings.SAAS_MODE}, B2B: {settings.is_b2b_mode}')"

# Debug frontend mode
docker exec saas-frontend-dev node -e "console.log('Mode:', process.env.NEXT_PUBLIC_SAAS_MODE)"

# Check navigation behavior
# B2B: Teams menu visible, "Team Dashboard", Organization info shown
# B2C: Teams menu hidden, "My Dashboard", Organization info hidden
```

---

**Remember: Security by default - every new route is protected unless explicitly made public!**

**Important: SAAS Mode affects user experience - always test both B2B and B2C flows!**
