# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Loved CRM** is a complete multi-tenant CRM system designed specifically for Brazilian digital agencies. It features a modern full-stack architecture with Next.js 14 frontend, FastAPI backend, and comprehensive multi-tenancy support.

### Current Branch Status
- **Branch**: `feature/story1-2` (Pipeline Kanban Complete implementation)
- **Base Branch**: `main` (use for PRs)
- **Recent Focus**: WebSocket real-time collaboration and @dnd-kit drag & drop pipeline

### Critical Dependencies & Versions
- **Node.js**: >=18.0.0 (engines requirement)
- **Python**: 3.11+ (FastAPI backend)
- **Next.js**: 14.0.0 with App Router
- **FastAPI**: 0.111.1 with SQLAlchemy 2.0
- **Database**: PostgreSQL 16 with Redis caching
- **UI Framework**: shadcn/ui + Tailwind CSS 3.4.15
- **State Management**: Zustand + TanStack Query 5.82.0
- **Drag & Drop**: @dnd-kit/core (Pipeline Kanban)
- **Charts**: Recharts 2.15.4 (Pipeline metrics)

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
# Complete setup (recommended for first time)
make setup

# Start development servers
npm run dev
# Frontend: http://localhost:3000
# Backend: http://localhost:8000/docs

# Alternative: Docker development
make dev-start              # Start in background
make dev-logs               # View logs
make dev-stop               # Stop services
```

### Single Test Execution

```bash
# Run specific test files
npm run test:frontend tests/frontend/components/ui/button.test.tsx
python3 -m pytest tests/unit/test_auth.py -v
python3 -m pytest tests/e2e/api/test_crm_leads.py::test_create_lead -v

# Run tests with specific patterns
python3 -m pytest -k "test_organization" -v
npm run test:frontend -- --run --reporter=verbose components
```

### Database Management

```bash
# Start databases
make db-up

# Apply migrations
cd migrations && ./migrate apply

# Reset database (WARNING: deletes all data)
cd migrations && ./migrate init

# Check migration status
cd migrations && ./migrate status

# Production database access
make connect-db-prod                  # Interactive PostgreSQL connection
make db-prod-migration-apply         # Apply migrations to production
make db-prod-migration-status        # Check production migration status
make check-db-prod                   # Complete health check
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
make test-start              # Start complete E2E test environment
make test-run                # Run all E2E tests
make test-stop               # Stop and cleanup test environment
make test-verify             # Verify test environment health
make test-rebuild            # Rebuild test API image (after dependency changes)

# Hot updates (no restart required)
make test-hot-migrate        # Hot schema updates (2s vs 45s)
make test-hot-data          # Reload test data (3s vs 45s)
make test-hot-reset         # Reset data keeping schema (5s vs 45s)
make test-hot-all           # Apply all hot updates

# Test environment logs
make test-logs              # View all service logs
make test-logs-api          # View API logs only
make test-logs-db           # View database logs only

# Proxy integration testing (NEW)
make test-proxy             # Run all proxy integration tests
make test-proxy-quick       # Quick proxy tests
make test-proxy-auth        # Authentication via proxy
make test-proxy-headers     # Header forwarding validation
make test-proxy-compare     # Proxy vs direct API comparison
```

### Code Quality

```bash
# Linting and formatting
npm run lint                 # All linters (frontend + backend)
npm run fix                  # Auto-fix issues
npm run typecheck           # TypeScript check

# Backend quality
make backend-lint           # Python linters (flake8, mypy, bandit)
make backend-security       # Security scan (bandit)
make backend-fix           # Auto-fix backend formatting

# Security analysis
npm run security            # Python security scan
npm run security:json       # Generate JSON security report
npm run security:html       # Generate HTML security report

