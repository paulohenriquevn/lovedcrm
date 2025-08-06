# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this repository.

## Essential Commands

### Development Workflow

```bash
# Start development (MOST USED)
npm run dev                    # Both servers: localhost:3000 + localhost:8000

# Alternative Docker setup
make dev-start                 # Start all services in Docker
make dev-logs                  # View container logs
make dev-stop                  # Stop Docker environment

# Code quality
npm run fix                    # Auto-fix linting + formatting issues
npm run typecheck              # Check TypeScript errors

# Testing
npm run test                   # Frontend tests (Vitest)
python3 -m pytest tests/e2e/api/ -v  # Backend API tests
make test-hot-migrate          # Apply schema changes (2s vs 45s restart)

# Database operations
make db-up                     # Start PostgreSQL + Redis
cd migrations && ./migrate apply  # Apply migrations

# Configuration validation
./check-saas-mode.sh           # Verify B2B/B2C mode configuration

# Full validation before commit
make ci                        # Complete check (lint + test + security)
make ci-quick                  # Quick CI (lint + unit tests only)
make ci-unit                   # Unit tests only

# Health checks
curl http://localhost:8000/health      # Backend health (should return {"status": "ok"})
curl http://localhost:3000             # Frontend health
```

### Single Test Execution

```bash
# Frontend specific test
npm run test -- FormInputFields.test.tsx

# Backend specific test with pattern
python3 -m pytest tests/e2e/api/test_auth.py::test_register_user

# Backend tests by marker (20+ available markers)
python3 -m pytest -m "auth" -v          # Authentication tests
python3 -m pytest -m "billing" -v       # Billing/Stripe tests
python3 -m pytest -m "organizations" -v # Organization management
python3 -m pytest -m "security" -v      # Security tests
python3 -m pytest -m "performance" -v   # Performance tests
python3 -m pytest -m "two_factor" -v    # Two-factor authentication tests
python3 -m pytest -m "sessions" -v      # User session management tests
python3 -m pytest -m "preferences" -v   # User preferences tests

# CRM-specific test markers (when implemented)
python3 -m pytest -m "pipeline" -v      # Sales pipeline management tests
python3 -m pytest -m "timeline" -v      # Timeline and interaction history tests
python3 -m pytest -m "voip" -v          # VoIP and call recording tests
python3 -m pytest -m "ai_summary" -v    # AI conversation summary tests
python3 -m pytest -m "email_parsing" -v # Email parsing and lead capture tests

# Backend unit tests (separate from E2E)
python3 -m pytest tests/unit/ -v        # Backend unit tests
make test-backend-unit-quick             # Quick backend unit tests
```

### Story Development Workflow

```bash
# 1. Technical refinement (99% certainty before implementation)
/exec-roadmap "1.1"

# 2. Execution plan generation (integrates roadmap + refinement + codebase)
/exec-story "1.1"

# 3. Review implementation quality (optional)
/exec-review

# 4. Refine story details if needed (optional)
/exec-refine "story details"

# 5. Evolution of existing features (optional)
/evolve-feature "feature-name" "evolution-objective"
```

### Intelligent Planning System

```bash
# Complete workflow for story implementation
/exec-roadmap "1.1"                                 # Generate technical refinement
/exec-story "1.1"                                 # Generate contextual execution plan

# exec-story automatically reads:
# - docs/project/11-roadmap.md (story requirements)
# - docs/refined-stories/[1.1] - [Name].md (technical specifications)
# - Current codebase state (existing files, dependencies, conflicts)
# - Generates step-by-step execution plan with 99% certainty
```

### Production Database (Railway)

```bash
make connect-db-prod           # Interactive PostgreSQL session
make db-prod-migration-apply   # Apply pending migrations to production
make db-prod-status            # Database health check
```

## Technology Stack

