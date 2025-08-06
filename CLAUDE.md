# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Loved CRM** is a complete multi-tenant CRM system designed specifically for Brazilian digital agencies. It features a modern full-stack architecture with Next.js 14 frontend, FastAPI backend, and comprehensive multi-tenancy support.

### Key Features
- 📊 **Fixed Kanban Pipeline**: Lead → Contact → Proposal → Negotiation → Closed
- 🔗 **Unified Communication**: WhatsApp Business, VoIP, Email integration
- 🤖 **AI Features**: Automatic conversation summaries, sentiment analysis
- 🏢 **Multi-Tenancy**: Complete organization-scoped data isolation
- 🌍 **i18n Support**: Portuguese, English, Spanish

## Fundamental Rule

### A Regra Fundamental:

"Antes de iniciar uma nova task, SEMPRE pergunte: 'A task anterior está 100% implementada?'"

🚨 Como Funciona:

PASSO 1: Quando você me pedir para fazer algo novo
PASSO 2: Eu sempre perguntarei: "A task anterior está 100% implementada?"
PASSO 3: Se a resposta for NÃO → Paro e completo a anterior primeiro
PASSO 4: Se a resposta for SIM → Prossigo com a nova task

🛡️ Definição de "100% Implementada":

- ✅ Todos os botões funcionam (têm handlers)
- ✅ Todos os formulários submetem (têm validação + submit)
- ✅ Todas as modais abrem/fecham
- ✅ Todas as integrações funcionam de verdade (não mocks)
- ✅ Usuário consegue completar todos os fluxos

🎯 Resultado:

- NUNCA mais tasks esquecidas
- NUNCA mais acúmulo de funcionalidades incompletas
- SEMPRE validação completa antes de prosseguir

## Architecture Overview

### Technology Stack

**Frontend:**
- Next.js 14 with App Router
- TypeScript with strict configuration
- shadcn/ui + Tailwind CSS (CRM-themed colors)
- Zustand for state management
- TanStack Query for server state
- next-intl for internationalization

**Backend:**
- FastAPI with Python 3.11+
- SQLAlchemy 2.0 with PostgreSQL
- Pydantic for validation
- JWT authentication with organization context
- Redis for caching and sessions

**Multi-Tenancy:**
- Header-based isolation (`X-Org-Id`)
- Organization middleware validation
- All queries filtered by `organization_id`
- Automatic organization creation on user registration

**Infrastructure:**
- Docker & Docker Compose for development
- Railway for production deployment
- PostgreSQL 16 with SSL
- Redis for caching

### Project Structure

```
lovedcrm/
├── app/                     # Next.js 14 App Router
│   ├── [locale]/           # Internationalized routes
│   │   ├── admin/          # Admin dashboard (multi-tenant)
│   │   │   ├── crm/        # CRM features
│   │   │   ├── settings/   # Organization settings
│   │   │   ├── team/       # Team management
│   │   │   └── billing/    # Subscription management
│   │   ├── auth/           # Authentication pages
│   │   └── landing/        # Marketing landing page
│   ├── api/                # API routes
│   └── containers/         # Page-level containers
├── components/              # React components
│   ├── ui/                 # shadcn/ui components
│   ├── crm/                # CRM-specific components
│   ├── admin/              # Admin dashboard components
│   ├── auth/               # Authentication components
│   └── settings/           # Settings components
├── api/                    # FastAPI backend
│   ├── core/               # Core infrastructure
│   ├── models/             # SQLAlchemy models
│   ├── schemas/            # Pydantic schemas
│   ├── repositories/       # Data access layer
│   ├── services/           # Business logic
│   ├── routers/            # API endpoints
│   └── main.py             # FastAPI application
├── migrations/             # Database migrations
├── tests/                  # Comprehensive test suite
│   ├── frontend/           # Frontend unit tests
│   ├── e2e/                # End-to-end tests
│   └── unit/               # Backend unit tests
└── docs/                   # Documentation
```

## Development Commands

