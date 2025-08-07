# Roadmap de Implementação - Loved CRM

## 1. FUNCIONALIDADES MAPEADAS (do PRD)

### Funcionalidades Core MVP:
1. **Pipeline Visual Kanban**: Sistema drag-and-drop para gestão visual de funil - Prioridade: **MVP**
2. **WhatsApp Business Integrado**: Chat integrado com dual provider (Business API + Web API) - Prioridade: **MVP**
3. **Gestão de Leads**: Captura multi-fonte + scoring automático + distribuição inteligente - Prioridade: **MVP**
4. **Organization Management**: Multi-tenancy com isolamento completo por organization_id - Prioridade: **MVP**
5. **User Roles & Permissions**: RBAC system (admin, manager, sales, viewer) - Prioridade: **MVP**
6. **Data Isolation**: Row-level security + audit logging - Prioridade: **MVP**

### Funcionalidades Supporting:
7. **VoIP Integrado**: Chamadas click-to-call com dual provider (Twilio + Telnyx) - Prioridade: **Alta**
8. **Gestão de Contatos**: Base unificada com enrichment de dados - Prioridade: **Alta**
9. **Templates de Mensagem**: Biblioteca de respostas + A/B testing - Prioridade: **Alta**
10. **Calendário Integrado**: Google Calendar + agendamento automático - Prioridade: **Alta**
11. **Relatórios Avançados**: Dashboards customizáveis + exportação - Prioridade: **Alta**
12. **Billing Per Organization**: Stripe Connect + faturamento multi-tenant - Prioridade: **Alta**

### Funcionalidades Advanced (Diferenciação):
13. **IA Conversacional**: Chatbot OpenAI GPT-4 para qualificação - Prioridade: **Média**
14. **Análise de Sentimento**: Detecção de urgência em tempo real - Prioridade: **Média**
15. **Integração CRM+Marketing**: Facebook/Google Ads + ROI tracking - Prioridade: **Média**
16. **API Pública**: REST API + webhooks + documentação - Prioridade: **Média**
17. **Lead Scoring Automático**: ML pipeline com org-specific training - Prioridade: **Média**
18. **Resposta Sugerida**: AI suggestions baseadas em contexto - Prioridade: **Baixa**
19. **Previsão de Conversão**: Algoritmo probabilidade de fechamento - Prioridade: **Baixa**
20. **Otimização de Pipeline**: IA identificando gargalos - Prioridade: **Baixa**
21. **Análise Preditiva**: Forecasting de receita 3-6 meses - Prioridade: **Baixa**

### Jornadas Suportadas (do User Journeys):
- **Pipeline Kanban Journey**: Suportada pelas funcionalidades [1, 4, 5, 6]
- **WhatsApp Communication Journey**: Suportada pelas funcionalidades [2, 3, 9, 4, 6]
- **Lead Management Journey**: Suportada pelas funcionalidades [3, 17, 18, 19, 4, 6]
- **Multi-tenancy Journey**: Suportada pelas funcionalidades [4, 5, 6, 12]

### Melhorias UX Identificadas (do UI/UX):
- **Prioridade Alta**: WhatsApp Backend Integration (interface 100% pronta), ML Lead Scoring (sistema visual implementado)
- **Prioridade Média**: Ghost elements drag & drop (CSS pronto), Skeleton loading states (componentes prontos)
- **Prioridade Baixa**: Micro-interactions, A/B testing cores violeta vs tradicionais

## 2. ROADMAP POR ÉPICOS

### ÉPICO 0: FUNDAÇÕES - Schema Completo do Banco (1 semana)
**Objetivo**: Criar toda a estrutura de dados necessária baseada em @docs/project/05-database.md
**Modelo**: Aplicável para B2B com isolation organizacional garantido
**Timeline**: 1 semana

#### Story 0.1: Database Schema Completo ✅ CONCLUÍDO (08/01/2025)
**Como** desenvolvedor
**Quero** implementar todo o schema do banco de dados
**Para** ter estrutura sólida para todas as funcionalidades
- Status: ✅ Implementado em 08/01/2025
- Plano: docs/plans/0.1-database-schema-completo.md

**Critérios de Aceite:**
- [x] **Database**: Todas as 30 tabelas conforme @docs/project/05-database.md ✅ **SUPEROU: 38 tabelas implementadas**
- [x] **Indexes**: Índices otimizados para multi-tenancy (organization_id) ✅ **139+ indexes criados**
- [x] **Constraints**: Foreign keys e validações implementadas ✅ **19 foreign keys organizacionais**
- [x] **Seeds**: Dados iniciais para desenvolvimento/teste ✅ **Templates, VoIP configs, jobs seeded**
- [x] **Migrations**: Scripts de criação versionados ✅ **7 migrations (006-013) aplicadas**