- **Frontend**: Next.js 14 (App Router), React 18.2+, TypeScript 5.0+
- **Backend**: FastAPI (Python 3.11+), SQLAlchemy, Pydantic
- **Database**: PostgreSQL 16 with custom SQL migrations (NOT Alembic)
- **UI**: Tailwind CSS 3.4.15, shadcn/ui, Lucide React
- **State**: Zustand 4.5.7+, TanStack Query 5.82.0+
- **Testing**: Vitest (frontend), pytest (backend), Playwright (E2E)
- **Deploy**: Railway (production), Docker (development)

## Architecture Overview

**Loved CRM - Agency-Focused CRM System** with organization-centric architecture and complete data isolation.

**Core Flow**: User Registration → Auto-Create Organization → User = Owner → JWT with org_id → All Operations Org-Scoped

**Backend Pattern**: Router → Service → Repository → Model (Clean Architecture)
**Frontend Pattern**: Page → Container → Component → Service → Store

**CRM-Specific Architecture**:
- **Pipeline Management**: Kanban-style sales pipeline with 5 fixed stages (Lead → Contact → Proposal → Negotiation → Closed)
- **Timeline System**: Unified chronological feed of all client interactions (calls, emails, notes)
- **VoIP Integration**: Click-to-call with automatic call recording and storage
- **AI Conversation Summaries**: GPT-powered summaries of client interaction history
- **Email Parsing**: Automatic lead capture and message processing from emails
- **WhatsApp Business API**: Integrated messaging for client communication (Enterprise tier)

**SAAS Mode Configuration**: Template supports both B2B and B2C modes via `SAAS_MODE` environment variable:
- **B2B Mode**: Team collaboration with shared organizations and member management
- **B2C Mode**: Individual use with personal organizations (auto-created on signup)

**Critical**: Every feature MUST be organization-scoped using `useOrgContext()` (frontend) + `get_current_organization` (backend).

## Quick Setup

**Prerequisites**: Node.js 18+, Python 3.11+, Docker

```bash
# Complete setup (dependencies + database + migrations)
make setup

# Start development servers
npm run dev
# Frontend: http://localhost:3000
# Backend: http://localhost:8000 (API docs at /docs)

# Verify everything works
curl http://localhost:8000/health  # Should return {"status": "ok"}
python3 -m pytest tests/e2e/api/test_auth.py::test_register_user -v
```

**Ports Used**: 3000 (Next.js), 8000 (FastAPI), 5433 (PostgreSQL), 6379 (Redis)

**Alternative Docker Setup**:

```bash
make dev-start    # Start all services in Docker
make dev-logs     # View logs
make dev-stop     # Stop services
```

## Core Implementation Patterns

### Multi-Tenant Pattern (CRITICAL)

**Frontend**: Organization context + BaseService

```typescript
const { organization } = useOrgContext()
const items = await itemsService.getItems() // X-Org-Id auto-added
```

**Backend**: Organization dependency mandatory

```python
@router.get("/items")
async def get_items(
    organization: Organization = Depends(get_current_organization)
):
    return service.get_organization_items(organization.id)
```

**Database**: Org-filtered queries (ALWAYS required)

```python
items = db.query(Item).filter(Item.organization_id == org_id).all()
```

### Required Route Structure

```typescript
// CORRECT: Multi-tenant + i18n structure
/[locale]/admin/settings    # ✅ All business routes
/[locale]/admin/team        # ✅ Organization scoped

// WRONG: Breaks multi-tenancy
/dashboard/settings         # ❌ Missing locale/admin
```

## Key File Locations

### Multi-Tenancy Core (DO NOT MODIFY)

```
api/core/organization_middleware.py  # Header validation + org context
api/core/deps.py                     # get_current_organization dependency
hooks/use-org-context.ts            # Frontend org context hook
```

### Extend These Patterns

