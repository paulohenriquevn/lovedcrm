# CLAUDE.md

**Loved CRM** - Multi-tenant CRM for Brazilian digital agencies. Next.js 14, FastAPI, PostgreSQL.

## Tech Stack
- **Frontend**: Next.js 14, TypeScript, shadcn/ui, TanStack Query, @dnd-kit/core
- **Backend**: FastAPI, SQLAlchemy 2.0, PostgreSQL 16, Redis
- **Features**: Fixed Pipeline, WebSocket real-time, Multi-tenancy (org_id)

## Core Rules

### Task Completion Rule
"Antes de iniciar nova task, SEMPRE perguntar: 'A task anterior está 100% implementada?'"
- ✅ 100% = botões, formulários, modais, integrações funcionando
- ✅ Validação completa antes de prosseguir

### 95% Confidence Rule
- ✅ **MUST**: 95%+ certainty before implementing
- ❌ **NEVER**: Assume requirements or proceed without validation

### Multi-Tenancy (CRITICAL)
- Header-based isolation (`X-Org-Id`)
- All models MUST include `organization_id` FK
- All queries filtered by `organization_id`
- Repository pattern with automatic org filtering

## Project Structure

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

### Essential Commands
```bash
# Setup & Start
make setup                   # First-time setup
npm run dev                  # Start dev servers (Frontend:3000, Backend:8000)

# Quality & Testing
npm run lint                 # All linters
npm run typecheck           # TypeScript check
make test-hot-migrate       # Apply schema changes (fast)

# Database
cd migrations && ./migrate apply    # Apply migrations
cd migrations && ./migrate status   # Check status
make connect-db-prod               # Production access

# Testing
npm run test:frontend        # Frontend tests
python3 -m pytest tests/unit/ -v   # Backend tests
make test-start             # E2E environment
```

### Key Test Commands
```bash
# Specific tests
python3 -m pytest tests/e2e/api/test_crm_leads.py::test_create_lead -v
python3 -m pytest -k "test_organization" -v
make test-frontend-watch     # Watch mode

# Hot updates (no restart)
make test-hot-migrate        # Schema updates (2s vs 45s)
make test-hot-data          # Reload test data (3s)
```

## SAAS Mode Configuration

**CRITICAL**: Two modes via `SAAS_MODE` environment variable:

- **B2B**: Team collaboration, role-based permissions, shared workspaces
- **B2C**: Individual use, auto-created personal organizations

```bash
# B2B Mode (default)
SAAS_MODE=B2B
ENABLE_TEAM_FEATURES=true

# B2C Mode  
SAAS_MODE=B2C
ENABLE_TEAM_FEATURES=false
```

**Rules**:
- ✅ Both modes use org_id isolation (never user_id)
- ✅ Auto-organization creation always enabled
- ❌ Never mix B2B and B2C in same deployment

## Multi-Tenancy Patterns

### Organization Context
```typescript
// Frontend: useOrgContext() hook
const { organization } = useOrgContext()
```

```python
# Backend: Organization dependency
@router.get("/items")
async def get_items(organization: Organization = Depends(get_current_organization)):
    # Auto org-scoped queries
```

### Model Pattern
```python
class YourModel(Base):
    organization_id = Column(UUID, ForeignKey("organizations.id"), nullable=False)
    __table_args__ = (Index('ix_your_table_org_id', 'organization_id'),)
```

## CRM Architecture

### Pipeline System (98% Complete)
- Fixed 5-stage: Lead → Contact → Proposal → Negotiation → Closed
- `components/crm/pipeline-kanban.tsx` with @dnd-kit/core drag & drop
- WebSocket real-time: `hooks/use-pipeline-websocket.ts` with polling fallback
- **Remaining**: Final WebSocket broadcasting integration (2%)

### WebSocket System
- Manager: `api/core/websocket_manager.py` with org isolation
- Endpoint: `/ws/general?token=JWT&org_id=UUID`
- Frontend: `hooks/use-pipeline-websocket.ts`

