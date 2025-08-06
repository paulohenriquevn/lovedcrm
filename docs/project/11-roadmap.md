# 11-roadmap.md - Loved CRM Roadmap Vertical Slice

## **MODELO DETECTADO: B2B**

**Modelo confirmado**: B2B conforme 02-prd.md, 10-user-journeys.md
**Justificativa**: Sistema para agências digitais brasileiras (5-20 colaboradores) com organizações compartilhadas, colaboração em equipe e contexto organizacional proeminente
**Roadmap adaptado**: Organization-scoped para B2B (organizações compartilhadas + workflows colaborativos + milestones focados em equipe + contexto organizacional em todas as implementações)

## 🚨 **PRE-ROADMAP: PREPARAÇÃO 100% DO AMBIENTE**

**⚠️ CRÍTICO: Todo o PRE-ROADMAP DEVE estar 100% completo antes de iniciar qualquer Story do roadmap.**

> **OBJETIVO**: Deixar o ambiente completamente pronto, com todas as tabelas criadas, sistema de design implementado, landing page configurada, projeto renomeado e funcionalidades base operacionais.

### **FASE 1: IMPLEMENTAÇÃO COMPLETA BASE DE DADOS (AGENTE_04_DATABASE_ARCHITECT)**
**Duração**: 1-2 dias | **Responsável**: Backend Developer + DevOps

**🎯 OBJETIVO**: Implementar 100% do schema do banco de dados com todas as tabelas necessárias para o projeto.

**SE B2B DETECTADO:**

**1.1 IMPLEMENTAÇÃO SCHEMA COMPLETO**
- [ ] **Ler e implementar integralmente** `@docs/project/04-database.md`
- [ ] **Criar ALL tabelas do sistema** definidas no agente 04 (não apenas feature específica)
- [ ] **Implementar ALL relacionamentos** com FK `organization_id` obrigatório
- [ ] **Criar ALL índices de performance** baseados em organização
- [ ] **Implementar ALL constraints** de integridade organizacional

**1.2 EXECUÇÃO MIGRATIONS COMPLETAS**
- [ ] **Gerar arquivos migration** para todo o schema definido no agente 04
- [ ] **Executar migrations** no ambiente desenvolvimento
- [ ] **Executar migrations** no ambiente Railway produção  
- [ ] **Validar schema criado** com `\d+` PostgreSQL (todas tabelas listadas)
- [ ] **Confirmar FK organization_id** em todas as tabelas obrigatórias

**1.3 IMPLEMENTAÇÃO MODELS/REPOSITORIES/SERVICES**
- [ ] **Criar ALL models SQLAlchemy** para todas as tabelas definidas
- [ ] **Implementar ALL repositories** com filtro organizacional obrigatório
- [ ] **Criar ALL services** com validação organizacional
- [ ] **Implementar ALL schemas Pydantic** (request/response)
- [ ] **Adicionar ALL endpoints básicos** (GET, POST, PUT, DELETE) com middleware org

**1.4 VALIDAÇÃO COMPLETA ISOLAMENTO ORGANIZACIONAL**
- [ ] **Testar query filtering** em todas as tabelas (100% isolation)
- [ ] **Validar constraints organizacionais** (cross-org access blocked)
- [ ] **Testar performance queries** organizacionais com índices
- [ ] **Confirmar middleware** `api/core/organization_middleware.py` funcionando
- [ ] **Executar testes isolamento** entre organizações diferentes

### **FASE 2: IMPLEMENTAÇÃO SISTEMA DESIGN TOKENS (AGENTE_07_DESIGN_TOKENS)**
**Duração**: 6-8 horas | **Responsável**: Frontend Developer

**🎯 OBJETIVO**: Implementar 100% do sistema de design tokens definido pelo agente 07.

**2.1 IMPLEMENTAÇÃO DESIGN TOKENS**
- [ ] **Ler e implementar integralmente** `@docs/project/07-design-tokens.md`
- [ ] **Implementar ALL tokens** definidos (cores, tipografia, espaçamento, etc.)
- [ ] **Configurar Tailwind CSS** com tokens customizados do projeto
- [ ] **Criar arquivo tokens** (`tokens.css` ou `design-system.ts`)
- [ ] **Aplicar tokens** aos componentes shadcn/ui existentes

**2.2 CONFIGURAÇÃO SISTEMA DESIGN**
- [ ] **Implementar tema customizado** baseado no setor/modelo detectado
- [ ] **Configurar dark/light mode** com tokens definidos
- [ ] **Implementar responsive design** tokens (breakpoints, spacing)
- [ ] **Configurar animações/transições** definidas no agente 07
- [ ] **Validar consistência visual** em todos os componentes existentes

**2.3 VALIDAÇÃO DESIGN SYSTEM**
- [ ] **Testar tokens** em diferentes temas (light/dark)
- [ ] **Validar responsividade** em todas as breakpoints
- [ ] **Confirmar acessibilidade** (contraste, tamanhos, etc.)
- [ ] **Testar consistência** visual entre páginas
- [ ] **Validar performance** CSS com novos tokens

### **FASE 3: IMPLEMENTAÇÃO LANDING PAGE (AGENTE_08_LANDING_PAGE)**
**Duração**: 1 dia | **Responsável**: Frontend Developer + UX

**🎯 OBJETIVO**: Implementar 100% da landing page de alta conversão definida pelo agente 08.

**3.1 IMPLEMENTAÇÃO LANDING PAGE COMPLETA**
- [ ] **Ler e implementar integralmente** `@docs/project/08-landing-page.md`
- [ ] **Criar página landing** (`app/[locale]/page.tsx`) com estrutura definida
- [ ] **Implementar ALL seções** definidas (hero, features, pricing, etc.)
- [ ] **Aplicar design tokens** da Fase 2 na landing page
- [ ] **Implementar CTAs** de conversão otimizados

**3.2 OTIMIZAÇÃO CONVERSÃO**
- [ ] **Implementar formulários** lead generation definidos
- [ ] **Configurar tracking** analytics/conversão (se definido)
- [ ] **Implementar social proof** (testimonials, logos, etc.)
- [ ] **Otimizar performance** loading da landing page (< 2s)
- [ ] **Configurar SEO** meta tags, structured data

