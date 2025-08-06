# 11-roadmap-story-1.md - Pipeline Kanban B2B Roadmap Vertical Slice

## **MODELO DETECTADO: B2B**

**Modelo confirmado**: B2B conforme 02-prd.md, 10-user-journeys.md, 11-roadmap.md  
**Justificativa**: Sistema para agências digitais brasileiras (5-20 colaboradores) com organizações compartilhadas, colaboração em equipe e contexto organizacional proeminente  
**Roadmap adaptado**: Organization-scoped para B2B Pipeline Kanban (organizações compartilhadas + workflows colaborativos + milestones focados em equipe + contexto organizacional em todas as implementações)

## 🚨 **PRE-ROADMAP: PREPARAÇÃO 100% DO AMBIENTE**

**⚠️ CRÍTICO: Todo o PRE-ROADMAP DEVE estar 100% completo antes de iniciar qualquer Story do roadmap.**

> **REFERÊNCIA COMPLETA**: Consultar `@docs/project/11-roadmap.md` seções **FASE 1** até **FASE 6** do PRE-ROADMAP para preparação completa do ambiente (Database + Design Tokens + Landing Page + UX/UI + Configuração Projeto + Validação Final).

**🎯 CRITÉRIOS SUCESSO PRE-ROADMAP OBRIGATÓRIOS:**
- ✅ **ALL tabelas** agente 04 criadas e operacionais
- ✅ **Design tokens + Landing page** implementados  
- ✅ **ALL componentes UX** agente 09 implementados
- ✅ **Projeto renomeado** com identidade final
- ✅ **`make ci` passing** (100% lint + typecheck + security + tests)
- ✅ **Isolamento organizacional** 100% efetivo
- ✅ **60+ endpoints** existentes preservados e funcionando

---

## **ROADMAP PIPELINE KANBAN B2B - USER STORY SPLITTING**

**Épico**: Pipeline Kanban Para Agências Digitais Brasileiras - Implementação Incremental  
**Metodologia**: User Story Splitting + Arquitetura Vertical Slice B2B  
**Plataforma**: Railway + Next.js 14 + FastAPI + PostgreSQL (preservando sistema atual)  
**Isolamento Organizacional**: Organization_id B2B em todas as sub-stories  
**Entrega Valor**: Cada sub-story entrega funcionalidade end-to-end utilizável incremental para agências colaborativas

## **DEFINIÇÃO ÉPICO**

### **Épico**: Pipeline Kanban B2B - Implementação Incremental

**Como um** gestor/membro de agência digital brasileira  
**Eu quero** pipeline Kanban completo funcionando com colaboração em tempo real  
**Para que** minha agência possa visualizar, gerenciar e colaborar no pipeline de leads de forma eficiente mantendo isolamento organizacional total

### **Critérios Aceite Épico B2B**

- ✅ Pipeline Kanban funciona end-to-end para organizações/agências
- ✅ Isolamento organizacional 100% garantido (zero acesso cross-organization)  
- ✅ Sistema atual preservado (60+ endpoints funcionando)
- ✅ Colaboração real-time funciona múltiplos usuários por agência
- ✅ Performance < 200ms para operações pipeline com carga colaborativa B2B
- ✅ Pipeline integra com sistema CRM existente perfeitamente

### **Value Stream Épico B2B**

- **Valor Negócio**: Pipeline visual aumenta conversão leads 25-40% + reduz tempo gestão pipeline 70%
- **Valor Usuário**: Agências têm visibilidade completa pipeline + colaboração real-time + gestão eficiente
- **Valor Técnico**: Base sólida CRM + padrões colaboração B2B + escalabilidade organizacional

## **USER STORIES SPLITADAS (VERTICAL SLICES B2B)**

### **STORY 1.1: Pipeline Visualization B2B (Vertical Slice)**

**Duração**: 1-2 dias

**Como um** membro de agência digital  
**Eu quero** visualizar leads existentes em formato Kanban com 5 estágios  
**Para que** eu possa ter visão visual do pipeline da agência e leads em cada estágio

#### **MicroTasks (ORDEM DE EXECUÇÃO OBRIGATÓRIA B2B)**

**🥇 FASE 1: FUNDAÇÃO DATABASE B2B (Sequencial - 2-3 horas)**