```
# Frontend Development
app/[locale]/admin/                 # All business routes (MANDATORY structure)
services/base.ts                    # BaseService (auto X-Org-Id headers)
containers/                        # Business logic patterns (copy these)
components/ui/                      # 31 shadcn/ui components (100% compliant, do not modify)
components/common/                  # Custom components (extend here)

# Backend Development
api/routers/                        # 60+ endpoints (copy these patterns)
api/services/                       # Business logic with org validation
api/repositories/                   # Data access with org filtering
api/models/                         # SQLAlchemy models (add your tables)
  ├── user_sessions.py             # Session management with device tracking & automatic cleanup
  ├── user_two_factor.py           # TOTP 2FA with backup codes & recovery mechanisms
  ├── user_preferences.py          # User settings per organization (theme, notifications, quiet hours)
  └── your_business_models.py      # Add your custom business models here

# Database & Testing
migrations/migrate                  # Custom migration tool (NOT Alembic)
migrations/001_complete_initial_schema.sql  # Current consolidated schema
tests/e2e/api/                      # API tests with org isolation
check-saas-mode.sh                  # Configuration validation script

# Story Refinement System
docs/refined-stories/               # Technical refinements with 99% certainty
.claude/commands/exec-roadmap.md    # Agent for technical story analysis
```

## Testing

### Two-Phase Testing Architecture

```bash
# Phase 1: Setup environment (once)
make test-start                # Isolated test services (PostgreSQL:5434, Redis:6380, API:8001)

# Phase 2: Run tests (iteratively)
make test-hot-migrate          # Apply schema changes (2-5s vs 45s full restart)
python3 -m pytest -m "auth" -v          # Run by marker (auth, billing, security, etc.)
npm run test -- FormInputFields.test.tsx # Single frontend test

# Unit tests (no environment needed)
make test-unit                 # All unit tests (frontend + backend)
make test-unit-quick          # Quick mode unit tests
make test-frontend            # Frontend unit tests only
make test-backend-unit        # Backend unit tests only
```

### Testing Multi-Tenancy (Critical)

```python
# ALWAYS test organization isolation in your features
def test_organization_isolation(authenticated_user, other_organization):
    headers = {
        'Authorization': f"Bearer {token}",
        'X-Org-Id': other_organization['id']  # Different org!
    }
    response = client.get('/items', headers=headers)
    assert response.status_code == 403  # Must be forbidden
```

### New Feature Testing (Recent Updates)

```bash
# Test Two-Factor Authentication system
python3 -m pytest tests/e2e/api/test_two_factor_auth.py -v
python3 tests/e2e/api/run_2fa_tests.py  # Interactive 2FA test runner

# Test User Session Management
python3 -m pytest tests/e2e/api/test_user_sessions.py -v

# Test User Preferences
python3 -m pytest tests/e2e/api/test_user_preferences.py -v

# Integration test for complete 2FA login flow
python3 test_2fa_login_integration.py  # Validates complete 2FA system integration

# Run tests by specific feature markers
python3 -m pytest -m "user_preferences" -v  # User preferences system
python3 -m pytest -m "user_sessions" -v     # Session management with device tracking
```

## Common Issues & Solutions

### Port Conflicts

```bash
lsof -ti:3000 | xargs kill -9  # Next.js
lsof -ti:8000 | xargs kill -9  # FastAPI
lsof -ti:5433 | xargs kill -9  # PostgreSQL
lsof -ti:6379 | xargs kill -9  # Redis
lsof -ti:5434 | xargs kill -9  # Test PostgreSQL
lsof -ti:6380 | xargs kill -9  # Test Redis
lsof -ti:8001 | xargs kill -9  # Test API

# Alternative using make commands
make dev-stop                  # Stop Docker development environment
make test-stop                 # Stop test environment
```

### Database Issues

```bash
make db-up                     # Start PostgreSQL + Redis
cd migrations && ./migrate status    # Check current version
cd migrations && ./migrate apply     # Apply pending migrations
```

### Multi-Tenancy Violations

```python
# PROBLEM: Query without org filtering
users = db.query(User).all()  # Data leak!

# SOLUTION: Always filter by org_id
users = db.query(User).filter(User.organization_id == org_id).all()
```

