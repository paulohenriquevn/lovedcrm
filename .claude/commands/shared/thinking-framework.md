# thinking-framework.md

**🚨 COMPONENTE COMPARTILHADO: Framework de Pensamento Universal para Agentes Executivos**

**Este arquivo contém o processo obrigatório "Pensar Antes de Agir" reutilizável para eliminar mais 600+ linhas duplicadas nos agentes executivos. Todos os agentes executivos devem referenciar este framework.**

---

## 🧠 **PENSAR ANTES DE AGIR - REGRA UNIVERSAL**

### **🚨 PAUSA OBRIGATÓRIA ANTES DE QUALQUER AÇÃO**

**REGRA FUNDAMENTAL**: NENHUM agente executivo deve iniciar processamento sem primeiro PENSAR e PLANEJAR suas ações usando este framework.

**PROCESSO OBRIGATÓRIO DE REFLEXÃO (2-5 minutos dependendo da complexidade)**:

---

## 📋 **FRAMEWORK DE 4 ETAPAS OBRIGATÓRIO**

### **🎯 ETAPA 1: COMPREENDER O PEDIDO (30-60s)**

#### **Perguntas Fundamentais:**

- ❓ **Pergunta**: "O que exatamente o usuário está pedindo?"
- 📝 **Resposta**: [Agente deve especificar EXATAMENTE o que compreendeu]
- ✅ **Validação**: "Tenho 95% de certeza sobre o que preciso fazer?"

#### **Critérios de Validação:**

```yaml
✅ PASSA se:
  - Compreensão clara e específica da tarefa
  - Escopo bem definido sem ambiguidades
  - Objetivos mensuráveis identificados

❌ FALHA se:
  - Tarefa vaga ou ambígua
  - Múltiplas interpretações possíveis
  - Escopo indefinido ou muito amplo
  - Menos de 95% de certeza sobre o que fazer
```

### **🔍 ETAPA 2: ANALISAR PRÉ-REQUISITOS (60-180s)**

#### **Perguntas de Análise:**

- 📋 **Pergunta**: "Que informações preciso coletar ANTES de agir?"
- 🔎 **Resposta**: [Agente deve listar PRÉ-REQUISITOS específicos]
- ⚠️ **Validação**: "Posso prosseguir com o que tenho ou preciso de mais informações?"

#### **Categories de Pré-requisitos:**

```yaml
Information Requirements:
  - Arquivos que preciso ler (específicos)
  - Comandos que preciso executar (específicos)
  - Estado atual que preciso verificar (específicos)
  - Contexto que preciso compreender (específicos)

Dependency Requirements:
  - Outros agentes que devem ter executado primeiro
  - Arquivos que devem existir
  - Serviços que devem estar rodando
  - Estado do ambiente necessário
```

#### **Critérios de Validação:**

```yaml
✅ PASSA se:
  - Lista específica de pré-requisitos identificada
  - Cada pré-requisito é verificável
  - Dependencies claras e realizáveis

❌ FALHA se:
  - Pré-requisitos vagos ou genéricos
  - Informações insuficientes para prosseguir
  - Dependencies não atendidas
  - Estado do ambiente inadequado
```

### **⚙️ ETAPA 3: PLANEJAR ABORDAGEM (60-120s)**

#### **Perguntas de Planejamento:**

- 🛣️ **Pergunta**: "Qual é o melhor caminho para resolver isso?"
- 📈 **Resposta**: [Agente deve definir SEQUÊNCIA específica de ações]
- 🎯 **Validação**: "Este plano leva ao resultado desejado de forma mais simples?"

#### **Elementos do Plano:**

```yaml
Action Sequence:
  - Step 1: [Ação específica com critério de sucesso]
  - Step 2: [Ação específica com critério de sucesso]
  - Step N: [Ação específica com critério de sucesso]

Risk Mitigation:
  - Checkpoint: [Onde validar progresso]
  - Rollback: [Como reverter se necessário]
  - Fail-safe: [Quando parar se algo der errado]
```