### Quick Start
```bash
# Complete setup
make setup

# Start development servers
npm run dev
# Frontend: http://localhost:3000
# Backend: http://localhost:8000/docs
```

### Database Management
```bash
# Start databases
make db-up

# Apply migrations
cd migrations && ./migrate apply

# Reset database
cd migrations && ./migrate init

# Production database access
make connect-db-prod
make db-prod-migration-apply
```

### Testing Commands

**Frontend Testing:**
```bash
npm run test:frontend          # Unit tests
npm run test:frontend:watch    # Watch mode
npm run test:frontend:coverage # With coverage
npm run test:ui               # Visual test runner
```

**Backend Testing:**
```bash
npm run test:backend          # Python unit tests
npm run test:e2e:api         # API E2E tests
make test-backend-unit       # Detailed backend tests
```

**Full Test Suite:**
```bash
npm run test:all             # All tests
make test                    # All tests via Makefile
```

**E2E Testing Environment:**
```bash
make test-start              # Start test environment
make test-run                # Run E2E tests
make test-stop               # Stop test environment
make test-hot-migrate        # Hot schema updates (2s vs 45s)
```

### Code Quality
```bash
# Linting and formatting
npm run lint                 # All linters
npm run fix                  # Auto-fix issues
npm run typecheck           # TypeScript check

# Backend quality
make backend-lint           # Python linters
make backend-security       # Security scan
```

### Docker Development
```bash
# Complete Docker environment
make dev-start              # Start in background
make dev-logs               # View logs
make dev-stop               # Stop services
```

## Multi-Tenancy Implementation

### Core Patterns

**1. Organization Context (All endpoints must use this):**
```typescript
// Frontend: Automatic X-Org-Id header
import { useOrgContext } from '@/hooks/use-org-context'

const { organization } = useOrgContext()
```

```python
# Backend: Organization dependency
from ..core.deps import get_current_organization

@router.get("/items")
async def get_items(
    organization: Organization = Depends(get_current_organization)
):
    # All queries automatically org-scoped
```

**2. Model Pattern (All business models must include):**
```python
class YourModel(Base):
    __tablename__ = "your_table"
    
    id = Column(UUID(as_uuid=True), primary_key=True)
    # REQUIRED: Organization FK
    organization_id = Column(UUID, ForeignKey("organizations.id"), nullable=False)
    
    # REQUIRED: Index for performance
    __table_args__ = (
        Index('ix_your_table_org_id', 'organization_id'),
    )
```

**3. Repository Pattern (All data access must filter by org):**
```python
class YourRepository(SQLRepository):
    def get_by_organization(self, org_id: UUID):
        return self.db.query(YourModel).filter(
            YourModel.organization_id == org_id
        ).all()
```

## CRM-Specific Architecture

### Pipeline System
- **Fixed 5-stage pipeline**: Lead → Contact → Proposal → Negotiation → Closed
- **Drag & drop interface**: `components/crm/pipeline-kanban.tsx`
- **Pipeline stages**: `components/crm/pipeline-stage.tsx`
- **Lead management**: `api/routers/crm_leads.py`

### Communication System
- **Timeline component**: `components/crm/timeline.tsx`
- **WhatsApp integration**: Ready for WhatsApp Business API
- **VoIP system**: Click-to-call functionality
- **Communication models**: `api/models/crm_communication.py`

### AI Features
- **AI summaries**: `components/crm/ai-summary.tsx`
- **Sentiment analysis**: Backend service integration
- **Conversation insights**: Automatic lead scoring

## Key Development Patterns

### Frontend Patterns

**Container-Component Pattern:**
```typescript
// containers/crm/CRMContainer.tsx
export function CRMContainer() {
  const { data, isLoading } = useCRMData()
  return <CRMView data={data} loading={isLoading} />
}

// components/crm/CRMView.tsx
export function CRMView({ data, loading }: Props) {
  // Pure presentation component
}
```