```typescript
// PROBLEM: Direct API calls
fetch("/api/items")

// SOLUTION: Use BaseService
const items = await itemsService.getItems() // Auto X-Org-Id
```

### Migration Issues

```bash
# Custom migration system (NOT Alembic)
cd migrations && ./migrate status    # Check current version
cd migrations && ./migrate apply     # Apply pending migrations

# Current consolidated schema includes:
# - Core: Users, Organizations, Invites, Billing (template foundation)
# - Security: User Sessions with device tracking & automatic cleanup
# - Authentication: Two-Factor Authentication (TOTP + backup codes + recovery)
# - Personalization: User Preferences per organization (themes, notifications, quiet hours)
# - Performance: Complete indexes and constraints for multi-tenant queries

# Every migration MUST end with version tracking:
# INSERT INTO schema_versions (version, description) VALUES (X, 'Description');
```

### SAAS Mode Issues

```bash
# Check configuration sync
./check-saas-mode.sh               # Validates backend/frontend mode matching

# Mode mismatch symptoms
# - UI shows/hides incorrect features
# - Team management not working as expected
# - Registration flow inconsistent

# Fix mode mismatch
# 1. Update docker-compose.yml environment variables
# 2. Restart containers: make dev-stop && make dev-start
# 3. Verify: ./check-saas-mode.sh
```

## Internationalization (i18n)

**Languages**: English (default), Portuguese, Spanish  
**Routes**: `/[locale]/` structure mandatory  
**Translations**: 450+ keys in `messages/` directory

```typescript
// ALWAYS use translations
const t = useTranslations('admin.dashboard')
<h1>{t('title')}</h1>

// Navigation with locale
const { push } = useLocalizedNavigation()
push('/admin/settings') // → /en/admin/settings
```

## Documentation References

**Core Guides**:

- **[api/CLAUDE.md](api/CLAUDE.md)** - Backend patterns + Python style guide
- **[docs/tech/MULTI-TENANCY-GUIDE.md](docs/tech/MULTI-TENANCY-GUIDE.md)** - Architecture concepts
- **[docs/tech/MULTI-TENANCY-TEMPLATES.md](docs/tech/MULTI-TENANCY-TEMPLATES.md)** - Copy-paste templates

**Frontend**:

- **[docs/tech/FRONTEND-WORKFLOW.md](docs/tech/FRONTEND-WORKFLOW.md)** - 5-phase workflow
- **[docs/tech/SHADCN-UI-LLM-FRIENDLY.md](docs/tech/SHADCN-UI-LLM-FRIENDLY.md)** - 31 shadcn/ui components (100% compliant)
- **[docs/tech/TAILWIND-CSS-GUIDE.md](docs/tech/TAILWIND-CSS-GUIDE.md)** - Styling system
- **[docs/SHADCN_COMPLIANCE_UPDATE.md](docs/SHADCN_COMPLIANCE_UPDATE.md)** - UI compliance status

**Production**:

- **[docs/tech/PRODUCTION-MIGRATIONS-GUIDE.md](docs/tech/PRODUCTION-MIGRATIONS-GUIDE.md)** - Railway process
- **[docs/tech/RAILWAY-CLI-QUICK-COMMANDS.md](docs/tech/RAILWAY-CLI-QUICK-COMMANDS.md)** - CLI reference

**Troubleshooting**:

- **[docs/TROUBLESHOOTING-SAAS-MODE.md](docs/TROUBLESHOOTING-SAAS-MODE.md)** - B2B/B2C configuration issues

## Code Quality & Security

### Linting & Formatting