- [ ] **1.1** Projetar schema tabela `crm_leads` com FK organization_id (agência)
- [ ] **1.2** Criar arquivo migration banco dados para tabela leads
- [ ] **1.3** Aplicar migration ao banco desenvolvimento + verificar schema
- [ ] **1.4** Adicionar constraints chave estrangeira para isolamento organizacional agências
- [ ] **1.5** Criar indexes banco dados para queries organization_id + visualização
- [ ] **1.6** Inserir dados amostra múltiplas agências para visualização

**🥇 FASE 2: API BACKEND B2B (Sequencial após Fase 1 - 4-5 horas)**

- [ ] **2.1** Criar modelo SQLAlchemy CrmLead com FK organization_id
- [ ] **2.2** Implementar repository LeadsRepository com filtro organizacional GET apenas
- [ ] **2.3** Criar serviço LeadsService com lógica visualização organizacional B2B
- [ ] **2.4** Adicionar schemas Pydantic LeadResponse (apenas read)
- [ ] **2.5** Implementar endpoint GET `/api/v1/crm/leads` com api/core/organization_middleware.py
- [ ] **2.6** Adicionar tratamento erro API + validação organizacional + logs auditoria
- [ ] **2.7** Testar API manualmente com Postman + contexto organizacional múltiplas agências
- [ ] **2.8** Atualizar documentação OpenAPI para endpoint GET leads

**🥇 FASE 3: UI FRONTEND B2B (Sequencial após Fase 2 - 3-4 horas)**

- [ ] **3.1** Criar estrutura básica página pipeline `/[locale]/admin/crm/pipeline`
- [ ] **3.2** Adicionar item menu navegação "Pipeline CRM" (com contexto agência)
- [ ] **3.3** Implementar componente Kanban read-only com 5 colunas (Lead→Contato→Proposta→Negociação→Fechado)
- [ ] **3.4** Integrar hooks/use-org-context.ts + validação contexto agência
- [ ] **3.5** Conectar frontend à API backend + tratamento erro + loading states
- [ ] **3.6** Adicionar validação contexto organizacional + permissões B2B (Admin/Member)
- [ ] **3.7** Implementar visualização estática leads + indicadores contagem por estágio
- [ ] **3.8** Polish UI/UX + design responsivo + indicadores contexto agência

**🥇 FASE 4: PIPELINE TESTES B2B (Misto Sequencial/Paralelo após Fase 3 - 2-3 horas)**

**TESTES UNITÁRIOS B2B (Paralelo - podem executar simultaneamente)**

- [ ] **4.1a** Testar modelo CrmLead com organization_id agência (Backend)
- [ ] **4.1b** Testar filtro organizacional repository leads GET por agência (Backend)
- [ ] **4.1c** Testar lógica visualização organizacional serviço leads B2B (Backend)
- [ ] **4.2a** Testar renderização componente Kanban read-only (Frontend - Paralelo com 4.1x)
- [ ] **4.2b** Testar integração contexto organizacional agência visualização (Frontend - Paralelo com 4.1x)
- [ ] **4.2c** Testar validação permissões B2B + tratamento erro visualização (Frontend - Paralelo com 4.1x)

**TESTES INTEGRAÇÃO B2B (Sequencial após Testes Unitários)**

- [ ] **4.3** Testar API GET leads com contexto organizacional agência válida
- [ ] **4.4** Testar API GET leads rejeita acesso organização/agência inválida
- [ ] **4.5** Testar queries banco leads filtram por agência corretamente
- [ ] **4.6** Testar integração frontend + backend visualização pipeline end-to-end agência

**TESTES E2E B2B (Sequencial após Testes Integração)**

- [ ] **4.7** Testar fluxo completo visualização pipeline para agência (Admin + Member)
- [ ] **4.8** Testar isolamento visualização pipeline entre diferentes agências
- [ ] **4.9** Testar troca organizacional com visualização pipeline
- [ ] **4.10** Testar performance visualização com muitos leads por agência

#### **Critérios de Aceite B2B**

- ✅ Usuários agência podem visualizar pipeline Kanban no contexto organizacional
- ✅ Pipeline mostra apenas leads da agência (isolamento organization_id)
- ✅ Visualização funciona para Admin e Member da agência
- ✅ Contadores de leads por estágio corretos e isolados por agência
- ✅ Performance < 200ms para carregar pipeline (até 100 leads)
- ✅ Acesso cross-organization é prevenido (retorna 403/404)
- ✅ Sistema atual (60+ endpoints) continua funcionando normalmente