**Service Layer Pattern:**
```typescript
// services/crm-leads.ts
class CRMLeadsService extends BaseService {
  async getLeads(filters: LeadFilters) {
    // Automatic X-Org-Id header injection
    return this.get('/crm/leads', { params: filters })
  }
}
```

**State Management:**
```typescript
// stores/crm.ts
interface CRMStore {
  leads: Lead[]
  selectedLead: Lead | null
  pipelineFilters: PipelineFilters
}

export const useCRMStore = create<CRMStore>(...)
```

### Backend Patterns

**Clean Architecture Layers:**
```python
# 1. Router (HTTP layer)
@router.post("/leads")
async def create_lead(
    lead_data: LeadCreate,
    organization: Organization = Depends(get_current_organization),
    service: CRMLeadService = Depends()
):
    return await service.create_lead(organization.id, lead_data)

# 2. Service (Business logic)
class CRMLeadService:
    async def create_lead(self, org_id: UUID, data: LeadCreate):
        # Business rules and validation
        return await self.repository.create(org_id, data)

# 3. Repository (Data access)
class CRMLeadRepository:
    async def create(self, org_id: UUID, data: dict):
        # Database operations with org filtering
        return self.db.query(...).filter(org_id=org_id)
```

## Testing Guidelines

### Frontend Testing
- **Unit tests**: Component behavior and logic
- **Integration tests**: Service interactions
- **E2E tests**: Complete user workflows
- **Location**: `tests/frontend/`

### Backend Testing
- **Unit tests**: Service and repository logic
- **API tests**: Endpoint behavior
- **Multi-tenancy tests**: Data isolation verification
- **Location**: `tests/unit/` and `tests/e2e/api/`

### Test Organization Isolation
```python
def test_crm_leads_organization_isolation(client, auth_headers, other_org):
    """Verify leads cannot be accessed across organizations."""
    response = client.get(
        "/crm/leads",
        headers={**auth_headers, "X-Org-Id": other_org.id}
    )
    assert response.status_code == 403
```

## Configuration & Environment

### Required Environment Variables
```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5433/crm_db
REDIS_URL=redis://localhost:6379

# Security
SECRET_KEY=your-secret-key-min-32-chars
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Multi-tenancy
ENFORCE_ORGANIZATION_CONTEXT=true
AUTO_CREATE_ORGANIZATION=true

# Features
SAAS_MODE=B2B  # or B2C
ENABLE_BILLING=true
ENABLE_AI_FEATURES=true
```

### Development Tools Configuration
- **TypeScript**: Strict mode enabled in `tsconfig.json`
- **ESLint**: Next.js + TypeScript + security rules
- **Tailwind**: CRM-themed color system with pipeline/communication colors
- **Prettier**: Code formatting consistency
- **Vitest**: Frontend testing framework
- **Playwright**: E2E testing framework

## Production Deployment

**Railway Deployment:**
- **Frontend**: Next.js on Railway
- **Backend**: FastAPI on Railway
- **Database**: PostgreSQL with SSL
- **Redis**: Redis instance for caching
- **Domain**: Custom domain with SSL

**Health Monitoring:**
```bash
# Production health checks
curl https://backend-production-fd50.up.railway.app/health
curl https://frontend-production-c57a.up.railway.app

# Database management
make db-prod-status
make db-prod-migration-apply
```

## Common Development Tasks

### Adding New CRM Features
1. Create model in `api/models/` with `organization_id` FK
2. Add migration in `migrations/`
3. Create repository with org filtering
4. Implement service with business logic
5. Add API endpoints with org validation
6. Create frontend components
7. Add to admin routes with proper auth
8. Write tests for multi-tenancy isolation

### Debugging Multi-Tenancy Issues
- Check `X-Org-Id` header in requests
- Verify organization middleware is applied
- Ensure all queries include `organization_id` filter
- Test cross-organization access restrictions

### Performance Optimization
- Add database indexes for org-scoped queries
- Use pagination for large datasets
- Implement proper caching strategies
- Monitor query performance with org filtering

This architecture ensures complete data isolation between organizations while providing a rich CRM experience for digital agencies.