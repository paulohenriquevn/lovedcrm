# common-validations.md

**🚨 COMPONENTE COMPARTILHADO: Validações Comuns para Todos os Agentes Executivos**

**Este arquivo contém validações reutilizáveis para eliminar 1200+ linhas duplicadas nos agentes executivos. Todos os agentes devem referenciar este arquivo em vez de duplicar validações.**

---

## 📋 **LEITURA OBRIGATÓRIA ANTES DE QUALQUER EXECUÇÃO**

### **🚨 COMPLIANCE E DOCUMENTAÇÃO FUNDAMENTAL (OBRIGATÓRIO)**

```yaml
Arquivos de Compliance (TODOS OS AGENTES EXECUTIVOS DEVEM LER):
  ✅ CHANGELOG.md:
    - ANALISAR histórico completo de implementações do projeto
    - IDENTIFICAR padrões de desenvolvimento estabelecidos
    - VALIDAR contexto de mudanças recentes

  ✅ RULES.md:
    - CONFIRMAR compliance com regras críticas do template
    - VALIDAR 95% confidence rule implementation
    - VERIFICAR multi-tenancy patterns obrigatórios

  ✅ migrations/README.md:
    - ENTENDER sistema de migrações: ./migrate apply, seeds, etc.
    - VALIDAR schema consolidado v001 patterns
    - CONFIRMAR ambiente de seeds por environment
```

---

## 🔍 **ANÁLISE OBRIGATÓRIA DO CODEBASE ATUAL**

### **📊 DEPENDÊNCIAS E VERSÕES (CRITICAL PATH)**

```yaml
Backend Dependencies (requirements.txt):
  ✅ **DEVE**: Read requirements.txt
    - MAPEAR versões REAIS: FastAPI, SQLAlchemy, etc.
    - IDENTIFICAR bibliotecas críticas para multi-tenancy
    - VALIDAR compatibilidade de versões

Frontend Dependencies (package.json):
  ✅ **DEVE**: Read package.json
    - MAPEAR versões REAIS: Next.js, React, shadcn/ui, etc.
    - IDENTIFICAR dependências para organization context
    - VALIDAR setup de development tools
```

### **🗄️ DATABASE E SCHEMA ANALYSIS (CRITICAL PATH)**

```yaml
Schema State Validation:
  ✅ **DEVE**: Bash "cd migrations && ./migrate status"
    - VERIFICAR versão atual do schema vs target
    - IDENTIFICAR pending migrations que podem bloquear
    - VALIDAR database health antes de modificações

Schema Structure Understanding:
  ✅ **DEVE**: Read migrations/001_consolidated_schema.sql (parcial)
    - MAPEAR tabelas principais: organizations, users, crm_leads
    - VALIDAR organization_id FK patterns em todas tabelas
    - CONFIRMAR multi-tenant isolation structure
```

### **🏗️ ARQUITETURA BACKEND MAPPING (CRITICAL PATH)**

```yaml
Backend Structure Analysis:
  ✅ **DEVE**: LS api/models/
    - CATALOGAR todos models .py REAIS existentes
    - IDENTIFICAR patterns de organization_id implementation
    - MAPEAR relacionamentos críticos para multi-tenancy

  ✅ **DEVE**: LS api/services/
    - CATALOGAR services existentes REAIS
    - IDENTIFICAR patterns de business logic organization
    - VALIDAR separation of concerns implementation

  ✅ **DEVE**: LS api/routers/
    - CATALOGAR endpoints existentes REAIS
    - IDENTIFICAR patterns de API organization
    - VALIDAR organization middleware application
```

### **🎨 ARQUITETURA FRONTEND MAPPING (CRITICAL PATH)**

```yaml
Frontend Structure Analysis:
  ✅ **DEVE**: LS components/ui/
    - CATALOGAR componentes shadcn/ui REAIS disponíveis
    - IDENTIFICAR component patterns estabelecidos
    - VALIDAR design system compliance

  ✅ **DEVE**: LS app/[locale]/admin/
    - MAPEAR estrutura de rotas admin REAIS
    - IDENTIFICAR organization-scoped routes patterns
    - VALIDAR multi-tenant frontend organization
```