#### **Validação Final**

- [ ] `npm run lint` passa sem erros
- [ ] `npm run typecheck` passa sem erros TypeScript
- [ ] `npm run test` (testes unitários) passam 100%
- [ ] `npm run test:e2e` (testes integração) passam 100%
- [ ] `npm run security` passa validação segurança
- [ ] Deploy Railway bem-sucedido sem downtime

---

### **STORY 1.2: Lead Creation B2B (Vertical Slice)**

**Duração**: 1 dia  
**Como um** membro de agência digital  
**Eu quero** criar novos leads no pipeline da agência  
**Para que** eu possa adicionar prospects e oportunidades ao pipeline colaborativo da equipe

#### **MicroTasks B2B**

**🥇 FASE 1: EXTENSÃO DATABASE B2B (Sequencial - 1-2 horas)**

- [ ] **1.1** Adicionar campos obrigatórios tabela crm_leads (name, company, email, phone, value)
- [ ] **1.2** Criar migration para novos campos + constraints validação
- [ ] **1.3** Aplicar migration + verificar schema estendido
- [ ] **1.4** Adicionar indexes para busca leads por agência + criação
- [ ] **1.5** Testar inserção leads com dados amostra múltiplas agências

**🥇 FASE 2: API CRIAÇÃO BACKEND B2B (Sequencial após Fase 1 - 3-4 horas)**

- [ ] **2.1** Estender modelo SQLAlchemy CrmLead com campos obrigatórios
- [ ] **2.2** Implementar repository LeadsRepository método create com filtro organizacional
- [ ] **2.3** Estender serviço LeadsService com lógica criação organizacional B2B
- [ ] **2.4** Adicionar schemas Pydantic LeadRequest para criação
- [ ] **2.5** Implementar endpoint POST `/api/v1/crm/leads` com middleware organizacional
- [ ] **2.6** Adicionar validação campos obrigatórios + sanitização
- [ ] **2.7** Testar API POST manualmente + contexto organizacional
- [ ] **2.8** Atualizar documentação OpenAPI endpoint POST leads

**🥇 FASE 3: UI CRIAÇÃO FRONTEND B2B (Sequencial após Fase 2 - 2-3 horas)**

- [ ] **3.1** Adicionar botão "Criar Lead" no estágio Lead do Kanban
- [ ] **3.2** Implementar modal/formulário criação lead organization-aware
- [ ] **3.3** Adicionar campos obrigatórios (nome, empresa, contato, valor)
- [ ] **3.4** Integrar formulário com API POST + tratamento erro
- [ ] **3.5** Implementar feedback criação + refresh automático pipeline
- [ ] **3.6** Adicionar validações frontend + UX criação
- [ ] **3.7** Testar fluxo criação completo + contexto agência
- [ ] **3.8** Polish UX formulário + responsividade + acessibilidade

**🥇 FASE 4: PIPELINE TESTES CRIAÇÃO B2B (Misto após Fase 3 - 1-2 horas)**

**TESTES UNITÁRIOS CRIAÇÃO B2B (Paralelo)**
- [ ] **4.1a** Testar criação modelo lead + validação organizacional (Backend)
- [ ] **4.1b** Testar repository create + isolamento organizacional (Backend)
- [ ] **4.1c** Testar serviço criação + validação campos (Backend)
- [ ] **4.1d** Testar formulário criação UI + validações (Frontend)

**TESTES INTEGRAÇÃO CRIAÇÃO B2B (Sequencial)**
- [ ] **4.2** Testar API POST leads com contexto organizacional válido
- [ ] **4.3** Testar criação lead isolamento entre agências
- [ ] **4.4** Testar validações API + error handling
- [ ] **4.5** Testar fluxo completo criação frontend → backend

**TESTES E2E CRIAÇÃO B2B (Sequencial)**
- [ ] **4.6** Testar jornada: abrir modal → preencher → criar → ver pipeline atualizado
- [ ] **4.7** Testar criação lead com contexto organizacional correto
- [ ] **4.8** Testar validações formulário + mensagens erro
- [ ] **4.9** Testar performance criação + refresh pipeline

#### **Critérios de Aceite B2B**

- ✅ Usuários agência podem criar leads no contexto organizacional
- ✅ Leads criados aparecem no pipeline da agência imediatamente
- ✅ Formulário criação valida campos obrigatórios
- ✅ Leads criados são isolados por organization_id
- ✅ Performance criação < 500ms + refresh pipeline
- ✅ Validações funcionam frontend + backend
- ✅ UX criação intuitiva e responsiva

