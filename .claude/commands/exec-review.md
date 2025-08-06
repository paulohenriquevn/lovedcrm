# exec-review

**Realiza review estruturado de user stories implementadas seguindo metodologia DevSolo Docs V4.1**

**Argumentos:**

- `story`: ID da história a ser revisada (ex: 1.1, 2.3) ou descrição específica

**Uso:**

```bash
/exec-review 1.1
/exec-review "História 2.3: Validação precoce com beta testers"
```

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

### **Estado Atual do Review**

```yaml
História Analisada: [Extrair do argumento fornecido]
Branch Atual: [Verificar git branch]
Última Implementação: [Consultar commits recentes]
Arquivo Stories: docs/roadmap.md
```

---

## 📋 **REGRAS CRÍTICAS DE REVIEW - METODOLOGIA V4.1**

Estas regras são **INEGOCIÁVEIS** para aprovar uma história:

### **1. PRINCÍPIOS FUNDAMENTAIS DA METODOLOGIA**

- **95% DE CLAREZA**: **NUNCA** aprovar implementação ambígua ou mal definida
- **VERTICAL SLICE**: **NUNCA** aprovar implementação apenas horizontal
- **ANTI-SCOPE CREEP**: **NUNCA** aprovar se expandiu além do solicitado
- **OBJETIVIDADE**: **NUNCA** aprovar sem critérios mensuráveis atendidos

### **2. Conformidade de Escopo DevSolo Docs**

- **NUNCA** aprovar se implementou além do solicitado
- **NUNCA** aprovar se funcionalidades de outros agentes foram incluídas
- **SEMPRE** validar que apenas os critérios de aceite foram atendidos
- **SEMPRE** verificar se manteve a simplicidade (KISS)

### **3. Padrões de Código Next.js Stack**

- **NUNCA** aceitar `any` no TypeScript
- **NUNCA** aceitar arquivos > 300 linhas
- **NUNCA** aceitar funções > 30 linhas
- **NUNCA** aceitar console.logs ou código comentado
- **SEMPRE** validar uso correto do Prisma (sem SQL raw)
- **SEMPRE** usar shadcn/ui components quando possível

### **4. Segurança SaaS**

- **NUNCA** aprovar se expõe secrets ou APIs keys
- **NUNCA** aprovar sem validação de userId em queries
- **NUNCA** aprovar sem respeitar limites do plano do usuário
- **SEMPRE** verificar rate limiting onde aplicável

### **5. UI/UX Consistente**

- **SEMPRE** validar uso apenas de Tailwind CSS + shadcn/ui
- **SEMPRE** verificar dark mode implementado
- **SEMPRE** verificar loading states implementados
- **NUNCA** aprovar com bloqueios > 100ms

---

## 🔍 **PROCESSO DE REVIEW ESTRUTURADO EM FASES**

### **FASE 1: LOCALIZAR E ANALISAR A HISTÓRIA**

1. **Buscar no user-stories.md** pela história solicitada
2. **Extrair critérios de aceite** completos
3. **Validar dependências** com outras histórias
4. **Verificar sprint** e contexto da implementação

### **FASE 2: VALIDAÇÃO TÉCNICA OBRIGATÓRIA**

1. **🚨 EXECUTAR TESTES** - Bloqueador crítico se falhar
2. **Verificar comandos** - Todos devem passar sem erro
3. **Validar arquivos de teste** - Cobertura adequada
4. **Confirmar build** - Sem warnings ou erros

### **FASE 3: VALIDAÇÃO DE QUALIDADE E SEGURANÇA**

1. **Revisar código** - Padrões DevSolo Docs
2. **Verificar segurança** - Sem exposição de dados
3. **Validar performance** - Sem degradação
4. **Testar funcionalidades** - Casos principais e edge cases

### **FASE 4: APROVAÇÃO FINAL**

1. **Confirmar critérios 100%** atendidos
2. **Validar Definition of Done** completa
3. **Documentar conclusões** do review
4. **Decidir status** final (Aprovado/Ressalvas/Rejeitado)

### **IDENTIFICAÇÃO DA HISTÓRIA**

```yaml
ID: [Extrair do user-stories.md]
Título: [Título completo da história]
Sprint: [Sprint associada]
Épico: [Nome do Épico]
Pontos: [Story points atribuídos]
Implementador: [Verificar commits git]
Data: [Data da implementação]
```

---

## ✅ **CHECKLIST DE REVIEW DETALHADO**

### **1. VERIFICAÇÃO DE ESCOPO**

- [ ] A história implementada cobre apenas o que foi descrito nos critérios?
- [ ] Evita qualquer funcionalidade que pertença a outros agentes?
- [ ] Mantém-se fiel ao escopo sem adicionar complexidade extra?
- [ ] Não extrapola para funcionalidades de outras histórias?
- [ ] Segue a filosofia KISS do projeto?

**🔍 Análise de Escopo:**

```
✅ Implementado corretamente:
- [Listar funcionalidades que estão no escopo]

❌ Fora do escopo (se houver):
- [Listar funcionalidades extras que não deveriam estar]

⚠️ Gaps identificados:
- [Listar critérios não atendidos]
```