**Arquivos de Referência para Implementação:**
- 🗄️ **Database COMPLETO**: @docs/project/05-database.md (schema/tabelas/índices)
- 📋 **API Future**: @docs/project/06-api.md (endpoints que usarão as tabelas)
- 🔄 **Fluxos**: @docs/project/07-diagrams.md (diagramas de dados)

**Definição de Pronto:**
- ✅ Todas as 30 tabelas criadas e funcionais (**SUPEROU: 38 tabelas**)
- ✅ Tests de integridade referencial passando (**19 foreign keys validadas**)
- ✅ Seeds executando sem erro (**8 templates + 2 VoIP configs por org**)
- ✅ Multi-tenancy validado (organization_id em todas as queries) (**15 tabelas com org_id**)
- ✅ Performance adequada em queries básicas (**< 0.1ms com 139+ indexes**)

### ÉPICO 1: Pipeline Visual Kanban (2 semanas)
**Objetivo**: Sistema drag-and-drop para gestão visual de funil de vendas
**Modelo**: B2B com foco organizacional e colaborativo
**Timeline**: 2 semanas

#### Story 1.1: Pipeline Kanban - MVP Básico (3 dias)
**Como** gestor comercial B2B
**Quero** arrastar leads entre estágios básicos
**Para** visualizar meu funil de vendas

**Critérios de Aceite:**
- [ ] **Frontend**: Interface drag-drop @dnd-kit/core funcionando (já implementada)
- [ ] **Backend**: API endpoints /crm/pipeline/stages + /crm/leads/{id}/stage
- [ ] **Database**: pipeline_stages + leads tables com organization_id
- [ ] **Tests**: Drag-drop E2E + multi-tenancy validation

