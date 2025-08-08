# Loved CRM - User Journeys & Interaction Flows

## 1. Executive Summary

**Documento Técnico**: Mapeamento completo das jornadas de usuário para Loved CRM, sistema multi-tenant B2B focado em agências digitais brasileiras.

**Modelo de Negócio**: B2B (Business-to-Business) - Agências digitais que atendem outras empresas  
**Arquitetura**: Organization-centric com isolamento completo por `organization_id`  
**Stack**: Next.js 14 + FastAPI + PostgreSQL + Railway

**Dual Provider Architecture**:

- **WhatsApp**: Business API (oficial) + Web API (não-oficial)
- **VoIP**: Twilio (premium) + Telnyx (economia 30-70%)

## 2. Personas Identificadas

### **Persona 1: Agency Founder (Tomador de Decisão)**

- **Contexto**: Dono da agência, foca em crescimento e eficiência operacional
- **Objetivos**: Aumentar conversão em 300%, eliminar fragmentação de ferramentas
- **Pain Points**: Perda de 40% dos leads por desorganização, falta de visão consolidada
- **Technical Needs**: Multi-tenancy para clientes, relatórios executivos, ROI tracking

### **Persona 2: Commercial Manager (Gestor de Vendas)**

- **Contexto**: Responsável pelo processo comercial e performance da equipe
- **Objetivos**: Otimizar pipeline, distribuir leads, gerenciar equipe comercial
- **Pain Points**: Gargalos no pipeline, falta de previsibilidade, dispersão de dados
- **Technical Needs**: Pipeline analytics, lead scoring, team performance dashboards

### **Persona 3: Sales Representative (Vendedor)**

- **Contexto**: Executa vendas diárias, precisa de eficiência e contexto
- **Objetivos**: Manter contexto completo, responder rapidamente, fechar mais negócios
- **Pain Points**: Alternar entre ferramentas, perder contexto, templates manuais
- **Technical Needs**: WhatsApp integrado, templates, histórico unificado

### **Persona 4: Admin/Operations (Administrador)**

- **Contexto**: Configura sistema, gerencia usuários e integrações
- **Objetivos**: Configurar org, gerenciar permissões, manter dados seguros
- **Pain Points**: Configurações complexas, vazamento de dados, onboarding
- **Technical Needs**: User management, integrations setup, security controls

### **Persona 5: Viewer/Client (Visualizador)**

- **Contexto**: Acesso limitado para acompanhar resultados
- **Objetivos**: Acompanhar progresso, visualizar relatórios
- **Pain Points**: Falta de transparência, acesso inadequado
- **Technical Needs**: Read-only dashboards, filtered reports

## 3. Jornadas Críticas - MVP Core Features

### **JORNADA 1: Pipeline Visual Kanban**

**Persona**: Commercial Manager  
**Contexto**: Gerenciar funil de vendas visualmente  
**Priority**: MVP Core

#### Happy Path Flow:

```
1. Login/Authentication
   ↓
2. Dashboard Load (org-scoped)
   ↓
3. Pipeline Visualization (5 stages: Lead → Contact → Proposal → Negotiation → Closed)
   ↓
4. Drag & Drop Lead Movement
   ↓
5. Real-time Metrics Update
   ↓
6. Filter Application (period, owner, source)
   ↓
7. Conversion Analytics Display
```

#### Technical Implementation:

- **Middleware**: `get_current_organization` para context validation
- **Repository**: `PipelineRepository.get_organization_deals(org_id)`
- **Service**: `DealsService` com headers `X-Org-Id`
- **Frontend**: @dnd-kit/core para drag-and-drop interface

#### Edge Cases & Error Handling:

- **Lead com valor muito alto**: Validation popup + admin approval required
- **Concurrent lead movement**: Optimistic locking + conflict resolution UI
- **Pipeline com +100 leads**: Virtual scrolling + pagination
- **Network failure durante drag**: Rollback visual + retry mechanism
- **Cross-org access attempt**: 403 Forbidden + audit log

---

### **JORNADA 2: WhatsApp Business Integration**

**Persona**: Sales Representative  
**Contexto**: Conversar com leads sem trocar de ferramenta  
**Priority**: MVP Core

#### Dual Provider Architecture:

##### **Flow 1: WhatsApp Business API (Oficial)**