**3.3 INTEGRAÇÃO SISTEMA ATUAL**
- [ ] **Conectar CTAs** com sistema auth/registro existente
- [ ] **Implementar redirecionamentos** para `/[locale]/admin/` após conversão  
- [ ] **Configurar contexto organizacional** para novos usuários
- [ ] **Testar fluxo completo** landing → registro → dashboard
- [ ] **Validar responsividade** em todos os dispositivos

**3.4 VALIDAÇÃO LANDING PAGE**
- [ ] **Testar performance** (Lighthouse > 90 em todas métricas)
- [ ] **Validar acessibilidade** (WCAG 2.1 AA compliance)
- [ ] **Testar formulários** funcionando corretamente
- [ ] **Confirmar tracking** analytics configurado
- [ ] **Testar fluxo conversão** end-to-end

### **FASE 4: IMPLEMENTAÇÃO COMPLETA UX/UI (AGENTE_09_UI_UX)**
**Duração**: 1-1.5 dias | **Responsável**: Frontend Developer + UX Designer

**🎯 OBJETIVO**: Implementar 100% do sistema UX/UI definido pelo agente 09.

**4.1 IMPLEMENTAÇÃO COMPONENTES UI COMPLETOS**
- [ ] **Ler e implementar integralmente** `@docs/project/09-ui-ux-designer.md`
- [ ] **Criar ALL componentes UI** definidos no agente 09
- [ ] **Implementar padrões interação** organization-aware definidos
- [ ] **Aplicar design tokens** (Fase 2) em todos os componentes
- [ ] **Configurar shadcn/ui** com customizações definidas

**4.2 IMPLEMENTAÇÃO JORNADAS USUÁRIO**
- [ ] **Implementar ALL jornadas** usuário definidas (B2B)
- [ ] **Configurar navegação** organization-aware
- [ ] **Implementar breadcrumbs** contexto organizacional
- [ ] **Criar flows** onboarding definidos no agente 09
- [ ] **Implementar feedback** UI (loading, success, error states)

**4.3 OTIMIZAÇÃO EXPERIÊNCIA USUÁRIO**
- [ ] **Implementar progressive disclosure** definido
- [ ] **Configurar keyboard navigation** (acessibilidade)
- [ ] **Implementar search/filter** patterns organization-scoped
- [ ] **Criar empty states** organization-aware
- [ ] **Implementar tooltips/help** contextual

**4.4 VALIDAÇÃO UX/UI COMPLETA**
- [ ] **Testar ALL jornadas** usuário definidas
- [ ] **Validar consistência** visual com design tokens
- [ ] **Testar acessibilidade** (keyboard, screen readers)
- [ ] **Confirmar responsividade** em todos os dispositivos  
- [ ] **Validar performance** UX (interactions < 100ms)

### **FASE 5: CONFIGURAÇÃO COMPLETA PROJETO**
**Duração**: 4-6 horas | **Responsável**: DevOps + Project Lead

**🎯 OBJETIVO**: Renomear e configurar completamente o projeto com identidade final.

**5.1 RENOMEAÇÃO COMPLETA PROJETO**
- [ ] **Definir nome final** projeto baseado no `@docs/project/01-vision.md`
- [ ] **Atualizar package.json** (name, description, keywords)
- [ ] **Atualizar CLAUDE.md** com novo nome e contexto projeto
- [ ] **Renomear títulos** em todas as páginas e componentes
- [ ] **Atualizar meta tags** SEO com novo nome projeto

**5.2 CONFIGURAÇÃO AMBIENTE PRODUÇÃO**
- [ ] **Configurar Railway** com novo nome projeto
- [ ] **Atualizar variáveis ambiente** produção
- [ ] **Configurar domínio** customizado (se aplicável)
- [ ] **Testar deploy** com novo nome/configuração
- [ ] **Validar SSL/certificados** funcionando

**5.3 CONFIGURAÇÃO DESENVOLVIMENTO**
- [ ] **Atualizar README.md** com novo contexto projeto
- [ ] **Configurar env.local** desenvolvimento
- [ ] **Atualizar scripts** npm/makefile com contexto correto
- [ ] **Configurar git** tags/releases com novo nome
- [ ] **Testar ambiente** desenvolvimento completo

**5.4 BRANDING E IDENTIDADE**
- [ ] **Implementar logo/favicon** definidos no agente 08
- [ ] **Configurar cores** marca baseadas nos design tokens
- [ ] **Atualizar strings** UI com nova identidade
- [ ] **Configurar emails** transacionais com branding
- [ ] **Testar identidade** consistente em todas as páginas

### **FASE 6: VALIDAÇÃO FINAL PRE-ROADMAP**
**Duração**: 2-3 horas | **Responsável**: Tech Lead + QA

**🎯 OBJETIVO**: Validar que ambiente está 100% pronto para iniciar roadmap de features.

**6.1 VALIDAÇÃO TÉCNICA COMPLETA**
- [ ] **Executar `make ci`** (lint + typecheck + security + tests) - 100% pass
- [ ] **Validar build** produção sem erros/warnings
- [ ] **Testar deploy** Railway zero downtime
- [ ] **Confirmar 60+ endpoints** existentes funcionando
- [ ] **Validar performance** sistema (< 200ms response times)

**6.2 VALIDAÇÃO FUNCIONAL COMPLETA**
- [ ] **Testar auth/registration** funcionando com nova identidade
- [ ] **Validar contexto organizacional** em todas as páginas
- [ ] **Testar isolamento** organizacional 100% efetivo
- [ ] **Confirmar middleware** organizacional funcionando
- [ ] **Validar feature gating** básico funcionando

**6.3 VALIDAÇÃO SCHEMA DATABASE COMPLETO**
- [ ] **Confirmar ALL tabelas** definidas no agente 04 criadas
- [ ] **Validar ALL FK organization_id** implementadas
- [ ] **Testar ALL queries** com filtro organizacional
- [ ] **Confirmar ALL índices** performance criados
- [ ] **Validar ALL constraints** integridade organizacional

**6.4 VALIDAÇÃO UX/UI COMPLETA**
- [ ] **Confirmar ALL componentes** agente 09 implementados
- [ ] **Validar design tokens** aplicados consistentemente
- [ ] **Testar landing page** funcionando perfeitamente
- [ ] **Confirmar jornadas** usuário organization-aware
- [ ] **Validar acessibilidade** WCAG 2.1 compliance