#### **Validação Final**

- [ ] API POST leads funciona isolamento organizacional
- [ ] Formulário criação UX intuitivo + validações
- [ ] Testes unitários + integração passam
- [ ] Pipeline atualiza automaticamente após criação
- [ ] Deploy sem impacto sistema atual

---

### **STORY 1.3: Lead Stage Movement B2B (Vertical Slice)**

**Duração**: 1-2 dias  
**Como um** membro de agência digital  
**Eu quero** mover leads entre estágios do pipeline usando drag & drop  
**Para que** eu possa gerenciar progressão dos leads e colaborar com equipe da agência

#### **MicroTasks B2B**

**🥇 FASE 1: DATABASE MOVEMENT B2B (Sequencial - 1-2 horas)**

- [ ] **1.1** Adicionar campo pipeline_stage tabela crm_leads + constraints
- [ ] **1.2** Adicionar campos auditoria (updated_by, updated_at) para colaboração
- [ ] **1.3** Criar migration + aplicar + verificar schema
- [ ] **1.4** Adicionar indexes para queries movimento + histórico
- [ ] **1.5** Testar movimento estágios dados amostra múltiplas agências

**🥇 FASE 2: API MOVIMENTO BACKEND B2B (Sequencial após Fase 1 - 4-5 horas)**

- [ ] **2.1** Estender modelo CrmLead com pipeline_stage + auditoria
- [ ] **2.2** Implementar repository método update_stage com filtro organizacional
- [ ] **2.3** Criar serviço movement com lógica estágios + validação B2B
- [ ] **2.4** Adicionar schemas Pydantic LeadMoveRequest
- [ ] **2.5** Implementar endpoint PUT `/api/v1/crm/leads/{id}/stage` + middleware
- [ ] **2.6** Adicionar validação estágios permitidos + transições
- [ ] **2.7** Implementar logging movimento para colaboração
- [ ] **2.8** Testar API movimento + contexto organizacional

**🥇 FASE 3: UI DRAG & DROP FRONTEND B2B (Sequencial após Fase 2 - 4-6 horas)**

- [ ] **3.1** Implementar biblioteca drag & drop (react-beautiful-dnd)
- [ ] **3.2** Adicionar drag handlers nos cards de leads
- [ ] **3.3** Implementar drop zones nas colunas Kanban
- [ ] **3.4** Integrar movimento com API PUT + contexto organizacional
- [ ] **3.5** Adicionar feedback visual movimento + loading states
- [ ] **3.6** Implementar otimistic updates + rollback em caso erro
- [ ] **3.7** Adicionar indicadores usuário que fez movimento (colaboração)
- [ ] **3.8** Polish UX drag & drop + animações + touch support

**🥇 FASE 4: PIPELINE TESTES MOVIMENTO B2B (Misto após Fase 3 - 2-3 horas)**

**TESTES UNITÁRIOS MOVIMENTO B2B (Paralelo)**
- [ ] **4.1a** Testar modelo stage + validações + auditoria (Backend)
- [ ] **4.1b** Testar repository update_stage + isolamento (Backend)
- [ ] **4.1c** Testar serviço movimento + transições válidas (Backend)
- [ ] **4.1d** Testar drag & drop UI + validações (Frontend)

**TESTES INTEGRAÇÃO MOVIMENTO B2B (Sequencial)**
- [ ] **4.2** Testar API PUT movimento com contexto organizacional
- [ ] **4.3** Testar movimento isolamento entre agências
- [ ] **4.4** Testar validações transições estágios
- [ ] **4.5** Testar otimistic updates + error handling

**TESTES E2E MOVIMENTO B2B (Sequencial)**
- [ ] **4.6** Testar jornada: drag lead → drop → ver movimento confirmado
- [ ] **4.7** Testar movimento colaborativo múltiplos usuários agência
- [ ] **4.8** Testar validações movimento + error feedback
- [ ] **4.9** Testar performance movimento + pipeline refresh

#### **Critérios de Aceite B2B**

- ✅ Drag & drop funciona fluido entre todos os estágios
- ✅ Movimento leads isolado por organization_id agência
- ✅ Otimistic updates + rollback em caso erro funcionam
- ✅ Indicadores visuais de quem fez movimento (colaboração)
- ✅ Performance movimento < 300ms + feedback visual
- ✅ Validações transições estágios funcionam
- ✅ Touch support para dispositivos móveis