```bash
# All linting (frontend + backend)
make lint-all                  # Run all linters
make lint-fix-all             # Auto-fix all issues

# Frontend only
npm run lint                  # ESLint + Prettier check
npm run fix                   # Auto-fix frontend issues
npm run typecheck             # TypeScript validation

# Backend only
make backend-lint             # flake8 + mypy + bandit
make backend-fix              # black + isort formatting
make backend-security         # Security analysis with bandit

# Security reports
npm run security              # Backend security scan
npm run security:json         # JSON security report
npm run security:html         # HTML security report
```

### Complete CI Pipeline

```bash
make ci                       # Full CI (lint + typecheck + security + test)
make ci-quick                 # Quick CI (lint + unit tests)
make ci-security              # Security-only check
make ci-unit                  # Unit tests only

# Specialized quality commands
make lint-all                 # Run all linters (frontend + backend)
make lint-fix-all             # Auto-fix all issues (frontend + backend)
make backend-security         # Backend security analysis with bandit
```

## SAAS Mode Configuration

**Template supports two operational modes**:

### B2B Mode (Team Collaboration)
```bash
# Environment variables
SAAS_MODE=B2B
NEXT_PUBLIC_SAAS_MODE=B2B

# Features enabled
- Team member management
- Organization sharing
- Role-based permissions
- Team invitations
- Collaborative workspaces
```

### B2C Mode (Individual Use)
```bash
# Environment variables  
SAAS_MODE=B2C
NEXT_PUBLIC_SAAS_MODE=B2C

# Features enabled
- Personal workspaces
- Individual user accounts
- Auto-created personal organizations
- Single-user features focused UI
```

### Configuration Validation

```bash
# Check current mode configuration
./check-saas-mode.sh                # Validates backend/frontend mode sync

# Expected behavior verification
# B2B: Shows team features, organization management
# B2C: Hides team features, shows personal workspace UI
```

**Critical**: Both modes use the same organization-centric architecture for data isolation.

## Important Reminders

**Loved CRM - Agency-Focused CRM System** - This is a production multi-tenant CRM system with 60+ endpoints designed specifically for agencies, featuring pipeline management, VoIP integration, AI conversation summaries, and timeline-based client interactions.

**Critical Rules**:

1. Every feature MUST be organization-scoped - data isolation is existential
2. Use `useOrgContext()` (frontend) + `get_current_organization` (backend)
3. All database tables must include `organization_id` filtering
4. All frontend routes must follow `/[locale]/admin/` structure
5. All API calls must use BaseService (auto X-Org-Id headers)

**Recent System Enhancements**:

- **User Sessions Management**: Complete session tracking system with device fingerprinting and automatic cleanup
- **Two-Factor Authentication**: TOTP-based 2FA with backup codes, optional login flow, and recovery mechanisms
- **User Preferences**: Organization-scoped user settings (theme, language, notifications, quiet hours)
- **Enhanced Security**: Advanced session management with device tracking, security policies, and audit logging
- **Multi-Model Architecture**: Consolidated database schema with user_sessions, user_two_factor, and user_preferences tables

**Stack is Fixed**: Next.js 14 + FastAPI + PostgreSQL + Railway only

**95% Confidence Rule**: Following global CLAUDE.md guidelines - Never proceed without 95% certainty about requirements. Ask questions until completely clear about what needs to be built.

**99% Technical Certainty**: Use `exec-roadmap` agent to achieve 99% technical certainty before implementation, eliminating technical doubts through intensive research and validation.

**Priority Testing Rule**: Always test SUCCESS scenarios (2XX) BEFORE error validation (4XX). Functionality first, then security.

## Environment-Specific Commands

### Development Environment

```bash
# Local development (default ports)
npm run dev                    # Frontend: 3000, Backend: 8000
make db-up                     # PostgreSQL: 5433, Redis: 6379
```

### Test Environment

```bash
# Isolated test services
make test-start                # PostgreSQL: 5434, Redis: 6380, API: 8001
make test-hot-migrate          # Apply schema changes without restart
```

### Production Environment

```bash
# Railway production
make connect-db-prod           # Direct PostgreSQL connection
make db-prod-migration-apply   # Apply migrations to production
curl https://backend-production-fd50.up.railway.app/health
```