**6.5 SECURITY CHECK FINAL**
- [ ] **Confirmar isolamento organizacional** 100% effective
- [ ] **Validar prevenção** cross-organization access
- [ ] **Testar middleware** security em todos endpoints
- [ ] **Confirmar logging** auditoria funcionando
- [ ] **Validar compliance** segurança organizacional

### **🎯 CRITÉRIOS SUCESSO PRE-ROADMAP**

**✅ AMBIENTE 100% PRONTO QUANDO:**

**DATABASE & BACKEND:**
- ✅ **ALL tabelas** agente 04 criadas e operacionais
- ✅ **ALL models/repositories/services** implementados
- ✅ **ALL endpoints básicos** funcionando com isolamento org
- ✅ **Middleware organizacional** 100% operacional

**FRONTEND & UX:**
- ✅ **Design tokens** implementados e aplicados
- ✅ **Landing page** otimizada funcionando
- ✅ **ALL componentes UX** agente 09 implementados
- ✅ **Jornadas usuário** organization-aware funcionando

**PROJETO & DEPLOY:**
- ✅ **Projeto renomeado** com identidade final
- ✅ **Railway configurado** com novo nome/domínio
- ✅ **Branding consistente** em todas as páginas
- ✅ **Deploy produção** funcionando perfeitamente

**QUALIDADE & SEGURANÇA:**
- ✅ **`make ci` passing** (100% lint + typecheck + security + tests)
- ✅ **Isolamento organizacional** 100% efetivo
- ✅ **Performance** < 200ms response times
- ✅ **60+ endpoints** existentes preservados e funcionando

**🔒 SECURITY FINAL CHECK: Zero possibilidade de acesso cross-organization em qualquer parte do sistema.**

---

**⚠️ IMPORTANTE**: Apenas após **TODOS** os critérios acima estarem ✅ (100% completos), o roadmap de features pode ser iniciado. Qualquer item pendente deve ser resolvido antes de prosseguir.

---

## **ROADMAP FEATURE VERTICAL SLICE B2B-ESPECÍFICO**

**Épico**: Sistema CRM Completo Para Agências Digitais Brasileiras
**Metodologia**: User Story Splitting + Arquitetura Vertical Slice para B2B
**Plataforma**: Railway + Next.js 14 + FastAPI + PostgreSQL (preservando sistema atual)
**Isolamento Organizacional**: Organization_id B2B em todas as stories
**Entrega Valor**: Cada story entrega funcionalidade end-to-end utilizável para agências colaborativas

## **DEFINIÇÃO ÉPICO**

### **Épico**: Sistema CRM Agências - Implementação Completa B2B

**Como um** gestor/membro de agência digital brasileira  
**Eu quero** sistema CRM completo com Pipeline Kanban, Timeline WhatsApp e IA Resumos funcionando com isolamento organizacional  
**Para que** minha agência possa gerenciar leads de forma colaborativa, integrar comunicações e ter insights IA mantendo total segurança de dados organizacionais

### **Critérios Aceite Épico B2B**

- ✅ CRM funciona end-to-end para organizações/agências
- ✅ Isolamento organizacional 100% garantido (zero acesso cross-organization)  
- ✅ Sistema atual preservado (60+ endpoints funcionando)
- ✅ Feature gating implementado por tier assinatura baseado organização
- ✅ Metas performance atingidas (< 200ms response time) com carga colaborativa B2B
- ✅ Colaboração em equipe funciona perfeitamente (múltiplos usuários por agência)

### **Value Stream Épico B2B**

- **Valor Negócio**: CRM especializado agências aumenta conversão de leads 30-50% + reduz tempo gestão 60%
- **Valor Usuário**: Agências têm pipeline visual + WhatsApp integrado + IA resumos em português em uma ferramenta
- **Valor Técnico**: Evolução sistema atual + multi-tenancy B2B + integrações nativas brasileiras

## **USER STORIES (VERTICAL SLICES B2B)**

### **STORY 1: Pipeline Kanban Básico B2B (Vertical Slice)**

**Duração**: 3-4 dias

**Como um** gestor de agência digital  
**Eu quero** pipeline Kanban básico funcionando end-to-end para minha agência  
**Para que** eu possa visualizar e gerenciar leads da agência de forma colaborativa com minha equipe

#### **MicroTasks (ORDEM DE EXECUÇÃO OBRIGATÓRIA B2B)**

**🥇 FASE 1: FUNDAÇÃO DATABASE B2B (Sequencial - 4-6 horas)**

- [ ] **1.1** Projetar schema tabela `crm_leads` com FK organization_id (agência)
- [ ] **1.2** Criar arquivo migration banco dados para tabelas pipeline agências
- [ ] **1.3** Aplicar migration ao banco desenvolvimento + verificar schema
- [ ] **1.4** Adicionar constraints chave estrangeira para isolamento organizacional agências
- [ ] **1.5** Criar indexes banco dados para queries organization_id + pipeline_stage
- [ ] **1.6** Testar schema banco dados com dados amostra múltiplas agências

**🥇 FASE 2: API BACKEND B2B (Sequencial após Fase 1 - 8-10 horas)**

- [ ] **2.1** Criar modelo SQLAlchemy CrmLead com FK organization_id
- [ ] **2.2** Implementar repository LeadsRepository com filtro organizacional agência
- [ ] **2.3** Criar serviço LeadsService com lógica validação organizacional B2B
- [ ] **2.4** Adicionar schemas Pydantic leads (LeadRequest/LeadResponse)
- [ ] **2.5** Implementar endpoints API `/api/v1/crm/leads` com api/core/organization_middleware.py
- [ ] **2.6** Adicionar tratamento erro API + validação organizacional + logs auditoria
- [ ] **2.7** Testar API manualmente com Postman + contexto organizacional múltiplas agências
- [ ] **2.8** Atualizar documentação OpenAPI para endpoints pipeline CRM

**🥇 FASE 3: UI FRONTEND B2B (Sequencial após Fase 2 - 6-8 horas)**

- [ ] **3.1** Criar estrutura básica página pipeline `/[locale]/admin/crm/pipeline`
- [ ] **3.2** Adicionar item menu navegação "Pipeline CRM" (com contexto agência)
- [ ] **3.3** Implementar componente Kanban básico com 5 colunas (Lead→Contato→Proposta→Negociação→Fechado)
- [ ] **3.4** Integrar hooks/use-org-context.ts + validação contexto agência
- [ ] **3.5** Conectar frontend à API backend + tratamento erro + loading states
- [ ] **3.6** Adicionar validação contexto organizacional + permissões B2B (Admin/Member)
- [ ] **3.7** Implementar drag & drop básico + feedback visual + colaboração real-time
- [ ] **3.8** Polish UI/UX + design responsivo + indicadores colaboração equipe