```
1. Admin configura Business API (webhook validation)
   ↓
2. Lead envia mensagem → Webhook recebido
   ↓
3. Sistema processa (org_id filtering)
   ↓
4. Notificação push para vendedor responsável
   ↓
5. Vendedor abre chat integrado
   ↓
6. Histórico completo carregado (org-scoped)
   ↓
7. Resposta enviada → Sincronização bidirecional
   ↓
8. Status delivery/read confirmado
   ↓
9. Pipeline automaticamente atualizado
```

##### **Flow 2: WhatsApp Web API (Não-Oficial)**

```
1. Admin escaneia QR Code → Session management
   ↓
2. WebSocket connection established
   ↓
3. Lead envia mensagem → Real-time sync
   ↓
4. Mensagem aparece no CRM instantaneamente
   ↓
5. Vendedor responde pelo CRM
   ↓
6. Sync bidirecional com WhatsApp Web
   ↓
7. Session monitoring (auto-reconnect)
```

#### Technical Implementation:

```python
# Dual provider service architecture
class WhatsAppService(BaseService):
    async def send_message(self, org_id: UUID, provider_type: WhatsAppProvider, **kwargs):
        if provider_type == WhatsAppProvider.BUSINESS_API:
            return await self.business_api.send_message(org_id, **kwargs)
        elif provider_type == WhatsAppProvider.WEB_UNOFFICIAL:
            return await self.web_service.send_message(org_id, **kwargs)

# Organization-specific configuration
class OrganizationWhatsAppConfig:
    organization_id: UUID
    provider_type: WhatsAppProvider  # BUSINESS_API or WEB_UNOFFICIAL
    business_api_config: Optional[BusinessAPIConfig]
    web_session_config: Optional[WebSessionConfig]
```

#### Edge Cases & Risk Mitigation:

- **WhatsApp Web ban**: Auto-fallback para Business API + admin notification
- **Rate limit exceeded**: Message queuing + exponential backoff
- **Session disconnect**: Auto-reconnect + user notification
- **Message com caracteres especiais**: UTF-8 encoding + validation
- **Anexos grandes**: Compression + chunked upload
- **Múltiplas conversas**: Context switching + unread badges
- **Cross-org message**: Strict routing validation + security audit

---

### **JORNADA 3: Lead Management & Scoring**

**Persona**: Sales Representative + Commercial Manager  
**Contexto**: Capturar e qualificar leads automaticamente  
**Priority**: MVP Core

#### Happy Path Flow:

```
1. Lead Source Integration (forms, WhatsApp, referrals)
   ↓
2. Lead Capture → Automatic deduplication check
   ↓
3. ML Lead Scoring Calculation (0-100 score)
   ↓
4. Intelligent Assignment (round-robin + workload balancing)
   ↓
5. Vendedor Notification (push + email)
   ↓
6. Lead Profile Enrichment (social data, company info)
   ↓
7. Interaction Tracking (calls, messages, meetings)
   ↓
8. Score Updates based on engagement
   ↓
9. Automatic Nurturing for low-score leads
```

#### Technical Implementation:

- **Repository**: `LeadsRepository.create_organization_lead(org_id, data)`
- **Service**: `LeadScoringService` com ML pipeline
- **Middleware**: `LeadsMiddleware` com org filtering
- **ML Pipeline**: Real-time scoring com org-specific training data

#### Edge Cases & Error Handling:

- **Lead com dados incompletos**: Status "incomplete" + follow-up automation
- **Email duplicado**: Smart merge vs separate lead decision
- **Score calculation failure**: Default score + retry queue
- **Bulk import (1000+ leads)**: Async processing + progress tracking
- **Invalid phone/email**: Validation + normalization + admin alert
- **Vendor não disponível**: Graceful degradation + backup assignment
- **Cross-org lead assignment**: Prevention + security validation

---

### **JORNADA 4: Multi-Tenancy & Organization Management**

**Persona**: Agency Founder + Admin  
**Contexto**: Isolamento absoluto de dados entre clientes  
**Priority**: MVP Core (Security Critical)

#### Happy Path Flow:

```
1. Agency Founder Registration
   ↓
2. Organization Auto-Creation (unique org_id)
   ↓
3. Initial Admin Role Assignment
   ↓
4. Team Member Invitation (email-based)
   ↓
5. Role-Based Access Control Setup
   ↓
6. Data Isolation Validation (org_id filtering)
   ↓
7. Audit Trail Activation
   ↓
8. Billing Configuration (per-org)
```

#### Technical Implementation:

```python
# Core organization dependency pattern
@router.get("/protected-endpoint")
async def get_organization_data(
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db)
):
    # All queries automatically org-scoped
    return service.get_organization_data(organization.id)

# Model pattern with org isolation
class BusinessModel(Base):
    __tablename__ = "business_table"

    id = Column(UUID(as_uuid=True), primary_key=True)
    # REQUIRED: Organization FK pattern
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)

    # REQUIRED: Performance index
    __table_args__ = (
        Index('ix_business_table_organization_id', 'organization_id'),
    )
```

#### Security Edge Cases:

- **Cross-org data access attempt**: 403 Forbidden + immediate audit log + admin alert
- **JWT org_id mismatch**: Token invalidation + forced re-authentication
- **Admin role transfer**: Multi-factor verification + approval workflow
- **Organization deletion**: 30-day grace period + data export + compliance log
- **Invite link manipulation**: Token validation + expiry enforcement
- **Concurrent admin operations**: Optimistic locking + conflict resolution
- **Database query without org filter**: Query rejection + developer alert

---

## 4. Jornadas Supporting Features

### **JORNADA 5: VoIP Integration (Dual Provider)**

**Persona**: Sales Representative  
**Contexto**: Chamadas diretas do CRM  
**Priority**: Supporting

#### Provider Selection Flow:

```
1. Admin acessa Provider Settings
   ↓
2. Cost Calculator (Twilio vs Telnyx comparison)
   ↓
3. Provider Selection Based on Budget/Features
   ↓
4. Configuration Wizard (guided setup)
   ↓
5. Phone Number Setup/Porting
   ↓
6. Integration Testing
   ↓
7. Team Training & Rollout
```

#### Call Flow - Twilio Premium:

```
1. Click "Call Lead" button
   ↓
2. Twilio Voice SDK initialization
   ↓
3. Call connection (99.95% uptime SLA)
   ↓
4. Auto-recording activation
   ↓
5. Real-time call notes/CRM update
   ↓
6. Call completion → Recording storage
   ↓
7. Automatic transcription (optional)
   ↓
8. Lead activity timeline update
```

#### Call Flow - Telnyx Economy:

```
1. Click "Call Lead" button
   ↓
2. Telnyx Voice SDK initialization (TwiML compatible)
   ↓
3. Call connection (30-70% cost savings)
   ↓
4. Same feature parity as Twilio
   ↓
5. Cost tracking in real-time
   ↓
6. ROI calculations displayed
```

#### Hot-Swap Migration:

```
1. Admin decides to switch providers
   ↓
2. Migration wizard launched
   ↓
3. Historical data preserved
   ↓
4. Phone numbers ported (if applicable)
   ↓
5. Configuration updated (< 30 seconds for TwiML compatibility)
   ↓
6. Zero downtime switch
   ↓
7. Cost savings immediately visible
```

---

### **JORNADA 6: Template Management & Automation**

**Persona**: Sales Representative  
**Contexto**: Acelerar respostas com templates inteligentes  
**Priority**: Supporting

#### Template Creation Flow:

```
1. Admin/Manager creates template library
   ↓
2. Categorization (greeting, follow-up, objection, closing)
   ↓
3. Variable insertion ({{lead_name}}, {{company}}, {{value}})
   ↓
4. A/B testing setup (multiple versions)
   ↓
5. Performance tracking configuration
   ↓
6. Team access permissions
   ↓
7. Auto-suggestion rules
```

#### Template Usage Flow:

```
1. Vendedor typing message
   ↓
2. AI suggests relevant templates based on context
   ↓
3. Template selection
   ↓
4. Variable auto-population from lead data
   ↓
5. Message preview with personalization
   ↓
6. Send confirmation
   ↓
7. Performance metrics updated
   ↓
8. Template scoring for future suggestions
```

---

## 5. Advanced Features - Differentiation

### **JORNADA 7: AI Conversational & Lead Qualification**

**Persona**: Sales Representative + Lead (external)  
**Contexto**: Chatbot qualifica leads 24/7  
**Priority**: Advanced

#### AI Qualification Flow:

```
1. Lead initiates conversation (WhatsApp/Web chat)
   ↓
2. AI responde instantaneamente (< 2 segundos)
   ↓
3. Qualification questionnaire (dynamic based on industry)
   ↓
4. Lead responses captured & analyzed
   ↓
5. Real-time scoring calculation
   ↓
6. Decision point: Continue AI vs Human handoff
   ↓
7. If qualified: Immediate handoff to available rep
   ↓
8. Context transfer (full conversation history)
   ↓
9. Human continues seamlessly
   ↓
10. AI learns from human approval/rejection
```

