# exec-refine

**Refina user stories seguindo metodologia DevSolo Docs V4.1**

**Argumentos:**

- `story`: Texto completo da user story para refinar

**Uso:**

```bash
/exec-refine "Como usuário eu quero um sistema completo de relatórios"
/exec-refine "Implementar dashboard de analytics robusto e escalável"
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
- **Abordagem**: Organization-centric development, clean architecture
- **Validação**: Cada story deve manter multi-tenancy e entregar valor org-scoped

---

## 🎯 **PRINCÍPIOS FUNDAMENTAIS DA METODOLOGIA**

### **1. REGRA DE 95% DE CLAREZA**

- **NUNCA** refinar story sem 95% de certeza sobre valor e implementação
- **SEMPRE** questionar ambiguidades até resolução completa
- **SEMPRE** confirmar entendimento antes de quebrar/simplificar
- **NUNCA** assumir contexto ou requisitos não explícitos

### **2. VERTICAL SLICE VALIDATION**

- **SEMPRE** garantir que story entrega valor completo (UI + API + DB)
- **NUNCA** histórias que implementam apenas uma camada
- **SEMPRE** validar que slice funciona independentemente
- **SEMPRE** testar fluxo end-to-end após implementação

### **3. ANTI-SCOPE CREEP**

- **NUNCA** adicionar funcionalidades durante refinamento
- **SEMPRE** focar APENAS no valor mínimo necessário
- **NUNCA** "já que estamos fazendo isso" - cada story é independente
- **SEMPRE** documentar ideias extras para backlog futuro

### **4. OBJETIVIDADE OBRIGATÓRIA**

- **SEMPRE** usar critérios objetivos da DEFINICOES_OBJETIVAS.md
- **NUNCA** usar termos subjetivos como "melhor", "robusto", "escalável"
- **SEMPRE** usar escala 1-10 para avaliar complexidade e valor
- **SEMPRE** aplicar thresholds: >= 7 crítico, 5-6 médio, <= 4 baixo

---

## 📋 **REGRAS INEGOCIÁVEIS DE REFINAMENTO - METODOLOGIA V4.1**

### **1. VERTICAL SLICE Obrigatório**

- **NUNCA** story que não entrega valor completo ao usuário
- **NUNCA** implementação apenas horizontal (só UI, só API, só DB)
- **SEMPRE** atravessar Frontend → API → Business Logic → Database
- **SEMPRE** testável end-to-end pelo usuário final
- **SEMPRE** deployável independentemente

### **2. SIMPLICIDADE FORÇADA - Next.js Stack**

- **NUNCA** story > 5 pontos (máximo 80h = 2 semanas)
- **NUNCA** múltiplas funcionalidades em uma story
- **NUNCA** linguagem vaga ("sistema robusto", "flexível", "escalável")
- **SEMPRE** solução mais simples que funciona
- **SEMPRE** aproveitar Next.js App Router + shadcn/ui

### **3. VALIDAÇÃO RÁPIDA - DevSolo Docs**

- **NUNCA** stories com feedback > 14 dias (1 sprint)
- **NUNCA** perfectionism antes da validação
- **SEMPRE** critérios de aceite testáveis em 1-2 dias
- **SEMPRE** falha rápida se não atende critérios objetivos

### **4. INTEGRAÇÃO REAL - Stack Completa**

- **NUNCA** stories que precisam de mocks para funcionar
- **NUNCA** simular APIs externas na story (usar real)
- **SEMPRE** integração real com Stripe, Prisma, Supabase
- **SOMENTE** mocks em testes unitários (.test.ts)

---

## 🧠 **FASE 1: ANÁLISE CRÍTICA DA STORY - METODOLOGIA V4.1**

### **ETAPA 1: DETECÇÃO DE RED FLAGS**

**Story fornecida para análise:**
$ARGUMENTS

#### **🚨 Red Flags Automáticos - DevSolo Docs:**

- [ ] **Palavras anti-clareza**: "robusto", "escalável", "flexível", "completo", "framework"
- [ ] **Escopo aberto**: "sistema de", "plataforma de", "módulo de"
- [ ] **Múltiplas funcionalidades**: múltiplos "E" nos critérios
- [ ] **Linguagem vaga**: "todos os casos", "diferentes tipos"
- [ ] **Mock dependency**: "simular", "mockear", "stub"

#### **⚠️ Sinais Anti-VERTICAL SLICE:**

- [ ] **Só uma camada**: apenas UI, apenas API, apenas DB
- [ ] **Sem valor end-to-end**: usuário não consegue usar
- [ ] **Dependência de outras stories**: não funciona sozinha
- [ ] **Setup/configuração apenas**: sem funcionalidade real

#### **⚠️ Sinais Anti-Metodologia V4.1:**

- [ ] **Estimativa > 14 dias**: muito grande para sprint completo
- [ ] **Critérios vagos**: não testável imediatamente
- [ ] **Múltiplas validações**: tentativa de fazer muita coisa
- [ ] **Violação 95% clareza**: ambiguidades não resolvidas

### **ETAPA 2: ANÁLISE DE VERTICAL SLICE (Obrigatória)**

#### **Validação End-to-End - VERTICAL SLICE:**

```
CAMADAS OBRIGATÓRIAS (todas devem estar presentes):
□ Frontend/UI: [Interface específica que usuário interage]
□ Backend/API: [Endpoint específico que recebe requests]
□ Business Logic: [Regra específica processada]
□ Persistência: [Dados específicos salvos/lidos]
□ Integração: [Fluxo completo funcionando]