# Complete quality check
make lint-all               # All linters (frontend + backend)
make ci-quick              # Quick CI checks (linting + unit tests)
```

### Docker Development

```bash
# Complete Docker environment
make dev-start              # Start in background
make dev-logs               # View logs
make dev-stop               # Stop services
make dev-docker-reset       # Reset environment completely
```

### Development Status & Verification

```bash
make status                 # Show project status
./check-saas-mode.sh        # Verify B2B/B2C configuration
make test-verify            # Verify test environment health
```

## SAAS Mode Configuration

**CRITICAL:** This template supports two distinct operating modes configured via environment variable:

### SAAS_MODE=B2B (Team Collaboration)

- **Use Case**: Digital agencies, team-based CRM, collaborative workspaces
- **Features**: Team management, role-based permissions, shared organization resources
- **Organization**: Shared workspaces with multiple members
- **UI**: Team features, member management, role assignments visible

### SAAS_MODE=B2C (Individual Use)

- **Use Case**: Personal productivity apps, individual dashboards, solo entrepreneurs
- **Features**: Personal data management, individual subscriptions, private workspaces
- **Organization**: Auto-created personal organizations (one per user)
- **UI**: Team features hidden, focus on individual productivity

### Configuration

```bash
# B2B Mode (default)
SAAS_MODE=B2B
ENABLE_TEAM_FEATURES=true
SHOW_MEMBER_MANAGEMENT=true

# B2C Mode
SAAS_MODE=B2C
ENABLE_TEAM_FEATURES=false
SHOW_MEMBER_MANAGEMENT=false
```

**Important Notes:**

- Both modes use organization-scoped data isolation (org_id filtering)
- Auto-organization creation on registration works for both modes
- Header-based multi-tenancy (X-Org-Id) is always enforced
- UI adapts automatically based on SAAS_MODE configuration
- Billing plans can be configured differently for each mode

**⚠️ CRITICAL RULES FOR SAAS_MODE:**

- ✅ **MUST**: Configure SAAS_MODE via environment variable (B2B/B2C)
- ✅ **MUST**: Use organization auto-creation on registration (supports both modes)
- ✅ **MUST**: Adapt UI based on mode (team features B2B, personal features B2C)
- ✅ **MUST**: Maintain organization-centric isolation always (org_id universal)
- ✅ **MUST**: Implement billing appropriate for the chosen mode
- ❌ **MUST NOT**: Mix B2B and B2C functionalities in same deployment
- ❌ **MUST NOT**: Break auto-organization creation (essential for both modes)
- ❌ **MUST NOT**: Suggest user_id isolation (template uses org_id always)
- ❌ **MUST NOT**: Ignore established SAAS_MODE configuration

## Multi-Tenancy Implementation

### Core Patterns

**1. Organization Context (All endpoints must use this):**

```typescript
// Frontend: Automatic X-Org-Id header
import { useOrgContext } from "@/hooks/use-org-context"

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

### Pipeline System (90% Complete)

- **Fixed 5-stage pipeline**: Lead → Contact → Proposal → Negotiation → Closed
- **Drag & drop interface**: `components/crm/pipeline-kanban.tsx` with @dnd-kit/core
- **Pipeline stages**: `components/crm/pipeline-stage.tsx` with optimistic UI updates
- **Lead management**: `api/routers/crm_leads.py` with `/crm/leads/{id}/stage` endpoint
- **Real-time WebSocket**: `hooks/use-pipeline-websocket.ts` with automatic polling fallback
- **Performance optimization**: Database indexes (`migrations/014_pipeline_performance_index.sql`)
- **WebSocket handlers**: Complete real-time collaboration system
- **Remaining**: Pipeline-specific WebSocket endpoint (`/ws/pipeline`) and broadcasting integration

### WebSocket Real-Time System (98% Complete)

- **WebSocket Manager**: `api/core/websocket_manager.py` - Organization-isolated connection management
  - Multiple connections per user support (tabs, devices)
  - Automatic cleanup of stale connections
  - Real-time user presence tracking
  - Organization-scoped broadcasting
- **Frontend Hook**: `hooks/use-pipeline-websocket.ts` - Connection management with polling fallback
- **Endpoints**: `/ws/general?token=JWT&org_id=UUID` - General real-time endpoint
- **Pipeline Integration**: Ready for drag & drop broadcasting (final 2% remaining)

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

**Component Decomposition Pattern (NEW 2025):**

```typescript
// Main component file
export function PipelineKanban() {
  // Main component logic
}

// Decomposed helper components in separate files
// components/crm/pipeline-kanban-helpers.tsx
// components/crm/pipeline-websocket-handlers.tsx
// components/crm/pipeline-data-handlers.tsx
```

**Service Layer Pattern:**