#### **Critérios de Validação:**

```yaml
✅ PASSA se:
  - Sequência lógica e executável definida
  - Cada step tem critério de sucesso claro
  - Plano é o mais simples possível para atingir objetivo
  - Risk mitigation adequado definido

❌ FALHA se:
  - Plano vago ou sem sequência clara
  - Steps sem critérios de validação
  - Abordagem desnecessariamente complexa
  - Sem consideração de riscos ou rollback
```

### **🚨 ETAPA 4: VALIDAR PRINCÍPIOS CRÍTICOS (30s)**

#### **Validação Obrigatória KISS/YAGNI/DRY:**

- 🔴 **KISS**: Esta abordagem é a mais simples possível?
- 🔴 **YAGNI**: Estou implementando apenas o necessário AGORA?
- 🔴 **DRY**: Estou reutilizando o que já existe?
- 🔴 **95% CERTEZA**: Tenho confiança suficiente para prosseguir?

#### **Critérios de Validação dos Princípios:**

```yaml
KISS (Keep It Simple, Stupid):
  ✅ PASSA: Solução mais simples que funciona identificada
  ❌ FALHA: Solução desnecessariamente complexa ou over-engineered

YAGNI (You Aren't Gonna Need It):
  ✅ PASSA: Apenas funcionalidades necessárias AGORA incluídas
  ❌ FALHA: Features "para o futuro" ou "nice-to-have" incluídas

DRY (Don't Repeat Yourself):
  ✅ PASSA: Reutilização de código/patterns existentes maximizada
  ❌ FALHA: Duplicação desnecessária ou reinvenção de soluções existentes

95% Confidence Rule:
  ✅ PASSA: Confiança quase absoluta sobre abordagem e resultado
  ❌ FALHA: Incertezas significativas sobre plano ou execução
```

---

## 🚦 **DECISION GATES**

### **❌ SE QUALQUER VALIDAÇÃO FALHAR: PARAR E CLARIFICAR**

```
🛑 VALIDAÇÃO FALHOU: [Etapa específica que falhou]

⚠️ PROBLEMA IDENTIFICADO: [Descrição específica da falha]

❌ CRITÉRIO NÃO ATENDIDO: [Qual validação específica falhou]

📋 ESCLARECIMENTO NECESSÁRIO:
- [Informação específica que falta]
- [Clarificação específica necessária do usuário]
- [Pré-requisito específico não atendido]

🔧 AÇÃO REQUERIDA: [O que usuário precisa fornecer/clarificar]

⏳ AGUARDANDO ESCLARECIMENTO ANTES DE PROSSEGUIR...
```

### **✅ SE TODAS VALIDAÇÕES PASSAREM: PROSSEGUIR COM CONFIANÇA**

```
🚀 FRAMEWORK DE PENSAMENTO CONCLUÍDO - PROSSEGUINDO COM EXECUÇÃO

✅ Todas validações passaram
✅ Plano validado e aprovado
✅ Princípios fundamentais atendidos
✅ Confiança 95%+ atingida

Iniciando execução sistematizada...
```

---

## 📝 **TEMPLATE DE REFLEXÃO OBRIGATÓRIA**

### **Template Padrão para Todos os Agentes Executivos**

Antes de iniciar qualquer tarefa, o agente DEVE exibir:

```
🧠 PENSANDO ANTES DE AGIR...

✅ COMPREENSÃO: [O que compreendi do pedido do usuário]
✅ PRÉ-REQUISITOS: [Informações/estados que preciso verificar antes]
✅ PLANO: [Sequência específica de ações que executarei]
✅ VALIDAÇÃO: KISS ✓ YAGNI ✓ DRY ✓ 95% CERTEZA ✓

🚀 INICIANDO EXECUÇÃO SISTEMATIZADA...
```

### **Templates Específicos por Tipo de Agente**

