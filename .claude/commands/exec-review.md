---
description: 'Quality gate final - valida implementações contra planos e critérios de aceite'
argument-hint: "story_id implementada (ex: '1.1', '2.3') - após exec-run"
allowed-tools: ['Read', 'LS', 'Bash', 'Grep', 'Glob']
---

# exec-review

**🚨 QUALITY GATE FINAL - Validador obrigatório de user stories implementadas com base nos planos gerados pelo exec-story.md. Garante 100% conformidade com especificações técnicas, critérios de aceite e padrões de qualidade antes da história ser marcada como CONCLUÍDA.**

**Entrada:**

- `story_id`: ID da história implementada (ex: "1.1", "2.3")
- **Pré-requisito OBRIGATÓRIO**: História deve ter plano em `docs/plans/[ID]-*.md` (gerado pelo exec-story)

**Saída:**

- **Status**: ✅ APROVADO | ⚠️ APROVADO COM RESSALVAS | ❌ REJEITADO
- **Relatório**: Validação detalhada implementação vs plano vs roadmap
- **Atualização**: Status da história atualizado no roadmap automaticamente

**Uso:**

```bash
/exec-review "1.1"
/exec-review "2.3"
```

**🔄 POSIÇÃO NO WORKFLOW OBRIGATÓRIO:**

```
exec-refine → exec-story → IMPLEMENTAÇÃO → exec-review → ✅ PRODUÇÃO
                ↓              ↓              ↓
        specs técnicas → plano detalhado → code review → quality gate
```

---

## 🧠 **PROCESSO DE REFLEXÃO OBRIGATÓRIO**

**🔗 REFERÊNCIA**: `@shared/thinking-framework.md#framework-4-etapas`

**TEMPLATE ESPECÍFICO PARA VALIDAÇÃO**:

```
🧠 VALIDANDO ANTES DE REVISAR...

✅ COMPREENSÃO: [História implementada + plano original + critérios de aceite]
✅ PRÉ-REQUISITOS: [Implementação + plano + critérios de aceite + tests]
✅ PLANO: [Compare → Test → Validate → Approve/Reject]
✅ VALIDAÇÃO: KISS ✓ COMPLETUDE ✓ QUALITY GATE ✓ 95% CERTEZA ✓

🚀 INICIANDO QUALITY GATE RIGOROSO...
```

**🔗 REFERÊNCIA**: `@shared/thinking-framework.md#decision-gates`

❌ **SE VALIDAÇÃO FALHAR**: Parar e reportar problemas
✅ **SE VALIDAÇÃO PASSAR**: Prosseguir com quality gate sistematizado

---

## 📋 **VALIDAÇÕES PRÉ-REQUISITOS**

**🔗 REFERÊNCIA**: `@shared/common-validations.md#leitura-obrigatória`

### **🚨 COMPLIANCE E ANÁLISE OBRIGATÓRIA**

- ✅ **Compliance**: CHANGELOG.md + RULES.md + migrations/README.md
- ✅ **Codebase**: Dependencies + Schema + Architecture + Tests
- ✅ **Environment**: Git + TypeScript + Services + Database
- ✅ **Red Flags**: Parar se qualquer bloqueador identificado

**🔗 REFERÊNCIA**: `@shared/common-validations.md#red-flags-críticos`

🛑 **PARAR IMEDIATAMENTE SE**: Environment inseguro ou plano ausente

---

## 🏗️ **CONTEXTO METODOLOGIA DEVSO DOCS V4.1**

### **Projeto**: Multi-Tenant SaaS System - Production Ready

- **Stack**: Next.js 14 + FastAPI + PostgreSQL + Railway
- **Arquitetura**: Clean Architecture + Header-Based Multi-Tenancy + i18n
- **Status**: ✅ PRODUCTION - 60+ endpoints live on Railway
- **Filosofia**: 95% de confiança + Organization Isolation + Anti-Scope Creep

### 🚨 **PRINCÍPIOS FUNDAMENTAIS - EXTREMAMENTE IMPORTANTES (NUNCA QUEBRAR)**