```typescript
// services/crm-leads.ts
class CRMLeadsService extends BaseService {
  async getLeads(filters: LeadFilters) {
    // Automatic X-Org-Id header injection
    return this.get("/crm/leads", { params: filters })
  }

  async getPipelineMetrics(params?: { startDate?: string; endDate?: string }) {
    return this.get("/crm/leads/pipeline/metrics", { params })
  }

  async getPipelineFilters() {
    return this.get("/crm/leads/pipeline/filters")
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

### Environment Verification

```bash
# Check current SAAS mode configuration
./check-saas-mode.sh

# Verify environment variables
make status
```

### Required Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5433/crm_db
REDIS_URL=redis://localhost:6379

# Security
SECRET_KEY=your-secret-key-min-32-chars
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Multi-tenancy (Critical for data isolation)
ENFORCE_ORGANIZATION_CONTEXT=true
AUTO_CREATE_ORGANIZATION=true
ALLOW_CROSS_ORG_ACCESS=false

# SaaS Configuration
SAAS_MODE=B2B  # B2B (team collaboration) or B2C (individual use)
ENABLE_BILLING=true
ENABLE_AI_FEATURES=true

# Optional Features
ENABLE_RECAPTCHA=false
RECAPTCHA_SITE_KEY=your-recaptcha-site-key
RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key
```

### Development Tools Configuration

- **TypeScript**: Strict mode enabled in `tsconfig.json`
- **ESLint**: Next.js + TypeScript + security rules
- **Tailwind**: CRM-themed color system with pipeline/communication colors
- **Prettier**: Code formatting consistency
- **Vitest**: Frontend testing framework
- **Playwright**: E2E testing framework
- **shadcn/ui**: Complete UI component library with multi-select, calendar, and CRM-optimized components

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

## Current Development Status & Next Steps

### Pipeline Kanban MVP (Story 1.1) - 98% Complete ✅

**Implemented & Working:**

- ✅ **@dnd-kit/core**: Complete drag & drop with `PipelineKanban` component
- ✅ **Backend API**: Full `/crm/leads/{id}/stage` endpoint with validation
- ✅ **WebSocket Manager**: Organization-isolated real-time system (`websocket_manager.py`)
- ✅ **Database Schema**: Consolidated migration with PipelineStage enum + indexes
- ✅ **Service Layer**: Complete `CRMLeadService.moveLeadToStage()` implementation
- ✅ **Multi-tenancy**: Perfect organization isolation across all pipeline operations
- ✅ **Component Architecture**: Decomposed pattern with 10+ helper components
- ✅ **Advanced Filtering**: Multi-select pipeline filters with real-time updates
- ✅ **Metrics Dashboard**: Complete analytics with Recharts integration
- ✅ **WebSocket Hook**: `use-pipeline-websocket.ts` with polling fallback

**Final 2% - WebSocket Real-time Integration:**

- 🔧 **WebSocket Broadcasting**: Connect drag & drop events to real-time updates
- 🧪 **E2E Testing**: Real-time collaboration test coverage
- 📈 **Performance**: Final WebSocket connection optimizations

### Pipeline Kanban Complete (Story 1.2) - Implementation Ready

**Next Phase Documentation:**

- 📋 **Detailed Plan**: Story 1.2 documented in `docs/plans/1.1-pipeline-kanban-mvp-basico.md`
- ⏱️ **Time Estimate**: 2-3 hours for WebSocket real-time completion
- 🎯 **Priority**: CRITICAL - only remaining gap for MVP
- ✅ **Technical Confidence**: 99% - all infrastructure ready

### Component Architecture Pattern

Most CRM components now follow decomposition pattern:

- Main component: `component-name.tsx`
- Helper components: `component-name-components.tsx`
- Logic utilities: `component-name-utils.tsx` or `component-name-helpers.tsx`
- Type definitions: `component-name-types.ts`
- Data handlers: `component-name-data-handlers.tsx`
- WebSocket handlers: `component-name-websocket-handlers.tsx`

**Examples in production:**
- `pipeline-kanban.tsx` with 10+ decomposed helper files
- `pipeline-filters.tsx` with advanced multi-select filtering
- `pipeline-metrics.tsx` with Recharts integration
- Complete query provider system with TanStack Query

## Common Development Tasks

### Adding New CRM Features

1. Create model in `api/models/` with `organization_id` FK
2. Add migration in `migrations/`
3. Create repository with org filtering
4. Implement service with business logic
5. Add API endpoints with org validation
6. Create frontend components (follow decomposition pattern)
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