VALOR ENTREGUE AO USUÁRIO:
□ Usuário consegue executar ação completa
□ Resultado visível e utilizável
□ Não depende de outras stories
□ Deployável independentemente

ANTI-PADRÕES VERTICAL SLICE (REJEITADOS):
□ Apenas setup/configuração (horizontal)
□ Apenas refatoração técnica (horizontal)
□ Apenas uma camada (horizontal)
□ Apenas research/spike (não entrega valor)
□ Requer mock para funcionar (não é real)
```

### **ETAPA 3: ANÁLISE KISS + FAIL-FAST**

#### **Questões Eliminatórias KISS:**

1. **MVP Real**: Qual a solução MAIS SIMPLES que funciona?
2. **Hardcode First**: Posso começar com valores fixos/hardcoded?
3. **Anti-Abstração**: Preciso realmente de patterns complexos?
4. **50% Rule**: Como fazer em metade do tempo com metade da complexidade?

#### **Questões Eliminatórias FAIL-FAST:**

1. **Teste Imediato**: Usuário consegue testar em máximo 1 dia?
2. **Feedback Rápido**: Consigo saber se funciona em 24h?
3. **Falha Clara**: Se der erro, vai falhar rapidamente com mensagem clara?
4. **Validação Cedo**: Posso validar critérios antes de implementar tudo?

---

## 🔪 **FASE 2: ESTRATÉGIAS DE REFINAMENTO**

### **DECISÃO 1: AÇÃO NECESSÁRIA**

#### **✅ Story Aprovada (≤ 5 pontos)**

```yaml
Critérios Atendidos:
  - Escopo específico e claro
  - Valor mensurável definido
  - Implementação vertical
  - Estimativa realista
  - Critérios testáveis

Ação: Melhorar critérios de aceite e Definition of Done
```

#### **⚡ Story para Simplificação KISS**

```yaml
Problemas Identificados:
  - Linguagem de over-engineering
  - Múltiplas funcionalidades
  - Abstrações desnecessárias
  - "Preparação para futuro"

Ação: Aplicar técnicas de simplificação
```

#### **🔪 Story para Quebra Vertical**

```yaml
Complexidade Detectada:
  - Múltiplos fluxos de usuário
  - Diferentes conjuntos de dados
  - Várias interfaces/telas
  - Estimativa > 8 pontos

Ação: Quebrar em stories menores mantendo verticalidade
```

### **DECISÃO 2: TÉCNICAS ESPECÍFICAS**

#### **Para Simplificação KISS:**

**Técnica 1: Eliminar Abstrações**

```
❌ ANTES: "Sistema flexível de notificações"
✅ DEPOIS: "Envio de email simples para usuário"

❌ ANTES: "Framework de relatórios customizável"
✅ DEPOIS: "Relatório fixo de vendas mensais"
```

**Técnica 2: Hardcode First**

```
❌ ANTES: "Configuração dinâmica de dashboards"
✅ DEPOIS: "Dashboard fixo com 3 métricas básicas"

❌ ANTES: "Sistema de templates flexível"
✅ DEPOIS: "Template único de email"
```

**Técnica 3: MVP Forçado**

```
❌ ANTES: "Carrinho completo com múltiplas opções"
✅ DEPOIS: "Adicionar/remover item do carrinho"

❌ ANTES: "Sistema de autenticação robusto"
✅ DEPOIS: "Login com email/senha básico"
```

#### **Para Quebra Vertical:**

**Padrão 1: Por Cenário de Uso**

```
Epic: Gerenciar Usuários

Story 1: Visualizar lista de usuários
- GET /api/users
- Tabela simples
- Paginação básica

Story 2: Criar usuário básico
- POST /api/users
- Form mínimo (nome, email)
- Validação simples

