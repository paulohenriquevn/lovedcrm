# 🚀 Multi-Tenant SaaS Starter Template

**Complete SaaS starter template** with Next.js 14 + FastAPI. Organization-centric architecture with complete data isolation, team management, and internationalization support. **Perfect foundation for your next B2B SaaS application.**

> 🎯 **STARTER TEMPLATE**: Ready-to-customize foundation for SaaS applications  
> 🔗 **LIVE DEMO**: https://frontend-production-c57a.up.railway.app  
> 📖 **Documentation**: [Template Guide](CLAUDE.md) | [Backend Development](api/CLAUDE.md) | [Customization Rules](RULES.md)

## **Quick Start**

### **Prerequisites**

- Docker & Docker Compose
- Node.js 18+ • Python 3.11+

### **Setup & Run**

```bash
# Complete setup (deps + database + migrations)
make setup

# Start development servers
npm run dev
# Frontend: http://localhost:3000
# Backend: http://localhost:8000 (API docs at /docs)
```

### **Test Everything**

```bash
# Complete test suite
make test-full

# Quick development tests
make test-quick
make test-hot-migrate        # Fast schema updates (2s vs 45s)
```

### **Production Management**

```bash
# Railway production database
make connect-db-prod         # Interactive PostgreSQL
make db-prod-migration-apply # Apply migrations

# Health checks
curl https://backend-production-fd50.up.railway.app/health
```

## 🎁 **What This Template Provides**

**🏢 Multi-Tenant Foundation Ready for Customization**

- Organization-centric: Every user auto-assigned to org on signup
- Complete data isolation between organizations (header-based)
- Team management with role-based permissions (Owner/Admin/Member)
- Email invitations with acceptance flow

**🚀 Production-Ready Features Out of the Box**

- Internationalization: English, Portuguese, Spanish (ready for your translations)
- 55+ API endpoints with comprehensive documentation (extend for your business)
- Authentication: JWT + Google OAuth + email verification (OAuth ready for your apps)
- Database: PostgreSQL with consolidated schema (add your business tables)

**⚡ Superior Developer Experience for Template Customization**

- Hot updates: 2-5s schema changes vs 45s restarts (develop your features faster)
- Complete test suite: E2E + unit + integration (460+ tests to build upon)
- Docker development environment (works anywhere)
- Extensive automation: 100+ make commands (focus on your business logic)

## 🏗️ **Template Architecture**

**Clean Architecture + Multi-Tenancy (Ready to Extend)**

```
Frontend: Next.js 14 → Container → Component → Service → Store
Backend:  Router → Service → Repository → Model (SQLAlchemy)
```

**Key Patterns Built Into the Template**

- **Frontend**: `/[locale]/admin/` routing with org context (add your business routes here)
- **Backend**: Every query filtered by `organization_id` (your tables inherit this pattern)
- **API**: X-Org-Id headers + JWT validation (automatically handles multi-tenancy)
- **Database**: Complete tenant isolation at row level (your data stays isolated)

**Modern Tech Stack (Production-Ready)**

- **Frontend**: Next.js 14, TypeScript, shadcn/ui, Tailwind, next-intl
- **Backend**: FastAPI, SQLAlchemy 2.0, PostgreSQL, Redis
- **Testing**: Playwright E2E, Vitest frontend, pytest backend (test your customizations)
- **Deployment**: Railway template with one-click deploy (your SaaS live in minutes)

## **Essential Commands**

**Development Workflow**

```bash
make setup                   # Complete project setup
npm run dev                  # Start both servers
make test-quick             # Run critical tests
make lint-all               # Code quality checks
./check-saas-mode.sh        # Verify B2B/B2C configuration
```

**Database Management**

```bash
# Local development
make db-up                  # Start PostgreSQL + Redis
cd migrations && ./migrate apply    # Apply migrations

# Production (Railway)
make connect-db-prod        # Interactive access
make db-prod-migration-apply # Apply to production
```

**Testing (Two-Phase)**

```bash
# Phase 1: Setup environment
make test-env-full          # Complete test setup

# Phase 2: Run tests
make test-run-all           # All tests
make test-run-api-auth      # Authentication tests
make test-hot-migrate       # Fast schema updates
```

## **Multi-Tenancy Security**

**Registration Flow**: User signs up → Organization auto-created → User becomes owner → JWT with org_id