### **2. VALIDAÇÃO DOS CRITÉRIOS DE ACEITE**

**Critérios Originais da História:**

```yaml
# [Copiar exatamente do user-stories.md]
Critérios de Aceite:
- [ ] [Critério 1 - verificar se foi implementado]
- [ ] [Critério 2 - verificar se foi implementado]
- [ ] [Critério 3 - verificar se foi implementado]
```

**Status dos Critérios:**

- ✅ **Atendidos**: [X de Y critérios]
- ❌ **Não atendidos**: [Listar quais]
- ⚠️ **Parcialmente atendidos**: [Listar quais + o que falta]

### **3. CONFORMIDADE COM REGRAS DO PROJETO**

#### **📌 PRINCÍPIOS FUNDAMENTAIS METODOLOGIA V4.1 (Verificação Obrigatória)**

- [ ] **95% DE CLAREZA**: Implementação clara e sem ambiguidades
- [ ] **VERTICAL SLICE**: Implementação end-to-end funcional (UI + API + DB)
- [ ] **ANTI-SCOPE CREEP**: Nenhuma funcionalidade além do especificado
- [ ] **OBJETIVIDADE**: Critérios mensuráveis e verificáveis atendidos

#### **📌 Qualidade de Código**

- [ ] Nenhum `any` no TypeScript (verificar com type-check)
- [ ] Nenhum arquivo > 300 linhas (verificar com wc -l)
- [ ] Nenhuma função > 30 linhas (review manual)
- [ ] Sem `console.log` ou código comentado (grep search)
- [ ] Usa apenas `Prisma` para queries de DB (sem SQL raw)
- [ ] Segue estrutura: `app/`, `components/`, `lib/`, `api/`

#### **📌 UI/UX Padrões - shadcn/ui**

- [ ] Tailwind CSS + shadcn/ui apenas (sem CSS customizado)
- [ ] Dark mode implementado corretamente
- [ ] Loading states implementados onde necessário
- [ ] Feedback visual presente em ações do usuário
- [ ] Sem bloqueios > 100ms (teste manual)
- [ ] Responsivo (mobile + desktop)

#### **📌 Segurança SaaS**

- [ ] Sem exposição de secrets (grep por API keys)
- [ ] Verifica `userId` em todas as queries sensíveis
- [ ] Plano do usuário respeitado (free vs pro limits)
- [ ] Rate limiting implementado onde aplicável
- [ ] Validação de input do usuário presente

#### **📌 Integração Claude/IA** (se aplicável)

- [ ] Usa Claude Haiku apenas (não Sonnet - controle de custos)
- [ ] Implementa rate limiting adequado
- [ ] Faz contagem de tokens usados
- [ ] Timeout de 30s configurado
- [ ] Error handling para falhas da API

### **4. TESTES DE QUALIDADE**

#### **Testes Funcionais**

- [ ] Happy path testado manualmente 3x
- [ ] Edge cases principais testados
- [ ] Casos de erro tratados adequadamente
- [ ] Mobile e desktop funcionam corretamente
- [ ] Cross-browser: Chrome, Firefox, Safari
- [ ] Validação com dados reais (quando aplicável)

#### **Performance e Estabilidade**

- [ ] Resposta < 500ms (timing no DevTools)
- [ ] Queries otimizadas (sem problemas N+1)
- [ ] Sem degradação de performance anterior
- [ ] Memory leaks verificados (se componente complexo)
- [ ] Build passa sem warnings

### **5. VALIDAÇÃO TÉCNICA OBRIGATÓRIA**

#### **⚠️ TESTES UNITÁRIOS - BLOQUEADOR CRÍTICO**

**NENHUMA HISTÓRIA PODE SER APROVADA SEM TESTES UNITÁRIOS PASSANDO**

- [ ] **🚨 TODOS OS TESTES UNITÁRIOS PASSANDO** (execução obrigatória)
- [ ] **Cobertura mínima atingida** (funcionalidades principais 100%)
- [ ] **Estratégia de testes adequada** baseada no tipo de história:

**Para Autenticação/API Routes:**

- [ ] Testa endpoints principais e validação de dados
- [ ] Testa tratamento de erros e middlewares de segurança
- [ ] Testa casos de falha (email duplicado, senha inválida)

**Para Components/UI:**

- [ ] Testa renderização e estados (loading/error/success)
- [ ] Testa interações básicas e validação de formulários

**Para Integrações (IA, Stripe, etc.):**

- [ ] Testa chamadas com mocks das APIs externas
- [ ] Testa tratamento de timeouts/falhas e rate limiting

**Para Business Logic/Utils:**

- [ ] Testa casos de sucesso, falha e edge cases
- [ ] Testa cálculos e transformações de dados

#### **Comandos de Verificação Executados (TODOS OBRIGATÓRIOS)**