## Port Configuration Guide

### **Default Ports by Environment**

**🏠 DEVELOPMENT (Local)**
```bash
Frontend (Next.js):    http://localhost:3000
Backend (FastAPI):     http://localhost:8000 (/docs)
PostgreSQL:            localhost:5433
Redis:                 localhost:6379
```

**🧪 TEST (Docker Test Environment)**
```bash
Backend API Test:      http://localhost:8001 (/docs)
PostgreSQL Test:       localhost:5434
Redis Test:            localhost:6380
Mock Stripe:           http://localhost:9080
Mock Email UI:         http://localhost:8025
Mock Email SMTP:       localhost:1025
Mock S3:               http://localhost:9000
Mock S3 Console:       http://localhost:9001
```

**🚀 PRODUCTION (Railway)**
```bash
Frontend:              https://frontend-production-[hash].up.railway.app
Backend:               https://backend-production-[hash].up.railway.app
Database/Redis:        Private Railway network (not exposed)
```

### **🔧 Changing Development Ports**

#### **Frontend (Next.js) - Port 3000**

```bash
# Method 1: Command line
npm run dev -- --port 3001

# Method 2: Environment variable
PORT=3001 npm run dev

# Method 3: Edit package.json
"scripts": {
  "next-dev": "next dev --port 3001"
}
```

#### **Backend (FastAPI) - Port 8000**

```bash
# Method 1: Direct command
uvicorn api.main:app --host 0.0.0.0 --port 8001 --reload

# Method 2: Docker Compose (docker-compose.yml)
api:
  ports:
    - '8001:8000'  # External:Internal

# Method 3: Edit package.json
"fastapi-dev": "uvicorn api.main:app --port 8001 --reload"
```

#### **PostgreSQL - Port 5433**

```yaml
# docker-compose.yml
postgres:
  ports:
    - '5435:5432'  # New external port
```

```bash
# Update .env
DATABASE_URL="postgresql://postgres:postgres@localhost:5435/saas_starter"
```

#### **Redis - Port 6379**

```yaml
# docker-compose.yml
redis:
  ports:
    - '6380:6379'  # New external port
```

```bash
# Update .env
REDIS_URL="redis://localhost:6380"
```

### **🧪 Changing Test Environment Ports**

**Edit docker-compose.test.yml:**

```yaml
# Test API
api-test:
  ports:
    - '8002:8000'  # Change from 8001 to 8002

# Test PostgreSQL  
postgres-test:
  ports:
    - '5435:5432'  # Change from 5434 to 5435

# Test Redis
redis-test:
  ports:
    - '6381:6379'  # Change from 6380 to 6381

# Mock Services
mock-stripe:
  ports:
    - '9081:8080'  # Change from 9080 to 9081

mock-email:
  ports:
    - '1026:1025'  # SMTP
    - '8026:8025'  # Web UI

mock-s3:
  ports:
    - '9001:9000'  # API
    - '9002:9001'  # Console
```

**⚠️ IMPORTANT:** Internal container ports (after `:`) usually don't need changes, only external ports (before `:`).

### **🚀 Production Railway Ports**

**🔒 LIMITATIONS: Railway manages ports automatically**

- ✅ **Automatic**: Railway detects frameworks and configures PORT
- ❌ **Not configurable**: Internal ports managed by Railway
- ✅ **Custom Domain**: Can configure custom domains

#### **Configure Custom Domains**

```bash
# Via Railway CLI
railway domain add your-frontend.com
railway domain add api.your-frontend.com

# Via Railway Dashboard: Settings → Domains → Add Custom Domain
```

#### **Production Environment Variables**

```bash
# Configure custom URLs
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com
ALLOWED_ORIGINS=https://yourdomain.com,https://api.yourdomain.com
```

### **🔧 Port Conflict Resolution**