- **KISS (Keep It Simple, Stupid)**: **SEMPRE** escolher a solução mais simples que funciona
- **YAGNI (You Aren't Gonna Need It)**: **NUNCA** implementar funcionalidades "para o futuro"
- **DRY (Don't Repeat Yourself)**: **SEMPRE** reutilizar código existente antes de criar novo
- **⚠️ CRITICAL**: Quebrar estes princípios é considerado falha crítica

### **Complexidade Multi-Tenant**:

- **Threshold**: Até 8.0/10 (coordenação frontend+backend+org-isolation)
- **Abordagem**: Organization-centric review, clean architecture
- **Validação**: Review deve validar multi-tenancy e isolation

---

## 🔍 **PROCESSO DE REVIEW ESTRUTURADO EM 3 FASES**

### **🚨 FASE 0: VALIDAÇÃO OBRIGATÓRIA DO PLANO EXEC-STORY**

**REGRA ABSOLUTA: DEVE LER PLANO DO EXEC-STORY ANTES DE QUALQUER REVIEW**

#### **📁 LEITURA OBRIGATÓRIA - PLANO DE EXECUÇÃO**

**🔗 REFERÊNCIA**: `@shared/common-validations.md#análise-obrigatória-do-codebase`

- ✅ **DEVE**: `Read docs/plans/[ID]-*.md` - LER plano completo gerado pelo exec-story
- ✅ **DEVE**: `Read docs/project/11-roadmap.md` - LOCALIZAR história original no roadmap
- ✅ **DEVE**: `Bash git log --oneline -20` - VERIFICAR commits da implementação
- ✅ **DEVE**: `Bash git status` - ANALISAR estado atual do branch

#### **🔍 VALIDAÇÃO OBRIGATÓRIA - CONFORMIDADE PLANO vs IMPLEMENTAÇÃO**

- ✅ **DEVE**: Comparar arquivos criados vs especificados no plano
- ✅ **DEVE**: Verificar dependencies instaladas vs plano
- ✅ **DEVE**: Validar testes executados conforme plano
- ✅ **DEVE**: Executar `npm run typecheck` - conforme plano

### **FASE 1: COMPARAÇÃO PLANO vs IMPLEMENTAÇÃO**

1. **Comparar arquivos criados** vs especificados no plano exec-story
2. **Validar bibliotecas instaladas** vs dependencies do plano
3. **Verificar estrutura de código** vs padrões definidos no plano
4. **Comparar commits realizados** vs timeline estimado no plano

### **FASE 2: VALIDAÇÃO TÉCNICA OBRIGATÓRIA - CONFORME PLANO**

1. **🚨 EXECUTAR TESTES ESPECIFICADOS NO PLANO** - Bloqueador crítico se falhar
2. **Verificar comandos do plano** - Todos devem passar conforme especificado
3. **Validar testes e2e de isolation** - Obrigatórios conforme plano
4. **Confirmar build** - Sem warnings, conforme critérios do plano

### **FASE 3: QUALITY GATE FINAL**

1. **Comparar resultado final** vs plano completo exec-story
2. **Decidir status** baseado na conformidade: ✅/⚠️/❌
3. **Gerar relatório comparativo** implementação vs plano
4. **Marcar história como APROVADA** no roadmap apenas se 100% conforme

---

## ✅ **CHECKLIST DE REVIEW DETALHADO**

### **🚨 1. VERIFICAÇÃO DE CONFORMIDADE COM PLANO EXEC-STORY**

- [ ] Implementação seguiu os steps exatos especificados no plano?
- [ ] Arquivos criados coincidem 100% com os especificados no plano?
- [ ] Bibliotecas instaladas são exatamente as definidas no plano?
- [ ] Estrutura de código segue padrões definidos no plano?
- [ ] Timeline real está dentro da estimativa do plano (+/- 30%)?
- [ ] Testes e2e foram implementados conforme especificado no plano?

### **2. VALIDAÇÃO TRIPLA DOS CRITÉRIOS DE ACEITE**

**🔍 VALIDAÇÃO ROADMAP → PLANO → IMPLEMENTAÇÃO**

**Critérios no Roadmap Original:**

```yaml
- [ ] [Critério 1 original do roadmap]
- [ ] [Critério 2 original do roadmap]
- [ ] [Critério 3 original do roadmap]
```

**Critérios Preservados no Plano:**

```yaml
- [ ] [Critério 1 - PRESERVADO no plano? SIM/NÃO]
- [ ] [Critério 2 - PRESERVADO no plano? SIM/NÃO]
- [ ] [Critério 3 - PRESERVADO no plano? SIM/NÃO]
```

**Critérios Implementados:**

```yaml
- [ ] [Critério 1 - IMPLEMENTADO? SIM/NÃO/PARCIAL]
- [ ] [Critério 2 - IMPLEMENTADO? SIM/NÃO/PARCIAL]
- [ ] [Critério 3 - IMPLEMENTADO? SIM/NÃO/PARCIAL]
```

### **3. CONFORMIDADE COM REGRAS DO PROJETO**

#### **📌 PRINCÍPIOS FUNDAMENTAIS METODOLOGIA V4.1**

- [ ] **95% DE CLAREZA**: Implementação clara e sem ambiguidades
- [ ] **VERTICAL SLICE**: Implementação end-to-end funcional (UI + API + DB)
- [ ] **ANTI-SCOPE CREEP**: Nenhuma funcionalidade além do especificado
- [ ] **OBJETIVIDADE**: Critérios mensuráveis e verificáveis atendidos

#### **📌 Qualidade de Código**

- [ ] Nenhum `any` no TypeScript (verificar com type-check)
- [ ] Nenhum arquivo > 300 linhas (verificar com wc -l)
- [ ] Nenhuma função > 30 linhas (review manual)
- [ ] Sem `console.log` ou código comentado (grep search)
- [ ] Segue estrutura: `app/`, `components/`, `lib/`, `api/`

#### **📌 Multi-Tenancy Compliance**

- [ ] organization_id FK em todos os models novos
- [ ] X-Org-Id header validation em endpoints protegidos
- [ ] useOrgContext + BaseService usado no frontend
- [ ] Testes de organization isolation passando

### **4. VALIDAÇÃO TÉCNICA OBRIGATÓRIA**

#### **⚠️ TESTES UNITÁRIOS - BLOQUEADOR CRÍTICO**

**NENHUMA HISTÓRIA PODE SER APROVADA SEM TESTES UNITÁRIOS PASSANDO**

```bash
# 🚨 TESTES - OBRIGATÓRIOS
npm run test           # [ ] PASSOU - Todos os testes unitários
npm run typecheck      # [ ] PASSOU - Sem erros TypeScript
npm run lint           # [ ] PASSOU - Sem warnings
npm run build          # [ ] PASSOU - Build sucedeu
```

---

## 📊 **CONCLUSÃO DO REVIEW**

### **📈 STATUS FINAL - QUALITY GATE**

- [ ] **✅ APROVADO** — Implementação 100% conforme plano exec-story + todos testes passam
- [ ] **⚠️ APROVADO COM RESSALVAS** — Funciona + testes passam + pequenos desvios do plano
- [ ] **❌ REJEITADO** — Implementação não segue plano OU testes críticos falham

### **🎯 RESUMO EXECUTIVO - CONFORMIDADE PLANO vs IMPLEMENTAÇÃO**

**🚨 Conformidade com Plano Exec-Story:** [X/Y] ✅
**Critérios Roadmap → Plano → Implementação:** [X/Y] ✅  
**Steps do Plano Seguidos:** [X/Y] ✅
**Arquivos Conforme Plano:** [X/Y] ✅
**Testes E2E Conforme Plano:** [PASSOU/FALHOU] ✅/❌
**Timeline vs Planejado:** [Dentro/Fora] da estimativa ✅/❌

### **✅ PONTOS FORTES DA IMPLEMENTAÇÃO vs PLANO**

```
1. [Steps do plano que foram seguidos perfeitamente]
2. [Arquivos criados exatamente conforme especificação do plano]
3. [Padrões técnicos do plano implementados corretamente]
```

### **⚠️ DESVIOS DO PLANO IDENTIFICADOS**

```
Minor (aceitáveis com justificativa):
- [Pequenas adaptações que melhoraram o resultado]

Major (devem ser corrigidos ou justificados):
- [Arquivos não especificados no plano que foram criados]
- [Steps do plano que foram pulados sem justificativa]
```

### **❌ BLOQUEADORES CRÍTICOS** (impedem aprovação)

```
1. 🚨 PLANO EXEC-STORY NÃO ENCONTRADO (bloqueador automático)
2. 🚨 TESTES E2E DO PLANO NÃO PASSAM (bloqueador automático)
3. 🚨 CRITÉRIOS DO ROADMAP REMOVIDOS NO PLANO (falha crítica)
4. 🚨 IMPLEMENTAÇÃO IGNORA COMPLETAMENTE O PLANO (rejeição automática)
```

---

## 🚀 **AÇÕES PÓS-REVIEW**

### **Se ✅ APROVADO (100% conforme plano):**

```bash
# 1. Marcar história como APROVADA no roadmap
# Atualizar docs/project/11-roadmap.md: Status → ✅ APROVADO ([DD/MM/YYYY])

# 2. Documentar conformidade com plano
# Adicionar nota: "Implementação seguiu 100% o plano docs/plans/[ID]-*.md"

# 3. Preparar para produção
git checkout main
git merge [branch-da-historia]
```

### **Se ❌ REJEITADO (não conforme plano):**

```yaml
# 1. Feedback específico baseado na não-conformidade com plano
Plano Original: docs/plans/[ID]-*.md
Problemas de Conformidade:
  - Steps não seguidos: [Lista detalhada]
  - Arquivos divergentes: [O que foi criado vs especificado]
  - Testes falhou: [Comandos específicos que falharam]

# 2. Ações corretivas obrigatórias
ANTES DE NOVO REVIEW:
  - [ ] Seguir exatamente os steps do plano docs/plans/[ID]-*.md
  - [ ] Criar apenas os arquivos especificados no plano
  - [ ] Executar testes e2e conforme especificado no plano
```

---

## 🎯 **LEMBRETE FINAL**

**O review é para:**

- ✅ **🚨 GARANTIR TESTES PASSAM** (prioridade #1)
- ✅ Garantir qualidade e conformidade
- ✅ Manter padrões do DevSolo Docs
- ✅ Prevenir bugs e problemas futuros
- ✅ Facilitar manutenção por dev solo

**Critérios finais inegociáveis:**

1. **🚨 "Todos os testes unitários passam?"**
2. **"Implementação seguiu 100% o plano do exec-story?"**
3. **"Um dev solo consegue manter isso facilmente?"**

---

**🎉 EXEC-REVIEW: QUALITY GATE COM 100% COMPLIANCE GARANTIDO**

Este agente garante que **APENAS implementações** que seguem **100% o plano do exec-story** e **passam em todos os testes** são aprovadas para produção, mantendo **quality standards** e **predictability** do sistema.