#### **Validação Final**

- [ ] Drag & drop funciona todos navegadores + dispositivos
- [ ] API movimento funciona isolamento organizacional
- [ ] Performance movimento atende metas < 300ms
- [ ] Colaboração movimento visível para equipe agência
- [ ] Deploy sem impacto funcionalidades existentes

---

### **STORY 1.4: Team Collaboration B2B (Vertical Slice)**

**Duração**: 0.5-1 dia  
**Como um** membro de agência digital  
**Eu quero** ver atualizações do pipeline em tempo real de outros membros da equipe  
**Para que** toda a agência tenha visão sincronizada e possa colaborar eficientemente

#### **MicroTasks B2B**

**🥇 FASE 1: REAL-TIME INFRASTRUCTURE B2B (Sequencial - 2-3 horas)**

- [ ] **1.1** Configurar WebSocket/Server-Sent Events para real-time
- [ ] **1.2** Implementar event broadcasting organizacional (apenas agência)
- [ ] **1.3** Adicionar middleware events com isolamento organization_id
- [ ] **1.4** Criar schemas eventos pipeline (lead_created, lead_moved)
- [ ] **1.5** Testar broadcasting eventos múltiplas agências isoladamente

**🥇 FASE 2: BACKEND EVENTS B2B (Sequencial após Fase 1 - 2-3 horas)**

- [ ] **2.1** Integrar eventos real-time nos serviços leads
- [ ] **2.2** Implementar broadcast criação leads para agência
- [ ] **2.3** Implementar broadcast movimento leads para agência
- [ ] **2.4** Adicionar metadata eventos (usuário, timestamp, ação)
- [ ] **2.5** Implementar rate limiting eventos por agência
- [ ] **2.6** Testar eventos isolamento organizacional

**🥇 FASE 3: FRONTEND REAL-TIME B2B (Sequencial após Fase 2 - 2-3 horas)**

- [ ] **3.1** Implementar client WebSocket/SSE organization-aware
- [ ] **3.2** Integrar eventos real-time no componente Pipeline
- [ ] **3.3** Adicionar handlers eventos (lead_created, lead_moved)
- [ ] **3.4** Implementar indicators visuais colaboração (quem está online)
- [ ] **3.5** Adicionar notificações discretas mudanças pipeline
- [ ] **3.6** Implementar auto-refresh pipeline em eventos
- [ ] **3.7** Testar real-time múltiplos usuários mesma agência
- [ ] **3.8** Polish UX colaboração + indicadores atividade

**🥇 FASE 4: PIPELINE TESTES COLABORAÇÃO B2B (Misto após Fase 3 - 1-2 horas)**

**TESTES UNITÁRIOS COLABORAÇÃO B2B (Paralelo)**
- [ ] **4.1a** Testar broadcasting eventos + isolamento org (Backend)
- [ ] **4.1b** Testar handlers eventos + metadata (Backend)
- [ ] **4.1c** Testar client real-time + conexão (Frontend)
- [ ] **4.1d** Testar indicadores colaboração UI (Frontend)

**TESTES INTEGRAÇÃO COLABORAÇÃO B2B (Sequencial)**
- [ ] **4.2** Testar eventos real-time isolamento organizacional
- [ ] **4.3** Testar múltiplos usuários mesma agência recebem eventos
- [ ] **4.4** Testar usuarios diferentes agências não recebem eventos cross-org
- [ ] **4.5** Testar performance eventos + pipeline refresh

**TESTES E2E COLABORAÇÃO B2B (Sequencial)**
- [ ] **4.6** Testar cenário: usuário A move lead → usuário B vê atualização
- [ ] **4.7** Testar colaboração real-time múltiplos browsers
- [ ] **4.8** Testar reconexão automática + recovery eventos
- [ ] **4.9** Testar indicadores presença usuários online

#### **Critérios de Aceite B2B**

- ✅ Real-time updates funcionam apenas para usuários da mesma agência
- ✅ Eventos isolados por organization_id (zero cross-organization)
- ✅ Indicadores visuais de colaboração (quem está online/ativo)
- ✅ Performance real-time < 500ms latência eventos
- ✅ Auto-reconnect funciona se conexão cai
- ✅ Pipeline refresh automático em eventos relevantes
- ✅ Rate limiting previne spam eventos