**🥇 FASE 4: PIPELINE TESTES B2B (Misto Sequencial/Paralelo após Fase 3 - 4-6 horas)**

**TESTES UNITÁRIOS B2B (Paralelo - podem executar simultaneamente)**

- [ ] **4.1a** Testar criação modelo CrmLead com organization_id agência (Backend)
- [ ] **4.1b** Testar filtro organizacional repository leads por agência (Backend)
- [ ] **4.1c** Testar lógica validação organizacional serviço leads B2B (Backend)
- [ ] **4.2a** Testar renderização componente Kanban pipeline (Frontend - Paralelo com 4.1x)
- [ ] **4.2b** Testar integração contexto organizacional agência (Frontend - Paralelo com 4.1x)
- [ ] **4.2c** Testar validação permissões B2B + tratamento erro (Frontend - Paralelo com 4.1x)

**TESTES INTEGRAÇÃO B2B (Sequencial após Testes Unitários)**

- [ ] **4.3** Testar API leads com contexto organizacional agência válida
- [ ] **4.4** Testar API leads rejeita acesso organização/agência inválida
- [ ] **4.5** Testar queries banco leads filtram por agência corretamente
- [ ] **4.6** Testar integração frontend + backend pipeline end-to-end agência

**TESTES E2E B2B (Sequencial após Testes Integração)**

- [ ] **4.7** Testar fluxo completo usuário pipeline para agência (Admin + Member)
- [ ] **4.8** Testar isolamento pipeline entre diferentes agências
- [ ] **4.9** Testar colaboração pipeline múltiplos usuários mesma agência
- [ ] **4.10** Testar troca organizacional com dados pipeline

**TESTES ISOLAMENTO ORGANIZACIONAL B2B (Sequencial após Testes E2E)**

- [ ] **4.11** Testar prevenção acesso cross-organization agências (segurança)
- [ ] **4.12** Testar troca organizacional agência com dados pipeline
- [ ] **4.13** Testar uso concorrente organizacional pipeline múltiplas agências

#### **Critérios de Aceite B2B**

- ✅ Usuários agência podem acessar pipeline dentro contexto organizacional
- ✅ Usuários agência podem criar/editar leads básicos para sua organização
- ✅ Pipeline mostra apenas dados da agência (isolamento organization_id)
- ✅ Acesso cross-organization é prevenido (retorna 403/404)
- ✅ Sistema atual (60+ endpoints) continua funcionando normalmente
- ✅ Colaboração B2B: múltiplos usuários da mesma agência veem mesmos leads
- ✅ Permissões B2B funcionam (Admin pode tudo, Member pode CRUD leads)

#### **Validação Final**

- [ ] `npm run lint` passa sem erros
- [ ] `npm run typecheck` passa sem erros TypeScript
- [ ] `npm run test` (testes unitários) passam 100%
- [ ] `npm run test:e2e` (testes integração) passam 100%
- [ ] `npm run security` passa validação segurança
- [ ] Deploy Railway bem-sucedido sem downtime

---

### **STORY 2: Timeline Comunicação WhatsApp B2B (Vertical Slice)**

**Duração**: 5-6 dias  
**Como um** membro de agência digital  
**Eu quero** timeline de comunicação WhatsApp funcionando end-to-end  
**Para que** minha agência possa centralizar todas as comunicações com clientes e compartilhar histórico com a equipe

#### **MicroTasks B2B**

**🥇 FASE 1: DATABASE COMUNICAÇÕES B2B (Sequencial - 6-8 horas)**

- [ ] **1.1** Projetar schema `crm_communications` com FK organization_id + lead_id
- [ ] **1.2** Adicionar campos WhatsApp (phone, message_id, direction, status)
- [ ] **1.3** Criar migration + constraints organizacionais + relacionamentos
- [ ] **1.4** Implementar indexes para queries agência + timeline chronológica
- [ ] **1.5** Adicionar tabela configurações WhatsApp por agência
- [ ] **1.6** Testar schema com dados amostra múltiplas agências

**🥇 FASE 2: BACKEND COMUNICAÇÕES B2B (Sequencial após Fase 1 - 1.5-2 dias)**

- [ ] **2.1** Criar modelo SQLAlchemy CrmCommunication + relacionamentos
- [ ] **2.2** Implementar repository CommunicationsRepository filtro organizacional
- [ ] **2.3** Criar serviço CommunicationsService + lógica WhatsApp Business API
- [ ] **2.4** Implementar endpoints `/api/v1/crm/communications` + middleware org
- [ ] **2.5** Adicionar integração WhatsApp Business API (mock/sandbox)
- [ ] **2.6** Implementar webhook receiver WhatsApp + validação organizacional
- [ ] **2.7** Criar serviço parsing mensagens + attachments + context agência
- [ ] **2.8** Adicionar logging auditoria + error handling + rate limiting

**🥇 FASE 3: FRONTEND TIMELINE B2B (Sequencial após Fase 2 - 1.5-2 dias)**

- [ ] **3.1** Criar página timeline `/[locale]/admin/crm/communications`
- [ ] **3.2** Implementar componente TimelineView organization-aware
- [ ] **3.3** Adicionar filtros comunicação (WhatsApp, Email, Nota, por usuário agência)
- [ ] **3.4** Criar componente envio mensagem WhatsApp + validação contexto
- [ ] **3.5** Implementar real-time updates (WebSocket/SSE) colaboração agência
- [ ] **3.6** Adicionar indicadores status entrega + leitura WhatsApp
- [ ] **3.7** Criar interface configuração WhatsApp Business por agência
- [ ] **3.8** Polish UX timeline + responsive + acessibilidade + colaboração visual

**🥇 FASE 4: PIPELINE TESTES COMUNICAÇÃO B2B (Misto após Fase 3 - 6-8 horas)**

**TESTES UNITÁRIOS COMUNICAÇÃO B2B (Paralelo)**
- [ ] **4.1a** Testar modelo comunicação + filtro organizacional agência (Backend)
- [ ] **4.1b** Testar integração WhatsApp API + validação organizacional (Backend)
- [ ] **4.1c** Testar webhook parsing + contexto agência (Backend)
- [ ] **4.1d** Testar componentes timeline UI + contexto agência (Frontend)
- [ ] **4.1e** Testar real-time updates colaboração (Frontend)

