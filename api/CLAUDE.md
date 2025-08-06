# FastAPI Backend Template - Development Guide

**IMPORTANTE:** Seja EXTREMAMENTE HONESTO SEMPRE em relação à situação do projeto. Nunca inicie algo antes de ter 95% de certeza. Não faça nenhuma alteração antes que você tenha 95% de confiança sobre o que deve ser construído. Faça perguntas até ter certeza absoluta.

Complete guidance for extending the FastAPI backend template for your SaaS application.

> **📖 Prerequisites:** Read [Template Guide](../CLAUDE.md) first for template overview  
> **🎯 Template Type:** SaaS Starter Template - Foundation for your backend business logic  
> **🏗️ Architecture:** Clean Architecture with Repository Pattern + Multi-Tenant DDD (ready to extend)  
> **🔒 Security:** Header-based multi-tenancy with strict organization isolation (built-in template foundation)

## 🚨 **TEMPLATE CUSTOMIZATION PRINCIPLES - EXTREMELY IMPORTANT**

### **KISS, YAGNI, DRY - NEVER BREAK WHEN EXTENDING TEMPLATE**

- **KISS (Keep It Simple, Stupid)**: **ALWAYS** choose the simplest solution that works for YOUR SaaS
- **YAGNI (You Aren't Gonna Need It)**: **NEVER** implement features "for the future" - focus on your MVP
- **DRY (Don't Repeat Yourself)**: **ALWAYS** reuse template patterns before creating new ones
- **⚠️ CRITICAL**: Breaking these principles when customizing the template is considered critical failure

## 🎯 Template Backend Foundation

**Template Foundation:** Complete multi-tenant organization-centric API (ready to extend)  
**Language:** Python 3.11+ with strict type hints (your custom code follows same standards)  
**Framework:** FastAPI with Pydantic validation (template provides patterns to copy)  
**Multi-tenancy:** Header-based (`X-Org-Id`) with strict isolation (your features inherit this automatically)

### Template Clean Architecture Pattern (Foundation You Extend)

```
Your Router → Your Service → Template Repository → Template Model
     ↓            ↓              ↓                    ↓
Your Custom   Your Business   Template Data      Template Schema
Endpoints     Logic          Access Patterns    + Your Tables
```

## 🏗️ Template Project Structure (Your Foundation)

```
api/
├── core/                    # Template infrastructure (DO NOT MODIFY)
│   ├── config.py           # Template settings (extend for your config)
│   ├── database.py         # Template SQLAlchemy setup (add your connection logic)
│   ├── deps.py             # Template dependencies (use in your endpoints)
│   ├── security.py         # Template JWT/auth (extend for your auth needs)
│   ├── middleware.py       # Template security headers (add your middleware)
│   ├── organization_middleware.py # Template multi-tenant validation (CORE - DO NOT CHANGE)
│   ├── exceptions.py       # Template exceptions (add your custom exceptions)
│   └── logging_config.py   # Template logging (extend for your logging needs)
├── models/                  # Template + Your SQLAlchemy models
│   ├── user.py             # Template user model (foundation)
│   ├── organization.py     # Template organization model (foundation)
│   ├── organization_invite.py # Template invitation system
│   ├── billing.py          # Template billing (extend for your billing logic)
│   └── your_models.py      # ADD YOUR BUSINESS MODELS HERE
├── schemas/                 # Template + Your Pydantic schemas
├── repositories/            # Template + Your data access layer
├── services/                # Template + Your business logic layer
├── routers/                 # Template + Your FastAPI route handlers
└── main.py                  # Template FastAPI app (register your routers here)
```

## 🔒 Template Multi-Tenancy Foundation (Your Features Inherit This)

### Template Dependencies (Use These in Your Endpoints)

```python
# ALWAYS use these template dependencies in YOUR custom routers
from ..core.deps import (
    get_current_active_user,  # Template authenticated user
    get_current_organization, # Template organization from X-Org-Id header
    get_db                    # Template database session
)
```

### Template Multi-Tenant Endpoint Pattern (Copy This for Your Features)

```python
# api/routers/your_custom_feature.py
@router.get("/your-business-items")
async def get_your_items(
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db)
):
    # ✅ Your queries automatically inherit org-scoping from template
    return your_service.get_organization_your_items(organization.id)
```

### Template Model Pattern (Copy This for YOUR Business Models)

```python
# api/models/your_business_model.py
class YourBusinessModel(Base):
    __tablename__ = "your_business_table"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    # 🔴 REQUIRED: Template organization FK pattern (NEVER SKIP THIS)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)

    # YOUR business fields here
    your_business_field = Column(String(255), nullable=False)

    # 🔴 REQUIRED: Template index pattern (COPY THIS EXACTLY)
    __table_args__ = (
        Index('ix_your_business_table_organization_id', 'organization_id'),
    )
```

### Template Repository Pattern (Copy This for YOUR Data Access)

```python
# api/repositories/your_business_repository.py
class YourBusinessRepository(SQLRepository[YourBusinessModel]):
    def get_by_organization(self, org_id: UUID) -> List[YourBusinessModel]:
        return self.db.query(YourBusinessModel).filter(
            YourBusinessModel.organization_id == org_id
        ).all()
```

### Template Service Pattern (Copy This for YOUR Business Logic)

```python
# api/services/your_business_service.py
class YourBusinessService:
    def __init__(self, db: Session):
        self.db = db
        self.repository = YourBusinessRepository(db)

    def create_your_item(self, organization: Organization, data: YourBusinessCreateSchema):
        # ✅ Template organization context automatically passed to your business logic
        return self.repository.create_for_organization(
            org_id=organization.id,
            data=data.dict()
        )
```

## ⚠️ Template Customization Critical Rules

### ALWAYS Do When Extending Template

- Use template `get_current_organization` dependency in YOUR endpoints
- Include template `organization_id` pattern in ALL your business models
- Filter ALL your queries by `organization_id` (copy template patterns)
- Use template Repository pattern for YOUR data access
- Validate organization ownership before YOUR operations (template provides this)

### NEVER Do When Customizing Template

- Query without organization filtering: `db.query(YourModel).all()` ❌
- Skip template organization validation in YOUR endpoints
- Trust client-provided `org_id` without template validation
- Create YOUR endpoints without template organization context

## 🧪 Testing Your Template Customizations

### Template Organization Isolation Test Pattern (Copy This for YOUR Features)

```python
def test_your_feature_organization_isolation(authenticated_user, other_organization):
    """Test that YOUR feature cannot access other organization's data."""
    headers = {
        'Authorization': f"Bearer {authenticated_user['tokens']['access_token']}",
        'X-Org-Id': other_organization['id']  # Different org!
    }

    response = client.get('/your-business-feature/items', headers=headers)

    # Template ensures this returns 403 (organization mismatch)
    assert response.status_code == 403
    assert "organization mismatch" in response.json()['detail']
```

## 📝 Template Code Style Guide (Follow When Extending)

> **📚 Template Style Standards**: See [Naming Conventions Guide](../docs/NAMING-CONVENTIONS-GUIDE.md) for template naming patterns and [Performance & Error Patterns](../docs/PERFORMANCE-ERROR-PATTERNS.md) for template optimization guidelines.

### Template Backend Standards (Follow for YOUR Files)

**Template File Organization (Copy This Pattern)**

```python
# Template file naming: snake_case (follow for YOUR files)
your_business_service.py
your_business_repository.py
your_webhook_handler.py

# Template directory structure (add YOUR files here)
models/          # Template models + YOUR business models
schemas/         # Template schemas + YOUR business schemas
services/        # Template services + YOUR business logic
repositories/    # Template repositories + YOUR data access
routers/         # Template routers + YOUR API endpoints
```

**Import Organization**

```python
# 1. Standard library
import logging
from datetime import datetime
from typing import List, Optional
from uuid import UUID

# 2. Third-party
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

# 3. Local imports (relative)
from ..core.database import get_db
from ..models.user import User
from ..schemas.organization import OrganizationResponse
```

**Class & Function Naming**

```python
# Classes: PascalCase
class OrganizationService:
class UserRepository:

# Functions and variables: snake_case
async def create_organization(org_data: OrganizationCreate):
user_id = current_user.id

# Constants: UPPER_CASE
MAX_ORGANIZATION_MEMBERS = 100
DEFAULT_PAGE_SIZE = 20

# Private methods: _snake_case
def _validate_organization_access(self, org_id: UUID):
```

**Docstrings & Type Hints**

```python
# Always include type hints
def get_organization_members(
    org_id: UUID,
    db: Session,
    skip: int = 0,
    limit: int = 100
) -> List[OrganizationMember]:
    """Get organization members with pagination.

    Args:
        org_id: Organization UUID
        db: Database session
        skip: Number of records to skip
        limit: Maximum records to return

    Returns:
        List of organization members

    Raises:
        HTTPException: If organization not found
    """
    return db.query(OrganizationMember)...
```

**Error Handling Patterns**

```python
# Specific HTTP exceptions
from fastapi import HTTPException, status

# Not found
raise HTTPException(
    status.HTTP_404_NOT_FOUND,
    "Organization not found"
)

# Validation error
raise HTTPException(
    status.HTTP_400_BAD_REQUEST,
    "Invalid organization name format"
)

# Permission denied
raise HTTPException(
    status.HTTP_403_FORBIDDEN,
    "Access denied: organization mismatch"
)
```

**Logging Standards**

```python
import logging
logger = logging.getLogger(__name__)

# Structured logging with context
logger.info(
    "Organization created successfully",
    extra={
        "organization_id": str(org.id),
        "user_id": str(current_user.id),
        "organization_name": org.name,
    }
)

# Error logging with details
logger.error(
    "Failed to create organization",
    extra={
        "user_id": str(current_user.id),
        "error": str(e),
        "org_data": org_data.model_dump(),
    },
    exc_info=True
)
```

**Database Query Patterns**

```python
# Always filter by organization_id
def get_organization_users(self, org_id: UUID) -> List[User]:
    return self.db.query(User)\
        .filter(User.organization_id == org_id)\
        .filter(User.is_active == True)\
        .order_by(User.created_at.desc())\
        .all()

# Use joins efficiently
def get_users_with_memberships(self, org_id: UUID) -> List[User]:
    return self.db.query(User)\
        .join(OrganizationMember)\
        .filter(OrganizationMember.organization_id == org_id)\
        .options(joinedload(User.organization_memberships))\
        .all()
```

**Performance Guidelines**

```python
# Index organization queries
__table_args__ = (
    Index('ix_users_org_id', 'organization_id'),
    Index('ix_users_org_email', 'organization_id', 'email'),
)

# Use pagination
def get_paginated_results(
    self,
    org_id: UUID,
    skip: int = 0,
    limit: int = 20
) -> List[Model]:
    return self.db.query(Model)\
        .filter(Model.organization_id == org_id)\
        .offset(skip)\
        .limit(limit)\
        .all()

# Avoid N+1 queries
from sqlalchemy.orm import joinedload
users = self.db.query(User)\
    .options(joinedload(User.organization))\
    .filter(User.organization_id == org_id)\
    .all()
```

## 🛠️ Development Commands

```bash
# Backend development
cd api && uvicorn main:app --reload  # Development server
python -m pytest                    # Run tests
black . && isort .                   # Format code
flake8 && mypy .                     # Lint & type check
bandit -r .                          # Security scan
```

## 📚 Key References

- **[Main CLAUDE.md](../CLAUDE.md)** - Complete system overview and rules
- **[Multi-Tenancy Guide](../docs/MULTI-TENANCY-GUIDE.md)** - Complete guide with copy/paste templates

## 🚨 Common Issues

### Organization Middleware Not Working

**Problem**: 403 errors on protected endpoints  
**Solution**: Ensure X-Org-Id header is sent and matches JWT org_id

### Cross-Organization Data Leak

**Problem**: Users seeing other organization's data  
**Solution**: Always filter queries by `organization_id`

### Migration Issues

**Problem**: "Database needs updates" stuck  
**Solution**: Ensure migrations end with version tracking:

```sql
INSERT INTO schema_versions (version, description) VALUES (X, 'Description');
```

---

**🔒 Remember:** Every operation must be organization-scoped. Multi-tenancy is not optional—it's existential for data security.