#### Learning & Optimization:

- **Conversation Analytics**: Success rate por conversation path
- **A/B Testing**: Different qualification approaches
- **Industry Customization**: Specific questions per business type
- **Continuous Learning**: Feedback loop from sales team

---

### **JORNADA 8: Provider Migration & Enterprise Features**

**Persona**: Admin  
**Contexto**: Otimização de custos e migração sem downtime  
**Priority**: Advanced/Enterprise

#### WhatsApp Provider Migration:

```
1. Current State Analysis (usage, costs, features)
   ↓
2. ROI Calculator (Business API vs Web API)
   ↓
3. Migration Planning (timeline, risks, rollback)
   ↓
4. Configuration Backup
   ↓
5. New Provider Setup (parallel configuration)
   ↓
6. Message History Export/Migration
   ↓
7. Hot-swap execution (< 5 minutes downtime)
   ↓
8. Testing & Validation
   ↓
9. Old provider decommissioning
   ↓
10. Cost savings reporting
```

#### VoIP Provider Migration:

```
1. Cost Analysis (Twilio premium vs Telnyx economy)
   ↓
2. TwiML Compatibility Check (ensures 5-minute migration)
   ↓
3. Phone Number Porting Process
   ↓
4. Parallel Testing Setup
   ↓
5. Call History Preservation
   ↓
6. Configuration Hot-swap
   ↓
7. Immediate cost savings (30-70% reduction)
   ↓
8. Performance monitoring
   ↓
9. ROI tracking & reporting
```

---

## 6. CRUD Operations - Detailed Corner Cases

### **LEADS Management CRUD**

#### CREATE Lead:

**Happy Path**: Form → Validation → Lead created → Score calculated → Assigned
**Edge Cases**:

- **Email duplicado**: Smart merge suggestion with conflict resolution UI
- **Dados incompletos**: Partial save + progressive completion prompts
- **Bulk import failure**: Transaction rollback + detailed error reporting
- **Score calculation timeout**: Default score + background recalculation
- **Assignment rules conflict**: Manual override + admin notification

#### READ Leads:

**Happy Path**: Paginated list → Filters → Org-scoped results
**Edge Cases**:

- **Large dataset (+10k)**: Virtual scrolling + search optimization
- **Complex filter combinations**: Query performance monitoring
- **Deleted leads access**: Soft delete visibility for admins only
- **Cross-org attempt**: Immediate 403 + security audit trail

#### UPDATE Lead:

**Happy Path**: Form update → Validation → Score recalculation → Notification
**Edge Cases**:

- **Concurrent updates**: Optimistic locking + merge conflict UI
- **Status restriction**: Role-based validation + approval workflows
- **Bulk updates**: Progress tracking + partial success handling
- **Pipeline automation trigger**: Async processing + error recovery

#### DELETE Lead:

**Happy Path**: Soft delete → 30-day archive → Hard delete + audit
**Edge Cases**:

- **Lead with active deals**: Deletion prevention + impact warning
- **GDPR compliance**: Hard delete + data purging confirmation
- **Bulk deletion**: Confirmation dialog + undo capability
- **Related data cascade**: Dependency mapping + user confirmation

### **ORGANIZATIONS Management CRUD**

#### CREATE Organization:

**Happy Path**: User signup → Auto-create org → Initial setup wizard
**Edge Cases**:

- **Name conflict**: Auto-suffix + user notification
- **Payment failure**: Limited features + grace period
- **Invite collision**: Merge vs separate organization decision
- **Setup abandonment**: Follow-up automation + recovery flows

#### UPDATE Organization:

**Happy Path**: Settings change → Validation → Feature update → Notification
**Edge Cases**:

- **Plan downgrade**: Feature blocking + data retention policy
- **Admin transfer**: Multi-step verification + security validation
- **Billing change**: Proration calculation + invoice generation
- **Feature limits exceeded**: Automatic enforcement + upgrade prompts

#### DELETE Organization:

**Happy Path**: Request → Data export → 30-day grace → Hard delete
**Edge Cases**:

- **Active subscriptions**: Billing cancellation requirement
- **Multiple admins**: Ownership transfer or bulk notification
- **Data compliance**: Regulatory retention + secure purging
- **Accidental deletion**: Recovery workflow + admin approval

---

## 7. Error Handling & Recovery Patterns

### **Network & Infrastructure Failures**