### **🧪 TESTING INFRASTRUCTURE ANALYSIS**

```yaml
Testing Coverage Mapping:
  ✅ **DEVE**: LS tests/e2e/api/
    - CATALOGAR testes e2e multi-tenant REAIS
    - IDENTIFICAR test patterns para organization isolation
    - VALIDAR coverage de security scenarios críticos
```

---

## 🚨 **VALIDAÇÕES OBRIGATÓRIAS DE ESTADO**

### **🔴 ENVIRONMENT HEALTH CHECK (BLOQUEADORES CRÍTICOS)**

```yaml
Git Repository State:
  ✅ **DEVE**: Bash "git status"
    - VERIFICAR working directory clean ou apenas arquivos não-críticos
    - IDENTIFICAR potential merge conflicts
    - VALIDAR branch state adequado para changes

TypeScript/Build Health:
  ✅ **DEVE**: Bash "npm run typecheck"
    - VERIFICAR zero erros TypeScript antes de modificações
    - IDENTIFICAR type issues que podem bloquear implementação
    - VALIDAR build stability baseline

Testing Baseline:
  ✅ **DEVE**: Execução seletiva baseada no tipo de mudança:
    - Para mudanças backend: `python3 -m pytest tests/unit/ -q`
    - Para mudanças frontend: `npm run test -- --run`
    - Para mudanças multi-tenant: `python3 -m pytest tests/e2e/ -k "isolation"`
```

---

## ⚠️ **RED FLAGS CRÍTICOS - PARAR IMEDIATAMENTE**

### **🛑 SITUAÇÕES QUE EXIGEM PAUSA OBRIGATÓRIA**

#### **🔴 RED FLAGS DE CODEBASE CORRUPTION**

```yaml
File System Issues: ❌ requirements.txt ou package.json corrompidos/ausentes
  ❌ migrations/001_consolidated_schema.sql ilegível/corrompido
  ❌ CHANGELOG.md ou RULES.md ausentes (compliance blocker)
  ❌ api/models/, api/services/, api/routers/ directories ausentes

Git Repository Issues: ❌ git status showing merge conflicts em arquivos críticos
  ❌ Unstaged changes em arquivos core (models, services, migrations)
  ❌ Branch state inconsistente ou detached HEAD
```

#### **🔴 RED FLAGS DE ENVIRONMENT BREAKDOWN**

```yaml
Dependency Issues: ❌ npm run typecheck failing com erros críticos
  ❌ python3 -c "import api.main" failing (backend import errors)
  ❌ ./migrate status failing ou showing critical errors
  ❌ Database connection errors ou schema version conflicts

Service Issues: ❌ Backend/Frontend services não inicializando
  ❌ Critical tests failing no baseline (organization isolation tests)
  ❌ Build processes failing with blocking errors
```

#### **🔴 RED FLAGS DE MULTI-TENANCY VIOLATIONS**

```yaml
Organization Isolation Risks: ❌ Models sem organization_id FK identification
  ❌ API endpoints sem organization middleware patterns
  ❌ Frontend sem useOrgContext/BaseService patterns
  ❌ Database queries sem organization filtering evidence
  ❌ Cross-org data access patterns identified em existing code
```

#### **🔴 RED FLAGS DE COMPLIANCE VIOLATIONS**

```yaml
Template Compliance Issues: ❌ RULES.md violations em existing codebase (95% confidence broken)
  ❌ Multi-tenancy patterns não implementados consistently
  ❌ Security vulnerabilities identificadas em analysis
  ❌ Performance degradation evidence em existing implementation
```

### **⚡ AÇÃO IMEDIATA QUANDO RED FLAG DETECTADO**

```
🚨 RED FLAG CRÍTICO DETECTADO: [Tipo específico identificado]

⚠️ EXECUÇÃO BLOQUEADA: [Descrição específica do problema encontrado]

🛑 ENVIRONMENT INSEGURO - PAUSANDO IMEDIATAMENTE

📋 PROBLEMAS CRÍTICOS IDENTIFICADOS:
- [Problema específico 1]: [Impacto detalhado]
- [Problema específico 2]: [Consequência identificada]
- [Problema específico N]: [Risco catalogado]

🔧 RESOLUÇÃO OBRIGATÓRIA ANTES DE CONTINUAR:
- [Ação específica 1 para resolver problema]
- [Ação específica 2 para validar correção]
- [Validação final necessária para confirmar segurança]

⏳ AGUARDANDO RESOLUÇÃO COMPLETA DOS RED FLAGS...

📞 ESCALAR PARA: Review manual se red flags persistirem após correção
```

