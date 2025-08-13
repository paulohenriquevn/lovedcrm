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
npm run quality             # Complete quality check (ESLint + TypeScript)
npm run lint                # ESLint only (style/code quality)
npm run typecheck           # TypeScript only (types/compilation)
npm run quality:frontend    # Frontend: ESLint + TypeScript
npm run quality:backend     # Backend: Python linters only
npm run quality:full        # All quality tools + security
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

**B2B ONLY**: System is exclusively B2B mode:

- **B2B**: Team collaboration, role-based permissions, shared workspaces

```bash
# B2B Mode (only mode supported)
SAAS_MODE=B2B
ENABLE_TEAM_FEATURES=true
```

**Rules**:

- ✅ B2B mode uses org_id isolation (never user_id)
- ✅ Auto-organization creation always enabled
- ✅ Team features always enabled

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

### Component Naming Conventions

**File Suffixes (Standardized):**
- `-utils.tsx/.ts` → Pure utility functions, data transformations, validators
- `-components.tsx` → Sub-components extracted from main component
- `-handlers.tsx` → Event handlers and interaction logic  
- `-types.ts` → Type definitions and interfaces
- `-hooks.tsx` → Custom React hooks

**Examples:**
```
✅ lead-edit-modal-utils.ts     # Form helpers, validation functions
✅ pipeline-kanban-helpers.tsx  # React components (StageColumn, etc)
✅ pipeline-drag-handlers.tsx   # Drag & drop event handlers
✅ pipeline-types.ts            # TypeScript interfaces
✅ use-pipeline-hooks.tsx       # Custom React hooks
```

**Rules:**
- Use `-utils` for pure functions (no React dependencies)
- Use `-helpers` only for React components
- Use `-handlers` for event handling logic
- Keep `-components` for extracted sub-components
- Use `-types` for TypeScript definitions only

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
SAAS_MODE=B2B  # B2B only
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
./check-saas-mode.sh        # B2B config verification
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

## Code Quality: Lint/TypeCheck Harmony

### 🎯 **ZERO CONFLITOS: Configuração que mantém qualidade máxima**

A configuração ESLint foi ajustada para **eliminar conflitos** entre `npm run lint` e `npm run typecheck`:

- ✅ **TypeScript compilation**: Sempre passa
- ✅ **ESLint rules**: Configuradas para não conflitar
- ✅ **Code quality**: Mantida com warnings ao invés de errors em casos específicos
- ❌ **`any` types**: Mantidos como warnings, não permitidos sem justificativa

### 📐 **Princípio de Qualidade**

**Regra Fundamental**: Se `npm run typecheck` passa, `npm run lint` não deve falhar por conflitos de tipos.

**Implementação**: Regras unsafe (assignment, call, member-access) configuradas como `warn` ao invés de `error`, mantendo feedback sem bloquear o desenvolvimento.

## Claude Command Agents System

**Specialized Claude agents for evidence-based development workflow**

This project includes 18 specialized Claude command agents that automate and standardize development tasks. Each agent follows the **95% confidence rule** and **evidence-based development** principles.

### Documentation Generation Agents (Production Chain)

**Complete documentation pipeline from vision to deployment:**

- **01-doc-vision.md**: Project vision and strategic positioning
- **02-doc-roadmap.md**: Feature roadmap and prioritization
- **03-doc-architecture.md**: Technical architecture and patterns
- **04-doc-database.md**: Database schema and multi-tenancy design
- **05-doc-api.md**: API endpoints and authentication flows
- **06-doc-frontend.md**: UI/UX patterns and component architecture
- **07-doc-deployment.md**: Production deployment and infrastructure
- **08-doc-security.md**: Security measures and compliance
- **09-doc-testing.md**: Testing strategy and quality assurance
- **10-doc-monitoring.md**: Observability and performance monitoring
- **11-doc-roadmap.md**: Project roadmap with user stories and acceptance criteria

### Execution Agents (Implementation Workflow)

**End-to-end development execution chain:**

- **exec-context.md**: Analyze codebase context and generate comprehensive project understanding
- **exec-refine.md**: Technical specification refinement with architecture validation
- **exec-story.md**: Detailed implementation planning with vertical slice methodology
- **exec-run.md**: Code execution and implementation following evidence-based practices
- **exec-bug.md**: Bug investigation and resolution maintaining multi-tenant isolation
- **exec-review.md**: Quality gate validation ensuring 100% conformity with plans

### Feature Evolution Agent

- **evolve-feature.md**: Feature enhancement using "Simplificar Substituindo" methodology - evolves existing functionality rather than creating new components

### Core Development Principles

All agents follow these **non-negotiable rules**:

#### 95% Confidence Rule

- **MUST**: Have 95%+ certainty before proceeding with ANY implementation
- **MUST**: Ask questions until absolute certainty about requirements
- **NEVER**: Assume requirements or make speculative interpretations

#### Evidence-Based Development

- **MUST**: Use Read/LS/Bash tools for direct codebase analysis
- **MUST**: Base decisions on actual code, not assumptions
- **NEVER**: Proceed without verification of current state

#### Multi-Tenant Compliance

- **MUST**: Maintain organization isolation (org_id) in all implementations
- **MUST**: Validate cross-organizational access restrictions
- **NEVER**: Use user_id isolation (always org_id)

#### Vertical Slice Methodology

- **MUST**: Implement complete slices (Frontend + Backend + Database)
- **MUST**: Ensure end-to-end functionality
- **NEVER**: Implement partial horizontal layers

### Workflow Integration

**Standard development flow:**

```
exec-context → exec-refine → exec-story → exec-run → exec-review
     ↓             ↓            ↓           ↓          ↓
  understand → specify → plan → implement → validate
```

**Documentation flow (parallel):**

```
01-doc-vision → 02-doc-roadmap → ... → 11-doc-roadmap
                      ↓
               feeds into exec-story planning
```

### Key Features

- **Auto-CHANGELOG Updates**: All agents automatically update CHANGELOG.md
- **Quality Gates**: exec-review enforces 100% conformity with exec-story plans
- **Organization Isolation**: All agents respect multi-tenant architecture
- **Evidence-Based**: All decisions backed by direct codebase analysis
- **KISS/YAGNI/DRY**: Fundamental principles enforced across all agents

### Usage Examples

```bash
# Understand codebase context
/exec-context "Analyze CRM pipeline architecture"

# Refine user story into technical specifications
/exec-refine "Story 2.1 - Lead management dashboard"

# Generate detailed implementation plan
/exec-story "2.1"

# Execute implementation following the plan
/exec-run "Implement story 2.1 following docs/plans/"

# Investigate and fix bugs
/exec-bug "Cross-org data leakage in dashboard"

# Quality gate validation
/exec-review "2.1"

# Evolve existing features
/evolve-feature "Enhance pipeline drag-and-drop with status validation"
```

This agent system ensures **consistent**, **evidence-based**, and **multi-tenant compliant** development across the entire LovedCRM project.