```bash
# Kill processes using specific ports
lsof -ti:3000 | xargs kill -9  # Next.js
lsof -ti:8000 | xargs kill -9  # FastAPI  
lsof -ti:5433 | xargs kill -9  # PostgreSQL
lsof -ti:6379 | xargs kill -9  # Redis
lsof -ti:8001 | xargs kill -9  # API Test
lsof -ti:5434 | xargs kill -9  # PostgreSQL Test
lsof -ti:6380 | xargs kill -9  # Redis Test

# Stop complete environments
make dev-stop                  # Development Docker
make test-stop                 # Test environment
```

### **📋 Port Change Checklist**

**For Development:**
- [ ] Change port in relevant configuration file
- [ ] Update environment variables (.env)
- [ ] Update URLs in configuration files
- [ ] Test connectivity between services
- [ ] Check CORS if applicable

**For Test:**
- [ ] Change docker-compose.test.yml
- [ ] Check mock service URLs
- [ ] Run `make test-rebuild` if needed
- [ ] Test complete E2E pipeline

**For Production:**
- [ ] Configure custom domain in Railway
- [ ] Update Railway environment variables
- [ ] Update ALLOWED_ORIGINS
- [ ] Test complete deployment

**See Also**: [api/CLAUDE.md](api/CLAUDE.md) for backend patterns, [docs/tech/](docs/tech/) for detailed guides, [lovedcrm.md](lovedcrm.md) for CRM product requirements

## CRM-Specific Development Patterns

### Pipeline Management
```typescript
// Frontend: Pipeline kanban with 5 fixed stages
const PIPELINE_STAGES = ['lead', 'contact', 'proposal', 'negotiation', 'closed'];

// Backend: Pipeline state transitions with validation
@router.put("/deals/{deal_id}/stage")
async def update_deal_stage(
    deal_id: str,
    new_stage: PipelineStage,
    organization: Organization = Depends(get_current_organization)
):
    return await deal_service.update_stage(deal_id, new_stage, organization.id)
```

### Timeline Integration
```typescript
// Unified timeline for all client interactions
interface TimelineEntry {
  id: string;
  type: 'call' | 'email' | 'note' | 'meeting';
  client_id: string;
  content: string;
  timestamp: Date;
  user_id: string;
  organization_id: string; // Always org-scoped
}
```

### VoIP Call Recording
```python
# Backend: Call recording with org isolation
@router.post("/calls/start")
async def start_call(
    phone_number: str,
    organization: Organization = Depends(get_current_organization)
):
    call_session = await voip_service.start_call(
        phone_number, 
        organization.id,
        auto_record=True
    )
    return call_session
```

### AI Conversation Summaries
```python
# Backend: GPT-powered conversation analysis
@router.get("/clients/{client_id}/summary")
async def get_conversation_summary(
    client_id: str,
    organization: Organization = Depends(get_current_organization)
):
    # Get last 10 interactions for the client
    interactions = await timeline_service.get_client_interactions(
        client_id, organization.id, limit=10
    )
    summary = await ai_service.generate_conversation_summary(interactions)
    return summary
```

## CRM Feature Implementation Guide

When implementing CRM features, always follow these patterns:

1. **Pipeline Operations**: All deals/leads must have `organization_id` and `stage` validation
2. **Timeline Entries**: Every client interaction creates a timeline entry with proper org scoping
3. **VoIP Integration**: Call recordings are stored with organization isolation
4. **AI Features**: Conversation summaries respect org boundaries and data access controls
5. **Email Parsing**: Incoming emails are automatically processed and org-scoped
6. **WhatsApp Integration**: Messages are threaded into the timeline with proper permissions

**Key CRM Models to Extend**:
```
api/models/
├── client.py           # Client/contact management
├── deal.py             # Sales pipeline deals
├── timeline_entry.py   # Unified interaction timeline
├── call_recording.py   # VoIP call storage
├── email_thread.py     # Email conversation tracking
└── ai_summary.py       # Conversation summaries
```