---

## ✅ **VALIDATION CHECKPOINTS PADRONIZADOS**

### **📋 CHECKLIST DE VALIDAÇÃO PRE-EXECUÇÃO**

```yaml
Compliance Validation (OBRIGATÓRIO): □ CHANGELOG.md lido e contexto compreendido
  □ RULES.md compliance validado (95% confidence + multi-tenancy)
  □ migrations/README.md patterns compreendidos
  □ tests/e2e/api/ coverage mapeado para organization isolation

Codebase Analysis (OBRIGATÓRIO): □ requirements.txt + package.json versions mapeadas
  □ ./migrate status executado e schema state validado
  □ api/models/ + api/services/ + api/routers/ catalogados
  □ components/ui/ + app/[locale]/admin/ mapeados

Environment Health (OBRIGATÓRIO): □ git status clean ou apenas non-critical files modified
  □ npm run typecheck passing (zero TypeScript errors)
  □ Baseline tests relevant para mudança passing
  □ Database connectivity e schema consistency confirmed

Multi-Tenancy Validation (CRITICAL): □ Organization isolation patterns identificados e validados
  □ X-Org-Id middleware patterns confirmed em existing code
  □ organization_id FK patterns validated em all relevant models
  □ useOrgContext + BaseService patterns confirmed em frontend
```

---

## 🎯 **SUCCESS CRITERIA TEMPLATES**

### **📊 VALIDATION EVIDENCE REQUIREMENTS**

```yaml
Evidence-Based Validation (TODOS OS AGENTES):

  File Reading Evidence:
    ✅ CHANGELOG.md: [COLAR 3-5 linhas das implementações recentes]
    ✅ requirements.txt: [COLAR principais dependencies com versões]
    ✅ package.json: [COLAR principais dependencies frontend]
    ✅ ./migrate status: [COLAR output do comando]

  Architecture Mapping Evidence:
    ✅ api/models/: [LISTAR arquivos .py encontrados]
    ✅ api/services/: [LISTAR services implementados]
    ✅ components/ui/: [LISTAR componentes shadcn/ui disponíveis]
    ✅ app/[locale]/admin/: [LISTAR estrutura de rotas admin]

  Health Check Evidence:
    ✅ git status: [COLAR status output]
    ✅ npm run typecheck: [CONFIRMAR zero errors ou COLAR errors]
    ✅ Relevant tests: [COLAR test results baseados no tipo de mudança]

❌ FALHA CRÍTICA se qualquer validação não tiver EVIDÊNCIA REAL de execução
```

---

## 🔧 **ROLLBACK E RECOVERY PROCEDURES**

### **🚨 EMERGENCY ROLLBACK COMMANDS**

```bash
# Git-based rollback (para file changes)
git checkout .                    # Discard unstaged changes
git reset --hard HEAD~1          # Rollback last commit (if committed)

# Database rollback (para schema changes)
cd migrations && ./migrate rollback 1  # Rollback 1 migration

# Service recovery (para service corruption)
pkill -f "node.*next" && pkill -f "uvicorn"  # Kill corrupted services
npm run dev                       # Restart development environment

# Dependency recovery (para dependency issues)
rm -rf node_modules package-lock.json && npm install  # Frontend deps
pip install --force-reinstall -r requirements.txt    # Backend deps
```

### **📋 ROLLBACK VALIDATION CHECKLIST**

```yaml
Post-Rollback Validation: □ git status showing clean working directory
  □ ./migrate status showing expected schema version
  □ npm run typecheck passing após rollback
  □ Baseline tests passing após recovery
  □ Services inicializando normally após restart
  □ Database connectivity restored
  □ Multi-tenancy isolation maintained
```

---

## 📚 **INTEGRATION PATTERNS**

