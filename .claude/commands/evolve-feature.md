# evolve-feature

**Analisa, planeja e cria tasks para evolução de features seguindo arquitetura Multi-Tenant SaaS**

**📋 LEITURA OBRIGATÓRIA ANTES DE QUALQUER EVOLUÇÃO:**

- ✅ **DEVE**: Read CHANGELOG.md - ANALISAR histórico completo de implementações do projeto

**Argumentos:**

- `feature`: Nome da feature a ser evoluída
- `objective`: Objetivo da evolução (opcional)

**Uso:**

```bash
/evolve-feature "authentication" "migrar para OAuth multi-tenant"
/evolve-feature "billing" "adicionar planos enterprise"
/evolve-feature "dashboard" "melhorar performance org-scoped"
```

---

## 🧠 **PENSAR ANTES DE AGIR - REGRA UNIVERSAL**

### **🚨 PAUSA OBRIGATÓRIA ANTES DE QUALQUER AÇÃO**

**REGRA FUNDAMENTAL**: Este agente NUNCA deve iniciar qualquer processamento sem primeiro PENSAR e PLANEJAR suas ações.

**PROCESSO OBRIGATÓRIO DE REFLEXÃO (2-3 minutos)**:

#### **🎯 ETAPA 1: COMPREENDER O PEDIDO (30s)**

- ❓ **Pergunta**: "O que exatamente o usuário está pedindo?"
- 📝 **Resposta**: [Analisar e criar plano de evolução para feature específica]
- ✅ **Validação**: "Tenho 95% de certeza sobre o que preciso fazer?"

#### **🔍 ETAPA 2: ANALISAR PRÉ-REQUISITOS (60s)**

- 📋 **Pergunta**: "Que informações preciso coletar ANTES de agir?"
- 🔎 **Resposta**: [Estado atual da feature, objetivo da evolução, impactos]
- ⚠️ **Validação**: "Posso prosseguir com o que tenho ou preciso de mais informações?"

#### **⚙️ ETAPA 3: PLANEJAR ABORDAGEM (60s)**

- 🛣️ **Pergunta**: "Qual é o melhor caminho para resolver isso?"
- 📈 **Resposta**: [Analisar estado -> definir objetivos -> planejar evolução -> validar org-centric]
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

✅ COMPREENSÃO: [Feature name + objetivo -> plano evolução arquitetura multi-tenant]
✅ PRÉ-REQUISITOS: [Estado atual feature, objetivo evolução, impactos]
✅ PLANO: [Analisar -> objetivar -> planejar -> validar org-centric]
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
- **Filosofia**: 95% de confiança + Organization-Centric + **Simplificar Substituindo**

### 🚨 **PRINCÍPIOS FUNDAMENTAIS - EXTREMAMENTE IMPORTANTES (NUNCA QUEBRAR)**

