# Solution Diagrams - Loved CRM

## 1. Architecture Overview

**System Stack**: Next.js 14 + FastAPI + PostgreSQL + Railway  
**Multi-Tenancy**: organization_id isolation across all layers  
**Integration Pattern**: Dual provider architecture para WhatsApp + VoIP  
**Total Diagrams**: 10 comprehensive technical diagrams  

**Template Foundation Verified:**
- ✅ 32 componentes shadcn/ui disponíveis no sistema atual
- ✅ FastAPI com 8 routers principais já implementados
- ✅ Multi-tenant organization middleware já ativo
- ✅ Configuração Tailwind com cores CRM customizadas
- ✅ Railway deployment com proxy Next.js configurado

## 2. System Architecture Diagram

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           LOVED CRM - COMPLETE SYSTEM                           │
│                        Multi-Tenant B2B CRM Architecture                        │
└─────────────────────────────────────────────────────────────────────────────────┘

                                PRESENTATION LAYER
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            Next.js 14 Frontend                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   Landing Page  │  │  Admin Dashboard │  │  CRM Interface  │  │ Auth Pages   │ │
│  │   /[locale]/    │  │ /[locale]/admin  │  │ /admin/crm/*    │  │ /auth/*      │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  └──────────────┘ │
│                                     │                                           │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │          shadcn/ui Components + Tailwind CSS (32 components)               │ │
│  │  • Pipeline Kanban    • WhatsApp Chat     • AI Summary     • Team Mgmt    │ │
│  │  • Lead Management    • VoIP Interface    • Templates      • Billing      │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                            ┌──────────────────────┐
                            │  X-Org-Id Headers    │
                            │  JWT + Org Context   │
                            │  Railway Proxy       │
                            └──────────────────────┘
                                        │
                                APPLICATION LAYER
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           FastAPI Backend (Python 3.11+)                       │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                        MIDDLEWARE STACK                                    │ │
│  │  SecurityHeaders → OrganizationContext → RateLimit → SentryContext        │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                            CORE ROUTERS                                     │ │
│  │  /auth      /organizations   /users        /billing      /crm/leads        │ │
│  │  /invites   /roles          /preferences  /websocket                       │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                         BUSINESS LAYER                                      │ │
│  │  Services → Repositories → Models (SQLAlchemy 2.0)                        │ │
│  │  • Multi-tenant isolation    • AI integration      • Provider management   │ │
│  │  • Lead scoring pipeline     • Real-time messaging • Background jobs       │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                 DATA LAYER
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           PostgreSQL 16 Database                               │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                        MULTI-TENANT SCHEMA                                 │ │
│  │                                                                             │ │
│  │  Core: organizations, users, organization_members, subscriptions           │ │
│  │  Business: leads, pipeline_stages, messages, call_logs, templates          │ │
│  │  Providers: whatsapp_configs, voip_configs, marketing_integrations         │ │
│  │  AI/ML: ai_conversations, lead_scoring_models, analytics_events            │ │
│  │  System: api_keys, webhook_subscriptions, background_jobs, audit_logs      │ │
│  │                                                                             │ │
│  │  🔒 ALL TABLES: organization_id isolation + performance indexes            │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  ┌─────────────────────────┐  ┌─────────────────────────┐                      │
│  │      Redis Cache        │  │    Background Jobs      │                      │
│  │  • Session storage      │  │  • Email sending        │                      │
│  │  • Real-time messaging  │  │  • AI processing        │                      │
│  │  • AI context cache     │  │  • Webhook delivery     │                      │
│  └─────────────────────────┘  └─────────────────────────┘                      │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                             INTEGRATION LAYER
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          External Integrations                                 │
│                                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   WhatsApp      │  │     VoIP        │  │   AI Services   │  │  Marketing   │ │
│  │ Business API ✅  │  │  Twilio ✅       │  │  OpenAI GPT-4   │  │ Facebook Ads │ │
│  │ Web API (alt) ⚠️ │  │  Telnyx (alt)   │  │  Sentiment AI   │  │ Google Ads   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  └──────────────┘ │
│                                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │    Calendar     │  │    Billing      │  │     Email       │  │   Storage    │ │
│  │ Google Calendar │  │    Stripe       │  │   SendGrid      │  │   Railway    │ │
│  │  OAuth2 + Sync  │  │  Connect API    │  │   Templates     │  │   File Store │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘

Legend:
  ✅ Primary Provider    ⚠️ Alternative Provider    🔒 Security Layer
  → Data Flow           ← Response Flow           ═ Multi-tenant Isolation
```

### Multi-Tenant Data Flow

```
USER REQUEST                     ORGANIZATION VALIDATION             DATABASE ACCESS
─────────────                    ───────────────────────             ───────────────
┌─────────────┐                  ┌─────────────────────┐             ┌─────────────┐
│ Frontend    │ ── X-Org-Id ───→ │ Organization        │ ── org_id ─→│ PostgreSQL  │
│ JWT Token   │    Header        │ Context Middleware  │    Filter   │ Query with  │
│ User Action │                  │                     │             │ org_id = ?  │
└─────────────┘                  └─────────────────────┘             └─────────────┘
       │                                    │                               │
       │                         ┌─────────────────────┐                   │
       │                         │ VALIDATION RULES    │                   │
       │                         │ • JWT org matches   │                   │
       │                         │ • Header org valid  │                   │
       │                         │ • User in org       │                   │
       │                         │ • Cross-org denied  │                   │
       │                         └─────────────────────┘                   │
       │                                    │                               │
       │                         ┌─────────────────────┐                   │
       └────── RESPONSE ─────────│ 200: Success       │←──── RESULT ───────┘
                                 │ 403: Org mismatch  │
                                 │ 401: No auth       │
                                 │ 422: Invalid data  │
                                 └─────────────────────┘
```

## 3. Database Schema Diagrams

### Core Multi-Tenant Schema

```
FOUNDATION TABLES (Multi-Tenancy Core)
═══════════════════════════════════════

┌─────────────────────┐         ┌─────────────────────┐
│    organizations    │         │        users        │
│ ─────────────────── │         │ ─────────────────── │
│ id (PK) UUID        │    ┌────│ id (PK) UUID        │
│ name VARCHAR(255)   │    │    │ email VARCHAR(255)  │
│ slug VARCHAR(100)   │    │    │ password_hash       │
│ plan_tier VARCHAR   │    │    │ full_name           │
│ settings JSONB      │    │    │ is_active BOOLEAN   │
│ features_enabled    │    │    │ email_verified      │
│ created_at          │    │    │ last_login_at       │
│ updated_at          │    │    │ created_at          │
└─────────────────────┘    │    │ updated_at          │
           │               │    └─────────────────────┘
           │ 1:N           │               │
           │               │               │ N:M
           ▼               │               ▼
┌─────────────────────────────────────────────────────────┐
│             organization_members                        │
│ ─────────────────────────────────────────────────────── │
│ id (PK) UUID                                            │
│ organization_id (FK) → organizations.id                 │
│ user_id (FK) → users.id                                 │
│ role VARCHAR(50) (admin, manager, sales, viewer)        │
│ permissions JSONB                                       │
│ is_active BOOLEAN                                       │
│ joined_at TIMESTAMPTZ                                   │
│ UNIQUE(organization_id, user_id)                        │
└─────────────────────────────────────────────────────────┘
```

### Business Logic Schema

```
PIPELINE & LEAD MANAGEMENT
═══════════════════════════

┌─────────────────────┐ 1:N  ┌─────────────────────┐ 1:N  ┌─────────────────────┐
│  pipeline_stages    │─────▶│       leads         │─────▶│   lead_activities   │
│ ─────────────────── │      │ ─────────────────── │      │ ─────────────────── │
│ id (PK)             │      │ id (PK)             │      │ id (PK)             │
│ organization_id (FK)│      │ organization_id (FK)│      │ organization_id (FK)│
│ name VARCHAR(100)   │      │ full_name           │      │ lead_id (FK)        │
│ stage_order INTEGER │      │ email               │      │ user_id (FK)        │
│ color VARCHAR(7)    │      │ phone               │      │ activity_type       │
│ is_active BOOLEAN   │      │ company             │      │ title VARCHAR(255)  │
│ stage_type VARCHAR  │      │ stage_id (FK)       │      │ description TEXT    │
│ created_at          │      │ assigned_to (FK)    │      │ metadata JSONB      │
│ updated_at          │      │ source VARCHAR      │      │ duration_minutes    │
└─────────────────────┘      │ lead_score INTEGER  │      │ external_id         │
                             │ probability_%       │      │ external_provider   │
                             │ estimated_value     │      │ created_at          │
                             │ custom_fields JSONB │      └─────────────────────┘
                             │ status VARCHAR      │
                             │ converted_at        │
                             │ created_at          │
                             │ updated_at          │
                             └─────────────────────┘

Organization Isolation: ALL tables have organization_id with indexes
Performance Indexes: ix_leads_org_stage, ix_activities_org_lead_created
Constraints: stage_id must belong to same organization as lead
```

### Communication Provider Schema

```
DUAL PROVIDER ARCHITECTURE
═══════════════════════════

┌─────────────────────────────────────────────────────────┐
│                whatsapp_configs                         │
│ ─────────────────────────────────────────────────────── │
│ id (PK) UUID                                            │
│ organization_id (FK) → organizations.id                 │
│ provider_type VARCHAR(50) (business_api, web_unofficial)│
│ is_active BOOLEAN                                       │
│                                                         │
│ -- Business API fields                                  │
│ business_phone_id VARCHAR(100)                          │
│ access_token TEXT                                       │
│ webhook_verify_token VARCHAR(255)                       │
│                                                         │
│ -- Web API fields                                       │
│ session_id VARCHAR(100)                                 │
│ qr_code_data TEXT                                       │
│ connection_status VARCHAR(50)                           │
│                                                         │
│ config_data JSONB                                       │
│ UNIQUE: one active config per organization              │
└─────────────────────────────────────────────────────────┘
                             │
                             ▼ 1:N
┌─────────────────────────────────────────────────────────┐
│                     messages                            │
│ ─────────────────────────────────────────────────────── │
│ id (PK) UUID                                            │
│ organization_id (FK) → organizations.id                 │
│ lead_id (FK) → leads.id (nullable)                      │
│ conversation_id UUID                                    │
│                                                         │
│ provider_type VARCHAR(50)                               │
│ provider_message_id VARCHAR(255)                        │
│ direction VARCHAR(10) (inbound, outbound)              │
│ message_type VARCHAR(50) (text, image, audio, etc)     │
│ content TEXT                                            │
│                                                         │
│ from_number VARCHAR(50)                                 │
│ to_number VARCHAR(50)                                   │
│ contact_name VARCHAR(255)                               │
│                                                         │
│ status VARCHAR(50) (pending, sent, delivered, read)    │
│ delivered_at TIMESTAMPTZ                                │
│ read_at TIMESTAMPTZ                                     │
│                                                         │
│ -- AI Analysis                                          │
│ sentiment_score FLOAT (-1.0 to 1.0)                    │
│ urgency_score INTEGER (0-100)                          │
│ ai_summary TEXT                                         │
│ ai_processed_at TIMESTAMPTZ                            │
│                                                         │
│ metadata JSONB                                          │
│ created_at TIMESTAMPTZ                                  │
│ updated_at TIMESTAMPTZ                                  │
└─────────────────────────────────────────────────────────┘

Similar pattern for VoIP with voip_configs and call_logs tables
```

### AI & Machine Learning Schema

```
AI CONTEXT MANAGEMENT
══════════════════════

┌─────────────────────┐ 1:N  ┌─────────────────────┐ 1:N  ┌─────────────────────┐
│ lead_scoring_models │─────▶│  ai_conversations   │─────▶│  ai_training_data   │
│ ─────────────────── │      │ ─────────────────── │      │ ─────────────────── │
│ id (PK)             │      │ id (PK)             │      │ id (PK)             │
│ organization_id (FK)│      │ organization_id (FK)│      │ organization_id (FK)│
│ model_name          │      │ lead_id (FK)        │      │ created_by (FK)     │
│ model_version       │      │ conversation_title  │      │ data_type VARCHAR   │
│ model_type VARCHAR  │      │ context_summary     │      │ category VARCHAR    │
│ config_data JSONB   │      │ total_messages      │      │ input_text TEXT     │
│ scoring_factors     │      │ status VARCHAR      │      │ expected_output     │
│ accuracy_score      │      │ handed_off_to (FK)  │      │ is_approved BOOLEAN │
│ precision_score     │      │ handed_off_at       │      │ usage_count INTEGER │
│ is_active BOOLEAN   │      │ total_tokens_used   │      │ success_rate FLOAT  │
│ training_completed  │      │ context_tokens      │      │ created_at          │
│ created_at          │      │ qualification_score │      │ updated_at          │
│ updated_at          │      │ success_outcome     │      └─────────────────────┘
└─────────────────────┘      │ created_at          │
                             │ updated_at          │
                             └─────────────────────┘

Organization-Specific Features:
• Each org has independent AI models and training data
• Context summaries isolated by organization_id
• Token usage tracked per organization for billing
• One active scoring model per organization constraint
```

## 4. API Architecture Diagrams

### API Endpoint Structure (Template-Compliant)

```
FASTAPI ROUTER ORGANIZATION (No /api/v1 prefix - Template Pattern)
════════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────────┐
│                        EXISTING ENDPOINTS                           │
│                     (Template Foundation)                           │
└─────────────────────────────────────────────────────────────────────┘

/auth/*                     /organizations/*               /billing/*
├─ POST /register          ├─ GET /current                ├─ GET /subscription
├─ POST /login             ├─ PUT /current                ├─ POST /create-checkout
├─ POST /refresh           ├─ GET /current/members        ├─ POST /webhook
├─ POST /reset-password    ├─ POST /invite-member         └─ GET /usage
└─ POST /verify-email      └─ DELETE /members/{user_id}

/users/*                   /crm/leads/* (Basic)          /websocket/*
├─ GET /me                 ├─ GET /                      ├─ WebSocket /ws
├─ PUT /me                 ├─ POST /                     └─ Real-time updates
├─ DELETE /me              ├─ PUT /{lead_id}
└─ GET /preferences        └─ DELETE /{lead_id}

┌─────────────────────────────────────────────────────────────────────┐
│                          NEW ENDPOINTS                              │
│                    (To Be Implemented)                             │
└─────────────────────────────────────────────────────────────────────┘

/crm/pipeline/*                    /integrations/*
├─ GET /stages                    ├─ GET /whatsapp
├─ POST /stages                   ├─ POST /whatsapp/setup
├─ PUT /stages/{id}               ├─ PUT /whatsapp/switch
├─ DELETE /stages/{id}            ├─ POST /whatsapp/qr-code
└─ PATCH /leads/{id}/stage        ├─ GET /voip
                                  ├─ POST /voip/setup
/crm/leads/* (Enhanced)           ├─ PUT /voip/switch
├─ GET /activities                ├─ GET /calendar
├─ POST /score                    ├─ POST /calendar/oauth
├─ PUT /assign                    └─ POST /calendar/oauth/callback
├─ GET /messages
├─ POST /messages                 /ai/*
└─ POST /calls                    ├─ GET /conversations
                                  ├─ POST /conversations
/crm/templates/*                  ├─ POST /conversations/{id}/messages
├─ GET /                          ├─ POST /conversations/{id}/handoff
├─ POST /                         ├─ POST /analyze/sentiment
├─ PUT /{id}                      ├─ GET /leads/{id}/score
├─ GET /{id}/stats                └─ PUT /leads/{id}/score
├─ POST /{id}/use
└─ GET /suggestions               /analytics/*
                                  ├─ GET /pipeline
/api-keys/*                       ├─ GET /leads
├─ GET /                          ├─ GET /communication
├─ POST /                         ├─ GET /team
├─ PUT /{id}/scopes               └─ POST /custom-report
└─ DELETE /{id}
```

### Multi-Tenancy API Flow

```
API REQUEST PROCESSING FLOW
════════════════════════════

┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Next.js Proxy  │    │   FastAPI       │
│   X-Org-Id:     │───▶│   Rewrite Rules  │───▶│   Organization  │
│   uuid-123      │    │   /api/* →       │    │   Middleware    │
│   JWT: Bearer.. │    │   backend:8000/* │    │   Validation    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                         │
                                                         ▼
                                                ┌─────────────────┐
                                                │  VALIDATION     │
                                                │  ─────────────  │
                                                │  1. JWT valid?  │
                                                │  2. Org exists? │
                                                │  3. User in org?│
                                                │  4. Headers OK? │
                                                └─────────────────┘
                                                         │
                                    ┌────────────────────┼────────────────────┐
                                    ▼                    ▼                    ▼
                           ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
                           │  ✅ SUCCESS     │  │  ❌ 403 ERROR   │  │  ❌ 401 ERROR   │
                           │  Pass org       │  │  Org mismatch   │  │  No auth/       │
                           │  context to     │  │  User not in    │  │  Invalid token  │
                           │  business layer │  │  organization   │  │                 │
                           └─────────────────┘  └─────────────────┘  └─────────────────┘
                                    │
                                    ▼
                           ┌─────────────────┐
                           │  BUSINESS LAYER │
                           │  Service calls  │
                           │  Repository     │
                           │  with org_id    │
                           │  filtering      │
                           └─────────────────┘
                                    │
                                    ▼
                           ┌─────────────────┐
                           │  DATABASE       │
                           │  SELECT * FROM  │
                           │  table WHERE    │
                           │  organization_id│
                           │  = ?            │
                           └─────────────────┘
```

### Provider Integration Architecture

```
DUAL PROVIDER INTEGRATION PATTERN
══════════════════════════════════

WhatsApp Integration:
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           WHATSAPP DUAL PROVIDER                               │
└─────────────────────────────────────────────────────────────────────────────────┘

OPTION 1: Business API (Official)          OPTION 2: Web API (Unofficial)
┌─────────────────────────────┐           ┌─────────────────────────────┐
│ WhatsApp Business Platform  │           │    whatsapp-web.js Node     │
│ ──────────────────────────  │           │ ──────────────────────────  │
│ • Meta Official API         │           │ • QR Code Authentication    │
│ • Conversation-based billing│           │ • Session Management        │
│ • Requires approval         │           │ • WebSocket Connection      │
│ • High reliability          │           │ • Risk of account ban       │
│ • Enterprise features       │           │ • Free to use              │
└─────────────────────────────┘           └─────────────────────────────┘
               │                                         │
               ▼                                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    UNIFIED WHATSAPP SERVICE                         │
│ ─────────────────────────────────────────────────────────────────── │
│                                                                     │
│ class WhatsAppService:                                              │
│   async def send_message(self, org_id, provider_type, **kwargs):    │
│     if provider_type == BUSINESS_API:                               │
│       return await self.business_api.send_message(org_id, **kwargs) │
│     elif provider_type == WEB_UNOFFICIAL:                           │
│       return await self.web_service.send_message(org_id, **kwargs)  │
│                                                                     │
│ Organization Config:                                                │
│   organization_id: UUID                                             │
│   provider_type: WhatsAppProvider                                   │
│   business_api_config: Optional[BusinessAPIConfig]                  │
│   web_session_config: Optional[WebSessionConfig]                    │
└─────────────────────────────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    UNIFIED MESSAGE STORAGE                          │
│ provider_type: 'whatsapp_business' or 'whatsapp_web'               │
│ All messages stored with same schema regardless of provider        │
│ Hot-swap capability preserves message history                      │
└─────────────────────────────────────────────────────────────────────┘

Similar pattern for VoIP (Twilio vs Telnyx)
```

## 5. User Journey Flow Diagrams

### Pipeline Management Journey

```
PIPELINE KANBAN VISUAL MANAGEMENT
══════════════════════════════════

User Story: "Como gestor comercial quero arrastar leads entre estágios customizáveis"

┌─────────────────────────────────────────────────────────────────────────────────┐
│                           DRAG & DROP PIPELINE                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

[USER ACTION]          [FRONTEND]              [BACKEND]              [DATABASE]
     │                      │                      │                      │
     ├─ Load Pipeline ────▶ │                      │                      │
     │                      ├─ GET /crm/pipeline/ ▶│                      │
     │                      │   stages             │                      │
     │                      │                      ├─ Query stages WHERE ▶│
     │                      │                      │   organization_id=?  │
     │                      │ ◀──── stages[] ──────│ ◀─── results ────────│
     │                      │                      │                      │
     ├─ Drag Lead Card ───▶ │ @dnd-kit/core        │                      │
     │   (Stage: Lead →     │ onDragEnd()          │                      │
     │    Contact)          │                      │                      │
     │                      │                      │                      │
     ├─ Drop Validation ──▶ │ Optimistic Update    │                      │
     │                      │ UI shows movement    │                      │
     │                      │                      │                      │
     │                      ├─ PATCH /crm/leads/  ▶│                      │
     │                      │   {id}/stage         │                      │
     │                      │ {new_stage_id: uuid} │                      │
     │                      │                      │                      │
     │                      │                      ├─ Validate lead &    ▶│
     │                      │                      │   stage belong to    │
     │                      │                      │   same org_id        │
     │                      │                      │                      │
     │                      │                      ├─ UPDATE leads SET   ▶│
     │                      │                      │   stage_id=? WHERE   │
     │                      │                      │   id=? AND org_id=?  │
     │                      │                      │                      │
     │                      │                      ├─ INSERT activity    ▶│
     │                      │                      │   (stage_change)     │
     │                      │                      │                      │
     │                      │ ◀─── success ────────│ ◀─── committed ──────│
     │                      │                      │                      │
     │                      ├─ WebSocket Broadcast│                      │
     │                      │   to org members     │                      │
     │                      │                      │                      │
     │ ◀─ Real-time Update ─│ Other users see      │                      │
     │   (Other users)      │ lead movement        │                      │

Edge Cases Handled:
• Concurrent movement: Optimistic locking + conflict resolution
• Network failure: Rollback + retry mechanism  
• Cross-org attempt: 403 Forbidden + audit log
• Invalid stage: Validation + user feedback
```

### WhatsApp Communication Journey

```
WHATSAPP CONVERSATION WORKFLOW
══════════════════════════════

User Story: "Como vendedor quero conversar com leads diretamente no CRM"

┌─────────────────────────────────────────────────────────────────────────────────┐
│                        WHATSAPP CHAT INTEGRATION                               │
└─────────────────────────────────────────────────────────────────────────────────┘

SETUP PHASE:
[ADMIN]               [FRONTEND]              [BACKEND]              [DATABASE]
    │                      │                      │                      │
    ├─ Choose Provider ──▶ │ Provider Selection   │                      │
    │   (Business API)     │ Interface            │                      │
    │                      │                      │                      │
    │                      ├─ POST /integrations/▶│                      │
    │                      │   whatsapp/setup     │                      │
    │                      │ {provider_type:      │                      │
    │                      │  business_api,       │                      │
    │                      │  phone_id: "123",    │                      │
    │                      │  access_token: "..."} │                      │
    │                      │                      │                      │
    │                      │                      ├─ Validate & Test    │
    │                      │                      │   WhatsApp API       │
    │                      │                      │                      │
    │                      │                      ├─ INSERT whatsapp_   ▶│
    │                      │                      │   configs WHERE      │
    │                      │                      │   organization_id=?  │
    │                      │                      │                      │
    │                      │ ◀─── setup_status ──│ ◀─── config_saved ───│

MESSAGING PHASE:
[LEAD]                [WHATSAPP]              [WEBHOOK]              [CRM SYSTEM]
    │                      │                      │                      │
    ├─ Send Message ─────▶ │ WhatsApp Business    │                      │
    │   "Hi, interested    │ Receives message     │                      │
    │    in your service"  │                      │                      │
    │                      │                      │                      │
    │                      ├─ Webhook ──────────▶ │ POST /webhooks/     │
    │                      │ {                    │   whatsapp/{org_id} │
    │                      │   message_id: "...", │                     │
    │                      │   from: "+5511...",  │                     │
    │                      │   content: "Hi..."   │                     │
    │                      │ }                    │                     │
    │                      │                      │                     │
    │                      │                      ├─ Validate Signature▶│
    │                      │                      │   & Organization     │
    │                      │                      │                     │
    │                      │                      ├─ Process Message   ▶│
    │                      │                      │   • Lead matching   │
    │                      │                      │   • Store message   │
    │                      │                      │   • AI analysis     │
    │                      │                      │                     │
    │                      │                      │ ◀─── processed ─────│
    │                      │                      │                     │
    │                      │                      ├─ WebSocket         ▶│
    │                      │                      │   Broadcast to       │
    │                      │                      │   Assigned Rep       │

[SALES REP]           [FRONTEND]              [BACKEND]              [WHATSAPP]
    │                      │                      │                      │
    │ ◀─ Notification ─────│ Real-time message    │                      │
    │   (New message)      │ appears in CRM       │                      │
    │                      │                      │                      │
    ├─ Reply in CRM ─────▶ │ Chat Interface       │                      │
    │   "Thanks for your   │ (WhatsApp-like UI)   │                      │
    │    interest!"        │                      │                      │
    │                      │                      │                      │
    │                      ├─ POST /crm/leads/   ▶│                      │
    │                      │   {id}/messages      │                      │
    │                      │ {                    │                      │
    │                      │   content: "Thanks", │                      │
    │                      │   provider: "whatsapp"│                     │
    │                      │ }                    │                      │
    │                      │                      │                      │
    │                      │                      ├─ Send via WhatsApp ▶│
    │                      │                      │   Business API       │
    │                      │ ◀─── message_sent ───│ ◀─── delivered ──────│
    │                      │                      │                      │
    │ ◀─ Confirmation ─────│ Message delivered    │                      │
    │   (Delivered)        │ status updated       │                      │
```

### AI-Powered Lead Qualification Journey

```
AI CONVERSATION & LEAD SCORING
═══════════════════════════════

User Story: "Como agência quero chatbot que qualifica leads automaticamente"

┌─────────────────────────────────────────────────────────────────────────────────┐
│                         AI QUALIFICATION FLOW                                  │
└─────────────────────────────────────────────────────────────────────────────────┘

[LEAD]                [AI SYSTEM]             [HUMAN HANDOFF]         [LEARNING]
    │                      │                      │                      │
    ├─ Initial Contact ──▶ │ AI Conversation      │                      │
    │   "Hi, need website" │ Detected             │                      │
    │                      │                      │                      │
    │                      ├─ Context Analysis   ▶│                      │
    │                      │ • Industry detection │                      │
    │                      │ • Intent classification│                     │
    │                      │ • Urgency assessment │                      │
    │                      │                      │                      │
    │                      ├─ OpenAI GPT-4      ▶│                      │
    │                      │ "I'd be happy to    │                      │
    │                      │  help! What type    │                      │
    │                      │  of website?"       │                      │
    │                      │                      │                      │
    │ ◀─ AI Response ──────│ < 2 seconds         │                      │
    │   (Contextual)       │                      │                      │
    │                      │                      │                      │
    ├─ Lead Responds ────▶ │ "E-commerce for     │                      │
    │   "E-commerce for    │  clothing brand"    │                      │
    │    clothing brand"   │                      │                      │
    │                      │                      │                      │
    │                      ├─ Qualification Q's  ▶│                      │
    │                      │ • Budget range?     │                      │
    │                      │ • Timeline?         │                      │
    │                      │ • Decision maker?   │                      │
    │                      │                      │                      │
    │                      ├─ Real-time Scoring ▶│                      │
    │                      │ Budget: High (8/10) │                      │
    │                      │ Urgency: Med (6/10) │                      │
    │                      │ Fit: High (9/10)    │                      │
    │                      │ TOTAL SCORE: 85/100 │                      │
    │                      │                      │                      │
    │                      ├─ Handoff Decision  ▶│                      │
    │                      │ Score ≥ 80 → Human │                      │
    │                      │                     │                      │
    │                      ├─ Context Transfer ─▶ │ Human Rep Notified   │
    │                      │ Full conversation   │ "High-value lead     │
    │                      │ history + score     │  ready for handoff"  │
    │                      │ breakdown           │                      │
    │                      │                     │                      │
    │                      │                     ├─ Seamless Takeover ▶│
    │                      │                     │ "Hi! I'm John from   │
    │                      │                     │  our sales team..."  │
    │                      │                     │                      │
    │                      │                     │                      ├─ Outcome Tracking ▶
    │                      │                     │                      │ • Conversation won?  │
    │                      │                     │                      │ • Handoff smooth?    │
    │                      │                     │                      │ • Score accurate?    │
    │                      │                     │                      │                      │
    │                      │ ◀─── Feedback Loop ─┼──────────────────────┼─ Model Improvement  │
    │                      │ Update AI model     │                      │ • Scoring accuracy   │
    │                      │ based on outcomes   │                      │ • Question effectiveness│
    │                      │                     │                      │ • Handoff timing     │

Edge Cases:
• Low score (< 50): Continue AI nurturing + educational content
• Complex query: Immediate human handoff with context
• Repeat visitor: Load previous context + personalization
• After hours: AI handles + schedules human follow-up
```

## 6. Integration Architecture

### External Service Integration Pattern

```
THIRD-PARTY INTEGRATIONS ARCHITECTURE
═════════════════════════════════════

┌─────────────────────────────────────────────────────────────────────────────────┐
│                        INTEGRATION MANAGEMENT                                   │
└─────────────────────────────────────────────────────────────────────────────────┘

CALENDAR INTEGRATION (Google Calendar)
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│   OAuth2 Setup     │───▶│   Token Management  │───▶│   Bi-Directional   │
│ ─────────────────── │    │ ─────────────────── │    │      Sync           │
│ • Authorization URL │    │ • Access Token      │    │ ─────────────────── │
│ • Consent Flow      │    │ • Refresh Token     │    │ • CRM → Calendar    │
│ • State Validation  │    │ • Auto-refresh      │    │ • Calendar → CRM    │
│ • Org Context       │    │ • Secure Storage    │    │ • Conflict Resolution│
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
         │                          │                          │
         ▼                          ▼                          ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        CALENDAR EVENTS SYNC                                    │
│                                                                                 │
│ CRM Meeting Creation:                    Calendar Event Change:                │
│ 1. User schedules in CRM               1. User changes in Google Calendar      │
│ 2. POST /calendar/events               2. Google sends webhook                 │
│ 3. API creates Google event            3. POST /webhooks/calendar/{org_id}     │
│ 4. Event ID stored in CRM              4. CRM updates lead timeline            │
│ 5. Lead timeline updated               5. Conflict resolution if needed        │
│                                                                                 │
│ Organization Isolation:                                                         │
│ • Each org has separate calendar tokens                                         │
│ • Events filtered by organization_id                                            │
│ • Cross-org access prevented                                                   │
└─────────────────────────────────────────────────────────────────────────────────┘

MARKETING PLATFORMS INTEGRATION
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│   Facebook Ads      │    │   Google Ads        │    │    ROI Tracking     │
│ ─────────────────── │    │ ─────────────────── │    │ ─────────────────── │
│ • Access Token      │    │ • OAuth2 + Refresh │    │ • Lead Attribution  │
│ • Ad Account ID     │    │ • Customer ID       │    │ • Conversion Events │
│ • Campaign Import   │    │ • Campaign Sync     │    │ • Revenue Mapping   │
│ • Lead Events       │    │ • Keyword Tracking  │    │ • Performance Calc  │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
         │                          │                          │
         ▼                          ▼                          ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         MARKETING ROI CALCULATION                              │
│                                                                                 │
│ Lead Generation → CRM Processing → Revenue Attribution                         │
│ ────────────────────────────────────────────────────────────────────────────── │
│                                                                                 │
│ 1. Facebook/Google sends lead data                                             │
│ 2. CRM creates lead with source attribution                                    │
│ 3. Sales process tracked through pipeline                                      │
│ 4. Won deals attributed back to marketing campaign                             │
│ 5. ROI calculated: (Revenue - Ad Spend) / Ad Spend                            │
│ 6. Performance dashboard updated per organization                               │
│                                                                                 │
│ Multi-Tenant Considerations:                                                   │
│ • Each org has independent ad accounts                                          │
│ • ROI calculations isolated by organization_id                                  │
│ • Marketing spend tracked per org for accurate ROI                             │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### AI Service Integration

```
AI & MACHINE LEARNING INTEGRATION
══════════════════════════════════

┌─────────────────────────────────────────────────────────────────────────────────┐
│                            AI SERVICES STACK                                   │
└─────────────────────────────────────────────────────────────────────────────────┘

OPENAI GPT-4 INTEGRATION
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│  Context Management │───▶│   Token Optimization│───▶│  Organization       │
│ ─────────────────── │    │ ─────────────────── │    │  Learning           │
│ • Conversation      │    │ • Context Summary   │    │ ─────────────────── │
│   History Storage   │    │ • Token Limits      │    │ • Custom Prompts    │
│ • Lead Context      │    │ • Cost Tracking     │    │ • Training Data     │
│ • Industry Data     │    │ • Response Caching  │    │ • Feedback Loops    │
│ • Previous Outcomes │    │ • Batch Processing  │    │ • Model Refinement  │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
         │                          │                          │
         ▼                          ▼                          ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        AI PROCESSING PIPELINE                                  │
│                                                                                 │
│ Message Received → Context Analysis → AI Response → Learning Update            │
│ ────────────────────────────────────────────────────────────────────────────── │
│                                                                                 │
│ 1. Message arrives from WhatsApp/Email                                         │
│ 2. Load organization-specific context                                          │
│    • Previous conversations                                                     │
│    • Lead information                                                           │
│    • Industry templates                                                         │
│    • Custom training data                                                       │
│                                                                                 │
│ 3. OpenAI API call with context                                                │
│    • GPT-4 with organization prompt                                            │
│    • Token optimization (summarize old context)                                │
│    • Function calling for CRM actions                                          │
│                                                                                 │
│ 4. Response processing                                                          │
│    • Generate reply                                                             │
│    • Update lead scoring                                                        │
│    • Trigger automations                                                       │
│    • Log interaction                                                            │
│                                                                                 │
│ 5. Learning feedback                                                            │
│    • Track response effectiveness                                               │
│    • Update organization AI model                                              │
│    • Improve future responses                                                   │
└─────────────────────────────────────────────────────────────────────────────────┘

SENTIMENT ANALYSIS & SCORING
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│   Real-time         │    │   Urgency          │    │   Action            │
│   Sentiment         │    │   Detection        │    │   Triggers          │
│ ─────────────────── │    │ ─────────────────── │    │ ─────────────────── │
│ • Message Analysis  │    │ • Keywords         │    │ • High Urgency =    │
│ • Score (-1 to +1)  │    │ • Context Clues    │    │   Immediate Alert   │
│ • Confidence Level  │    │ • Timing Patterns  │    │ • Negative Sentiment│
│ • Historical Trend  │    │ • Urgency Score    │    │   = Manager Notify  │
│ • Baseline Comparison│   │   (0-100)          │    │ • Opportunity =     │
└─────────────────────┘    └─────────────────────┘    │   Auto-assign       │
                                                      └─────────────────────┘
```

## 7. Component Interaction Diagrams

### Frontend Component Architecture

```
NEXT.JS 14 COMPONENT HIERARCHY
═══════════════════════════════

┌─────────────────────────────────────────────────────────────────────────────────┐
│                          APP ROUTER STRUCTURE                                  │
└─────────────────────────────────────────────────────────────────────────────────┘

app/
├── [locale]/
│   ├── admin/                    ← Organization-scoped admin area
│   │   ├── crm/                  ← CRM feature modules
│   │   │   ├── page.tsx          → CRM Dashboard Container
│   │   │   ├── leads/
│   │   │   │   ├── page.tsx      → Leads List Container  
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx  → Lead Detail Container
│   │   │   ├── pipeline/
│   │   │   │   └── page.tsx      → Pipeline Kanban Container
│   │   │   └── settings/
│   │   │       └── page.tsx      → CRM Settings Container
│   │   ├── settings/             ← Organization settings
│   │   │   ├── page.tsx          → Org Settings Container
│   │   │   ├── team/
│   │   │   │   └── page.tsx      → Team Management Container  
│   │   │   └── integrations/
│   │   │       └── page.tsx      → Integrations Container
│   │   └── billing/              ← Billing & subscriptions
│   │       └── page.tsx          → Billing Container
│   └── auth/                     ← Authentication pages
│       ├── login/page.tsx        → Login Container
│       └── register/page.tsx     → Register Container

COMPONENT INTERACTION FLOW:
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         CONTAINER-COMPONENT PATTERN                            │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│   Page Container    │───▶│   Business Logic    │───▶│   API Services      │
│ ─────────────────── │    │ ─────────────────── │    │ ─────────────────── │  
│ • useOrgContext()   │    │ • useCRMStore()     │    │ • leadService.get() │
│ • Data fetching     │    │ • useLeadData()     │    │ • X-Org-Id headers  │
│ • State management  │    │ • Business rules    │    │ • Error handling    │
│ • Error boundaries  │    │ • Form validation   │    │ • Response caching  │
│ • Loading states    │    │ • Optimistic updates│    │ • Retry logic       │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
         │                          │                          │
         ▼                          ▼                          ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            UI COMPONENTS                                        │
│                                                                                 │
│ ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│ │ Pipeline Kanban │  │  WhatsApp Chat  │  │   Lead Cards    │  │ AI Summary   │ │
│ │ ─────────────── │  │ ─────────────── │  │ ─────────────── │  │ ──────────── │ │
│ │ • @dnd-kit/core │  │ • Message list  │  │ • Lead info     │  │ • Collapsible│ │
│ │ • Drag handlers │  │ • Send input    │  │ • Score display │  │ • AI insights│ │
│ │ • Stage columns │  │ • Attachments   │  │ • Action buttons│  │ • Suggestions│ │
│ │ • Real-time     │  │ • Status icons  │  │ • Pipeline move │  │ • Export     │ │
│ │   updates       │  │ • Timestamps    │  │ • Timeline      │  │   options    │ │
│ └─────────────────┘  └─────────────────┘  └─────────────────┘  └──────────────┘ │
│                                                                                 │
│ ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│ │   Templates     │  │   Team Mgmt     │  │   Analytics     │  │  Settings    │ │
│ │ ─────────────── │  │ ─────────────── │  │ ─────────────── │  │ ──────────── │ │
│ │ • Template list │  │ • Member list   │  │ • Charts/graphs │  │ • Preferences│ │
│ │ • Variable subs │  │ • Role mgmt     │  │ • Export reports│  │ • Integrations│ │
│ │ • A/B testing   │  │ • Permissions   │  │ • Date filters  │  │ • Billing    │ │
│ │ • Performance   │  │ • Invitations   │  │ • KPI tracking  │  │ • Security   │ │
│ └─────────────────┘  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘

STATE MANAGEMENT ARCHITECTURE:
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            ZUSTAND STORES                                      │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│     CRM Store       │    │     UI Store        │    │    Auth Store       │
│ ─────────────────── │    │ ─────────────────── │    │ ─────────────────── │
│ • leads: Lead[]     │    │ • sidebarOpen       │    │ • user: User        │
│ • selectedLead      │    │ • activeModal       │    │ • organization      │
│ • pipelineFilters   │    │ • loading states    │    │ • permissions       │
│ • pipelineStages    │    │ • error messages    │    │ • isAuthenticated   │
│ • templates         │    │ • notifications     │    │ • tokens            │
│ • aiSummaries       │    │ • theme settings    │    │ • refreshToken()    │
│ • updateLead()      │    │ • toggleSidebar()   │    │ • logout()          │
│ • moveToPipeline()  │    │ • showNotification()│    │ • switchOrg()       │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘

Real-time Updates via TanStack Query + WebSocket:
• Pipeline changes broadcast to all org members
• New messages appear instantly in conversations  
• AI summaries update in real-time
• Lead score changes reflect immediately
```

### Backend Service Dependencies

```
FASTAPI SERVICE ARCHITECTURE
═════════════════════════════

┌─────────────────────────────────────────────────────────────────────────────────┐
│                          CLEAN ARCHITECTURE LAYERS                             │
└─────────────────────────────────────────────────────────────────────────────────┘

PRESENTATION LAYER (FastAPI Routers)
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│  /auth/*          /crm/*          /integrations/*      /analytics/*            │
│  ├─ login         ├─ leads        ├─ whatsapp          ├─ pipeline             │
│  ├─ register      ├─ pipeline     ├─ voip              ├─ team                 │
│  ├─ refresh       ├─ templates    ├─ calendar          ├─ marketing           │
│  └─ verify        └─ ai           └─ marketing         └─ custom              │
│                                                                                 │
│  Common Dependencies per Route:                                                │
│  • get_current_organization (Multi-tenancy)                                    │
│  • get_current_active_user (Authentication)                                    │
│  • get_db (Database session)                                                   │
│  • rate_limiter (Rate limiting)                                                │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
BUSINESS LOGIC LAYER (Services)
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   CRM Service   │  │  WhatsApp       │  │   AI Service    │  │ Analytics    │ │
│  │ ─────────────── │  │  Service        │  │ ─────────────── │  │ Service      │ │
│  │ • create_lead() │  │ ─────────────── │  │ • analyze_msg() │  │ ──────────── │ │
│  │ • update_score()│  │ • send_message()│  │ • score_lead()  │  │ • pipeline() │ │
│  │ • move_stage()  │  │ • get_history() │  │ • suggest_reply()│ │ • team_perf()│ │
│  │ • assign_lead() │  │ • switch_provider│ │ • handoff_human()│ │ • roi_calc() │ │
│  │                 │  │ • validate_msg()│  │                 │  │              │ │
│  │ Dependencies:   │  │                 │  │ Dependencies:   │  │ Dependencies:│ │
│  │ • LeadsRepo     │  │ Dependencies:   │  │ • OpenAI API    │  │ • EventsRepo │ │
│  │ • ActivitiesRepo│  │ • WhatsAppRepo  │  │ • ConversRepo   │  │ • LeadsRepo  │ │
│  │ • PipelineRepo  │  │ • MessageRepo   │  │ • TrainingRepo  │  │ • RevenueData│ │
│  └─────────────────┘  │ • ProviderAPI   │  └─────────────────┘  └──────────────┘ │
│                       └─────────────────┘                                       │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
DATA ACCESS LAYER (Repositories)
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   Leads Repo    │  │  Messages Repo  │  │   Pipeline Repo │  │ Analytics    │ │
│  │ ─────────────── │  │ ─────────────── │  │ ─────────────── │  │ Repo         │ │
│  │ Base: SQLRepo   │  │ Base: SQLRepo   │  │ Base: SQLRepo   │  │ ──────────── │ │
│  │                 │  │                 │  │                 │  │ Base: SQLRepo│ │
│  │ Methods:        │  │ Methods:        │  │ Methods:        │  │              │ │
│  │ • get_by_org()  │  │ • get_by_org()  │  │ • get_by_org()  │  │ Methods:     │ │
│  │ • create_for_   │  │ • create_for_   │  │ • create_for_   │  │ • events_by_ │ │
│  │   _org()        │  │   _org()        │  │   _org()        │  │   _org()     │ │
│  │ • update_org_   │  │ • get_by_lead() │  │ • update_order()│  │ • metrics_   │ │
│  │   _scoped()     │  │ • get_conv()    │  │ • delete_stage()│  │   _by_org()  │ │
│  │ • delete_org_   │  │ • store_ai()    │  │                 │  │ • revenue_   │ │
│  │   _scoped()     │  │   _analysis()   │  │                 │  │   _tracking()│ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  └──────────────┘ │
│                                                                                 │
│  🔒 ALL REPOSITORIES: Automatic organization_id filtering                       │
│  🔒 NO CROSS-ORG QUERIES: Every method validates organization context          │
│  🔒 PERFORMANCE OPTIMIZED: Indexes on organization_id + business fields       │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
INFRASTRUCTURE LAYER (Models & Database)
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          SQLALCHEMY MODELS                                     │
│                                                                                 │
│  📋 30 Tables Total:                                                            │
│  • 6 Foundation (orgs, users, members, subscriptions, jobs, audit)             │
│  • 8 Business (leads, stages, activities, templates, scoring, etc)             │
│  • 6 Communication (whatsapp_configs, messages, attachments, calls, etc)       │
│  • 4 AI/ML (conversations, training_data, models, analytics)                   │
│  • 6 Integration (calendar, marketing, api_keys, webhooks, etc)                │
│                                                                                 │
│  🔒 Multi-Tenancy Pattern on ALL Business Tables:                              │
│    organization_id = Column(UUID, ForeignKey("organizations.id"))              │
│    __table_args__ = (Index('ix_table_org_id', 'organization_id'),)             │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 8. Deployment Architecture

### Railway Production Environment

```
RAILWAY DEPLOYMENT ARCHITECTURE
════════════════════════════════

┌─────────────────────────────────────────────────────────────────────────────────┐
│                           RAILWAY PRODUCTION                                   │
└─────────────────────────────────────────────────────────────────────────────────┘

FRONTEND SERVICE (Next.js 14)
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        frontend-production.up.railway.app                      │
│ ─────────────────────────────────────────────────────────────────────────────── │
│                                                                                 │
│  Environment Variables:                                                         │
│  • NEXT_PUBLIC_API_URL=https://backend-production.up.railway.app               │
│  • NEXT_PUBLIC_SENTRY_DSN=...                                                  │
│  • NODE_ENV=production                                                          │
│                                                                                 │
│  Build Configuration:                                                           │
│  • output: 'standalone' (Docker optimization)                                  │
│  • TypeScript: ignoreBuildErrors (MVP mode)                                    │
│  • ESLint: ignoreDuringBuilds (MVP mode)                                       │
│                                                                                 │
│  Request Routing (next.config.js):                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  /api/auth/:path*     → backend/auth/:path*                             │   │
│  │  /api/crm/:path*      → backend/crm/:path*                              │   │
│  │  /api/organizations/* → backend/organizations/:path*                    │   │
│  │  /api/billing/:path*  → backend/billing/:path*                          │   │
│  │  /api/:path*          → backend/:path*                                  │   │
│  │  /docs                → backend/docs                                    │   │
│  │  /health              → backend/health                                  │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼ HTTPS
BACKEND SERVICE (FastAPI)
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        backend-production.up.railway.app                       │
│ ─────────────────────────────────────────────────────────────────────────────── │
│                                                                                 │
│  Environment Variables:                                                         │
│  • DATABASE_URL=postgresql://user:pass@railway-postgres:5432/railway           │
│  • REDIS_URL=redis://railway-redis:6379                                        │
│  • SECRET_KEY=... (32+ chars)                                                  │
│  • CORS_ORIGINS=["https://frontend-production.up.railway.app"]                 │
│  • SENTRY_DSN=... (monitoring)                                                 │
│                                                                                 │
│  Health Monitoring:                                                             │
│  • GET /health → Database + Redis status                                       │
│  • GET /database/info → Migration status + connection pool                     │
│  • Automatic Railway health checks                                             │
│                                                                                 │
│  Middleware Stack:                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  SecurityHeaders → OrganizationContext → RateLimit → SentryContext     │   │
│  │                                                                         │   │
│  │  🔒 CRITICAL: OrganizationContextMiddleware                            │   │
│  │     • Validates X-Org-Id header                                        │   │
│  │     • Ensures JWT org_id matches header                                │   │
│  │     • Prevents cross-organization access                               │   │
│  │     • All business endpoints require organization context              │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼ Railway Private Network
DATABASE SERVICE (PostgreSQL 16)
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        PostgreSQL 16 with SSL                                  │
│ ─────────────────────────────────────────────────────────────────────────────── │
│                                                                                 │
│  Connection Configuration:                                                      │
│  • SSL Mode: require                                                            │
│  • Connection Pool: 20 connections                                             │
│  • Timezone: UTC                                                               │
│  • Encoding: UTF-8                                                             │
│                                                                                 │
│  Schema Status:                                                                 │
│  • schema_versions table tracks migrations                                     │
│  • 30 tables with organization_id isolation                                    │
│  • 50+ performance indexes                                                     │
│  • Row-level security via application logic                                    │
│                                                                                 │
│  Monitoring:                                                                    │
│  • Connection health checks via /database/info                                 │
│  • Migration status tracking                                                   │
│  • Query performance monitoring                                                │
│  • Automated backups by Railway                                                │
└─────────────────────────────────────────────────────────────────────────────────┘

REDIS SERVICE (Caching & Sessions)
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              Redis Instance                                     │
│ ─────────────────────────────────────────────────────────────────────────────── │
│                                                                                 │
│  Usage Patterns:                                                                │
│  • Session storage (JWT blacklisting)                                          │
│  • Rate limiting counters                                                      │
│  • Background job queues                                                       │
│  • AI conversation context caching                                             │
│  • Real-time WebSocket message queuing                                         │
│                                                                                 │
│  Organization Isolation:                                                        │
│  • Redis keys prefixed with org_id                                             │
│  • Session data scoped by organization                                         │
│  • Cache invalidation per organization                                         │
└─────────────────────────────────────────────────────────────────────────────────┘

SSL TERMINATION & SECURITY
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            Security Headers                                     │
│ ─────────────────────────────────────────────────────────────────────────────── │
│                                                                                 │
│  Automatic Railway SSL:                                                         │
│  • TLS 1.2+ enforced                                                           │
│  • Automatic certificate management                                            │
│  • HSTS headers                                                                │
│  • Secure cookie settings                                                      │
│                                                                                 │
│  Custom Security Headers (SecurityHeadersMiddleware):                          │
│  • X-Frame-Options: DENY                                                       │
│  • X-Content-Type-Options: nosniff                                             │
│  • Referrer-Policy: origin-when-cross-origin                                   │
│  • Content-Security-Policy: strict                                             │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Monitoring and Observability

```
PRODUCTION MONITORING STACK
════════════════════════════

ERROR TRACKING (Sentry)
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            Sentry Integration                                   │
│ ─────────────────────────────────────────────────────────────────────────────── │
│                                                                                 │
│  Frontend Monitoring:                                                           │
│  • JavaScript errors and exceptions                                            │
│  • Performance monitoring (Core Web Vitals)                                    │
│  • User session tracking                                                       │
│  • Custom organization context in errors                                       │
│                                                                                 │
│  Backend Monitoring:                                                            │
│  • Python exception tracking                                                   │
│  • API performance monitoring                                                  │
│  • Database query performance                                                  │
│  • Organization context in all errors                                          │
│                                                                                 │
│  Multi-Tenant Error Context:                                                   │
│  • All errors tagged with organization_id                                      │
│  • User identification with org context                                        │
│  • Request tracing across frontend/backend                                     │
│  • Custom dashboards per organization tier                                     │
└─────────────────────────────────────────────────────────────────────────────────┘

APPLICATION PERFORMANCE MONITORING
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        Health Check Endpoints                                  │
│ ─────────────────────────────────────────────────────────────────────────────── │
│                                                                                 │
│  GET /health:                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  {                                                                      │   │
│  │    "status": "healthy",                                                 │   │
│  │    "service": "Loved CRM API",                                          │   │
│  │    "version": "1.0.0",                                                  │   │
│  │    "timestamp": 1642253400,                                             │   │
│  │    "dependencies": {                                                    │   │
│  │      "database": {                                                      │   │
│  │        "status": "healthy",                                             │   │
│  │        "response_time_ms": 15.2,                                        │   │
│  │        "type": "postgresql"                                             │   │
│  │      },                                                                 │   │
│  │      "redis": {                                                         │   │
│  │        "status": "healthy",                                             │   │
│  │        "response_time_ms": 2.1,                                         │   │
│  │        "type": "redis"                                                  │   │
│  │      }                                                                  │   │
│  │    },                                                                   │   │
│  │    "response_time_ms": 23.8                                             │   │
│  │  }                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  GET /database/info:                                                            │
│  • Database version information                                                │
│  • Connection pool status                                                      │
│  • Migration status and latest version                                         │
│  • Performance metrics                                                         │
└─────────────────────────────────────────────────────────────────────────────────┘

LOGS & METRICS
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          Structured Logging                                    │
│ ─────────────────────────────────────────────────────────────────────────────── │
│                                                                                 │
│  Log Format (JSON):                                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  {                                                                      │   │
│  │    "timestamp": "2024-01-15T10:30:00Z",                                 │   │
│  │    "level": "INFO",                                                     │   │
│  │    "logger": "api.services.crm_leads",                                  │   │
│  │    "message": "Lead created successfully",                              │   │
│  │    "organization_id": "uuid-123",                                       │   │
│  │    "user_id": "uuid-456",                                               │   │
│  │    "lead_id": "uuid-789",                                               │   │
│  │    "request_id": "correlation-uuid",                                    │   │
│  │    "extra_context": {                                                   │   │
│  │      "lead_score": 85,                                                  │   │
│  │      "source": "whatsapp",                                              │   │
│  │      "assigned_to": "user-uuid"                                         │   │
│  │    }                                                                    │   │
│  │  }                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  Key Metrics Tracked:                                                          │
│  • API response times per endpoint                                             │
│  • Database query performance                                                  │
│  • Organization-scoped error rates                                             │
│  • WebSocket connection statistics                                             │
│  • Background job processing times                                             │
│  • External service integration health                                         │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 9. Security and Multi-Tenancy

### Organization Isolation Patterns

```
MULTI-TENANT SECURITY ARCHITECTURE
═══════════════════════════════════

┌─────────────────────────────────────────────────────────────────────────────────┐
│                        ORGANIZATION DATA ISOLATION                             │
└─────────────────────────────────────────────────────────────────────────────────┘

REQUEST FLOW SECURITY:
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│   Client Request    │───▶│   Middleware        │───▶│   Business Logic    │
│ ─────────────────── │    │   Validation        │    │ ─────────────────── │
│ Headers:            │    │ ─────────────────── │    │ Organization        │
│ • Authorization:    │    │ 1. JWT Valid?       │    │ Context Required:   │
│   Bearer jwt_token  │    │ 2. X-Org-Id Valid?  │    │                     │
│ • X-Org-Id:         │    │ 3. Org Match JWT?   │    │ @requires_org       │
│   uuid-123          │    │ 4. User in Org?     │    │ def endpoint(       │
│ • Content-Type:     │    │ 5. Permissions OK?  │    │   org: Organization │
│   application/json  │    │                     │    │ ) -> Response:      │
│                     │    │ ✅ PASS → Continue  │    │   # org is validated│
│                     │    │ ❌ FAIL → 403/401   │    │   # and injected    │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
                                     │
                                     ▼
DATABASE ISOLATION:
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          AUTOMATIC ORG FILTERING                               │
│                                                                                 │
│  ✅ SECURE (Organization-scoped):                                              │
│  SELECT * FROM leads WHERE organization_id = 'uuid-123';                       │
│  UPDATE leads SET status = 'active' WHERE id = ? AND organization_id = ?;      │
│  DELETE FROM leads WHERE id = ? AND organization_id = ?;                       │
│                                                                                 │
│  ❌ INSECURE (Cross-organization risk):                                        │
│  SELECT * FROM leads WHERE id = ?;  -- Missing org filter!                    │
│  SELECT * FROM leads;               -- No filtering at all!                   │
│                                                                                 │
│  🔒 PREVENTION MECHANISMS:                                                     │
│  • Repository pattern enforces organization filtering                          │
│  • All business models include organization_id FK                             │
│  • Database indexes optimize org-scoped queries                               │
│  • Unit tests verify cross-org prevention                                     │
│                                                                                 │
│  📊 PERFORMANCE OPTIMIZATION:                                                  │
│  • Primary index: (organization_id, created_at)                               │
│  • Business indexes: (organization_id, stage_id, lead_score)                  │
│  • Query execution plans optimized for org filtering                          │
│  • Connection pooling respects org-based traffic patterns                     │
└─────────────────────────────────────────────────────────────────────────────────┘

SECURITY BOUNDARIES:
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            ACCESS CONTROL                                      │
│                                                                                 │
│  Authentication Layers:                                                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  1. JWT Token Validation (user identity)                               │   │
│  │  2. Organization Membership (user in org?)                             │   │
│  │  3. Role-Based Permissions (admin, manager, sales, viewer)             │   │
│  │  4. Feature Gates (plan tier restrictions)                             │   │
│  │  5. Rate Limiting (per organization limits)                            │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  Cross-Organization Attack Prevention:                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  Scenario: Malicious user tries to access other org's data             │   │
│  │                                                                         │   │
│  │  Attack Vector 1: Modify X-Org-Id header                               │   │
│  │  ✅ Prevention: JWT org_id must match header org_id                    │   │
│  │                                                                         │   │
│  │  Attack Vector 2: Guess other organization's UUIDs                     │   │
│  │  ✅ Prevention: User must be member of organization                    │   │
│  │                                                                         │   │
│  │  Attack Vector 3: Parameter manipulation in URLs                       │   │
│  │  ✅ Prevention: All resources validated against org_id                 │   │
│  │                                                                         │   │
│  │  Attack Vector 4: Database injection attacks                           │   │
│  │  ✅ Prevention: Parameterized queries + org_id always included         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘

AUDIT AND COMPLIANCE:
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              AUDIT TRAIL                                       │
│                                                                                 │
│  Every Action Logged:                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  {                                                                      │   │
│  │    "id": "audit-uuid",                                                  │   │
│  │    "organization_id": "uuid-123",                                       │   │
│  │    "user_id": "uuid-456",                                               │   │
│  │    "action": "lead_updated",                                            │   │
│  │    "resource_type": "lead",                                             │   │
│  │    "resource_id": "uuid-789",                                           │   │
│  │    "ip_address": "192.168.1.1",                                         │   │
│  │    "user_agent": "Mozilla/5.0...",                                      │   │
│  │    "changes": {                                                         │   │
│  │      "before": {"stage_id": "uuid-old"},                               │   │
│  │      "after": {"stage_id": "uuid-new"}                                 │   │
│  │    },                                                                   │   │
│  │    "success": true,                                                     │   │
│  │    "timestamp": "2024-01-15T10:30:00Z"                                  │   │
│  │  }                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  Security Events Monitoring:                                                   │
│  • Failed cross-organization access attempts                                   │
│  • Suspicious authentication patterns                                          │
│  • Bulk data export operations                                                 │
│  • API key usage anomalies                                                     │
│  • Privilege escalation attempts                                               │
│                                                                                 │
│  LGPD/GDPR Compliance:                                                         │
│  • Data export capabilities per organization                                   │
│  • Right to deletion with cascade handling                                     │
│  • Data processing consent tracking                                            │
│  • Cross-border data transfer logging                                          │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 10. Diagram Conventions and Legends

### Symbol Definitions

```
DIAGRAM LEGEND & CONVENTIONS
════════════════════════════

┌─────────────────────────────────────────────────────────────────────────────────┐
│                            SYMBOL MEANINGS                                     │
└─────────────────────────────────────────────────────────────────────────────────┘

RELATIONSHIP NOTATION:
───▶  : Data Flow (Request)                    ◀───  : Response Flow
═══▶  : Secure/Encrypted Flow                 ╋     : Decision Point
━━━▶  : Multi-tenant Isolated Flow            ▼     : Process Flow
┅┅┅▶  : Optional/Conditional Flow             │     : Connection
                                              └─ ┬ ─┘ : Alternative Paths

COMPONENT TYPES:
┌─────────────────┐ : Service/Component        [USER ACTION] : User Interaction
│     Service     │                            {Business}   : Business Logic  
│ ─────────────── │                            (Database)   : Data Storage
│ • Function 1    │                            <External>   : External Service
│ • Function 2    │                            |Internal|   : Internal Process
└─────────────────┘

SECURITY & ISOLATION:
🔒 : Security Layer                           🔴 : Critical/Required
🔑 : Authentication Required                  ⚠️  : Warning/Risk
🛡️ : Organization Isolation                  ✅ : Validated/Secure
👤 : User Context                             ❌ : Forbidden/Blocked
🏢 : Organization Context                     🎯 : Business Goal

STATUS INDICATORS:
✅ : Implemented/Working                      🆕 : New/To Be Built
⚠️ : Alternative/Risky                       🔄 : In Progress  
❌ : Not Recommended                         📋 : Documentation
🚀 : Performance Optimized                   🧪 : Testing Required
```

### Reading Guide

```
HOW TO READ THESE DIAGRAMS
══════════════════════════

┌─────────────────────────────────────────────────────────────────────────────────┐
│                          INTERPRETATION GUIDE                                  │
└─────────────────────────────────────────────────────────────────────────────────┘

1. SYSTEM ARCHITECTURE DIAGRAMS:
   • Read top-to-bottom: User → Frontend → Backend → Database
   • Organization isolation shown with 🔒 symbols
   • Multi-tenant data flow marked with ═══▶
   • Critical security layers highlighted with 🔴

2. DATABASE SCHEMA DIAGRAMS:
   • Primary keys shown as (PK)
   • Foreign keys shown as (FK) with arrows
   • Organization relationships marked with 🏢
   • Indexes listed in __table_args__ sections
   • Multi-tenant isolation via organization_id filtering

3. API FLOW DIAGRAMS:
   • Headers section shows required authentication
   • Middleware validation steps numbered 1-5
   • Success path shown with ✅ symbols
   • Error responses shown with ❌ symbols
   • Organization context validation at each layer

4. USER JOURNEY DIAGRAMS:
   • Left-to-right flow: User Action → System Response
   • Edge cases listed below main flow
   • Real-time updates shown with broadcast symbols
   • Organization scope maintained throughout journey

5. INTEGRATION DIAGRAMS:
   • External services marked with dashed borders
   • OAuth flows shown with token exchange arrows
   • Webhook patterns displayed with callback flows
   • Provider options shown as alternative paths

MULTI-TENANCY VISUAL PATTERNS:
• 🏢 Organization context always present in business operations
• 🔒 Security validation at each layer boundary  
• ═══ Org-isolated data flow vs ──── general data flow
• All business tables include organization_id relationships
• Cross-org access prevention marked with ❌ symbols
```

---

<function_calls>
<invoke name="TodoWrite">
<parameter name="todos">[{"id": "diagram_analysis", "content": "Analyze all documentation files to understand system architecture and features", "status": "completed"}, {"id": "codebase_verification", "content": "Verify current template structure and components available", "status": "completed"}, {"id": "diagram_generation", "content": "Generate comprehensive technical diagrams for all system components", "status": "completed"}]