## File Structure & Key Locations

### Frontend Architecture

```
app/[locale]/               # Internationalized routing
├── admin/                  # Protected admin routes
│   ├── crm/               # CRM main interface
│   ├── settings/          # Organization settings
│   ├── team/              # Team management with detailed components
│   └── billing/           # Subscription management
├── auth/                   # Authentication flows
└── invites/[token]/        # Public invitation acceptance

components/                 # React components library
├── ui/                    # shadcn/ui base components
├── crm/                   # CRM-specific components
├── admin/                 # Admin dashboard components
├── settings/              # Settings with comprehensive tab system
├── organizations/         # Organization management
└── providers/             # Context providers
```

### Backend Architecture

```
api/                        # FastAPI backend
├── core/                  # Infrastructure & middleware
│   ├── deps.py            # Dependency injection patterns
│   ├── organization_middleware.py  # Multi-tenancy enforcement
│   └── security.py        # Authentication & authorization
├── models/                # SQLAlchemy data models
├── schemas/               # Pydantic validation schemas
├── repositories/          # Data access layer
├── services/              # Business logic layer
└── routers/               # API endpoint definitions
```

### Critical Files for Multi-Tenancy

- `api/core/organization_middleware.py`: Enforces organization context
- `api/core/deps.py`: `get_current_organization()` dependency
- `hooks/use-org-context.ts`: Frontend organization context
- All models in `api/models/`: Must include `organization_id` FK

### Testing Infrastructure

```
tests/
├── frontend/              # Vitest frontend tests
├── e2e/api/              # API integration tests
│   ├── test_multi_tenant_isolation.py  # Critical isolation tests
│   ├── test_saas_mode_*.py            # B2B/B2C mode tests
│   └── test_pipeline_realtime.py     # Pipeline real-time collaboration tests
├── e2e/proxy/            # Next.js → Backend proxy integration tests
│   ├── test_proxy_auth.py            # Authentication via proxy
│   ├── test_proxy_headers.py         # Header forwarding validation
│   ├── test_proxy_crm_leads.py       # CRM features via proxy
│   └── utils/nextjs_client.py        # Proxy test utilities
├── unit/                 # Backend unit tests
└── e2e/mocks/            # WireMock configurations for external services
```

### Development Tools

- `Makefile`: 50+ automation commands for development workflow
- `check-saas-mode.sh`: Validates B2B/B2C configuration  
- `migrations/migrate`: Custom database migration tool with hot updates support
- `migrations/001_consolidated_schema.sql`: Single consolidated migration replacing 14 legacy migrations
- `docker-compose.yml`: Development environment
- `docker-compose.test.yml`: E2E testing environment
- `docker-compose.prod.yml`: Production environment
- `requirements.txt`: Python dependencies
- `package.json`: Node.js dependencies with comprehensive scripts

#### Recent Architectural Enhancements (2025)

- **Component decomposition pattern**: Many components now split into `-components.tsx` files for better maintainability
- **WebSocket infrastructure**: Complete real-time system with organization isolation and polling fallback via `use-pipeline-websocket.ts`
- **Pipeline Kanban MVP**: 95% complete with @dnd-kit/core drag-drop, real-time updates, and performance optimization
- **Advanced hook system**: 20+ custom hooks including comprehensive WebSocket management and organization context
- **Database schema consolidation**: Single `001_consolidated_schema.sql` migration replacing 14 legacy migrations
- **Performance indexes**: Pipeline-specific database indexes for optimal Kanban performance (now in consolidated schema)
- **Design tokens demo**: Complete showcase of CRM UI components and design system  
- **Proxy integration testing**: Complete E2E test suite for Next.js → Backend proxy validation
- **Migration system evolution**: Custom `./migrate` tool with hot updates, dev/test/prod seeds separation

### Development Environment Verification

```bash
# Check environment health
make status                           # Overall project status
./check-saas-mode.sh                 # B2B/B2C mode verification
make test-verify                     # E2E test environment health
curl http://localhost:3000           # Frontend availability
curl http://localhost:8000/health    # Backend health check
```

## Development Rules & Guidelines

### 95% Confidence Rule

**CRITICAL:** Before implementing any feature, ensure 95%+ confidence about requirements:

- ✅ **MUST**: Ask questions until absolutely certain about business requirements
- ✅ **MUST**: Stop and obtain specific evidence if any validation fails
- ❌ **NEVER**: Assume requirements or make speculative interpretations
- ❌ **NEVER**: Proceed without complete validation of user inputs

### Codebase Analysis Rule (MANDATORY)

**🔍 BEFORE creating any component, service, API, or model:**

1. **SEARCH FIRST**: Use Glob/Grep/Read tools to analyze existing codebase
2. **VERIFY EXISTS**: Check if component/service already exists
3. **EVOLVE vs CREATE**: If exists, evolve existing; if not, follow similar patterns
4. **DOCUMENT**: "Analyzed X files, found Y similar, decision: evolving Z"
5. **JUSTIFY**: Clear reasoning for evolution vs new creation

**MANDATORY VALIDATION PROCESS:**
- ✅ **OBLIGATORY**: `Glob "**/*.tsx"` + `Grep "ComponentName"` + `Read similar files`
- ✅ **OBLIGATORY**: Analyze existing functionality, props, patterns
- ✅ **OBLIGATORY**: Decide: Evolve existing OR create new (with justification)
- ✅ **OBLIGATORY**: Document: "Analysis: X components found, Y evolution applied"
- ❌ **FORBIDDEN**: Create components/services without prior codebase analysis
- ❌ **FORBIDDEN**: Duplicate existing functionality without extreme justification

### Fail-Fast Validation (CRITICAL)

**Always detect errors as early as possible:**

- ✅ **MUST**: Validate data at input/function start/process beginning
- ✅ **MUST**: Immediately halt execution when validation fails (throw exceptions, return errors)
- ✅ **MUST**: Provide specific error messages with resolution guidance
- ✅ **MUST**: Prevent invalid data from propagating through system
- ✅ **MUST**: Implement UI validation with immediate user feedback
- ✅ **MUST**: Validate API requests before processing to protect backend
- ✅ **MUST**: Apply domain logic validation to maintain data integrity
- ❌ **MUST NOT**: Allow invalid data to continue processing
- ❌ **MUST NOT**: Skip validation for performance reasons
- ❌ **MUST NOT**: Provide generic or unclear error messages

### Multi-Tenancy Security (Non-Negotiable)

**Every feature MUST follow these patterns:**

- ✅ Organization-scoped data isolation (org_id filtering)
- ✅ Header-based isolation (X-Org-Id + middleware validation)
- ✅ Repository pattern with automatic org filtering
- ✅ JWT with organization context
- ❌ **NEVER** create routes without organization validation
- ❌ **NEVER** implement user_id isolation (always use org_id)

### Technology Stack Constraints

**MUST use established technology stack:**

- ✅ Next.js 14 + FastAPI + PostgreSQL + Railway only
- ✅ shadcn/ui + Tailwind CSS + Lucide icons
- ✅ Leverage existing 55+ production endpoints
- ❌ **NEVER** suggest alternative technologies or frameworks

## Common Development Patterns

### Adding New Features (Step-by-Step)

1. **Database**: Add migration in `migrations/` with `organization_id` FK
2. **Backend**: Create model → schema → repository → service → router
3. **Frontend**: Create types → service → store → components → pages
4. **Tests**: Add isolation tests in `tests/e2e/api/`
5. **Integration**: Update relevant containers and hooks

### Quick Development Commands for Daily Use

```bash
# Development workflow
make setup                     # First-time setup
npm run dev                    # Start development (Frontend: 3000, Backend: 8000)
make test-hot-migrate         # Apply schema changes (2s)
make test-hot-data           # Reload test data (3s)

# Code quality (run before commits)
npm run lint                  # Frontend + backend linting
npm run typecheck            # TypeScript validation
make backend-security        # Security scan

# Database operations  
cd migrations && ./migrate apply    # Apply consolidated schema migration
cd migrations && ./migrate status   # Check migration status
cd migrations && ./migrate dev-seeds # Load dev/test seed data
make connect-db-prod               # Production access

# Testing during development
make test-frontend-watch     # Frontend tests (watch mode)
make test-backend-unit-quick # Backend tests (quick)
make test-hot-all           # Apply all updates
npm run test:e2e:api         # API E2E tests

# WebSocket & Pipeline debugging
npm run dev                  # Check WebSocket connections in browser dev tools
make test-logs-api          # Monitor WebSocket connections in API logs
# Pipeline Kanban WebSocket: /ws/general?token=JWT&org_id=UUID
# WebSocket Manager: api/core/websocket_manager.py with organization isolation
# Frontend Hook: hooks/use-pipeline-websocket.ts with polling fallback

# Docker development (alternative to npm run dev)
make dev-start              # Complete Docker environment
make dev-logs               # View all service logs
make dev-stop               # Stop all services

# SAAS Mode verification
./check-saas-mode.sh        # Verify B2B/B2C configuration consistency
make status                 # Complete project status overview
```