**TESTES INTEGRAÇÃO COMUNICAÇÃO B2B (Sequencial)**
- [ ] **4.2** Testar fluxo completo envio/recebimento WhatsApp por agência
- [ ] **4.3** Testar isolamento comunicações entre agências diferentes
- [ ] **4.4** Testar colaboração real-time múltiplos usuários agência
- [ ] **4.5** Testar configuração WhatsApp Business por agência

**TESTES E2E COMUNICAÇÃO B2B (Sequencial)**
- [ ] **4.6** Testar jornada completa: configurar WhatsApp → enviar → receber → timeline
- [ ] **4.7** Testar isolamento comunicações sob carga múltiplas agências
- [ ] **4.8** Testar colaboração em tempo real equipe agência
- [ ] **4.9** Testar recuperação erro + webhook reliability

#### **Critérios de Aceite B2B**

- ✅ Agências podem configurar WhatsApp Business independentemente
- ✅ Timeline mostra apenas comunicações da agência (isolamento total)
- ✅ Envio/recebimento WhatsApp funciona com contexto organizacional
- ✅ Múltiplos usuários da agência veem timeline compartilhada
- ✅ Real-time updates funcionam para colaboração da equipe
- ✅ Webhooks processam mensagens apenas para agência correta
- ✅ Performance < 200ms para carregar timeline (até 1000 mensagens)

#### **Validação Final**

- [ ] Integração WhatsApp Business API funciona em sandbox
- [ ] Timeline carrega rapidamente com isolamento organizacional
- [ ] Colaboração real-time funciona entre membros da agência
- [ ] Testes segurança confirmam isolamento comunicações
- [ ] Deploy Railway + configuração webhooks produção

---

### **STORY 3: IA Resumos Conversas Português B2B (Vertical Slice)**

**Duração**: 4-5 dias  
**Como um** gestor de agência  
**Eu quero** resumos IA automáticos de conversas longas em português  
**Para que** minha agência possa ter insights rápidos das comunicações e compartilhar contexto com a equipe

#### **MicroTasks IA B2B**

**🥇 FASE 1: DATABASE IA RESUMOS B2B (Sequencial - 4-6 horas)**

- [ ] **1.1** Projetar schema `crm_ai_summaries` com FK organization_id + communication_thread
- [ ] **1.2** Adicionar campos IA (summary_text, sentiment, next_actions, urgency_score)
- [ ] **1.3** Criar migration + indexes organizacionais + relacionamentos comunicação
- [ ] **1.4** Implementar tabela configuração IA por agência (OpenAI API key, preferências)
- [ ] **1.5** Adicionar constraints organizacionais + auditoria IA usage
- [ ] **1.6** Testar schema com dados múltiplas agências + simulação resumos

**🥇 FASE 2: BACKEND IA SERVICE B2B (Sequencial após Fase 1 - 1.5-2 dias)**

- [ ] **2.1** Criar modelo SQLAlchemy AISummary + relacionamentos organizacionais
- [ ] **2.2** Implementar repository AISummaryRepository + filtro organizacional
- [ ] **2.3** Criar serviço AIService + integração OpenAI GPT-4 + context agência
- [ ] **2.4** Implementar prompt engineering português brasileiro + agências
- [ ] **2.5** Adicionar endpoints `/api/v1/crm/ai-summaries` + middleware organizacional
- [ ] **2.6** Criar serviço análise sentimento + next actions + urgency scoring
- [ ] **2.7** Implementar rate limiting IA por agência + cota management
- [ ] **2.8** Adicionar background jobs resumos automáticos + error handling

**🥇 FASE 3: FRONTEND IA RESUMOS B2B (Sequencial após Fase 2 - 1.5-2 dias)**

- [ ] **3.1** Criar componente AISummaryCard + integração timeline
- [ ] **3.2** Implementar botão "Gerar Resumo IA" + loading states
- [ ] **3.3** Adicionar página configurações IA `/[locale]/admin/crm/ia-config`
- [ ] **3.4** Criar visualização insights IA (sentiment, urgência, próximas ações)
- [ ] **3.5** Implementar resumos automáticos + notificações colaboração agência
- [ ] **3.6** Adicionar sharing resumos IA com equipe + comentários colaborativos
- [ ] **3.7** Criar dashboard insights IA por agência + métricas usage
- [ ] **3.8** Polish UX IA + feedback visual + educação sobre valor IA

**🥇 FASE 4: PIPELINE TESTES IA B2B (Misto após Fase 3 - 6-8 horas)**

**TESTES UNITÁRIOS IA B2B (Paralelo)**
- [ ] **4.1a** Testar modelos IA + filtro organizacional agência (Backend)
- [ ] **4.1b** Testar integração OpenAI + prompt português + context agência (Backend)
- [ ] **4.1c** Testar análise sentimento + next actions + organizacional (Backend)
- [ ] **4.1d** Testar componentes UI resumos + contexto agência (Frontend)
- [ ] **4.1e** Testar sharing colaborativo resumos agência (Frontend)

**TESTES INTEGRAÇÃO IA B2B (Sequencial)**
- [ ] **4.2** Testar fluxo completo geração resumo IA por agência
- [ ] **4.3** Testar isolamento resumos IA entre agências diferentes
- [ ] **4.4** Testar rate limiting + cota management por agência
- [ ] **4.5** Testar colaboração resumos IA equipe agência

**TESTES E2E IA B2B (Sequencial)**
- [ ] **4.6** Testar jornada: conversa longa → resumo automático → insights → sharing
- [ ] **4.7** Testar resumos IA português brasileiro + contexto agências
- [ ] **4.8** Testar configuração IA + cota usage + billing por agência
- [ ] **4.9** Testar performance IA + background jobs + error recovery

#### **Critérios de Aceite B2B**

- ✅ IA gera resumos precisos em português brasileiro
- ✅ Resumos são isolados por agência (zero cross-organization)
- ✅ Análise sentimento + próximas ações funciona contexto agências
- ✅ Equipe da agência pode ver/comentar resumos colaborativamente
- ✅ Rate limiting + cota management por agência funciona
- ✅ Resumos automáticos disparam para conversas longas (>10 mensagens)
- ✅ Performance IA < 10s para gerar resumo + insights