**Request Flow**: Every API call includes X-Org-Id header → Middleware validates organization access → Database queries scoped to org_id

**Data Isolation**

```python
# Every query automatically org-scoped
users = db.query(User).filter(User.organization_id == org_id).all()

# All endpoints require org validation
@router.get("/members")
async def get_members(org: Organization = Depends(get_current_organization)):
    return org.members  # Automatically scoped
```

## 🔗 **Template API Foundation (55+ Endpoints Ready to Extend)**

**Authentication (12)**: Register with auto-org creation, JWT with org_id, Google OAuth, password reset, email verification

**Organizations (13)**: CRUD operations, member management, team invitations, role assignments

**Users (8)**: Profile management, organization membership, admin operations

**Roles (7)**: Permission system, role-based access control, member role management

**Billing (8)**: Subscription plans, Stripe integration, plan comparison, webhooks

**Invites (4)**: Public invitation acceptance, email-based team invitations

**System (3)**: Health checks, database status, API information

**Your Business Logic**: Add your custom endpoints following the established patterns

> 📖 **Template Customization Guide**: [Backend Development](api/CLAUDE.md) with copy-paste patterns for your features

## 🧪 **Template Testing Foundation**

**Comprehensive Test Coverage**: 460+ tests covering authentication, multi-tenancy, data isolation, member management, and i18n (build your tests on top)

**Two-Phase Testing (Perfect for Template Development)**

```bash
# 1. Setup environment once
make test-env-full              # Databases + services + Playwright

# 2. Test your customizations during development
make test-quick                 # Critical template tests (ensure you didn't break core)
make test-run-api-auth         # Authentication + org creation (always works)
make test-hot-migrate          # Fast schema updates for your tables (2s vs 45s)
```

**Template Test Foundation (Your Features Must Pass These)**

- ✅ Multi-tenant data isolation (zero cross-org access)
- ✅ Authentication flow with auto-org creation
- ✅ Member management and role-based permissions
- ✅ Internationalization routing and translations
- 🎯 **Your Business Logic Tests**: Add tests for your custom features

## **Configuration**

**Essential Environment Variables**

```bash
# Database & Redis
DATABASE_URL=postgresql://user:pass@localhost:5433/saas_db
REDIS_URL=redis://localhost:6379

# Security (Required)
SECRET_KEY=your-secret-key-min-32-chars

# Multi-Tenancy (Critical)
ENFORCE_ORGANIZATION_CONTEXT=true
ALLOW_CROSS_ORG_ACCESS=false        # Prevents data leaks
AUTO_CREATE_ORGANIZATION=true       # Auto-org on signup
```

> **Complete Configuration**: See [CLAUDE.md](CLAUDE.md) for all environment variables and deployment configs

## 🚀 **Deploy Your Customized Template**

### 🎯 **One-Click Railway Deployment**

This **SaaS starter template** includes everything you need for instant deployment. Perfect for launching your customized SaaS quickly:

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.com/new/template/saas-multi-tenant-base)

#### **Template Deployment Flow (Recommended):**

1. **⭐ Star this repository** for future reference
2. **🍴 Fork this repository** to your GitHub account
3. **🎨 Customize the template** for your specific SaaS needs:
   - Update branding in `lib/design-tokens.ts`
   - Add your business logic in `api/services/` and `containers/`
   - Extend the database schema in `migrations/`
   - Customize UI components in `components/`
4. **🚀 Deploy with Railway Template:**
   - Click the Railway button above
   - **Connect your customized fork** during template deployment
   - **Configure your environment variables** (API keys, domains, etc.)
   - Railway automatically creates:
     - 🎨 Frontend service (your customized Next.js app)
     - ⚡ Backend service (your customized FastAPI)
     - 🗄️ PostgreSQL database with SSL
     - 🔄 Redis cache for sessions
     - 🔗 All environment variables and internal networking

5. **🎉 Your customized SaaS is live** in minutes!

#### **What gets deployed automatically:**

- **Frontend**: Next.js 14 with shadcn/ui and Tailwind
- **Backend**: FastAPI with authentication and multi-tenancy
- **Database**: PostgreSQL 16 with SSL certificates
- **Cache**: Redis for sessions and caching
- **Networking**: Internal service communication configured
- **Variables**: Cross-service environment variables set up