### Communication & AI
- Timeline: `components/crm/timeline.tsx`
- WhatsApp/VoIP integration ready
- AI summaries and sentiment analysis

## Development Patterns

### Frontend
- **Container-Component**: Separate data logic from presentation
- **Component Decomposition**: Split complex components into helper files
- **Service Layer**: `services/crm-leads.ts` with automatic X-Org-Id headers
- **State Management**: Zustand stores with TanStack Query

### Backend  
- **Clean Architecture**: Router → Service → Repository layers
- **Organization Dependency**: All endpoints use `get_current_organization`
- **Automatic Filtering**: All queries include `organization_id` filter

## Testing & Configuration

### Testing
- **Frontend**: `tests/frontend/` - Unit/integration tests
- **Backend**: `tests/unit/` and `tests/e2e/api/` - Multi-tenancy isolation tests
- **Critical**: Verify cross-organization access restrictions

### Environment Variables
```bash
DATABASE_URL=postgresql://user:pass@localhost:5433/crm_db
SECRET_KEY=your-secret-key-min-32-chars
SAAS_MODE=B2B  # or B2C
ENFORCE_ORGANIZATION_CONTEXT=true
AUTO_CREATE_ORGANIZATION=true
```

### Tools
- TypeScript strict mode, ESLint, Tailwind, shadcn/ui, Vitest, Playwright

### Production (Railway)
- Next.js + FastAPI + PostgreSQL + Redis + SSL
- Health: `curl https://backend-production-fd50.up.railway.app/health`

## Current Status

### Pipeline Kanban MVP - 98% Complete ✅
- ✅ @dnd-kit/core drag & drop, WebSocket system, decomposed components
- 🔧 **Remaining**: WebSocket broadcasting integration (2-3 hours)

## Common Tasks

### Adding CRM Features
1. Model with `organization_id` FK → Migration → Repository → Service → Router
2. Frontend: Components (decomposition pattern) → Routes → Tests

### Component Decomposition Pattern
- Main: `component-name.tsx`
- Helpers: `component-name-components.tsx`, `component-name-utils.tsx`
- Handlers: `component-name-data-handlers.tsx`, `component-name-websocket-handlers.tsx`

## Key Files

### Critical Multi-Tenancy Files
- `api/core/organization_middleware.py`: Enforces org context
- `api/core/deps.py`: `get_current_organization()` dependency  
- `hooks/use-org-context.ts`: Frontend org context
- All `api/models/`: Must include `organization_id` FK

### Development Tools
- `Makefile`: 50+ automation commands
- `migrations/migrate`: Custom migration tool with hot updates
- `migrations/001_consolidated_schema.sql`: Single consolidated migration
- `.claude/commands/`: Specialized Claude agents (exec-story.md, exec-refine.md, etc.)

### Verification Commands
```bash
make status                  # Project status
./check-saas-mode.sh        # B2B/B2C config verification
make test-verify            # Test environment health
```

## Development Rules (CRITICAL)

### Core Rules
1. **95% Confidence**: Never proceed without 95%+ certainty about requirements
2. **Codebase Analysis**: ALWAYS use Glob/Grep/Read before creating components
3. **Evolve vs Create**: Evolve existing code, never duplicate functionality
4. **Multi-tenancy**: Every feature MUST use org_id isolation, never user_id
5. **Tech Stack**: Next.js 14 + FastAPI + PostgreSQL + Railway only

### Quality Checklist
- [ ] 95% confidence validated
- [ ] Codebase analysis completed  
- [ ] Multi-tenancy isolation implemented
- [ ] SAAS_MODE compliance verified
- [ ] Existing patterns followed

### Red Flags 🚨
- Technology suggestions outside established stack
- Component creation without codebase analysis
- user_id isolation (use org_id always)
- Requirements assumptions without validation

### Implementation Flow
1. **Análise**: `Glob` + `Grep` + `Read` existing code
2. **Backend**: Model → Migration → Service → Router
3. **Frontend**: Types → Service → Components → Tests
4. **Validation**: Full-stack integration testing

**Remember**: This is a production system with 55+ endpoints. Always evolve, never reinvent.