Story 3: Editar dados do usuário
- PUT /api/users/:id
- Form de edição
- Update em tempo real
```

**Padrão 2: Por Progressive Enhancement**

```
Epic: Sistema de Busca

Story 1: Busca simples por texto
- Input básico
- LIKE no banco
- Lista de resultados

Story 2: Busca com filtro por categoria
- Dropdown de categorias
- Filtro funcional
- Resultados filtrados

Story 3: Busca com ordenação
- Botões de ordenação
- Sort no backend
- UI de feedback
```

**Padrão 3: Por Dados/Entidades**

```
Epic: Dashboard de Métricas

Story 1: Métrica de usuários ativos
- Query específica
- Card visual simples
- Número grande e claro

Story 2: Métrica de vendas mensais
- Query de vendas
- Gráfico básico
- Período fixo (30 dias)

Story 3: Métrica de conversão
- Cálculo simples
- Percentual visual
- Tooltip explicativo
```

---

## 🎯 **FASE 3: RESULTADO DO REFINAMENTO**

### **TEMPLATE DE STORY REFINADA**

#### **Para Stories Aprovadas (Melhoradas):**

```markdown
## História: [Título Específico e Claro]

**Como** [persona específica]
**Eu quero** [ação específica e mensurável]
**Para que** [valor específico e claro]

### 🎯 Valor de Negócio

- **Impacto**: [Métrica específica que melhora]
- **Usuário**: [Quem se beneficia exatamente]
- **Urgência**: [Por que fazer agora]

### 📋 Critérios de Aceite Específicos

**Cenário 1: Happy Path**

- **Dado que** [contexto específico e testável]
- **Quando** [ação específica do usuário]
- **Então** [resultado específico e observável]

**Cenário 2: [Caso Edge Importante]**

- **Dado que** [contexto de erro/edge case]
- **Quando** [ação que gera o caso]
- **Então** [comportamento esperado específico]

### 🏗️ Implementação Vertical Mínima

**Camadas Envolvidas:**

- **UI**: [Componente/página específica]
- **API**: [Endpoint específico - método e rota]
- **Logic**: [Regra de negócio específica]
- **Data**: [Tabela/modelo específico]

**Arquivos Estimados:**

- `components/[nome-especifico].tsx`
- `app/api/[endpoint-especifico]/route.ts`
- `lib/[logica-especifica].ts`

### ⚡ Implementação KISS

**Decisões de Simplicidade:**

- **Hardcode inicial**: [O que pode ser fixo primeiro]
- **Sem abstrações**: [O que NÃO vai ser genérico]
- **MVP apenas**: [O que fica fora desta versão]

### ✅ Definition of Done Específica

**Funcional:**

- [ ] [Critério específico 1]
- [ ] [Critério específico 2]
- [ ] [Critério específico 3]

**Técnico:**

- [ ] Testes unitários > 80% cobertura
- [ ] Performance < 500ms
- [ ] TypeScript strict sem erros
- [ ] Mobile responsivo

### 📊 Estimativa Final

- **Story Points**: [1, 2, 3, ou 5 apenas]
- **Tempo**: [1-5 dias máximo]
- **Confiança**: [Alta = bem definida, Média = algumas dúvidas]
- **Riscos**: [Lista específica de possíveis problemas]
```

#### **Para Stories Quebradas:**

```markdown
## Epic Original: [Título do Epic]

**Problema**: Story muito complexa (estimativa original: X pontos)
**Solução**: Quebra em Y stories verticais menores

### Story 1: [Título Específico] - [2-3 pontos]

**Como** [persona]
**Eu quero** [funcionalidade mínima 1]
**Para que** [valor específico 1]

**Implementação**:

- [Lista específica do que inclui]
- [End-to-end mínimo funcional]

### Story 2: [Título Específico] - [2-3 pontos]

**Como** [persona]
**Eu quero** [funcionalidade mínima 2]
**Para que** [valor específico 2]

**Implementação**:

- [Lista específica do que inclui]
- [Builds sobre Story 1]

### Story 3: [Título Específico] - [2-3 pontos]

**Como** [persona]
**Eu quero** [funcionalidade mínima 3]
**Para que** [valor específico 3]

**Implementação**:

- [Lista específica do que inclui]
- [Completa a funcionalidade desejada]

### 🔗 Ordem de Implementação:

1. **Story 1**: Base funcional (walking skeleton)
2. **Story 2**: Incremento de valor
3. **Story 3**: Funcionalidade completa

### 📊 Resultado da Quebra:

- **Antes**: 1 story de X pontos (Y dias)
- **Depois**: 3 stories de 2-3 pontos cada (2-3 dias cada)
- **Benefício**: Entrega incremental + feedback mais rápido
```

---

## ✅ **VALIDAÇÃO FINAL DE QUALIDADE**

### **Checklist Obrigatório:**

#### **📏 Tamanho e Complexidade:**

- [ ] **≤ 5 pontos** por story (máximo 5 dias)
- [ ] **Uma funcionalidade principal** por story
- [ ] **Escopo específico** sem ambiguidade
- [ ] **Estimativa confiável** (alta confiança)

#### **🎯 Clareza e Valor:**

- [ ] **Persona específica** (não genérica)
- [ ] **Ação mensurável** (não vaga)
- [ ] **Valor claro** (usuário entende o porquê)
- [ ] **Critérios testáveis** (sem interpretação)

#### **🏗️ Vertical Slice:**

- [ ] **End-to-end completo** (UI + API + Data)
- [ ] **Valor independente** (funciona sozinha)
- [ ] **Demonstrável** (usuário pode testar)
- [ ] **Deployável** (pode ir para produção)

#### **⚡ Princípios KISS:**

- [ ] **Solução mais simples** escolhida
- [ ] **Sem over-engineering** detectado
- [ ] **Hardcode quando apropriado**
- [ ] **Abstrações mínimas** necessárias

#### **🚀 Implementação Prática:**

- [ ] **Arquivos específicos** identificados
- [ ] **APIs específicas** definidas
- [ ] **Testes específicos** planejados
- [ ] **Dependências mínimas**

---

## 🎯 **RESULTADO FINAL**

### **Stories Refinadas:**

[Apresentar a(s) story(ies) refinada(s) seguindo o template acima]

### **Métricas de Sucesso:**

- **Velocity**: Stories menores = entrega mais rápida
- **Quality**: Escopo claro = menos bugs e retrabalho
- **Predictability**: Estimativas mais precisas
- **Value**: Feedback e validação mais rápidos

### **Próximos Passos:**

1. **Review com PO**: Validar valor e prioridade
2. **Planning**: Estimar definitivamente
3. **Sprint**: Adicionar ao backlog da sprint
4. **Implementação**: Usar `/project:exec-storie` para execução

---

## 🛠 **COMANDOS RELACIONADOS**

```bash
# Para análise específica de complexidade:
/project:refinement:complexity [story]

# Para quebra de stories grandes:
/project:refinement:split [story]

# Para aplicar KISS a stories:
/project:refinement:kiss [story]

# Para validar vertical slice:
/project:refinement:vertical-slice [story]

# Após refinamento, para implementar:
/project:exec-storie [story-refinada]
```

---

## 📚 **EXEMPLOS PRÁTICOS**

### **Exemplo 1: Story Over-Engineered**

**❌ ANTES:**

```
"Como usuário eu quero um sistema robusto e escalável de
notificações que suporte múltiplos canais (email, SMS, push)
com templates customizáveis e sistema de retry inteligente"
```

**✅ DEPOIS (KISS aplicado):**

```
História: Envio de email de boas-vindas

Como novo usuário
Eu quero receber email de boas-vindas após cadastro
Para que eu saiba que minha conta foi criada com sucesso

Implementação KISS:
- Template fixo de email
- Trigger automático no signup
- SMTP simples
- Sem retry (por enquanto)
```

### **Exemplo 2: Story Muito Grande**

**❌ ANTES:**

```
"Como admin eu quero gerenciar usuários completo com CRUD,
permissões, grupos, auditoria e relatórios"
Estimativa: 15 pontos
```

**✅ DEPOIS (Quebra Vertical):**

```
Story 1: Listar usuários básico (3 pontos)
- GET /api/users
- Tabela simples
- Paginação básica

Story 2: Criar usuário (2 pontos)
- POST /api/users
- Form nome/email
- Validação básica

Story 3: Editar usuário (3 pontos)
- PUT /api/users/:id
- Form de edição
- Update em tempo real

Story 4: Desativar usuário (2 pontos)
- PATCH /api/users/:id/disable
- Soft delete
- Confirmação
```

### **Exemplo 3: Story Horizontal**

**❌ ANTES:**

```
"Criar API de produtos"
(apenas backend, sem valor para usuário)
```

**✅ DEPOIS (Vertical Slice):**

```
História: Visualizar produtos na loja

Como cliente
Eu quero ver lista de produtos disponíveis
Para que eu possa escolher o que comprar

Implementação Vertical:
- UI: Página /produtos com grid
- API: GET /api/products
- Data: Tabela products básica
- End-to-end: Cliente vê produtos reais
```