### Debugging Multi-Tenancy Issues

```bash
# Check organization context
grep -r "X-Org-Id" .                    # Find header usage
grep -r "organization_id" api/models/    # Check model filtering
grep -r "get_current_organization" .     # Find dependency usage

# Verify data isolation
make test-run-api-auth                   # Run isolation tests
PGPASSWORD=... psql ... -c "SELECT COUNT(*) FROM users;"  # Direct DB check
```

### Debugging WebSocket Issues

```bash
# WebSocket connection testing
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" \
  "http://localhost:8000/ws/general?token=JWT_TOKEN&org_id=ORG_UUID"

# Monitor WebSocket activity
make test-logs-api | grep -i websocket   # API WebSocket logs
make dev-logs | grep -i websocket        # Docker WebSocket logs

# Frontend WebSocket debugging (browser console)
# Check connection status in useWebSocket hook
console.log(websocketStatus, lastMessage, connectionAttempts)

# Backend WebSocket manager debugging
# Add to api/core/websocket_manager.py for debugging:
logger.info(f"Active connections: {len(self.connections)}")
logger.info(f"Org connections: {self.connections.get(org_str, {})}")
```

## Final Development Guidelines

### Story-Based Development

When implementing new features, always:

1. **Check existing stories**: Review `docs/plans/` for detailed implementation guides
2. **Follow the Fundamental Rule**: Always ask "Is the previous task 100% implemented?" before starting new work
3. **Use detailed plans**: Most major features have comprehensive implementation plans with 95%+ confidence
4. **Maintain component decomposition**: Follow established patterns for scalability

### Critical Success Factors

- **Multi-tenancy isolation**: Never compromise on organization-scoped data separation
- **WebSocket integration**: Leverage existing real-time infrastructure for new features  
- **Component reusability**: Build on existing shadcn/ui and decomposed component patterns
- **Performance first**: Apply database indexes and frontend memoization from day one
- **Test coverage**: Both unit tests and E2E tests are mandatory for all features

### Production Readiness

The codebase includes:
- ✅ Complete 38-table database schema (consolidated into single migration)
- ✅ 50+ Makefile automation commands
- ✅ Comprehensive testing infrastructure with 460+ tests
- ✅ Real-time WebSocket system with organization isolation
- ✅ Multi-tenant security architecture with header-based isolation
- ✅ Production deployment on Railway with health monitoring
- ✅ Advanced component decomposition patterns with @dnd-kit drag & drop

**Current Focus**: Pipeline Kanban completion (Story 1.2) with 99% technical confidence and detailed 32-hour implementation plan.

## Immediate Next Steps (Priority Order)

### 1. Complete WebSocket Real-time Integration (2-3 hours)
- **File**: `components/crm/pipeline-kanban.tsx`
- **Action**: Connect drag & drop events to WebSocket broadcasting
- **Code**: Integrate `websocket_manager.broadcast_to_organization()` with pipeline stage changes
- **Test**: Verify real-time collaboration between browser tabs

### 2. Add Pipeline-specific WebSocket Events (1 hour)
- **File**: `hooks/use-pipeline-websocket.ts`
- **Action**: Add pipeline-specific event handlers (`lead_moved`, `stage_updated`)
- **Integration**: Connect to existing `moveLeadToStage` service calls

### 3. E2E Test Coverage (1-2 hours)
- **File**: `tests/e2e/api/test_pipeline_realtime.py`
- **Action**: Add WebSocket collaboration tests
- **Coverage**: Multi-user drag & drop scenarios

This completes the Pipeline Kanban MVP and enables full real-time collaboration for digital agencies.