- **WhatsApp Provider Down**: Automatic failover + user notification
- **Database Timeout**: Circuit breaker + graceful degradation
- **API Rate Limits**: Exponential backoff + queue management
- **File Upload Failures**: Chunked retry + progress restoration

### **Data Consistency Errors**

- **Concurrent Modifications**: Conflict resolution UI + merge options
- **Import Data Validation**: Detailed error reports + fix suggestions
- **Cross-Org Data Leaks**: Immediate isolation + security audit
- **Duplicate Detection**: Smart merge suggestions + manual override

### **User Experience Errors**

- **Session Expiration**: Seamless renewal + data preservation
- **Permission Changes**: Real-time updates + graceful degradation
- **Feature Access Denied**: Clear upgrade paths + alternative options
- **Form Validation**: Progressive validation + contextual help

---

## 8. Performance & Scalability Considerations

### **Database Optimization**

- **Organization Filtering**: Mandatory org_id indexes on all business tables
- **Query Performance**: Sub-200ms response time target
- **Connection Pooling**: Optimized for multi-tenant access patterns
- **Cache Strategy**: Redis for frequently accessed org data

### **Real-time Communication**

- **WebSocket Scaling**: Horizontal scaling with sticky sessions
- **Message Queuing**: Reliable delivery with retry mechanisms
- **Provider Rate Limits**: Intelligent throttling + queue management
- **Notification System**: Multi-channel with delivery confirmation

### **Frontend Performance**

- **Code Splitting**: Route-based + feature-based lazy loading
- **Data Caching**: TanStack Query with org-scoped invalidation
- **Virtual Lists**: Handle large datasets efficiently
- **Progressive Loading**: Skeleton screens + optimistic updates

---

## 9. Security & Compliance Patterns

### **Multi-Tenant Security**

- **Row-Level Security**: Every query filtered by organization_id
- **API Authentication**: JWT + X-Org-Id header validation
- **Cross-Org Prevention**: Automatic 403 + audit logging
- **Data Encryption**: At rest + in transit + field-level for PII

### **Audit & Monitoring**

- **Action Logging**: All CRUD operations with user context
- **Security Events**: Failed access attempts + anomaly detection
- **Performance Monitoring**: Response times + error rates per org
- **Compliance Tracking**: LGPD/GDPR data handling + retention

### **Provider Security**

- **WhatsApp Web API**: Account isolation + session monitoring
- **API Key Management**: Encrypted storage + rotation policies
- **Webhook Security**: Signature validation + replay prevention
- **Data Transit**: End-to-end encryption for all communications

---

## 10. Success Metrics & KPIs

### **User Experience Metrics**

- **Task Completion Rate**: >95% for core workflows
- **Time to First Value**: <5 minutes for new users
- **Feature Adoption**: >80% usage of core features per org
- **User Satisfaction**: NPS >70, CSAT >4.8/5.0

### **Technical Performance Metrics**

- **API Response Time**: <500ms (95th percentile)
- **Database Query Performance**: <200ms for org-filtered queries
- **WhatsApp Message Delivery**: <3 seconds end-to-end
- **System Uptime**: >99.9% availability

### **Business Impact Metrics**

- **Lead Conversion**: +300% vs fragmented tools
- **Response Time**: 60% reduction in customer response time
- **Tool Consolidation**: 80% reduction in tool switching
- **Revenue Impact**: Measurable increase in sales efficiency

### **Security Metrics**

- **Cross-Org Prevention**: 0 data leakage incidents
- **Authentication Success**: >99.9% valid auth attempts
- **Security Audit**: 100% compliance with security standards
- **Data Isolation**: All queries org-scoped validation

---

**🎯 DOCUMENTO COMPLETO** - Ready for Implementation

Este documento fornece o mapeamento completo das jornadas de usuário para o Loved CRM, incluindo:

- ✅ 5 personas detalhadas para agências digitais
- ✅ 8 jornadas críticas com happy paths e edge cases
- ✅ CRUD operations completas com corner cases
- ✅ Dual provider architecture (WhatsApp + VoIP)
- ✅ Security patterns para multi-tenancy
- ✅ Performance e scalability considerations
- ✅ Error handling e recovery patterns
- ✅ Success metrics e KPIs

**Architecture Compliance**: Next.js 14 + FastAPI + PostgreSQL + Railway  
**Multi-Tenancy**: Organization-scoped com isolamento absoluto  
**Provider Strategy**: Dual provider com hot-swap capability