#### **Validação Final**

- [ ] Integração OpenAI funciona com prompts português brasileiro
- [ ] Resumos IA são precisos e úteis para contexto agências
- [ ] Isolamento organizacional resumos IA 100% efetivo
- [ ] Colaboração resumos IA funciona entre equipe agência
- [ ] Cota management + billing IA por agência operacional

---

### **STORY 4: Feature Gating Assinatura B2B (Vertical Slice)**

**Duração**: 4-5 dias  
**Como um** owner de agência  
**Eu quero** funcionalidades CRM baseadas em tier assinatura da agência  
**Para que** minha agência obtenha acesso apropriado conforme plano contratado e possa fazer upgrade quando necessário

#### **MicroTasks Feature Gating B2B**

**🥇 FASE 1: DATABASE ASSINATURA B2B (Sequencial - 4-6 horas)**

- [ ] **1.1** Estender tabela organizations com subscription_tier + billing_info
- [ ] **1.2** Criar tabela usage_tracking com organization_id + feature metrics
- [ ] **1.3** Adicionar tabela subscription_limits + tiers B2B (Starter/Professional/Enterprise)
- [ ] **1.4** Implementar constraints cota por agência + feature flags
- [ ] **1.5** Criar indexes billing + usage queries organizacionais
- [ ] **1.6** Testar schema subscription múltiplas agências diferentes tiers

**🥇 FASE 2: BACKEND SUBSCRIPTION B2B (Sequencial após Fase 1 - 1.5-2 dias)**

- [ ] **2.1** Implementar serviço SubscriptionService + lógica tier B2B agências
- [ ] **2.2** Criar feature gating middleware + validação tier organizacional
- [ ] **2.3** Adicionar endpoints `/api/v1/billing/subscription` + context agência
- [ ] **2.4** Implementar usage tracking automático por feature + agência
- [ ] **2.5** Criar serviço upgrade flow + integração Stripe organizacional
- [ ] **2.6** Adicionar validação limits: leads, users, WhatsApp messages, IA summaries
- [ ] **2.7** Implementar billing webhooks + subscription status sync
- [ ] **2.8** Criar admin endpoints subscription management + auditoria

**🥇 FASE 3: FRONTEND FEATURE GATING B2B (Sequencial após Fase 2 - 1.5-2 dias)**

- [ ] **3.1** Criar componente FeatureGate + integração contexto organizacional
- [ ] **3.2** Implementar page billing `/[locale]/admin/billing` owner-only
- [ ] **3.3** Adicionar indicadores UI tier atual agência + usage meters
- [ ] **3.4** Criar modals upgrade + comparação tiers B2B agências
- [ ] **3.5** Implementar prompts upgrade contextualizados por feature
- [ ] **3.6** Adicionar notifications limites atingidos + owner alerts
- [ ] **3.7** Criar interface billing management + payment methods agência
- [ ] **3.8** Polish UX upgrade flow + educação valor tiers superiores

**🥇 FASE 4: PIPELINE TESTES BILLING B2B (Misto após Fase 3 - 6-8 horas)**

**TESTES UNITÁRIOS BILLING B2B (Paralelo)**
- [ ] **4.1a** Testar lógica subscription + feature gating por agência (Backend)
- [ ] **4.1b** Testar usage tracking + limits enforcement organizacional (Backend)
- [ ] **4.1c** Testar upgrade flow + billing webhooks por agência (Backend)
- [ ] **4.1d** Testar componentes FeatureGate + contexto agência (Frontend)
- [ ] **4.1e** Testar UI billing management + owner permissions (Frontend)

**TESTES INTEGRAÇÃO BILLING B2B (Sequencial)**
- [ ] **4.2** Testar enforcement tiers subscription por agência
- [ ] **4.3** Testar usage tracking + limits diferentes agências
- [ ] **4.4** Testar upgrade flow completo Stripe + agência
- [ ] **4.5** Testar billing webhooks + subscription sync organizacional

**TESTES E2E BILLING B2B (Sequencial)**
- [ ] **4.6** Testar jornada: limit reached → upgrade prompt → payment → access
- [ ] **4.7** Testar feature gating cross-features (Pipeline, WhatsApp, IA)
- [ ] **4.8** Testar billing management owner + member restrictions
- [ ] **4.9** Testar subscription downgrade + data retention agência

#### **Critérios de Aceite B2B**

- ✅ Feature gating funciona por tier subscription agência
- ✅ Usage tracking preciso por agência + feature
- ✅ Upgrade flow funciona para organizações (owner authorization)
- ✅ Limits enforcement: leads, users, mensagens, IA summaries por agência
- ✅ Billing management acessível apenas para owners agência
- ✅ Subscription changes aplicam imediatamente para toda agência
- ✅ Members veem features disponíveis conforme tier da agência

#### **Validação Final**

- [ ] Feature gating enforcement funciona 100% precisão
- [ ] Usage tracking billing preciso por agência
- [ ] Upgrade flow Stripe funciona organizações B2B
- [ ] Permissions billing (owner-only) funcionam corretamente
- [ ] Subscription sync + webhooks operacionais produção

## **DEPENDÊNCIAS STORY E INTEGRAÇÃO B2B**

### **Dependências Story B2B (Ordem Execução)**
```
STORY 1 (Pipeline B2B) → STORY 2 (Timeline B2B) → STORY 3 (IA B2B) → STORY 4 (Billing B2B)
↓                       ↓                      ↓                   ↓
Schema CRM              Comunicações           Resumos IA          Feature Gating
Pipeline Kanban         WhatsApp Integration   OpenAI GPT-4        Subscription Tiers
Colaboração Agência     Timeline Colaborativo  Português BR        Billing B2B
```

### **Pontos Integração Sistema B2B (Preservados)**
- **Autenticação B2B**: ✅ Stories usam JWT existente + claims organizacionais agência
- **Contexto Organizacional B2B**: ✅ Stories usam api/core/organization_middleware.py + agência context
- **Database B2B**: ✅ Stories estendem PostgreSQL existente + padrões organizacionais
- **Frontend B2B**: ✅ Stories integram Next.js 14 + shadcn/ui + organization-aware components
- **API B2B**: ✅ Stories estendem FastAPI existente + dependências organizacionais