#### **Validação Final**

- [ ] Real-time funciona múltiplos usuários mesma agência
- [ ] Isolamento organizacional eventos 100% efetivo
- [ ] Performance real-time atende metas < 500ms
- [ ] Indicadores colaboração intuitivos e úteis
- [ ] Reconexão automática funciona corretamente

## **DEPENDÊNCIAS SUB-STORIES E INTEGRAÇÃO B2B**

### **Dependências Sub-Stories B2B (Ordem Execução)**
```
STORY 1.1 (Visualization) → STORY 1.2 (Creation) → STORY 1.3 (Movement) → STORY 1.4 (Collaboration)
↓                         ↓                      ↓                      ↓
Schema Base               Criação Leads          Drag & Drop            Real-time Events
API GET                   API POST               API PUT                WebSocket/SSE
UI Read-only              UI Forms               UI Drag & Drop         UI Collaboration
```

### **Pontos Integração Sistema B2B (Preservados)**
- **Autenticação B2B**: ✅ Sub-stories usam JWT existente + claims organizacionais agência
- **Contexto Organizacional B2B**: ✅ Sub-stories usam api/core/organization_middleware.py + agência context
- **Database B2B**: ✅ Sub-stories estendem PostgreSQL existente + padrões organizacionais
- **Frontend B2B**: ✅ Sub-stories integram Next.js 14 + shadcn/ui + organization-aware components
- **API B2B**: ✅ Sub-stories estendem FastAPI existente + dependências organizacionais

### **Dependências Cross-Sub-Story B2B**
- **STORY 1.1 → STORY 1.2**: Schema e visualização base requeridos para adicionar criação
- **STORY 1.2 → STORY 1.3**: Criação leads requerida para ter leads para mover
- **STORY 1.3 → STORY 1.4**: Movimento requerido para ter eventos colaboração relevantes
- **TODAS SUB-STORIES**: Middleware organizacional B2B requerido para isolamento agências

## **AVALIAÇÃO RISCO VERTICAL SLICE SUB-STORIES B2B**

### **Gerenciamento Risco Nível Sub-Story B2B**

#### **Riscos STORY 1.1: Visualization**
- **Risco**: Performance consulta leads grandes volumes por agência
- **Mitigação**: Paginação + indexes otimizados + caching
- **Contingência**: Loading progressivo + skeleton UI
- **Impacto Timeline**: +2 horas otimização performance

#### **Riscos STORY 1.2: Creation**
- **Risco**: Validações formulário + UX criação
- **Mitigação**: Validações frontend + backend + UX testing
- **Contingência**: Simplificar formulário MVP + melhorias posteriores
- **Impacto Timeline**: +1 hora UX refinement

#### **Riscos STORY 1.3: Movement**
- **Risco**: Drag & drop compatibility cross-browser + mobile
- **Mitigação**: Biblioteca testada + fallback click-to-move
- **Contingência**: Click-to-move interface como alternativa
- **Impacto Timeline**: +3 horas compatibility testing

#### **Riscos STORY 1.4: Collaboration**
- **Risco**: Real-time events performance + reliability
- **Mitigação**: Rate limiting + reconnection logic + graceful degradation
- **Contingência**: Polling fallback + manual refresh
- **Impacto Timeline**: +2 horas reliability testing

## **PLANEJAMENTO RECURSO VERTICAL SLICE SUB-STORIES B2B**

### **Alocação Recurso Por Sub-Story B2B**

**STORY 1.1 - Visualization B2B (1-2 dias)**
- **Dev Backend**: 0.5 dia (schema + API GET + filtros org)
- **Dev Frontend**: 0.5 dia (UI Kanban read-only + context org)
- **QA/Testes**: 0.5 dia (testes visualização + isolamento)

**STORY 1.2 - Creation B2B (1 dia)**
- **Dev Backend**: 0.4 dia (API POST + validações)
- **Dev Frontend**: 0.4 dia (formulário + integration)
- **QA/Testes**: 0.2 dia (testes criação + validações)

**STORY 1.3 - Movement B2B (1-2 dias)**
- **Dev Backend**: 0.4 dia (API PUT + stage management)
- **Dev Frontend**: 0.8 dia (drag & drop + UX)
- **QA/Testes**: 0.3 dia (testes movimento + compatibility)