#### **Manual Railway Setup (Alternative):**

**Production (Railway)**

- Frontend: https://frontend-production-c57a.up.railway.app
- Backend: https://backend-production-fd50.up.railway.app
- Status: Live with consolidated database schema (optimized 2025-08-03)

**Local Production Build**

```bash
npm run build && npm start         # Next.js production
cd migrations && ./migrate apply    # Database migrations
docker-compose up -d               # Full Docker setup
```

**Production Management**

```bash
make connect-db-prod               # PostgreSQL access
make db-prod-migration-apply       # Apply migrations
curl https://backend-production-fd50.up.railway.app/health  # Health check
```

## **Contributing**

**Development Guidelines**

- **Multi-Tenancy First**: All features must be organization-scoped
- **Database Isolation**: Every query includes `org_id` filtering
- **Frontend Context**: Use `useOrgContext()` + `useTranslations()` hooks
- **Testing Required**: Verify data isolation between orgs (`make test-full`)

**Process**: Fork → Create feature branch → Add tests → Submit PR

## **Documentation**

**Essential Guides**

- **[CLAUDE.md](CLAUDE.md)** - Complete development guide + architecture
- **[api/CLAUDE.md](api/CLAUDE.md)** - FastAPI backend implementation guide
- **[Railway Template Integration](docs/RAILWAY-TEMPLATE-INTEGRATION.md)** - Railway deployment guide
- **[Railway CLI Guide](docs/RAILWAY-CLI-QUICK-COMMANDS.md)** - Production management

**Feature Guides**

- **[Multi-Tenancy Guide](docs/MULTI-TENANCY-GUIDE.md)** - Implementation patterns
- **[Frontend Guide](docs/FRONTEND-WORKFLOW.md)** - Complete workflow
- **[SAAS Mode Troubleshooting](docs/TROUBLESHOOTING-SAAS-MODE.md)** - B2B/B2C configuration issues
- **[i18n System](docs/I18N-SYSTEM-DOCUMENTATION.md)** - Complete internationalization guide

**Reference**

- **[shadcn/ui Components](docs/SHADCN-UI-LLM-FRIENDLY.md)** - UI library reference
- **[Tailwind CSS](docs/TAILWIND-CSS-GUIDE.md)** - Styling system guide

## **Template Usage**

This repository is designed as a **SaaS starter template**. Here's how to use it effectively:

### **For New SaaS Projects:**

1. **Fork** this repository
2. **Customize** branding, features, and business logic
3. **Deploy** using the Railway template button above
4. **Launch** your SaaS in production

### **Key Template Features:**

- **Multi-tenant architecture** ready for B2B SaaS
- **Billing integration** with Stripe
- **Authentication system** with roles and permissions
- **Internationalization** support (EN/PT/ES)
- **Production-ready** deployment configuration
- **Comprehensive testing** setup
- **Developer-friendly** documentation and tooling

### **Customization Areas:**

- **Branding**: Update colors, logos, and styling in `lib/design-tokens.ts`
- **Features**: Add your business logic in `api/services/` and `containers/`
- **UI Components**: Extend or modify components in `components/`
- **Database Schema**: Add your tables via migrations in `migrations/`
- **API Endpoints**: Add your routes in `api/routers/`

This template eliminates months of initial development and lets you focus on your unique value proposition.

## 🎯 **Why Choose This SaaS Starter Template?**

✅ **Battle-Tested Foundation**: 55+ endpoints already working in production (see demo)  
✅ **True Multi-Tenancy Built-In**: Organization-scoped data isolation (no data leaks)  
✅ **Superior Developer Experience**: 2s hot updates, 460+ tests, 100+ automation commands  
✅ **Complete Modern Stack**: Authentication, billing, i18n, clean architecture ready to extend

**Perfect Template For**: B2B SaaS, team collaboration tools, client management systems, or any application requiring strict multi-tenant data isolation.

**What Makes This Template Special**: Unlike basic starters, this template includes the complex multi-tenancy patterns that take months to implement correctly. Start building your business logic immediately instead of solving infrastructure problems.

---

🔓 **License**: MIT - Use as foundation for your commercial SaaS applications  
🚀 **Get Started**: `make setup && npm run dev` (your template is running in 2 minutes)  
⭐ **Star this repo** if this template helps your SaaS development!