- **KISS (Keep It Simple, Stupid)**: **SEMPRE** escolher a solução mais simples que funciona
- **YAGNI (You Aren't Gonna Need It)**: **NUNCA** implementar funcionalidades "para o futuro"
- **DRY (Don't Repeat Yourself)**: **SEMPRE** reutilizar código existente antes de criar novo
- **⚠️ CRITICAL**: Quebrar estes princípios é considerado falha crítica

### **Complexidade Gerenciável Multi-Tenant**:

- **Threshold**: Até 8.0/10 para desenvolvedor experiente (coordenação frontend+backend)
- **Abordagem**: Evolução org-aware, cada mudança deve manter isolamento
- **Validação**: Cada evolução deve simplificar e manter multi-tenancy

---

## 📋 **FILOSOFIA CENTRAL: SIMPLIFICAR SUBSTITUINDO**

### **Princípios Fundamentais:**

- **Evoluir ≠ Adicionar**: Evolução é substituição por algo mais simples
- **Deletar > Criar**: Sucesso medido por linhas de código removidas
- **1 Semana Máximo**: Evoluções que demoram mais estão complexas demais
- **Interface Mínima**: Encontrar a menor interface entre sistema e feature
- **YAGNI Radical**: You Aren't Gonna Need It - cortar impiedosamente

### **Anti-Patterns de Evolução:**

```yaml
❌ Evoluções Problemáticas:
  - "Vamos manter as duas versões por segurança"
  - "Precisamos de um sistema de migração elaborado"
  - "E se fizéssemos algo genérico para o futuro?"
  - "Vamos criar um período de transição de 3 meses"
  - "Precisamos de 15 configurações diferentes"

✅ Evoluções Corretas:
  - "Dia D trocamos tudo"
  - "Script simples de migração"
  - "Resolvemos o problema específico"
  - "1 semana de migração máximo"
  - "1 configuração que funciona"
```

---

## 🔍 **PROCESSO DE EVOLUÇÃO HÍBRIDA**

### **FASE 1: ANÁLISE INICIAL (1-2 horas máximo)**

#### **Questões Fundamentais:**

```yaml
1. O que temos hoje? (1 parágrafo)
   Frontend: [Estado atual no Next.js]
   Backend: [Estado atual no FastAPI]
   Dados: [Estado atual dos dados]

2. O que queremos ter? (1 parágrafo)
   Frontend: [Estado desejado no Next.js]
   Backend: [Estado desejado no FastAPI]
   Dados: [Estado desejado dos dados]

3. Por quê? (1 frase)
   Motivação: [Problema específico que resolve]
```

#### **Mapeamento Multi-Tenant:**

```yaml
Frontend (Next.js 14):
  Páginas: [app/[locale]/admin/ - estrutura obrigatória]
  Containers: [Business logic com useOrgContext]
  Components: [shadcn/ui + design tokens]
  Services: [BaseService com X-Org-Id automático]
  Stores: [Zustand com org context]

Backend (FastAPI):
  Routers: [api/routers/ com get_current_organization]
  Services: [api/services/ com org validation]
  Repositories: [api/repositories/ com org filtering]
  Models: [api/models/ com organization_id FK]

Multi-Tenancy:
  Org Headers: [X-Org-Id em todas as requisições]
  Data Isolation: [Queries sempre filtradas por org_id]
  Auth: [JWT com org_id payload]
  Routes: [/[locale]/admin/ structure]

Database:
  Schema: [Prisma/SQLAlchemy com organization_id]
  Migrations: [Railway deployment]
  Volume: [Dados por organização]
  Isolation: [Zero vazamento cross-org]
```

### **FASE 2: REFINAMENTO IMPIEDOSO (30 minutos)**

#### **Aplicar Regra 80/20:**

```yaml
80% do Benefício: [Funcionalidades que resolvem o problema principal]
20% do Esforço: [Implementação mais simples possível]

Cortar YAGNI:
❌ Cortado: [Funcionalidades "talvez úteis no futuro"]
✅ Mantido: [Apenas o essencial para resolver o problema]
```

#### **Decisões KISS Multi-Tenant:**

```yaml
Migração de Dados:
  COMPLEXO: "Sistema de migração gradual com rollback automático"
  SIMPLES: "Railway migration apply, validação org isolation"

API Changes:
  COMPLEXO: "Versionamento com 3 versões simultâneas"
  SIMPLES: "Breaking change, update client + server"

Multi-Tenant Deployment:
  COMPLEXO: "Deploy per-organization com feature flags"
  SIMPLES: "Deploy global, validar org isolation"

Org Context:
  COMPLEXO: "Context switching dinâmico"
  SIMPLES: "useOrgContext hook + BaseService"
```

### **FASE 3: CRIAÇÃO DE TASKS (1 hora)**

#### **Template de Task Multi-Tenant:**

```yaml
TASK: [Verbo] + [O quê] + [Onde] + [Org Context]
ENTREGA: [Arquivo específico + validação org isolation]
TEMPO: [Horas, nunca mais que 8h por task]
RISCO: [Baixo/Médio/Alto]
ROLLBACK: [Como desfazer mantendo data isolation]
ORG_VALIDATION: [Como validar que não vaza dados]
```

#### **Padrões de Tasks Multi-Tenant:**

**1. Backend Model/Service (Sempre org-first):**

```yaml
Task: Implementar model/service com org filtering
Entrega: api/models/feature.py + org_id FK + tests
Tempo: 3-4h
Risco: Alto (data isolation crítico)
Rollback: Migration rollback
Org_Validation: Testar cross-org access negado
```

**2. Frontend Service/Store:**

```yaml
Task: Criar service com BaseService + org store
Entrega: services/feature.ts + stores/feature.ts
Tempo: 2-3h
Risco: Médio
Rollback: Remove files
Org_Validation: X-Org-Id headers automáticos
```

**3. UI Components/Container:**

```yaml
Task: Implementar UI com useOrgContext
Entrega: components/ + containers/ com org validation
Tempo: 3-4h
Risco: Baixo
Rollback: Remove components
Org_Validation: useOrgContext hook funcionando
```

**4. Route Integration:**

```yaml
Task: Integrar em /[locale]/admin/ structure
Entrega: app/[locale]/admin/feature/ funcionando
Tempo: 1-2h
Risco: Baixo
Rollback: Remove route
Org_Validation: Route protegida por org
```

**5. Production Deploy + Validation:**

```yaml
Task: Deploy com validação multi-tenant
Entrega: Railway deploy + org isolation test
Tempo: 2h
Risco: Alto
Rollback: Railway rollback
Org_Validation: Test cross-org data leakage
```

---

## ✅ **VALIDAÇÃO DO PLANO MULTI-TENANT**

### **Checklist Anti-Complexidade:**

```yaml
Timing:
□ Todas as tasks cabem em 1 semana?
□ Nenhuma task demora mais de 8 horas?
□ Deploy Railway pode ser feito com confidence?

Simplicidade:
□ Cada task tem entrega clara?
□ Nenhuma task tem "e" no meio?
□ Deletamos mais código do que criamos?
□ O resultado final é mais simples que o atual?

Multi-Tenancy:
□ Todas as tasks mantêm org isolation?
□ Nenhuma task pode vazar dados cross-org?
□ BaseService e useOrgContext são usados?
□ Testes de org isolation incluídos?

Riscos:
□ Temos rollback plan para cada step?
□ Railway migrations são reversíveis?
□ Podemos pausar sem quebrar multi-tenancy?
□ Data isolation nunca é comprometido?

Arquitetura:
□ Clean architecture é mantida?
□ /[locale]/admin/ structure é respeitada?
□ Design tokens e shadcn/ui são usados?
□ i18n support é preservado?
```

### **Teste do Elevador Híbrido:**

```yaml
Você consegue explicar o plano em 30 segundos?

Exemplo: "Vamos trocar auth de sessão para JWT.
Criamos interface, implementamos no backend,
adaptamos frontend, migramos dados se necessário,
ativamos em produção numa data específica,
deletamos código antigo. 1 semana total."

Se não conseguir, está complexo demais.
```

---

## 📊 **EXEMPLO PRÁTICO: MIGRAÇÃO DE AUTENTICAÇÃO**

### **Análise (1 hora):**

```yaml
HOJE:
  Frontend: Login form + session cookies
  Backend: POST /login retorna session cookie
  Dados: users table com password_hash

QUER:
  Frontend: OAuth button + JWT storage
  Backend: OAuth callback + JWT generation
  Dados: users table + oauth_providers table

POR QUÊ: Usuários pedem login social e é mais seguro
```

### **Refinamento (30 min):**

```yaml
CORTAR (YAGNI):
  - Múltiplos providers (só Google)
  - Migration gradual de usuários
  - Compatibilidade com cookies
  - Refresh tokens complexos

MANTER:
  - User model atual
  - Permissions existentes
  - Emails de notificação

SIMPLIFICAR:
  - Uma data de corte: todo mundo loga de novo
  - JWT simples sem refresh
  - OAuth direto, sem abstração
```

### **Tasks:**

```yaml
1. Criar AuthInterface (1h)
   ENTREGA: interfaces/auth.ts
   RISCO: Baixo
   ROLLBACK: Deletar arquivo

2. Implementar GoogleAuth no backend (4h)
   ENTREGA: services/google_auth.py + tests
   RISCO: Médio
   ROLLBACK: Git revert

3. Criar OAuth client no frontend (3h)
   ENTREGA: services/auth.ts funcional
   RISCO: Baixo
   ROLLBACK: Usar auth anterior

4. Migrar dados users (2h)
   ENTREGA: Script migration + backup
   RISCO: Alto
   ROLLBACK: Restore backup

5. Switch em produção (2h)
   ENTREGA: Deploy + config change
   RISCO: Alto
   ROLLBACK: Config rollback

6. Deletar código session (1h)
   ENTREGA: PR com arquivos removidos
   RISCO: Baixo
   ROLLBACK: Git revert
```

### **Validação:**

```yaml
✓ 13 horas total (menos de 2 dias)
✓ Cada task independente
✓ Resultado: menos código, mais segurança
✓ Explicação: "sessão vira JWT via Google OAuth"
```

---

## 🛠️ **TEMPLATE FINAL PARA QUALQUER EVOLUÇÃO**

```markdown
# Evolução: [Nome da Feature]

## Análise (1h)

### Estado Atual

**Frontend:** [Arquivos principais + como funciona]
**Backend:** [Arquivos principais + como funciona]  
**Dados:** [Tables/models envolvidos]

### Estado Desejado

**Frontend:** [O que vai mudar + benefícios]
**Backend:** [O que vai mudar + benefícios]
**Dados:** [O que vai mudar + benefícios]

### Motivação

**POR QUÊ:** [1 frase clara do problema que resolve]

## Refinamento (30min)

### Aplicar 80/20

**80% do Valor (MANTER):** [Funcionalidades essenciais]
**20% do Esforço (CORTAR YAGNI):** [Nice-to-haves cortados]

### Decisões KISS

**COMPLEXO → SIMPLES:** [Simplificações aplicadas]

### Reutilização (DRY)

**MANTER:** [Código que não muda]
**SUBSTITUIR:** [Código reescrito]
**DELETAR:** [Código removido]

## Tasks (1h)

### Task 1: [Nome] ([X]h)

- **FAZER:** [Descrição clara]
- **ENTREGA:** [Arquivo específico]
- **RISCO:** [Baixo/Médio/Alto]
- **ROLLBACK:** [Como desfazer]

[Repetir para todas as tasks]

### Ordem de Execução

**Dia 1-2:** [Tasks de implementação]
**Dia 3-4:** [Tasks de integração]
**Dia 5:** [Deploy + cleanup]

## Validação

### Checklist Anti-Complexidade

- [ ] Menos de 1 semana total?
- [ ] Mais deleta do que cria?
- [ ] Rollback plan para cada step?
- [ ] Explica em 30 segundos?

### Teste do Elevador

"[Explicação em 30 segundos do que vai acontecer]"
```

---

## 🎯 **COMANDOS RELACIONADOS**

```bash
# Para análise de evolução multi-tenant:
/evolve-feature "feature-name" "objective"

# Para refinamento de tasks resultantes:
/exec-refine "task da evolução"

# Para implementação com org-awareness:
/exec-story "task 1 - backend com org filtering"
/exec-story "task 2 - frontend com useOrgContext"

# Para debug de problemas multi-tenant:
/exec-bug "problema de org isolation"
/exec-bug "cross-org data leakage"

# Para review validando multi-tenancy:
/exec-review "task completada"
```

---

## 🎯 **LEMBRETE FINAL MULTI-TENANT**

**O objetivo não é evoluir - é simplificar substituindo mantendo isolation.**

Se a evolução não resulta em:

- ✅ Menos código
- ✅ Menor complexidade
- ✅ Menos pontos de falha
- ✅ Mais fácil de manter
- ✅ **Multi-tenancy preservado/melhorado**
- ✅ **Zero data leakage risk**

Então algo está errado no plano!

**Corte. Simplifique. Delete. Isole.**