**STORY 1.4 - Collaboration B2B (0.5-1 dia)**
- **Dev Backend**: 0.3 dia (real-time events + broadcasting)
- **Dev Frontend**: 0.4 dia (real-time UI + indicators)
- **QA/Testes**: 0.3 dia (testes colaboração + multi-user)

### **Critérios Sucesso Por Sub-Story B2B**

#### **Métricas Sucesso STORY 1.1 - Visualization**
- ✅ Pipeline visualiza leads agência em < 200ms
- ✅ Isolamento organizacional 100% visualização
- ✅ UI intuitiva e responsiva todos dispositivos
- ✅ Contexto agência sempre visível e claro

#### **Métricas Sucesso STORY 1.2 - Creation**
- ✅ Criação leads < 500ms + feedback UX
- ✅ Validações funcionam frontend + backend
- ✅ Leads criados aparecem imediatamente pipeline
- ✅ UX criação intuitiva e sem erros

#### **Métricas Sucesso STORY 1.3 - Movement**
- ✅ Drag & drop fluido < 300ms movimento
- ✅ Compatibility cross-browser + mobile
- ✅ Otimistic updates + error recovery
- ✅ Visual feedback movimento claro

#### **Métricas Sucesso STORY 1.4 - Collaboration**
- ✅ Real-time events < 500ms latência
- ✅ Colaboração isolada por agência
- ✅ Indicadores presença usuários funcionam
- ✅ Reconnection automática confiável

## **PIPELINE ENTREGA VERTICAL SLICE SUB-STORIES B2B**

### **Processo Entrega Por Sub-Story B2B**
```
Dev Sub-Story B2B → MicroTask Sequencial → Tests Unit → Tests Integration → Tests E2E → Tests Multi-User → Aceite B2B → Demo → Next Sub-Story
```

### **Definition of Done B2B (Por Sub-Story)**
- [ ] Todas MicroTasks completadas (Database + Backend + Frontend + Tests)
- [ ] Testes unitários passam >90% cobertura componentes sub-story
- [ ] Testes integração validam isolamento organizacional agências
- [ ] **Testes multi-user validam colaboração agência (quando aplicável)**
- [ ] Testes E2E confirmam valor incremental entregue
- [ ] Critérios Aceite B2B validados e demo funciona
- [ ] Validação lint, typecheck, segurança passa
- [ ] **Sub-story demonstra valor utilizável independentemente**
- [ ] Deploy Railway sem impacto sub-stories anteriores + sistema

### **Pipeline Validação B2B (Por Sub-Story)**
1. **Desenvolvimento B2B**: MicroTasks sequenciais organization-aware
2. **Testes Unitários B2B**: Componentes isolados + validação organizacional
3. **Testes Integração B2B**: API + DB + contexto organizacional
4. **Testes E2E B2B**: Fluxos valor + isolamento organizacional
5. **Testes Multi-User B2B**: Colaboração agência (quando aplicável)
6. **Demo Sub-Story**: Valor incremental demonstrado stakeholders
7. **Validação Técnica**: Lint + typecheck + segurança + performance
8. **Validação Deploy**: Railway + sub-stories anteriores funcionando
9. **Aprovação Sub-Story**: Critérios aceite + próxima sub-story

---

## **CHECKLIST IMPLEMENTAÇÃO SUB-STORIES VERTICAL SLICE B2B**

### **Preparação Épico Pipeline B2B**
- [ ] Épico Pipeline Kanban definido valor incremental agências
- [ ] Critérios aceite épico pipeline B2B estabelecidos
- [ ] Value stream mapeado pipeline agências brasileiras
- [ ] Estratégia colaboração + isolamento organizacional definida

### **Sub-Story 1.1: Visualization B2B (1-2 dias)**
- [ ] Schema crm_leads base + FK organization_id
- [ ] API GET leads + filtro organizacional
- [ ] UI Kanban visualization + contexto agência
- [ ] Testes visualização + isolamento organizacional
- [ ] Demo: "Ver leads agência em pipeline visual"

### **Sub-Story 1.2: Creation B2B (1 dia)**  
- [ ] Schema estendido campos leads + validações
- [ ] API POST leads + validação organizacional
- [ ] UI formulário criação + integration
- [ ] Testes criação + validações + isolamento
- [ ] Demo: "Criar lead e ver no pipeline imediatamente"