### **Dependências Cross-Story B2B**
- **STORY 1 → STORY 2**: Pipeline leads requerido para associar comunicações
- **STORY 2 → STORY 3**: Timeline comunicação requerida para gerar resumos IA
- **STORY 3 → STORY 4**: Funcionalidades IA requerem feature gating subscription
- **TODAS STORIES**: Middleware organizacional B2B requerido para isolamento agências

## **AVALIAÇÃO RISCO VERTICAL SLICE B2B**

### **Gerenciamento Risco Nível Story B2B**

#### **Riscos STORY 1: Pipeline Kanban B2B**
- **Risco**: Colaboração real-time conflitos múltiplos usuários agência
- **Mitigação**: Optimistic locking + conflict resolution + event sourcing
- **Contingência**: Fallback polling + manual refresh + conflict alerts
- **Impacto Timeline**: +1 dia desenvolvimento colaboração

#### **Riscos STORY 2: WhatsApp Timeline B2B**
- **Risco**: WhatsApp Business API rate limits + webhook reliability
- **Mitigação**: Rate limiting graceful + webhook retry logic + fallback polling
- **Contingência**: Mock WhatsApp para desenvolvimento + sandbox produção
- **Impacto Timeline**: +2 dias integração WhatsApp + webhook reliability

#### **Riscos STORY 3: IA Resumos B2B**
- **Risco**: OpenAI API costs + latency + context português brasileiro
- **Mitigação**: Cota management rigoroso + caching + prompt optimization
- **Contingência**: IA simplificada MVP + upgrade post-launch advanced IA
- **Impacto Timeline**: +1 dia otimização prompts português

#### **Riscos STORY 4: Billing B2B**
- **Risco**: Stripe B2B complexity + tax compliance brasileiro + multi-user billing
- **Mitigação**: Stripe Billing existing patterns + tax handling via Stripe Tax
- **Contingência**: Billing simplificado MVP + advanced billing post-launch
- **Impacto Timeline**: +1 dia integração Stripe B2B

## **PLANEJAMENTO RECURSO VERTICAL SLICE B2B**

### **Alocação Recurso Por Story B2B**

**STORY 1 - Pipeline B2B (3-4 dias)**
- **Dev Backend**: 2 dias (CRM models + colaboração + org filtering)
- **Dev Frontend**: 1.5 dias (Kanban UI + real-time + colaboração visual)
- **QA/Testes**: 0.5 dia (testes colaboração + isolamento organizacional)

**STORY 2 - WhatsApp B2B (5-6 dias)**
- **Dev Backend**: 3 dias (WhatsApp API + webhooks + timeline + org isolation)
- **Dev Frontend**: 2 dias (Timeline UI + real-time + sharing colaborativo)
- **QA/Testes**: 1 dia (testes integração WhatsApp + colaboração)

**STORY 3 - IA B2B (4-5 dias)**
- **Dev Backend**: 2.5 dias (OpenAI + prompts português + cota + org context)
- **Dev Frontend**: 1.5 dias (IA UI + insights + sharing colaborativo)
- **QA/Testes**: 1 dia (testes IA + português + colaboração)

**STORY 4 - Billing B2B (4-5 dias)**
- **Dev Backend**: 2.5 dias (Stripe B2B + feature gating + usage tracking org)
- **Dev Frontend**: 1.5 dias (Billing UI + owner permissions + upgrade flow)
- **QA/Testes**: 1 dia (testes billing B2B + permissions + subscription)

### **Critérios Sucesso Por Story B2B**

#### **Métricas Sucesso STORY 1 - Pipeline B2B**
- ✅ Pipeline Kanban funciona colaborativamente para agências
- ✅ Isolamento organizacional 100% entre agências
- ✅ Real-time collaboration múltiplos usuários agência
- ✅ Tempo resposta < 200ms operações pipeline

#### **Métricas Sucesso STORY 2 - WhatsApp B2B**
- ✅ WhatsApp Business API integração funciona por agência
- ✅ Timeline compartilhada agência funciona colaborativamente
- ✅ Isolamento comunicações 100% entre agências
- ✅ Real-time updates colaboração < 500ms

#### **Métricas Sucesso STORY 3 - IA B2B**
- ✅ Resumos IA português brasileiro precisos para agências
- ✅ Sharing colaborativo resumos funciona equipe agência
- ✅ Isolamento resumos IA 100% entre agências
- ✅ Performance IA < 10s geração resumo

#### **Métricas Sucesso STORY 4 - Billing B2B**
- ✅ Feature gating funciona precisão tier subscription agência
- ✅ Billing B2B owner-only permissions funcionam
- ✅ Usage tracking preciso por agência + feature
- ✅ Upgrade flow organizacional funciona Stripe B2B

## **PIPELINE ENTREGA VERTICAL SLICE B2B**

### **Processo Entrega Por Story B2B**
```
Desenvolvimento Story B2B → MicroTask → Testes Unit → Testes Integration → Testes E2E B2B → Testes Colaboração → Critérios Aceite B2B → Lint/Security → Demo Story → Próxima Story
```

### **Definition of Done B2B (Por Story)**
- [ ] Todas MicroTasks completadas (Frontend + Backend + Database + B2B context)
- [ ] Testes unitários passam >90% cobertura componentes story
- [ ] Testes integração validam isolamento organizacional agências
- [ ] **Testes colaboração B2B validam múltiplos usuários agência**
- [ ] Testes E2E confirmam jornada completa B2B funciona
- [ ] Todos Critérios Aceite B2B validados e aceitos
- [ ] Validação lint, typecheck, segurança passa
- [ ] **Story demonstra colaboração B2B valor end-to-end**
- [ ] Deploy Railway sem impacto sistema + agências existentes

### **Pipeline Validação B2B (Por Story)**
1. **Desenvolvimento B2B**: MicroTasks com contexto organizacional sequencial
2. **Testes Unitários B2B**: Componente isolado + validação organizacional agência
3. **Testes Integração B2B**: API + banco + contexto organizacional + colaboração
4. **Testes E2E B2B**: Fluxos completos + prevenção cross-organization + colaboração agência
5. **Testes Colaboração**: Multiple users same agência + real-time + sharing
6. **Testes Aceite B2B**: Validação critérios aceite agências
7. **Validação Técnica**: Lint + typecheck + segurança + performance colaboração
8. **Validação Deploy**: Railway + testes rollback + agências continuam funcionando
9. **Revisão Story B2B**: Confirmação valor colaborativo + planejamento próxima story

---

