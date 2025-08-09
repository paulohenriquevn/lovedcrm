# exec-bug

**Investiga e corrige bugs no sistema Multi-Tenant SaaS mantendo isolamento organizacional**

**📋 LEITURA OBRIGATÓRIA ANTES DE QUALQUER DEBUG:**

- ✅ **DEVE**: Read CHANGELOG.md - ANALISAR histórico completo de implementações do projeto

**Argumentos:**

- `bug`: Descrição do bug, erro específico, ou comportamento inesperado

**Uso:**

```bash
/exec-bug "Cross-org data leakage no dashboard"
/exec-bug "BaseService não adiciona X-Org-Id header"
/exec-bug "useOrgContext retorna org incorreta"
/exec-bug "Railway migration falhou com org_id constraint"
```

---

## 🧠 **PENSAR ANTES DE AGIR - REGRA UNIVERSAL**

### **🚨 PAUSA OBRIGATÓRIA ANTES DE QUALQUER AÇÃO**

**REGRA FUNDAMENTAL**: Este agente NUNCA deve iniciar qualquer processamento sem primeiro PENSAR e PLANEJAR suas ações.

**PROCESSO OBRIGATÓRIO DE REFLEXÃO (2-3 minutos)**:

#### **🎯 ETAPA 1: COMPREENDER O PEDIDO (30s)**

- ❓ **Pergunta**: "O que exatamente o usuário está pedindo?"
- 📝 **Resposta**: [Investigar e corrigir bug específico mantendo isolamento organizacional]
- ✅ **Validação**: "Tenho 95% de certeza sobre o que preciso fazer?"

#### **🔍 ETAPA 2: ANALISAR PRÉ-REQUISITOS (60s)**

- 📋 **Pergunta**: "Que informações preciso coletar ANTES de agir?"
- 🔎 **Resposta**: [Descrição bug, logs, código relacionado, testes existentes]
- ⚠️ **Validação**: "Posso prosseguir com o que tenho ou preciso de mais informações?"

#### **⚙️ ETAPA 3: PLANEJAR ABORDAGEM (60s)**

- 🛣️ **Pergunta**: "Qual é o melhor caminho para resolver isso?"
- 📈 **Resposta**: [Reproduzir bug -> identificar causa -> corrigir -> testar isolamento]
- 🎯 **Validação**: "Este plano leva ao resultado desejado?"

#### **🚨 ETAPA 4: VALIDAR PRINCÍPIOS (30s)**

- 🔴 **KISS**: Esta abordagem é a mais simples possível?
- 🔴 **YAGNI**: Estou implementando apenas o necessário AGORA?
- 🔴 **DRY**: Estou reutilizando o que já existe?
- 🔴 **95% CERTEZA**: Tenho confiança suficiente para prosseguir?

**❌ SE QUALQUER VALIDAÇÃO FALHAR**: PARAR e pedir esclarecimentos ao usuário
**✅ SE TODAS VALIDAÇÕES PASSAREM**: Prosseguir com execução confiante

### **📝 TEMPLATE DE REFLEXÃO OBRIGATÓRIA**

Antes de iniciar qualquer tarefa, o agente DEVE exibir:

```
🧠 PENSANDO ANTES DE AGIR...

✅ COMPREENSÃO: [Descrição bug -> investigação + correção mantendo org isolation]
✅ PRÉ-REQUISITOS: [Bug description, logs, código, testes]
✅ PLANO: [Reproduzir -> diagnosticar -> corrigir -> validar]
✅ VALIDAÇÃO: KISS ✓ YAGNI ✓ DRY ✓ 95% CERTEZA ✓

🚀 INICIANDO EXECUÇÃO COM CONFIANÇA...
```

**TEMPO INVESTIDO**: 2-3 minutos de planejamento podem economizar horas de retrabalho.

---

## 🏗️ **CONTEXTO SISTEMA MULTI-TENANT SAAS**

### **Projeto**: Multi-Tenant SaaS System - Production Ready

- **Stack**: Next.js 14 + FastAPI + PostgreSQL + Railway
- **Arquitetura**: Clean Architecture + Header-Based Multi-Tenancy + i18n
- **Status**: ✅ PRODUCTION - 60+ endpoints live on Railway
- **Filosofia**: 95% de confiança + Organization Isolation + Zero Data Leakage