### **Sub-Story 1.3: Movement B2B (1-2 dias)**
- [ ] Schema pipeline_stage + auditoria movimento
- [ ] API PUT movement + validação transições
- [ ] UI drag & drop + otimistic updates
- [ ] Testes movimento + compatibility + isolamento
- [ ] Demo: "Mover leads entre estágios drag & drop"

### **Sub-Story 1.4: Collaboration B2B (0.5-1 dia)**
- [ ] Real-time events infrastructure + isolamento org
- [ ] Backend broadcasting + frontend real-time
- [ ] UI collaboration indicators + presence
- [ ] Testes real-time + multi-user + isolamento
- [ ] Demo: "Ver mudanças pipeline tempo real equipe"

### **Conclusão Épico Pipeline B2B**
- [ ] Todas 4 sub-stories entregam valor incremental
- [ ] Pipeline Kanban completo funciona colaborativamente
- [ ] Isolamento organizacional 100% todas sub-stories
- [ ] Performance + UX atendem metas B2B agências
- [ ] Base sólida para próximas stories CRM (Timeline, IA, Billing)

---

**PIPELINE KANBAN B2B SUB-STORIES - ENTREGA VALOR INCREMENTAL ORGANIZATION-SCOPED AGÊNCIAS**

## **FERRAMENTAS E VALIDAÇÕES SUB-STORIES B2B**

### **CHECKLIST PRÉ-ENTREGA OBRIGATÓRIO SUB-STORIES:**

- [ ] **🚨 PREREQUISITOS INCLUÍDOS**: PRE-ROADMAP 6 fases completado
- [ ] **Sub-stories valor incremental**: 4 sub-stories pipeline valor independente  
- [ ] **MicroTasks ordem execução**: Numeradas sequenciais organization-aware
- [ ] **🥇 REGRA DE OURO SUB-STORIES**: Ordem execução obrigatória respeitada
- [ ] **Testes sub-story completos**: Unit + Integration + E2E + Multi-User
- [ ] **Critérios aceite sub-story**: DoD + valor + colaboração + isolamento
- [ ] **Demo valor incremental**: Cada sub-story demonstrável independentemente
- [ ] **Isolamento organizacional**: Zero cross-organization todas sub-stories
- [ ] **Colaboração B2B**: Múltiplos usuários agência validado

### **RED FLAGS CRÍTICOS SUB-STORIES (PARAR IMEDIATAMENTE):**

- **🥇 Ordem execução ausente**: Sub-stories sem sequência numerada clara
- **Valor não-incremental**: Sub-stories sem valor utilizável independente
- **Dependencies quebradas**: Sub-story depende de futuras para funcionar
- **Isolamento inadequado**: Sub-stories sem organization_id desde início
- **Colaboração ausente**: Sub-stories sem suporte múltiplos usuários agência
- **Testes insuficientes**: Sub-stories sem testes multi-user + isolamento

### **QUALITY GATES SUB-STORIES B2B:**

- **🥇 ORDEM EXECUÇÃO**: MicroTasks numeradas sequenciais todas sub-stories
- **VALOR INCREMENTAL**: Sub-stories demonstram valor independente
- **ISOLAMENTO ORGANIZACIONAL**: Zero cross-organization validado
- **COLABORAÇÃO B2B**: Múltiplos usuários agência funcionando  
- **DEPENDENCY MANAGEMENT**: Sub-stories sequence correta + integration
- **PERFORMANCE TARGETS**: < 200ms visualization, < 500ms operations
- **UX COLLABORATION**: Indicators colaboração + presence awareness

## **RESULTADO ESPERADO SUB-STORIES B2B**

Ao final desta implementação sub-stories, teremos:

- **Pipeline Kanban B2B completo** com entrega valor incremental
- **4 Sub-stories independentes** cada uma utilizável e demonstrável  
- **Colaboração real-time** funcionando múltiplos usuários agência
- **Isolamento organizacional** 100% efetivo todas operações
- **Performance otimizada** para usage colaborativo B2B
- **Base pipeline sólida** para integração próximas stories CRM (Timeline, IA, Billing)
- **UX colaborativa** com indicators presence + activity awareness
- **Arquitetura escalável** suportando crescimento agências

**File Location**: `/home/paulo/Projetos/desafio/lovedcrm/docs/project/11-roadmap-story-1.md`

Este roadmap sub-stories pode ser implementado incrementalmente entregando valor a cada sub-story completada, mantendo 100% compatibilidade sistema atual organization-centric para agências digitais brasileiras.