```bash
# 🚨 TESTES - OBRIGATÓRIOS
npm run test           # [ ] PASSOU - Todos os testes unitários
npm run test:coverage  # [ ] PASSOU - Cobertura mínima atingida

# Verificar código
npm run type-check  # [ ] PASSOU - Sem erros TypeScript
npm run lint        # [ ] PASSOU - Sem warnings
npm run build       # [ ] PASSOU - Build sucedeu

# Verificar banco (se aplicável)
npx prisma generate  # [ ] PASSOU - Types atualizados
npx prisma db push   # [ ] PASSOU - Schema sincronizado

# Verificar aplicação
npm run dev         # [ ] PASSOU - Servidor inicia sem erros
```

#### **Arquivos de Teste Obrigatórios Verificados**

- [ ] Arquivos `.test.ts/.test.tsx` existem para funcionalidades implementadas
- [ ] Testes cobrem casos principais da história
- [ ] Mocks adequados para dependências externas

### **6. DEBUGABILIDADE E MANUTENÇÃO**

- [ ] Estrutura de arquivos facilita debugging futuro?
- [ ] Logs úteis implementados (sem console.log em produção)?
- [ ] Errors são tratados e categorizáveis?
- [ ] Código é legível para um dev solo manter?
- [ ] Documentação inline adequada (quando lógica complexa)?

---

## 📊 **CONCLUSÃO DO REVIEW**

### **📈 STATUS FINAL**

- [ ] **✅ APROVADO** — História está completa, todos os testes passam, conforme padrões
- [ ] **⚠️ APROVADO COM RESSALVAS** — Funciona, testes passam, mas tem melhorias menores
- [ ] **❌ REJEITADO** — Não atende requisitos críticos OU testes não passam

### **🎯 RESUMO EXECUTIVO**

**Critérios Atendidos:** [X/Y] ✅
**Conformidade com Padrões:** [X/Y] ✅  
**Qualidade Técnica:** [X/Y] ✅
**🚨 Testes Unitários:** [PASSOU/FALHOU] ✅/❌
**Segurança:** [X/Y] ✅

### **✅ PONTOS FORTES DA IMPLEMENTAÇÃO**

```
1. [Destacar o que foi muito bem feito]
2. [Aspectos técnicos bem implementados]
3. [Boa aderência aos padrões do projeto]
```

### **⚠️ MELHORIAS RECOMENDADAS**

```
Minor (pode ser tratado em próxima história):
- [Ajustes menores de UX]
- [Otimizações de performance]

Major (deve ser corrigido antes de aprovar):
- [Violações de segurança]
- [Critérios não atendidos]
```

### **❌ BLOQUEADORES CRÍTICOS** (se houver)

```
1. 🚨 TESTES UNITÁRIOS NÃO PASSAM (bloqueador automático)
2. [Problemas de segurança ou breaking changes]
3. [Critérios obrigatórios não atendidos]
4. [Riscos de regressão identificados]
```

---

## 🚀 **AÇÕES PÓS-REVIEW**

### **Se APROVADO:**

```bash
# 1. Marcar história como concluída
# Atualizar user-stories.md: ❌ → ✅

# 2. Preparar para merge (se aplicável)
git checkout main
git merge [branch-da-historia]

# 3. Documentar lições aprendidas
# [Adicionar insights para próximas histórias]
```

### **Se REJEITADO:**

```yaml
# 1. Feedback específico para o implementador
Problemas: [Lista detalhada - incluir falhas de teste específicas]
Testes que falharam: [Comandos e outputs dos erros]
Sugestões: [Como corrigir cada problema]
Prazo: [Timeframe para correções]

# 2. Criar plano de correção
Prioridade: [P0 se testes falham, P1/P2 baseado na criticidade]
Esforço estimado: [Story points para correção]
Bloqueador: [Testes obrigatórios devem passar antes de novo review]
```

---

## 📝 **DOCUMENTAÇÃO DO REVIEW**

### **Histórico de Reviews** (manter no projeto)

```yaml
História X.X:
  Data: [Data do review]
  Status: [Aprovado/Rejeitado/Ressalvas]
  Reviewer: [Quem fez o review]
  Principais issues: [Lista resumida]
  Tempo de review: [Tempo investido]
```

### **Métricas de Qualidade**

- **Taxa de aprovação**: [Histórias aprovadas/total]
- **Principais gaps**: [Padrões mais violados]
- **Tempo médio de correção**: [Para histórias rejeitadas]

---

## 🎯 **LEMBRETE FINAL**

**O review é para:**

- ✅ **🚨 GARANTIR TESTES PASSAM** (prioridade #1)
- ✅ Garantir qualidade e conformidade
- ✅ Manter padrões do DevSolo Docs
- ✅ Prevenir bugs e problemas futuros
- ✅ Facilitar manutenção por dev solo

**O review NÃO é para:**

- ❌ Criticar escolhas de implementação válidas
- ❌ Impor preferências pessoais de código
- ❌ Bloquear por perfeccionismo excessivo
- ❌ Adicionar complexidade desnecessária

**Critérios finais inegociáveis:**

1. **🚨 "Todos os testes unitários passam?"**
2. **"Um dev solo consegue manter isso facilmente?"**