### 🚨 **PRINCÍPIOS FUNDAMENTAIS - EXTREMAMENTE IMPORTANTES (NUNCA QUEBRAR)**

- **KISS (Keep It Simple, Stupid)**: **SEMPRE** escolher a solução mais simples que funciona
- **YAGNI (You Aren't Gonna Need It)**: **NUNCA** implementar funcionalidades "para o futuro"
- **DRY (Don't Repeat Yourself)**: **SEMPRE** reutilizar código existente antes de criar novo
- **⚠️ CRITICAL**: Quebrar estes princípios é considerado falha crítica

### **Complexidade Multi-Tenant**:

- **Threshold**: Até 8.0/10 (coordenação frontend+backend+org-isolation)
- **Abordagem**: Organization-centric debugging, sempre validar isolation
- **Validação**: Cada correção deve manter/melhorar multi-tenancy

---

## 🎯 **PRINCÍPIOS FUNDAMENTAIS DA METODOLOGIA**

### **1. REGRA DE 95% DE CLAREZA**

- **NUNCA** implementar correção sem 95% de certeza sobre a causa
- **SEMPRE** investigar até entender completamente o problema
- **SEMPRE** questionar se é sintoma de problema maior
- **NUNCA** aplicar "band-aid" em problemas mal compreendidos

### **2. VERTICAL SLICE VALIDATION**

- **SEMPRE** validar se o bug afeta uma slice completa (UI + API + DB)
- **NUNCA** corrigir apenas uma camada sem validar o impacto total
- **SEMPRE** garantir que a correção não quebra outras slices
- **SEMPRE** testar fluxo end-to-end após correção

### **3. ANTI-SCOPE CREEP**

- **NUNCA** expandir o escopo da correção durante o debugging
- **SEMPRE** focar APENAS no bug específico reportado
- **NUNCA** "já que estou aqui" - cada correção é independente
- **SEMPRE** documentar outros problemas encontrados para depois

### **4. OBJETIVIDADE OBRIGATÓRIA**

- **SEMPRE** usar critérios objetivos da DEFINICOES_OBJETIVAS.md
- **NUNCA** usar termos subjetivos como "parece", "talvez", "provavelmente"
- **SEMPRE** usar escala 1-10 para avaliar severidade e impacto
- **SEMPRE** aplicar thresholds: >= 7 crítico, 5-6 médio, <= 4 baixo

---

## 🔍 **INVESTIGAÇÃO ESTRUTURADA EM 6 FASES - METODOLOGIA V4.1**

### **🚨 FASE 0: ANÁLISE OBRIGATÓRIA DO ESTADO ATUAL DO PROJETO**

**REGRA ABSOLUTA: DEVE LER FISICAMENTE ARQUIVOS ANTES DE QUALQUER DEBUGGING**

#### **📁 LEITURA OBRIGATÓRIA DE ARQUIVOS CRÍTICOS**

- ✅ **DEVE**: `Bash git log --oneline -10` - VERIFICAR commits recentes relacionados ao bug
- ✅ **DEVE**: `Bash git status` - ANALISAR estado atual do branch
- ✅ **DEVE**: `Read requirements.txt` - LISTAR dependências Python atuais
- ✅ **DEVE**: `Read package.json` - LISTAR dependências Frontend atuais
- ✅ **DEVE**: `LS api/models/` - MAPEAR models relacionados ao bug
- ✅ **DEVE**: `LS api/services/` - MAPEAR services relacionados ao bug
- ✅ **DEVE**: `LS api/routers/` - MAPEAR routers relacionados ao bug
- ✅ **DEVE**: `LS components/ui/` - VERIFICAR componentes envolvidos no bug
- ✅ **DEVE**: `Bash npm run dev` - TENTAR reproduzir o bug localmente
- ✅ **DEVE**: `Bash curl http://localhost:8000/health` - VERIFICAR saúde do backend

#### **🚨 VALIDAÇÃO OBRIGATÓRIA**

- ❌ **FALHA CRÍTICA**: Não usar ferramentas Read/LS/Bash para análise real
- ❌ **FALHA CRÍTICA**: Assumir causa do bug sem verificação direta
- ❌ **FALHA CRÍTICA**: Debug baseado em suposições sobre código
- ✅ **OBRIGATÓRIO**: Cada item acima DEVE ter evidência de leitura/execução real

### **FASE 1: COLETA DE EVIDÊNCIAS (95% DE CLAREZA)**

```yaml
Bug Analysis:
  Severidade: [1-10] # Usar DEFINICOES_OBJETIVAS.md
  Impacto: [1-10] # Quantos usuários afetados
  Reprodutibilidade: [1-10] # 10 = sempre reproduz
  Urgência: [1-10] # Baseado em critérios objetivos

Contexto Técnico:
  Stack_Component: [Frontend/Backend/Database/Integration]
  Vertical_Slice: [Qual slice está quebrada]
  User_Story: [História de usuário afetada]

Evidências Coletadas:
  Error_Messages: [Mensagens exatas de erro]
  Browser_Console: [Logs do console]
  Server_Logs: [Logs do Next.js]
  Database_State: [Estado dos dados via Prisma Studio]
  Network_Requests: [Requisições HTTP via DevTools]
```

### **FASE 2: REPRODUÇÃO COM VERTICAL SLICE**

```bash
# 1. Reproduzir slice completa
npm run dev
npx prisma studio

# 2. Testar fluxo end-to-end
# Frontend: Interface user
# API: Endpoint específico
# Database: Dados persistidos

# 3. Validar dependências entre slices
# Se bug em Auth, verificar impacto em Dashboard
# Se bug em Payment, verificar impacto em Subscription
```

### **FASE 3: ANÁLISE ANTI-SCOPE CREEP**

```yaml
Escopo_Permitido:
  - Corrigir APENAS o bug específico
  - Validar slice afetada
  - Não quebrar outras slices

Escopo_Proibido:
  - Refatorar código "já que estou aqui"
  - Corrigir bugs não relacionados
  - Implementar melhorias não solicitadas
  - Mudar arquitetura ou patterns
```

### **FASE 4: ANÁLISE DE CAUSA RAIZ COM EVIDÊNCIAS**

Aplicar metodologia "5 Porquês" baseada nas evidências coletadas na Fase 0:

```yaml
1. O_que_aconteceu: [Sintoma específico observado COM EVIDÊNCIAS]
   Por_que: [Causa imediata - score 1-10 de confiança]
   Evidência: [Arquivo/comando que confirma esta causa]

2. Por_que_isso_causou_problema: [Causa deeper COM EVIDÊNCIAS]
   Por_que: [Análise mais profunda - score 1-10]
   Evidência: [Log/código específico que suporta esta causa]

3. Por_que_essa_condição_existe: [Causa architectural COM EVIDÊNCIAS]
   Por_que: [Problema de design/implementação identificado]
   Evidência: [Arquivo específico com o código problemático]
```

### **FASE 5: IMPLEMENTAÇÃO DE CORREÇÃO**

1. **Implementar mudança mínima** baseada na causa raiz identificada
2. **Validar correção** com reprodução do bug original
3. **Executar testes** para garantir não regressão
4. **Documentar correção** aplicada

---

## 🐛 **CATEGORIZAÇÃO POR STACK COMPONENT**

### **Frontend (Next.js 14 Multi-Tenant)**

```yaml
Componentes_Afetados:
  - app/[locale]/admin/[...]/page.tsx
  - containers/[...]/[...]Container.tsx
  - components/[...]/[...].tsx
  - services/[...].ts (BaseService)
  - stores/[...].ts (Zustand + org context)

Ferramentas_Debugging:
  - React DevTools (org context)
  - Network Tab (X-Org-Id headers)
  - useOrgContext hook state
  - Zustand devtools

Validações_Multi_Tenant:
  - useOrgContext retorna org correta
  - BaseService adiciona X-Org-Id
  - Routes seguem /[locale]/admin/
  - Stores mantêm org isolation
```

### **Backend (FastAPI Clean Architecture)**

```yaml
Componentes_Afetados:
  - api/routers/[...].py
  - api/services/[...].py
  - api/repositories/[...].py
  - api/models/[...].py
  - api/core/organization_middleware.py

Ferramentas_Debugging:
  - FastAPI logs
  - PostgreSQL query logs
  - API testing (curl/Postman)
  - Organization middleware traces

Validações_Multi_Tenant:
  - get_current_organization dependency
  - All queries filter by organization_id
  - No cross-org data leakage
  - Middleware validates X-Org-Id
```

### **Database (PostgreSQL + SQLAlchemy)**

```yaml
Componentes_Afetados:
  - api/models/[...].py (organization_id FK)
  - migrations/[...].sql
  - api/repositories/[...].py (org filtering)
  - Database constraints

Ferramentas_Debugging:
  - PostgreSQL logs
  - Query analysis tools
  - Migration status
  - Constraint validation

Validações_Multi_Tenant:
  - All tables have organization_id
  - Queries always filter by org_id
  - No cross-org data visible
  - Foreign keys respect org boundaries
```

### **Integrations (Multi-Tenant Aware)**

```yaml
Componentes_Afetados:
  - api/services/stripe_service.py
  - api/core/deps.py (org dependencies)
  - Organization middleware
  - Authentication with org context

Ferramentas_Debugging:
  - External API logs
  - Organization isolation tests
  - Header validation
  - Rate limiting per org

Validações_Multi_Tenant:
  - External calls include org context
  - Rate limits per organization
  - Billing isolated by org
  - Webhooks validate organization
```

### **📋 CHECKLIST OBRIGATÓRIO - EVIDÊNCIAS DE ANÁLISE REAL**

```yaml
Análise de Arquivos Realizada (FASE 0):
  ✅ git log: [COLAR commits recentes relacionados ao bug]
  ✅ git status: [COLAR estado atual do branch]
  ✅ requirements.txt: [LISTAR dependências Python atuais]
  ✅ package.json: [LISTAR dependências Frontend atuais]
  ✅ api/models/: [LISTAR arquivos relacionados ao bug]
  ✅ api/services/: [LISTAR arquivos relacionados ao bug]
  ✅ api/routers/: [LISTAR arquivos relacionados ao bug]
  ✅ components/ui/: [LISTAR componentes envolvidos]
  ✅ npm run dev: [RESULTADO - reproduziu o bug?]
  ✅ backend health: [RESULTADO - sistema funcionando?]

❌ FALHA CRÍTICA se qualquer item acima não tiver evidência REAL de execução
```

---

## 🎯 **ANÁLISE DE CAUSA RAIZ - METODOLOGIA V4.1**

### **5 Porquês + Validação Objetiva**

```yaml
1. O_que_aconteceu: [Sintoma específico observado]
   Por_que: [Causa imediata - score 1-10 de confiança]
   Validação: [Como confirmar esta causa]

2. Por_que_isso_causou_problema: [Causa deeper]
   Por_que: [Análise mais profunda - score 1-10]
   Validação: [Evidência que suporta esta causa]

3. Por_que_essa_condição_existe: [Causa architectural]
   Por_que: [Problema de design/implementação]
   Validação: [Revisar código e documentação]

4. Por_que_não_foi_prevenido: [Falha de processo]
   Por_que: [Gap na metodologia/validação]
   Validação: [Verificar se seguimos REGRAS_UNIVERSAIS.md]

5. Como_prevenir_recorrência: [Melhoria de processo]
   Ação: [Atualizar metodologia se necessário]
   Validação: [Implementar validação adicional]
```

### **Checklist de Causas Comuns - DevSolo Docs**

```yaml
# Violações da Metodologia V4.1:
- [ ] Implementação sem 95% de clareza
- [ ] Slice incompleta (falta UI/API/DB)
- [ ] Scope creep durante desenvolvimento
- [ ] Validação objetiva não aplicada

# Problemas Técnicos Específicos:
- [ ] JWT token expirado/inválido
- [ ] Prisma schema desatualizado
- [ ] Stripe webhook não configurado
- [ ] Middleware não aplicado
- [ ] TypeScript strict mode violation
- [ ] Rate limiting atingido
- [ ] Database constraint violation
- [ ] Environment variables missing
```

---

## 🛠️ **PLANO DE CORREÇÃO - PRIORIZAÇÃO OBJETIVA**

### **Severidade por Critérios Objetivos (1-10)**

```yaml
Score_10: # CRÍTICO - Corrigir AGORA
  criterios:
    - Sistema completamente inacessível
    - Perda de dados confirmada
    - Vazamento de segurança
    - Falha total de pagamento

Score_7-9: # ALTO - Corrigir hoje
  criterios:
    - Feature principal quebrada
    - > 50% dos usuários afetados
    - Performance degradada significativamente
    - Erro rate > 10%

Score_4-6: # MÉDIO - Corrigir esta semana
  criterios:
    - Feature secundária com problema
    - < 50% dos usuários afetados
    - UX prejudicada mas funcional
    - Casos edge frequentes

Score_1-3: # BAIXO - Backlog
  criterios:
    - Polimento de interface
    - Casos edge raros
    - Otimizações não críticas
    - Melhorias de UX
```

### **Estratégia de Correção por Severidade**

```yaml
# CRÍTICO (Score 10): HOTFIX
Branch: hotfix/critical-[bug-id]
Processo: Fix imediato → Deploy → Validação
Princípio: Menor mudança que resolve

# ALTO (Score 7-9): BUGFIX
Branch: bugfix/[componente]-[bug-id]
Processo: Fix → Validação slice → Deploy
Princípio: Correção completa da slice

# MÉDIO (Score 4-6): FEATURE
Branch: feature/fix-[componente]
Processo: Fix → Testes → Code review → Deploy
Princípio: Correção + prevenção

# BAIXO (Score 1-3): IMPROVEMENT
Branch: improvement/[area]
Processo: Análise → Design → Implementação → Testes
Princípio: Melhoria sustentável
```

---

## ✅ **VALIDAÇÃO DE CORREÇÃO - VERTICAL SLICE**

### **Checklist por Slice Completa**

```yaml
# Authentication Slice:
- [ ] Login funciona (UI + API + DB)
- [ ] JWT persiste corretamente
- [ ] Middleware protege rotas
- [ ] Logout limpa sessão
- [ ] Redirect após auth funciona

# Dashboard Slice:
- [ ] Dados carregam (UI + API + DB)
- [ ] CRUD operations funcionam
- [ ] Permissions respeitadas
- [ ] Real-time updates se aplicável
- [ ] Error handling adequado

# Payment Slice:
- [ ] Checkout flow completo
- [ ] Webhook processa corretamente
- [ ] Database atualizado
- [ ] Customer portal funciona
- [ ] Subscription status correto

# Activity Logging Slice:
- [ ] Events são capturados
- [ ] Logs enviados para Loki
- [ ] Dashboard mostra atividade
- [ ] Filtros funcionam
- [ ] Performance mantida
```

### **Validação Anti-Regressão**

```yaml
# Outras slices NÃO afetadas:
- [ ] Authentication ainda funciona
- [ ] Dashboard carrega normalmente
- [ ] Payments processam
- [ ] Logging continua ativo

# Performance mantida:
- [ ] Lighthouse score >= 90
- [ ] API response time < 500ms
- [ ] Database queries otimizadas
- [ ] No memory leaks
```

---

## 🚫 **RED FLAGS - METODOLOGIA V4.1**

### **1. Violação de 95% de Clareza**

```yaml
❌ Sinais:
  - Não consegue explicar causa em 2 frases
  - Tentativa de "fix" sem entender problema
  - Múltiplas teorias sobre causa
  - Correção afeta > 3 arquivos sem justificativa

✅ Ações:
  - PARAR correção imediatamente
  - Voltar para investigação
  - Aplicar 5 porquês rigorosamente
  - Buscar ajuda se necessário
```

### **2. Scope Creep Durante Correção**

```yaml
❌ Sinais:
  - "Já que estou aqui, vou arrumar..."
  - Mudança de múltiplas features
  - Refatoração não relacionada
  - Correção de bugs não reportados

✅ Ações:
  - Documentar outros problemas para depois
  - Focar APENAS no bug específico
  - Criar issues separadas para outras correções
  - Validar se mudança é mínima necessária
```

### **3. Quebra de Vertical Slice**

```yaml
❌ Sinais:
  - Correção em apenas uma camada
  - Não testou fluxo end-to-end
  - Outras slices podem estar afetadas
  - Validação incompleta

✅ Ações:
  - Testar slice completa
  - Validar impacto em slices relacionadas
  - Executar testes de regressão
  - Documentar interdependências
```

---

## 🚀 **COMANDOS ESPECÍFICOS - DEVSO DOCS V4.1**

### **Setup de Debugging**

```bash
# 1. Ambiente de desenvolvimento
git checkout [branch-do-bug]
npm install
cp .env.example .env.local
# Configurar variáveis de ambiente

# 2. Serviços locais
docker-compose up -d postgres  # Se usando local
npm run db:migrate
npm run db:seed

# 3. Ferramentas de debugging
npm run dev  # Next.js dev server
npx prisma studio  # Database visual
npm run type-check  # TypeScript validation
```

### **Debugging por Stack Component**

```bash
# Frontend Issues
npm run dev  # Hot reload + error overlay
npm run build  # Production build validation
npm run lint  # Code quality check

# Backend Issues
npm run dev  # API routes debugging
curl -X POST http://localhost:3000/api/test  # Direct API testing
npm run type-check  # API types validation

# Database Issues
npx prisma studio  # Visual database browser
npx prisma db push  # Schema sync
npx prisma reset  # Reset development DB
npx prisma migrate dev  # Apply migrations

# Integration Issues
# Stripe: Check webhook logs in dashboard
# Loki: Check logs in Grafana
# Auth: Check JWT in browser DevTools
```

---

## 🏁 **CHECKLIST FINAL - METODOLOGIA V4.1**

### **Correção Validada com 95% de Confiança**

- [ ] Bug 100% reproduzido antes da correção
- [ ] Causa raiz identificada com score >= 8/10 confiança
- [ ] Correção implementada seguindo princípios V4.1
- [ ] Vertical slice completa validada
- [ ] Nenhuma regressão identificada
- [ ] Performance mantida ou melhorada

### **Conformidade com Metodologia**

- [ ] DEFINICOES_OBJETIVAS.md consultada
- [ ] REGRAS_UNIVERSAIS.md aplicadas
- [ ] Scope creep evitado
- [ ] Validação objetiva aplicada
- [ ] Documentação atualizada

### **Código e Padrões**

- [ ] TypeScript strict mode sem erros
- [ ] ESLint sem warnings
- [ ] Patterns da metodologia seguidos
- [ ] Comentários apenas onde necessário
- [ ] Commit message seguindo padrão

### **Commit Message - DevSolo Docs V4.1**

```bash
git commit -m "fix: [descrição específica do bug]

- Corrige [comportamento específico]
- Causa raiz: [explicação objetiva]
- Severidade: [score 1-10]
- Slice afetada: [componente específico]
- Validação: [como foi testado]

Metodologia V4.1 aplicada:
- 95% de clareza: ✅
- Vertical slice: ✅
- Anti-scope creep: ✅
- Validação objetiva: ✅
"
```

---

## 📋 **PROCESS FLOW - DEVSO DOCS V4.1**

**🎯 FLUXO OBRIGATÓRIO**:

1. **Coletar** → 95% de clareza sobre o problema
2. **Reproduzir** → Validar slice completa afetada
3. **Analisar** → Aplicar 5 porquês com critérios objetivos
4. **Corrigir** → Implementar mudança mínima necessária
5. **Validar** → Testar slice + verificar regressão
6. **Documentar** → Atualizar processo se necessário

**🚨 PRIORIZAÇÃO OBJETIVA**:

- **Score 10**: Drop everything, fix now
- **Score 7-9**: Fix hoje, deploy ASAP
- **Score 4-6**: Fix esta semana
- **Score 1-3**: Backlog, próximo sprint

**💡 PRINCÍPIOS FUNDAMENTAIS**:

- 95% de clareza antes de qualquer ação
- Vertical slice validation obrigatória
- Anti-scope creep rigorosamente aplicado
- Validação objetiva em todas as etapas