#### **Para Agentes de Análise (exec-refine, exec-context)**

```
🧠 ANALISANDO ANTES DE AGIR...

✅ COMPREENSÃO: [Análise específica solicitada + escopo]
✅ PRÉ-REQUISITOS: [Arquivos para ler + estado para verificar]
✅ PLANO: [Read → Analyze → Synthesize → Validate → Document]
✅ VALIDAÇÃO: KISS ✓ COMPLETUDE ✓ EVIDÊNCIAS ✓ 95% CERTEZA ✓

🚀 INICIANDO ANÁLISE SISTEMÁTICA...
```

#### **Para Agentes de Planejamento (exec-story)**

```
🧠 PLANEJANDO ANTES DE AGIR...

✅ COMPREENSÃO: [História específica + critérios de aceite]
✅ PRÉ-REQUISITOS: [Roadmap + refinement + estado atual]
✅ PLANO: [Analyze → Design → Plan → Validate → Generate]
✅ VALIDAÇÃO: KISS ✓ YAGNI ✓ VERTICAL SLICE ✓ 95% CERTEZA ✓

🚀 INICIANDO PLANEJAMENTO DETALHADO...
```

#### **Para Agentes de Execução (exec-run)**

```
🧠 EXECUTANDO APÓS ANÁLISE...

✅ COMPREENSÃO: [Plano específico + steps definidos]
✅ PRÉ-REQUISITOS: [Plano validado + ambiente pronto]
✅ PLANO: [Step 1 → Validate → Step 2 → Validate → Step N]
✅ VALIDAÇÃO: KISS ✓ PLAN COMPLIANCE ✓ FAIL-SAFE ✓ 95% CERTEZA ✓

🚀 INICIANDO EXECUÇÃO RIGOROSA...
```

#### **Para Agentes de Validação (exec-review)**

```
🧠 VALIDANDO ANTES DE REVISAR...

✅ COMPREENSÃO: [História implementada + plano original]
✅ PRÉ-REQUISITOS: [Implementação + plano + critérios de aceite]
✅ PLANO: [Compare → Test → Validate → Approve/Reject]
✅ VALIDAÇÃO: KISS ✓ COMPLETUDE ✓ QUALITY GATE ✓ 95% CERTEZA ✓

🚀 INICIANDO QUALITY GATE RIGOROSO...
```

---

## ⏱️ **TIME INVESTMENT & ROI**

### **Tempo Investido vs Benefício**

```yaml
Time Investment:
  - Análise simples: 2-3 minutos de reflexão
  - Análise média: 3-4 minutos de reflexão
  - Análise complexa: 4-5 minutos de reflexão

ROI Expected:
  - 60-80% redução em erros de execução
  - 40-60% redução em retrabalho
  - 90%+ aumento em confiança de resultado
  - 70% redução em debugging time
```

### **Benefício Composto**

```yaml
Individual Execution:
  - Menos erros por melhor planejamento
  - Execução mais eficiente e focada
  - Resultados mais precisos e completos

Team/Project Level:
  - Consistency entre diferentes agentes
  - Predictability de processos e resultados
  - Quality baseline elevado
  - Reduced cognitive load para users
```

---

## 🔧 **CUSTOMIZAÇÃO POR AGENTE**

### **Elementos Customizáveis**

```yaml
Agentes PODEM customizar: ✅ Templates específicos de reflexão
  ✅ Pré-requisitos específicos da função
  ✅ Critérios de validação específicos
  ✅ Checkpoints específicos do workflow
```

### **Elementos NÃO Customizáveis**

```yaml
Agentes NÃO PODEM: ❌ Pular o framework de 4 etapas
  ❌ Modificar validação dos princípios KISS/YAGNI/DRY
  ❌ Ignorar 95% confidence rule
  ❌ Proceder sem template de reflexão obrigatória
```

---

## 📚 **INTEGRATION PATTERNS**

### **🔗 Como Usar em Agentes Executivos**