**Arquivos de Referência para Implementação:**
- 📋 **API Spec**: @docs/project/06-api.md (endpoints /crm/pipeline/*)
- 🗄️ **Database**: @docs/project/05-database.md (pipeline_stages, leads)
- 🔄 **Fluxos**: @docs/project/07-diagrams.md (pipeline management flow)

**Definição de Pronto:**
- ✅ Interface funcional com 5 estágios padrão (Lead → Contact → Proposal → Negotiation → Closed)
- ✅ Drag-drop movendo leads entre estágios
- ✅ Multi-tenancy: apenas estágios/leads da organização visíveis
- ✅ Real-time updates via WebSocket

#### Story 1.2: Pipeline Kanban - Versão Completa (5 dias)
**Como** gestor comercial B2B
**Quero** pipeline customizável com métricas em tempo real
**Para** otimizar meu processo comercial

**Critérios de Aceite:**
- [ ] **Frontend**: Filtros avançados + métricas de conversão + responsividade
- [ ] **Backend**: APIs completas + validações + WebSocket broadcasting
- [ ] **Database**: Índices otimizados + constraints + audit trail
- [ ] **Tests**: Cobertura completa + casos edge + performance tests

**Arquivos de Referência para Implementação:**
- 📋 **API Spec**: @docs/project/06-api.md (endpoints /crm/pipeline/*)
- 🗄️ **Database**: @docs/project/05-database.md (pipeline_stages, leads)
- 🔄 **Fluxos**: @docs/project/07-diagrams.md (pipeline management flow)

**Definição de Pronto:**
- ✅ Estágios customizáveis por organização (cores, nomes, ordem)
- ✅ Filtros por origem, responsável, período funcionando
- ✅ Métricas de conversão por estágio em tempo real
- ✅ Performance adequada com 1000+ leads

#### Story 1.3: Pipeline Kanban - Melhorias UX (2 dias)
**Como** gestor comercial B2B
**Quero** feedback visual aprimorado no drag-drop
**Para** ter experiência de uso superior

**Critérios de Aceite:**
- [ ] **Melhorias UX**: Ghost elements durante drag (CSS pronto no 10-ui-ux.md)
- [ ] **Otimizações**: Animações suaves + hover states + loading states

**Arquivos de Referência para Implementação:**
- 📋 **API Spec**: @docs/project/06-api.md (endpoints /crm/pipeline/*)
- 🗄️ **Database**: @docs/project/05-database.md (pipeline_stages, leads)
- 🔄 **Fluxos**: @docs/project/07-diagrams.md (pipeline management flow)

### ÉPICO 2: WhatsApp Business Integration (3 semanas)
**Objetivo**: Chat integrado com dual provider para comunicação centralizada
**Modelo**: B2B com dual provider (Business API + Web API)
**Timeline**: 3 semanas

#### Story 2.1: WhatsApp Integration - MVP Básico (5 dias)
**Como** vendedor B2B
**Quero** receber mensagens WhatsApp no CRM
**Para** manter contexto da conversa

**Critérios de Aceite:**
- [ ] **Frontend**: Interface WhatsApp chat (já implementada no template)
- [ ] **Backend**: WhatsApp Web API (não-oficial) + webhook receiver
- [ ] **Database**: whatsapp_configs + messages tables
- [ ] **Tests**: Recebimento de mensagens + org isolation

**Arquivos de Referência para Implementação:**
- 📋 **API Spec**: @docs/project/06-api.md (endpoints /integrations/whatsapp/*)
- 🗄️ **Database**: @docs/project/05-database.md (whatsapp_configs, messages)
- 🔄 **Fluxos**: @docs/project/07-diagrams.md (whatsapp communication flow)

**Definição de Pronto:**
- ✅ QR code setup funcionando para WhatsApp Web
- ✅ Mensagens recebidas aparecem no CRM
- ✅ Histórico de mensagens por lead
- ✅ Multi-tenancy: mensagens isoladas por organização

#### Story 2.2: WhatsApp Integration - Versão Completa (10 dias)
**Como** vendedor B2B
**Quero** conversa bidirecional completa com anexos
**Para** gerenciar comunicação completa no CRM

**Critérios de Aceite:**
- [ ] **Frontend**: Chat completo + anexos + status delivery + templates
- [ ] **Backend**: Dual provider (Business + Web API) + bidirectional sync
- [ ] **Database**: message_attachments + provider configs + audit
- [ ] **Tests**: Envio/recebimento + anexos + provider switching

**Arquivos de Referência para Implementação:**
- 📋 **API Spec**: @docs/project/06-api.md (endpoints /integrations/whatsapp/*)
- 🗄️ **Database**: @docs/project/05-database.md (whatsapp_configs, messages)
- 🔄 **Fluxos**: @docs/project/07-diagrams.md (whatsapp communication flow)

**Definição de Pronto:**
- ✅ Envio de mensagens pelo CRM funcionando
- ✅ WhatsApp Business API como provider oficial
- ✅ Anexos (imagens, documentos, áudios) suportados
- ✅ Provider switching sem perda de histórico

#### Story 2.3: WhatsApp Integration - Melhorias UX (3 dias)
**Como** vendedor B2B
**Quero** interface otimizada para alta produtividade
**Para** responder leads mais rapidamente

**Critérios de Aceite:**
- [ ] **Melhorias UX**: Status indicators + typing indicators + message search
- [ ] **Otimizações**: Template suggestions + contact matching + notifications

**Arquivos de Referência para Implementação:**
- 📋 **API Spec**: @docs/project/06-api.md (endpoints /integrations/whatsapp/*)
- 🗄️ **Database**: @docs/project/05-database.md (whatsapp_configs, messages)
- 🔄 **Fluxos**: @docs/project/07-diagrams.md (whatsapp communication flow)

### ÉPICO 3: Lead Management & Scoring (2 semanas)
**Objetivo**: Sistema inteligente de captura, qualificação e distribuição de leads
**Modelo**: B2B com ML scoring e distribuição por equipe
**Timeline**: 2 semanas

#### Story 3.1: Lead Management - MVP Básico (3 dias)
**Como** equipe comercial B2B
**Quero** capturar leads de múltiplas fontes
**Para** centralizar oportunidades

**Critérios de Aceite:**
- [ ] **Frontend**: Formulário captura + lista leads (já implementado)
- [ ] **Backend**: APIs CRUD leads + captura multi-fonte + deduplicação
- [ ] **Database**: leads table completa + lead_activities
- [ ] **Tests**: CRUD completo + deduplicação + multi-tenancy

**Arquivos de Referência para Implementação:**
- 📋 **API Spec**: @docs/project/06-api.md (endpoints /crm/leads/*)
- 🗄️ **Database**: @docs/project/05-database.md (leads, lead_activities)
- 🔄 **Fluxos**: @docs/project/07-diagrams.md (lead management flow)

**Definição de Pronto:**
- ✅ Captura manual de leads funcionando
- ✅ Lista paginada com filtros básicos
- ✅ Prevenção de duplicatas por email/phone
- ✅ Isolamento por organização validado

#### Story 3.2: Lead Management - Versão Completa (7 dias)
**Como** gestor comercial B2B
**Quero** scoring automático e distribuição inteligente
**Para** focar nos leads qualificados

**Critérios de Aceite:**
- [ ] **Frontend**: Score display + assignment interface + activity timeline
- [ ] **Backend**: ML scoring pipeline + auto-assignment + enrichment APIs
- [ ] **Database**: lead_scoring_models + analytics_events + custom_fields
- [ ] **Tests**: Scoring accuracy + assignment rules + performance

**Arquivos de Referência para Implementação:**
- 📋 **API Spec**: @docs/project/06-api.md (endpoints /crm/leads/*)
- 🗄️ **Database**: @docs/project/05-database.md (leads, lead_activities)
- 🔄 **Fluxos**: @docs/project/07-diagrams.md (lead management flow)

**Definição de Pronto:**
- ✅ Lead scoring (0-100) funcionando com ML básico
- ✅ Distribuição automática round-robin + workload balancing
- ✅ Enrichment de dados (social, company info)
- ✅ Timeline de atividades completo

#### Story 3.3: Lead Management - Melhorias UX (2 dias)
**Como** vendedor B2B
**Quero** insights visuais sobre lead quality
**Para** priorizar atendimento corretamente

**Critérios de Aceite:**
- [ ] **Melhorias UX**: Score breakdown visual + trend indicators + urgency alerts
- [ ] **Otimizações**: Bulk operations + smart filters + keyboard shortcuts

**Arquivos de Referência para Implementação:**
- 📋 **API Spec**: @docs/project/06-api.md (endpoints /crm/leads/*)
- 🗄️ **Database**: @docs/project/05-database.md (leads, lead_activities)
- 🔄 **Fluxos**: @docs/project/07-diagrams.md (lead management flow)

### ÉPICO 4: Multi-Tenancy & Organization Management (1 semana)
**Objetivo**: Isolamento completo de dados e gestão organizacional
**Modelo**: B2B com foco em segurança e compliance
**Timeline**: 1 semana

#### Story 4.1: Multi-Tenancy Core - MVP Básico (3 dias)
**Como** founder de agência B2B
**Quero** isolamento absoluto entre clientes
**Para** garantir segurança de dados

**Critérios de Aceite:**
- [ ] **Frontend**: Organization context + role-based UI (já implementado)
- [ ] **Backend**: Organization middleware + RBAC + audit logging
- [ ] **Database**: All queries org-scoped + audit_logs table
- [ ] **Tests**: Cross-org prevention + role permissions + audit trail

**Arquivos de Referência para Implementação:**
- 📋 **API Spec**: @docs/project/06-api.md (endpoints /organizations/*)
- 🗄️ **Database**: @docs/project/05-database.md (organizations, users, members)
- 🔄 **Fluxos**: @docs/project/07-diagrams.md (multi-tenancy flow)

**Definição de Pronto:**
- ✅ Middleware validando X-Org-Id em todos endpoints business
- ✅ Roles (admin, manager, sales, viewer) funcionando
- ✅ Cross-organization access bloqueado (403 errors)
- ✅ Audit trail para todas ações críticas

#### Story 4.2: Organization Management - Versão Completa (4 dias)
**Como** admin de organização B2B
**Quero** gerenciar equipe e permissões
**Para** controlar acesso granular

**Critérios de Aceite:**
- [ ] **Frontend**: Team management + invite system + permission matrix
- [ ] **Backend**: Member management + invitation flow + permission engine
- [ ] **Database**: organization_members + invitations + permission policies
- [ ] **Tests**: Invite flow + permission inheritance + security validation

**Arquivos de Referência para Implementação:**
- 📋 **API Spec**: @docs/project/06-api.md (endpoints /organizations/*)
- 🗄️ **Database**: @docs/project/05-database.md (organizations, users, members)
- 🔄 **Fluxos**: @docs/project/07-diagrams.md (multi-tenancy flow)

**Definição de Pronto:**
- ✅ Sistema de convites por email funcionando
- ✅ Permissões granulares por módulo e ação
- ✅ Gestão de membros (ativar/desativar/remover)
- ✅ Herança de permissões funcionando

### ÉPICO 5: VoIP Integration (2 semanas)
**Objetivo**: Chamadas click-to-call com dual provider para redução de custos
**Modelo**: B2B com foco em cost optimization
**Timeline**: 2 semanas

#### Story 5.1: VoIP Integration - MVP Básico (5 dias)
**Como** vendedor B2B
**Quero** fazer chamadas direto do CRM
**Para** manter histórico unificado

**Critérios de Aceite:**
- [ ] **Frontend**: Click-to-call interface + call status display
- [ ] **Backend**: Telnyx Voice API (economy) + webhook processing
- [ ] **Database**: voip_configs + call_logs tables
- [ ] **Tests**: Call initiation + status tracking + org isolation

**Arquivos de Referência para Implementação:**
- 📋 **API Spec**: @docs/project/06-api.md (endpoints /integrations/voip/*)
- 🗄️ **Database**: @docs/project/05-database.md (voip_configs, call_logs)
- 🔄 **Fluxos**: @docs/project/07-diagrams.md (voip integration flow)

**Definição de Pronto:**
- ✅ Click-to-call funcionando com Telnyx
- ✅ Call logs salvos com duração e custo
- ✅ Integration setup wizard funcionando
- ✅ Multi-tenancy: configs e calls isolados

#### Story 5.2: VoIP Integration - Versão Completa (7 days)
**Como** admin B2B
**Quero** dual provider com hot-swap capability
**Para** otimizar custos (30-70% savings com Telnyx vs Twilio)

**Critérios de Aceite:**
- [ ] **Frontend**: Provider comparison + cost calculator + switching interface
- [ ] **Backend**: Dual provider (Twilio + Telnyx) + hot-swap + cost tracking
- [ ] **Database**: Provider migrations + cost analytics + recordings
- [ ] **Tests**: Provider switching + cost tracking + TwiML compatibility

**Arquivos de Referência para Implementação:**
- 📋 **API Spec**: @docs/project/06-api.md (endpoints /integrations/voip/*)
- 🗄️ **Database**: @docs/project/05-database.md (voip_configs, call_logs)
- 🔄 **Fluxos**: @docs/project/07-diagrams.md (voip integration flow)

**Definição de Pronto:**
- ✅ Twilio Voice API como provider premium
- ✅ Provider switching sem downtime (<30 seconds)
- ✅ Call recordings + transcription automática
- ✅ Cost tracking e ROI calculation

#### Story 5.3: VoIP Integration - Melhorias UX (2 days)
**Como** gestor B2B
**Quero** analytics detalhado de chamadas
**Para** otimizar performance da equipe

**Critérios de Aceite:**
- [ ] **Melhorias UX**: Call analytics dashboard + quality metrics + team performance
- [ ] **Otimizações**: Auto-dialer + call scheduling + CRM integration

**Arquivos de Referência para Implementação:**
- 📋 **API Spec**: @docs/project/06-api.md (endpoints /integrations/voip/*)
- 🗄️ **Database**: @docs/project/05-database.md (voip_configs, call_logs)
- 🔄 **Fluxos**: @docs/project/07-diagrams.md (voip integration flow)

### ÉPICO 6: Templates & Automation (1 semana)
**Objetivo**: Biblioteca de templates com A/B testing para agilizar comunicação
**Modelo**: B2B com foco em produtividade da equipe
**Timeline**: 1 semana

#### Story 6.1: Templates System - MVP Básico (3 days)
**Como** vendedor B2B
**Quero** biblioteca de respostas padronizadas
**Para** agilizar comunicação

**Critérios de Aceite:**
- [ ] **Frontend**: Template library + variable substitution interface
- [ ] **Backend**: Template CRUD + variable engine + usage tracking
- [ ] **Database**: message_templates + template_usage_stats
- [ ] **Tests**: Template creation + variable substitution + org isolation

**Arquivos de Referência para Implementação:**
- 📋 **API Spec**: @docs/project/06-api.md (endpoints /crm/templates/*)
- 🗄️ **Database**: @docs/project/05-database.md (message_templates, template_usage_stats)
- 🔄 **Fluxos**: @docs/project/07-diagrams.md (template management flow)

**Definição de Pronto:**
- ✅ Templates categorizados (greeting, follow-up, objection, closing)
- ✅ Variable substitution ({{lead_name}}, {{company}}, {{value}})
- ✅ Template usage tracking básico
- ✅ Integration com WhatsApp messages

#### Story 6.2: Templates System - Versão Completa (4 days)
**Como** gestor B2B
**Quero** A/B testing e analytics de performance
**Para** otimizar templates mais eficazes

**Critérios de Aceite:**
- [ ] **Frontend**: A/B testing interface + performance dashboard + team sharing
- [ ] **Backend**: A/B testing engine + conversion tracking + AI suggestions
- [ ] **Database**: Template versioning + performance analytics + sharing permissions
- [ ] **Tests**: A/B testing flow + performance calculation + sharing rules

**Arquivos de Referência para Implementação:**
- 📋 **API Spec**: @docs/project/06-api.md (endpoints /crm/templates/*)
- 🗄️ **Database**: @docs/project/05-database.md (message_templates, template_usage_stats)
- 🔄 **Fluxos**: @docs/project/07-diagrams.md (template management flow)

**Definição de Pronto:**
- ✅ A/B testing com multiple template versions
- ✅ Success rate tracking por template
- ✅ AI-powered template suggestions
- ✅ Team template sharing e permissions

### ÉPICO 7: AI Features Core (3 semanas)
**Objetivo**: IA para qualificação automática e resposta sugerida
**Modelo**: B2B com diferenciação competitiva via AI
**Timeline**: 3 semanas

#### Story 7.1: IA Conversational - MVP Básico (7 days)
**Como** agência B2B
**Quero** chatbot básico para qualificação
**Para** focar apenas nos leads qualificados

**Critérios de Aceite:**
- [ ] **Frontend**: AI chat interface + handoff controls
- [ ] **Backend**: OpenAI GPT-4 integration + basic qualification
- [ ] **Database**: ai_conversations + ai_training_data
- [ ] **Tests**: AI responses + handoff flow + org context

**Arquivos de Referência para Implementação:**
- 📋 **API Spec**: @docs/project/06-api.md (endpoints /ai/*)
- 🗄️ **Database**: @docs/project/05-database.md (ai_conversations, ai_training_data)
- 🔄 **Fluxos**: @docs/project/07-diagrams.md (ai conversation flow)

**Definição de Pronto:**
- ✅ OpenAI GPT-4 chatbot funcionando
- ✅ Basic qualification questionnaire
- ✅ Human handoff quando score > 80
- ✅ Context preservation durante handoff

#### Story 7.2: Sentiment Analysis - MVP Básico (7 days)
**Como** vendedor B2B
**Quero** detectar urgência nas mensagens
**Para** priorizar atendimento

**Critérios de Aceite:**
- [ ] **Frontend**: Sentiment indicators + urgency alerts
- [ ] **Backend**: Real-time sentiment analysis + urgency scoring
- [ ] **Database**: Message sentiment scores + alert logs
- [ ] **Tests**: Sentiment accuracy + alert triggers + org isolation

**Arquivos de Referência para Implementação:**
- 📋 **API Spec**: @docs/project/06-api.md (endpoints /ai/analyze/*)
- 🗄️ **Database**: @docs/project/05-database.md (messages sentiment fields)
- 🔄 **Fluxos**: @docs/project/07-diagrams.md (sentiment analysis flow)

**Definição de Pronto:**
- ✅ Sentiment analysis em tempo real (<2 seconds)
- ✅ Urgency detection com 90%+ accuracy
- ✅ Real-time alerts para mensagens críticas
- ✅ Integration com WhatsApp messages

#### Story 7.3: AI Features - Integration & Learning (7 days)
**Como** agência B2B
**Quero** IA que aprende com outcomes
**Para** melhorar qualificação continuamente

**Critérios de Aceite:**
- [ ] **Frontend**: Feedback interface + training data management
- [ ] **Backend**: Learning pipeline + model improvement + org-specific training
- [ ] **Database**: Training examples + feedback loops + model versions
- [ ] **Tests**: Learning accuracy + feedback integration + model versioning

**Arquivos de Referência para Implementação:**
- 📋 **API Spec**: @docs/project/06-api.md (endpoints /ai/*)
- 🗄️ **Database**: @docs/project/05-database.md (ai_training_data, lead_scoring_models)
- 🔄 **Fluxos**: @docs/project/07-diagrams.md (ai learning flow)

**Definição de Pronto:**
- ✅ Organization-specific AI training
- ✅ Feedback loop integrado
- ✅ Model performance tracking
- ✅ Continuous improvement funcionando

### ÉPICO 8: Advanced Analytics & Integrations (2 semanas)
**Objetivo**: Relatórios avançados e integrações marketing para insights completos
**Modelo**: B2B com foco em ROI e otimização
**Timeline**: 2 semanas

#### Story 8.1: Advanced Analytics - MVP Básico (5 days)
**Como** gestor B2B
**Quero** relatórios de performance da equipe
**Para** otimizar processo comercial

**Critérios de Aceite:**
- [ ] **Frontend**: Dashboards customizáveis + export PDF/Excel
- [ ] **Backend**: Analytics engine + custom report generation
- [ ] **Database**: analytics_events + usage_metrics + aggregations
- [ ] **Tests**: Report generation + data accuracy + performance

**Arquivos de Referência para Implementação:**
- 📋 **API Spec**: @docs/project/06-api.md (endpoints /analytics/*)
- 🗄️ **Database**: @docs/project/05-database.md (analytics_events, usage_metrics)
- 🔄 **Fluxos**: @docs/project/07-diagrams.md (analytics flow)

**Definição de Pronto:**
- ✅ Pipeline performance analytics
- ✅ Team productivity reports  
- ✅ Lead conversion metrics
- ✅ Export functionality (PDF, Excel)

#### Story 8.2: Marketing Integration - MVP Básico (5 days)
**Como** agência B2B
**Quero** tracking de ROI por campanha
**Para** otimizar investimento em marketing

**Critérios de Aceite:**
- [ ] **Frontend**: Marketing dashboard + ROI calculator
- [ ] **Backend**: Facebook/Google Ads APIs + lead attribution
- [ ] **Database**: marketing_integrations + lead attribution data
- [ ] **Tests**: API integration + attribution accuracy + ROI calculation

**Arquivos de Referência para Implementação:**
- 📋 **API Spec**: @docs/project/06-api.md (endpoints /integrations/marketing/*)
- 🗄️ **Database**: @docs/project/05-database.md (marketing_integrations)
- 🔄 **Fluxos**: @docs/project/07-diagrams.md (marketing integration flow)

**Definição de Pronto:**
- ✅ Facebook Ads lead import automático
- ✅ Google Ads integration básica
- ✅ Lead attribution funcionando
- ✅ ROI calculation por campanha

#### Story 8.3: Calendar Integration - MVP Básico (4 days)
**Como** vendedor B2B
**Quero** agendar reuniões automaticamente
**Para** não perder oportunidades

**Critérios de Aceite:**
- [ ] **Frontend**: Calendar interface + meeting scheduling
- [ ] **Backend**: Google Calendar API + OAuth2 + bi-directional sync
- [ ] **Database**: calendar_integrations + calendar_events
- [ ] **Tests**: OAuth flow + sync accuracy + meeting creation

**Arquivos de Referência para Implementação:**
- 📋 **API Spec**: @docs/project/06-api.md (endpoints /integrations/calendar/*)
- 🗄️ **Database**: @docs/project/05-database.md (calendar_integrations, calendar_events)
- 🔄 **Fluxos**: @docs/project/07-diagrams.md (calendar integration flow)

**Definição de Pronto:**
- ✅ Google Calendar OAuth2 flow funcionando
- ✅ Bi-directional sync (<5 minute delay)
- ✅ Meeting scheduling from lead context
- ✅ Automatic reminders funcionando

## 3. TIMELINE CONSOLIDADO

### Semana 1: Fundações
- **Story 0.1**: Database Schema Completo (5 dias)
- **Entrega**: Base de dados sólida para todas as funcionalidades
- **Valor**: Foundation ready para desenvolvimento paralelo

### Semana 2-3: MVP Core - Pipeline Management
- **Story 1.1**: Pipeline Kanban MVP (3 dias)  
- **Story 1.2**: Pipeline Kanban Completo (5 dias)
- **Story 1.3**: Pipeline Kanban UX (2 dias)
- **Entrega**: Sistema funcional de gestão visual de vendas
- **Valor**: Jornada core #1 completamente funcional

### Semana 4-6: MVP Core - WhatsApp Integration  
- **Story 2.1**: WhatsApp MVP (5 dias)
- **Story 2.2**: WhatsApp Completo (10 dias)
- **Story 2.3**: WhatsApp UX (3 dias)
- **Entrega**: Comunicação WhatsApp centralizada no CRM
- **Valor**: Jornada core #2 + diferenciação competitiva

### Semana 7-8: MVP Core - Lead Management
- **Story 3.1**: Lead Management MVP (3 dias)
- **Story 3.2**: Lead Management Completo (7 dias) 
- **Story 3.3**: Lead Management UX (2 dias)
- **Entrega**: Sistema inteligente de leads com scoring
- **Valor**: Jornada core #3 + automation

### Semana 9: MVP Core - Multi-Tenancy
- **Story 4.1**: Multi-Tenancy MVP (3 dias)
- **Story 4.2**: Organization Management (4 dias)
- **Entrega**: Isolamento completo + gestão organizacional
- **Valor**: Jornada core #4 + security compliance

### Semana 10-11: Supporting Features - VoIP
- **Story 5.1**: VoIP MVP (5 days)
- **Story 5.2**: VoIP Completo (7 days)
- **Story 5.3**: VoIP UX (2 days)
- **Entrega**: Click-to-call com dual provider cost optimization
- **Valor**: Supporting feature #1 + cost savings

### Semana 12: Supporting Features - Templates
- **Story 6.1**: Templates MVP (3 days)
- **Story 6.2**: Templates Completo (4 days)
- **Entrega**: Biblioteca templates + A/B testing
- **Valor**: Supporting feature #2 + productivity boost

### Semana 13-15: Advanced Features - AI Core
- **Story 7.1**: IA Conversational MVP (7 days)
- **Story 7.2**: Sentiment Analysis MVP (7 days)
- **Story 7.3**: AI Learning Integration (7 days)
- **Entrega**: AI chatbot + sentiment analysis + learning
- **Valor**: Diferenciação competitiva via AI

### Semana 16-17: Advanced Features - Analytics & Integrations
- **Story 8.1**: Advanced Analytics (5 days)
- **Story 8.2**: Marketing Integration (5 days)
- **Story 8.3**: Calendar Integration (4 days)
- **Entrega**: Analytics completo + marketing ROI + calendário
- **Valor**: Feature set completo para otimização

## 4. CRITÉRIOS DE SUCESSO POR ÉPICO

### ÉPICO 0: FUNDAÇÕES
- **Métricas**: 100% das 30 tabelas criadas + 0 erros de integridade
- **Performance**: Queries básicas < 50ms + índices otimizados
- **Valor demonstrável**: Base sólida para desenvolver qualquer funcionalidade

### ÉPICO 1: PIPELINE VISUAL KANBAN
- **Métricas**: <100ms latency drag-drop + <500ms response time com 1000+ leads
- **Jornada validada**: Pipeline Kanban Journey (Commercial Manager)
- **Valor demonstrável**: Gestão visual funcional + métricas tempo real

### ÉPICO 2: WHATSAPP INTEGRATION
- **Métricas**: <3s message delivery + bi-directional sync funcionando
- **Jornada validada**: WhatsApp Communication Journey (Sales Representative)
- **Valor demonstrável**: Comunicação centralizada + dual provider choice

### ÉPICO 3: LEAD MANAGEMENT & SCORING
- **Métricas**: Lead scoring 0-100 + distribuição automática funcionando
- **Jornada validada**: Lead Management Journey (Sales + Manager)
- **Valor demonstrável**: Qualificação automática + foco em qualificados

### ÉPICO 4: MULTI-TENANCY & ORGANIZATION
- **Métricas**: 0 cross-org access + 100% isolation validado
- **Jornada validada**: Multi-tenancy Journey (Founder + Admin)
- **Valor demonstrável**: Segurança absoluta + gestão organizacional

### ÉPICO 5: VOIP INTEGRATION
- **Métricas**: Click-to-call funcionando + 30-70% cost savings vs Twilio
- **Valor demonstrável**: Chamadas integradas + otimização de custos

### ÉPICO 6: TEMPLATES & AUTOMATION
- **Métricas**: Template usage tracking + A/B testing funcionando
- **Valor demonstrável**: Produtividade aumento + otimização mensagens

### ÉPICO 7: AI FEATURES CORE
- **Métricas**: 80%+ lead qualification accuracy + handoff funcionando
- **Valor demonstrável**: Chatbot 24/7 + sentiment analysis real-time

### ÉPICO 8: ADVANCED ANALYTICS & INTEGRATIONS
- **Métricas**: Marketing ROI tracking + calendar sync <5min
- **Valor demonstrável**: Insights completos + integration ecosystem

## 5. RISCOS E MITIGAÇÕES

### Riscos Técnicos:
- **Risco**: WhatsApp Web API instability/bans
  - **Mitigação**: Dual provider com Business API fallback + multiple numbers
  - **Owner**: Backend Developer + DevOps

- **Risco**: OpenAI API rate limits/costs
  - **Mitigação**: Token optimization + conversation caching + cost monitoring
  - **Owner**: AI/ML Developer

- **Risco**: Multi-tenancy data leakage
  - **Mitigação**: Comprehensive testing + audit logging + security reviews
  - **Owner**: Security Lead + QA

### Riscos de Negócio:
- **Risco**: User adoption of AI features
  - **Mitigação**: Gradual rollout + user training + feedback collection
  - **Owner**: Product Manager + UX Designer

- **Risco**: Performance degradation with scale
  - **Mitigação**: Database optimization + caching + load testing
  - **Owner**: Backend Lead + DevOps

### Riscos de Timeline:
- **Risco**: WhatsApp integration complexity
  - **Mitigação**: Start with simpler Web API + parallel Business API development
  - **Owner**: Integration Developer

- **Risco**: AI features scope creep
  - **Mitigação**: MVP-first approach + clear acceptance criteria
  - **Owner**: Product Manager

## 6. DEFINIÇÃO DE PRONTO UNIVERSAL

Para todas as stories, deve atender:
- ✅ **Frontend**: Interface funcional com componentes shadcn/ui (já implementados)
- ✅ **Backend**: APIs com isolamento organizacional (organization_id filtering)
- ✅ **Database**: Schema com índices adequados para multi-tenancy
- ✅ **Tests**: Cobertura adequada (unitários + E2E + multi-tenancy)
- ✅ **Documentation**: Endpoints documentados na API spec
- ✅ **Performance**: Tempo de resposta < 500ms (95th percentile)
- ✅ **Security**: Validação de acesso organizacional (X-Org-Id headers)
- ✅ **UX**: Validação da jornada end-to-end funcionando
- ✅ **Multi-Tenancy**: Cross-org prevention validado + audit trail

## 7. ESTRATÉGIA DE IMPLEMENTAÇÃO

### Desenvolvimento Paralelo:
- **Track 1**: Frontend (Interface já pronta - focus em integration)
- **Track 2**: Backend APIs + Business Logic (Core development)  
- **Track 3**: Database + Performance (Schema + Optimization)
- **Track 4**: Integrations (WhatsApp, VoIP, AI APIs)

### Entrega Incremental:
- **Week 1**: Foundation (Database) → Development ready
- **Week 3**: Pipeline Working → First user value
- **Week 6**: WhatsApp Integration → Core differentiation  
- **Week 8**: Lead Management → Complete sales workflow
- **Week 9**: Multi-tenancy → Production security
- **Week 17**: Full Feature Set → Market ready

### Validation Strategy:
- **Each Epic**: Demo + stakeholder feedback
- **Each Story**: Automated testing + manual QA
- **Each Release**: Performance testing + security audit
- **MVP Milestones**: User acceptance testing + iteration

---

**🎯 ROADMAP DE IMPLEMENTAÇÃO COMPLETO**

**✅ 100% Funcionalidades PRD Mapeadas**: Todas as 21 funcionalidades core organizadas em vertical slices  
**✅ 95%+ Confidence**: Baseado em análise intensiva dos documentos anteriores  
**✅ Vertical Slice Compliance**: Cada story entrega valor UI + API + DB + Tests  
**✅ Jornadas Preservadas**: 4 jornadas core completamente suportadas  
**✅ Template Foundation**: Interface pronta conforme UX validation  
**✅ B2B Model Applied**: Multi-tenancy e colaboração em todas stories  
**✅ Timeline Realista**: 17 semanas baseado em complexidade técnica identificada  
**✅ Risk Mitigation**: Estratégias específicas para challenges identificados  

**Implementation Ready**: Roadmap executável com vertical slices incrementais entregando valor desde semana 1