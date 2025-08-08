# 💜 Loved CRM - CRM para Agências Digitais

**O único CRM que agências digitais brasileiras realmente precisam.** Pipeline Kanban fixo, WhatsApp Business, VoIP integrado e IA para resumos automáticos - tudo em uma única plataforma moderna.

> 🎯 **FOCO LASER**: Agências digitais de 5-20 colaboradores no Brasil  
> 🔗 **LIVE DEMO**: https://frontend-production-c57a.up.railway.app  
> 📖 **Documentation**: [Development Guide](CLAUDE.md) | [Backend API](api/CLAUDE.md) | [Product Vision](docs/project/01-vision.md)

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

## 🎁 **Funcionalidades Core do Loved CRM**

**📊 Pipeline Visual Kanban Fixo**

- 5 estágios obrigatórios: Lead → Contato → Proposta → Negociação → Fechado
- Drag & drop para movimentação intuitiva de leads
- Cards completos com valor, prioridade, contato e next actions
- Filtros avançados por responsável, valor e data

**🔗 Comunicação Unificada**

- WhatsApp Business API integrado (Enterprise tier)
- VoIP click-to-call com gravação automática
- Timeline cronológica de todas as interações
- Email parsing automático para captura de leads

**🤖 Inteligência Artificial**

- Resumos automáticos de conversas com sentiment analysis
- Insights de probabilidade de conversão
- Sugestão de próximas ações baseada no histórico
- Análise de padrões de comunicação

**🏢 Multi-Tenancy para Agências**

- Isolamento completo de dados entre organizações (agencies)
- Contexto organizacional em TODAS as operações
- Colaboração segura entre membros da equipe
- Role-based permissions (Owner/Admin/Member)

## 🏗️ **Arquitetura CRM Organisation-Centric**

**Clean Architecture + Multi-Tenancy Focada em Agências**

```
Frontend: Next.js 14 → CRM Container → Component → Service → Store
Backend:  CRM Router → Service → Repository → Model (SQLAlchemy)
```

**Padrões CRM Implementados**

- **Frontend**: `/[locale]/admin/` routing with org context para agências
- **Backend**: TODAS as queries filtradas por `organization_id` (isolamento total)
- **API**: X-Org-Id headers + JWT validation (multi-tenancy seguro)
- **Database**: Isolamento completo ao nível de linha (dados organizacionais protegidos)

**Fluxo Core Organization-Centric**

- User Registration → Auto-Create Organization → User = Owner → JWT with org_id → All Operations Org-Scoped

**Stack Técnico Loved CRM (Production-Ready)**

- **Frontend**: Next.js 14, TypeScript, shadcn/ui, Tailwind CSS, Zustand, TanStack Query
- **Backend**: FastAPI, SQLAlchemy 2.0, PostgreSQL 16, Redis, Pydantic
- **CRM Features**: Pipeline Kanban, Timeline System, AI Summaries, WhatsApp API, VoIP
- **Testing**: 460+ tests - Playwright E2E, Vitest frontend, pytest backend
- **Deployment**: Railway com deploy automático (CRM online em minutos)

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