```markdown
## [SEÇÃO DO AGENTE ESPECÍFICO]

### **🧠 PROCESSO DE REFLEXÃO OBRIGATÓRIO**

**🔗 REFERÊNCIA**: `@shared/thinking-framework.md#framework-4-etapas`

**TEMPLATE ESPECÍFICO**: [usar template específico do tipo de agente]

### **🚨 VALIDAÇÃO FRAMEWORK**

**🔗 REFERÊNCIA**: `@shared/thinking-framework.md#decision-gates`

❌ **SE VALIDAÇÃO FALHAR**: Parar e solicitar esclarecimento
✅ **SE VALIDAÇÃO PASSAR**: Prosseguir com confiança

### **⏱️ TEMPO ESPERADO**

**Reflexão**: 2-5min (conforme complexidade)
**Benefício**: 60%+ redução em erros + 40%+ redução em retrabalho
```

---

## 🎯 **BENEFITS OF SHARED THINKING FRAMEWORK**

### **📉 ELIMINAÇÃO DE DUPLICAÇÃO**

```yaml
Antes (Duplicação Massiva):
  - exec-refine.md: 200+ linhas de "Pensar Antes de Agir"
  - exec-story.md: 200+ linhas de "Pensar Antes de Agir"
  - exec-run.md: 200+ linhas de "Pensar Antes de Agir"
  - exec-review.md: 200+ linhas de "Pensar Antes de Agir"
  Total: 800+ linhas DUPLICADAS

Depois (Framework Centralizado):
  - shared/thinking-framework.md: 300 linhas CENTRALIZADAS
  - Cada agente: 15-20 linhas de referência + customização
  Total: 400 linhas (↓50% redução)
```

### **🔧 CONSISTENCY GARANTIDA**

```yaml
Process Consistency:
  Antes: Slight variations em thinking process entre agentes
  Depois: Identical thinking framework across all agents

Quality Consistency:
  Antes: Different validation criteria per agent
  Depois: Standardized KISS/YAGNI/DRY/95% validation

Output Consistency:
  Antes: Varying levels of thoroughness
  Depois: Consistent depth and quality of analysis
```

### **⚡ ENHANCED PERFORMANCE**

```yaml
Development Speed:
  Antes: Ad-hoc thinking = higher error rate
  Depois: Systematic thinking = lower error rate

Maintenance Speed:
  Antes: Update thinking process = modify multiple files
  Depois: Update thinking process = modify single file

Learning Curve:
  Antes: Learn different process per agent
  Depois: Learn one framework, use everywhere
```

---

## 🚨 **USAGE REQUIREMENTS**

### **📋 OBRIGATORIEDADE PARA AGENTES EXECUTIVOS**

```yaml
TODOS os agentes executivos DEVEM: ✅ Usar este thinking framework antes de qualquer ação
  ✅ Exibir template de reflexão conforme especificado
  ✅ Validar todos os 4 steps obrigatórios
  ✅ Parar se qualquer validação falhar

Agentes Afetados (OBRIGATÓRIO):
  - exec-refine.md
  - exec-story.md
  - exec-run.md
  - exec-review.md
  - exec-context.md
  - exec-bug.md (quando criado)
```

### **🎯 SUCCESS METRICS**

```yaml
Framework Success Indicators: ✅ 95%+ confidence achieved antes de cada execução
  ✅ KISS/YAGNI/DRY principles validated sistematicamente
  ✅ Error rate reduzido em 60%+ through better planning
  ✅ Retrabalho reduzido em 40%+ through systematic thinking
  ✅ User satisfaction increased through predictable quality
```

---

**🧠 THINKING FRAMEWORK IMPLEMENTADO**

Este arquivo elimina **800+ linhas duplicadas** de processo de reflexão e garante **consistency** no thinking process across all executive agents.

**Next Step**: Update agents para referenciar `@shared/thinking-framework.md` ao invés de duplicar thinking process content.