## **CHECKLIST IMPLEMENTAÇÃO VERTICAL SLICE B2B**

### **Preparação Épico B2B**
- [ ] Épico definido com valor negócio claro agências digitais
- [ ] Critérios aceite épico B2B estabelecidos
- [ ] Value stream mapeado para agências brasileiras
- [ ] Estratégia isolamento organizacional B2B definida

### **Story 1: Pipeline Kanban B2B (3-4 dias)**
- [ ] Schema CRM leads + FK organization_id agência
- [ ] API pipeline + middleware organizacional + colaboração
- [ ] Kanban UI + contexto organizacional + real-time collaboration
- [ ] Testes B2B + colaboração + isolamento organizacional
- [ ] Critérios aceite B2B validados
- [ ] Deploy + validação colaboração agência

### **Story 2: WhatsApp Timeline B2B (5-6 dias)**
- [ ] Schema comunicações + WhatsApp + FK organization_id
- [ ] WhatsApp Business API + webhooks + timeline organizacional
- [ ] Timeline UI + real-time + sharing colaborativo agência
- [ ] Testes WhatsApp + colaboração + isolamento organizacional
- [ ] Critérios aceite B2B validados
- [ ] Deploy + WhatsApp produção configurado

### **Story 3: IA Resumos B2B (4-5 dias)**
- [ ] Schema IA summaries + OpenAI + FK organization_id
- [ ] IA service + português brasileiro + contexto agência
- [ ] IA UI + insights + sharing colaborativo
- [ ] Testes IA + português + colaboração organizacional
- [ ] Critérios aceite B2B validados
- [ ] Deploy + OpenAI produção operacional

### **Story 4: Billing B2B (4-5 dias)**
- [ ] Schema subscription + tiers B2B + feature gating
- [ ] Stripe B2B + usage tracking + owner permissions
- [ ] Billing UI + upgrade flow + owner-only features
- [ ] Testes billing + B2B + permissions organizacionais
- [ ] Critérios aceite B2B validados
- [ ] Deploy + Stripe B2B produção configurado

### **Conclusão Épico B2B**
- [ ] Todas 4 stories B2B entregues valor colaborativo
- [ ] Critérios aceite épico B2B validados
- [ ] CRM funciona end-to-end isolamento organizacional agências
- [ ] Colaboração B2B funciona múltiplos usuários por agência
- [ ] Metas performance B2B atingidas
- [ ] Deploy produção + monitoramento agências operacional

---

**LOVED CRM ROADMAP VERTICAL SLICE B2B - ORGANIZATION-SCOPED AGÊNCIAS + ENTREGA ORIENTADA A VALOR COLABORATIVO**

## **FERRAMENTAS E VALIDAÇÕES B2B**

### **CHECKLIST PRÉ-ENTREGA OBRIGATÓRIO B2B:**

- [ ] **🚨 PREREQUISITOS INCLUÍDOS**: Seção prerequisitos obrigatórios incluída
- [ ] **Definição épico B2B clara**: Épico CRM agências valor colaborativo end-to-end
- [ ] **User Stories verticais B2B**: 4 stories colaborativas (Pipeline → WhatsApp → IA → Billing)
- [ ] **MicroTasks B2B decompostas**: Tasks organizacionais + colaboração + isolamento
- [ ] **🥇 ORDEM EXECUÇÃO B2B**: Ordem numerada + contexto organizacional agência
- [ ] **Testes abrangentes B2B**: Unit + Integration + E2E + Colaboração por story
- [ ] **Critérios aceite B2B definidos**: DoD + colaboração + isolamento organizacional
- [ ] **Pipeline validação B2B**: Lint + security + colaboração + deploy
- [ ] **Isolamento organizacional B2B garantido**: Zero cross-organization agências
- [ ] **Colaboração B2B validada**: Múltiplos usuários por agência funcionando

### **RED FLAGS CRÍTICOS B2B (PARAR IMEDIATAMENTE):**

- **🚨 Prerequisitos ausentes**: Roadmap sem seção prerequisitos obrigatórios
- **🥇 Ordem execução ausente**: MicroTasks B2B sem ordem numerada clara
- **Stories não-colaborativas**: Stories que não suportam múltiplos usuários agência
- **Isolamento inadequado**: Stories sem isolamento organizacional agências
- **Valor não-colaborativo**: Stories sem valor colaborativo B2B
- **Contexto organizacional ausente**: Stories sem contexto agência
- **Permissões B2B ausentes**: Stories sem owner/member permissions

### **QUALITY GATES OBRIGATÓRIOS B2B:**

- **🚨 PREREQUISITOS B2B**: Seção prerequisitos + agente dependencies incluída
- **🥇 ORDEM EXECUÇÃO B2B**: MicroTasks ordem + contexto organizacional
- **VERTICAL SLICE B2B**: 100% stories colaborativas end-to-end
- **VALOR COLABORATIVO**: Stories entregam valor equipe agência
- **ISOLAMENTO ORGANIZACIONAL B2B**: Zero cross-organization agências
- **COLABORAÇÃO VALIDADA**: Múltiplos usuários agência testados
- **PERMISSÕES B2B**: Owner/Member permissions funcionando
- **BILLING B2B**: Subscription organizational + upgrade flow

## **RESULTADO ESPERADO B2B**

Ao final deste agente, teremos:

- **🚨 Prerequisitos B2B obrigatórios** incluídos roadmap especializado agências
- **Roadmap Vertical Slice B2B** completo para agências digitais brasileiras
- **Épico CRM B2B** definido valor colaborativo agências + critérios aceite
- **4 User Stories B2B verticais** colaborativas (Pipeline → WhatsApp → IA → Billing)
- **🥇 MicroTasks B2B ordem numerada** clara organizacional-específica
- **Critérios aceite B2B** colaboração + isolamento organizacional agências
- **Pipeline validação B2B** (Unit + Integration + E2E + Collaboration + Deploy)
- **Isolamento organizacional B2B** garantido todas stories agências
- **Planejamento B2B recurso** realista + dependências + timeline agências

**Base sólida B2B para Documentation Curator consolidar roadmap Ágil Agências.**

**File Location**: `/home/paulo/Projetos/desafio/lovedcrm/docs/project/11-roadmap.md`

Este roadmap Vertical Slice B2B pode ser implementado diretamente mantendo 100% compatibilidade arquitetura existente organization-centric para agências digitais brasileiras.