### **🔗 COMO USAR EM AGENTES EXECUTIVOS**

```markdown
## [SEÇÃO DO AGENTE]

### **📋 VALIDAÇÕES PRÉ-REQUISITOS**

**🔗 REFERÊNCIA**: `@shared/common-validations.md#leitura-obrigatória`

- ✅ **Compliance Check**: CHANGELOG.md + RULES.md + migrations/README.md
- ✅ **Codebase Analysis**: Dependencies + Schema + Architecture mapping
- ✅ **Environment Health**: Git + TypeScript + Database + Testing baseline
- ✅ **Multi-Tenancy**: Organization patterns validation

### **🚨 VALIDAÇÃO CRÍTICA**

**🔗 REFERÊNCIA**: `@shared/common-validations.md#red-flags-críticos`

❌ **PARAR IMEDIATAMENTE SE**: Qualquer red flag identificado
✅ **PROSSEGUIR APENAS SE**: Todos checkpoints validados com evidências

### **📊 EVIDENCE REQUIREMENTS**

**🔗 REFERÊNCIA**: `@shared/common-validations.md#validation-evidence-requirements`

[Agente deve colar evidências REAIS conforme template]
```

---

## 🎯 **BENEFITS OF SHARED VALIDATIONS**

### **📉 ELIMINAÇÃO DE DUPLICAÇÃO**

```yaml
Antes (Duplicação Massiva):
  - exec-refine.md: 300+ linhas de validações
  - exec-story.md: 400+ linhas de validações
  - exec-run.md: 350+ linhas de validações
  - exec-review.md: 250+ linhas de validações
  Total: 1200+ linhas DUPLICADAS

Depois (Referência Centralizada):
  - shared/common-validations.md: 350 linhas CENTRALIZADAS
  - Cada agente: 10-15 linhas de referência
  Total: 400 linhas (↓67% redução)
```

### **🔧 MANUTENÇÃO SIMPLIFICADA**

```yaml
Update Process:
  Antes: Mudança em validação = update em 4-6 arquivos
  Depois: Mudança em validação = update em 1 arquivo apenas

Consistency:
  Antes: Risk de inconsistências entre agentes
  Depois: Guaranteed consistency via shared reference

Testing:
  Antes: Validate consistency across multiple files
  Depois: Single source of truth testing
```

### **⚡ PERFORMANCE MELHORADA**

```yaml
Execution Time:
  Antes: 10-15min de validações redundantes por agente
  Depois: 3-5min de validações otimizadas e centralizadas

Cognitive Load:
  Antes: Developer precisa entender validações em cada agente
  Depois: Single comprehensive validation reference

Error Reduction:
  Antes: Multiple places para validation errors occur
  Depois: Centralized validation = centralized error handling
```

---

## 🚨 **USAGE REQUIREMENTS**

### **📋 OBRIGATORIEDADE PARA AGENTES EXECUTIVOS**

```yaml
TODOS os agentes executivos DEVEM: ✅ Referenciar @shared/common-validations.md
  ❌ NUNCA duplicar validações que existem neste arquivo
  ✅ Seguir templates de evidência definidos aqui
  ✅ Usar red flags e rollback procedures padronizados

Agentes Afetados (OBRIGATÓRIO):
  - exec-refine.md
  - exec-story.md
  - exec-run.md
  - exec-review.md
  - exec-context.md
  - exec-bug.md (quando criado)
```

### **🔧 CUSTOMIZAÇÃO PERMITIDA**

```yaml
Agentes PODEM adicionar: ✅ Validações específicas únicas para sua função
  ✅ Checkpoints adicionais específicos do workflow
  ✅ Success criteria específicos do output esperado

Agentes NÃO PODEM: ❌ Duplicar validações que existem neste shared file
  ❌ Modificar red flags ou rollback procedures padrão
  ❌ Ignorar compliance checks fundamentais
```

---

**🎉 SHARED VALIDATIONS IMPLEMENTADO**

Este arquivo elimina **1200+ linhas duplicadas** e centraliza **validações críticas** para manutenção simplificada e consistency garantida across all executive agents.

**Next Step**: Update agents to reference `@shared/common-validations.md` instead of duplicating validation content.
