# exec-review

**🚨 QUALITY GATE FINAL - Validador obrigatório de user stories implementadas com base nos planos gerados pelo exec-story.md. Garante 100% conformidade com especificações técnicas, critérios de aceite e padrões de qualidade antes da história ser marcada como CONCLUÍDA.**

**Entrada:**
- `story_id`: ID da história implementada (ex: "1.1", "2.3")
- **Pré-requisito OBRIGATÓRIO**: História deve ter plano em `docs/plans/[ID]-*.md` (gerado pelo exec-story)

**Saída:** 
- Relatório detalhado: ✅ APROVADO | ⚠️ APROVADO COM RESSALVAS | ❌ REJEITADO
- Validação completa: Implementação vs Plano vs Roadmap
- Quality gate automático: Só aprova se 100% conforme especificações

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

## 🧠 **PENSAR ANTES DE AGIR - REGRA UNIVERSAL**

### **🚨 PAUSA OBRIGATÓRIA ANTES DE QUALQUER AÇÃO**

**REGRA FUNDAMENTAL**: Este agente NUNCA deve iniciar qualquer processamento sem primeiro PENSAR e PLANEJAR suas ações.

**PROCESSO OBRIGATÓRIO DE REFLEXÃO (2-3 minutos)**:

#### **🎯 ETAPA 1: COMPREENDER O PEDIDO (30s)**
- ❓ **Pergunta**: "O que exatamente o usuário está pedindo?"
- 📝 **Resposta**: [Quality gate final: validar implementação vs plano do exec-story]
- ✅ **Validação**: "Tenho 95% de certeza sobre o que preciso fazer?"

#### **🔍 ETAPA 2: ANALISAR PRÉ-REQUISITOS (60s)**
- 📋 **Pergunta**: "Que informações preciso coletar ANTES de agir?"
- 🔎 **Resposta**: [Plano exec-story, roadmap, implementação atual, testes executados]
- ⚠️ **Validação**: "Posso prosseguir com o que tenho ou preciso de mais informações?"

#### **⚙️ ETAPA 3: PLANEJAR ABORDAGEM (60s)**
- 🛣️ **Pergunta**: "Qual é o melhor caminho para resolver isso?"
- 📈 **Resposta**: [Ler plano -> verificar implementação -> validar conformidade -> aprovar/rejeitar]
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

✅ COMPREENSÃO: [ID história -> quality gate final vs plano exec-story]
✅ PRÉ-REQUISITOS: [Plano docs/plans/, roadmap, implementação, testes]
✅ PLANO: [Ler plano -> verificar código -> validar conformidade -> aprovar/rejeitar]
✅ VALIDAÇÃO: KISS ✓ YAGNI ✓ DRY ✓ 95% CERTEZA ✓

🚀 INICIANDO QUALITY GATE COM CONFIANÇA...
```

**TEMPO INVESTIDO**: 2-3 minutos de planejamento podem economizar horas de retrabalho.

## 🚨 **RED FLAGS CRÍTICOS - QUANDO PARAR IMEDIATAMENTE**

### **⛔ SITUAÇÕES QUE EXIGEM PAUSA OBRIGATÓRIA**

**REGRA FUNDAMENTAL**: Se qualquer red flag for detectado, o agente DEVE parar imediatamente e pedir esclarecimentos.

#### **🔴 RED FLAGS DE PLANO EXEC-STORY AUSENTE/INVÁLIDO**
- ❌ **Plano não encontrado**: Arquivo `docs/plans/[ID]-*.md` não existe
- ❌ **Plano incompleto**: Plano exec-story não tem steps detalhados
- ❌ **Plano desatualizado**: Plano não corresponde à implementação atual
- ❌ **Plano genérico**: Steps não específicos para o codebase atual
- ❌ **História órfã**: Implementação sem plano de execução correspondente

#### **🔴 RED FLAGS DE IMPLEMENTAÇÃO vs PLANO**
- ❌ **Steps não seguidos**: Implementação não seguiu passos do plano
- ❌ **Arquivos diferentes**: Arquivos criados não coincidem com plano
- ❌ **Padrões violados**: Código não segue padrões especificados no plano
- ❌ **Dependencies divergentes**: Bibliotecas diferentes das especificadas
- ❌ **Timeline exceeded**: Implementação muito mais complexa que planejado

#### **🔴 RED FLAGS DE MULTI-TENANT VIOLATIONS**
- ❌ **Organization isolation broken**: Queries sem organization_id filtering
- ❌ **Cross-org data leakage**: Possibilidade de acesso cross-organizacional
- ❌ **Middleware bypassed**: Endpoints sem organization_middleware.py
- ❌ **Global state usage**: Estado compartilhado entre organizações
- ❌ **Security gaps**: Authentication/authorization sem contexto organizacional

#### **🔴 RED FLAGS DE QUALIDADE DE CÓDIGO**
- ❌ **Anti-patterns**: Código que viola KISS/YAGNI/DRY fundamentalmente
- ❌ **Technical debt explosion**: Implementation que piora drasticamente codebase
- ❌ **Performance disaster**: Response time > 5x baseline sem justificativa
- ❌ **Code complexity explosion**: Funções > 50 linhas, arquivos > 500 linhas
- ❌ **Dependencies hell**: Dependências desnecessárias ou conflitantes

#### **🔴 RED FLAGS DE CRITÉRIOS DE ACEITE**
- ❌ **Acceptance criteria ignored**: Critérios claramente não atendidos
- ❌ **Scope creep**: Implementou funcionalidades além do solicitado
- ❌ **Business logic wrong**: Regras de negócio implementadas incorretamente
- ❌ **User experience broken**: UX/UI não funciona conforme especificado
- ❌ **Integration failures**: Não funciona com resto do sistema

#### **🔴 RED FLAGS DE REVIEW IMPOSSÍVEL**
- ❌ **História não localizada**: ID não existe no roadmap/sistema
- ❌ **Ambiguous story**: Critérios de aceite vagos demais para validar
- ❌ **Missing context**: Não há informação suficiente para fazer review
- ❌ **Environment broken**: Sistema não roda para testar implementação
- ❌ **Dependencies missing**: Outras histórias necessárias não implementadas

### **⚡ AÇÃO IMEDIATA QUANDO RED FLAG DETECTADO**

```
🚨 RED FLAG DETECTADO: [Tipo do red flag]

⚠️ IMPLEMENTAÇÃO REJEITADA: [Razão específica da rejeição]

🛑 REVIEW INTERROMPIDO

❌ STATUS: REJEITADO

📋 BLOCKERS CRÍTICOS:
- [Blocker específico que impede aprovação]
- [Item que deve ser corrigido]
- [Validação que falhou]

🔧 AÇÃO REQUERIDA: [O que deve ser feito para corrigir]

⏳ AGUARDANDO CORREÇÃO ANTES DE NOVO REVIEW...
```

### **✅ COMO RESOLVER RED FLAGS**
- **Fix blockers first** - corrigir todos os problemas críticos identificados
- **Organization isolation** - garantir 100% isolation antes de aprovar
- **Meet acceptance criteria** - implementar EXATAMENTE o que foi pedido
- **Quality standards** - código deve atender padrões mínimos do template
- **Complete testing** - funcionalidade deve ser testável e testada

**LEMBRE-SE**: Review aprovando código ruim = problemas em produção + retrabalho futuro.

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

## 🔍 **PROCESSO DE REVIEW ESTRUTURADO EM 6 FASES**

### **🚨 FASE 0: VALIDAÇÃO OBRIGATÓRIA DO PLANO EXEC-STORY**

**REGRA ABSOLUTA: DEVE LER PLANO DO EXEC-STORY ANTES DE QUALQUER REVIEW**

#### **📁 LEITURA OBRIGATÓRIA - PLANO DE EXECUÇÃO**
- ✅ **DEVE**: `Read docs/plans/[ID]-*.md` - LER plano completo gerado pelo exec-story
- ✅ **DEVE**: `Read docs/project/11-roadmap.md` - LOCALIZAR história original no roadmap
- ✅ **DEVE**: `Read docs/refined/[ID]-*.md` - LER refinamento técnico (se existir)
- ✅ **DEVE**: `Bash git log --oneline -20` - VERIFICAR commits da implementação
- ✅ **DEVE**: `Bash git status` - ANALISAR estado atual do branch

#### **🔍 VALIDAÇÃO OBRIGATÓRIA - CONFORMIDADE PLANO vs IMPLEMENTAÇÃO**
- ✅ **DEVE**: `LS api/models/` - COMPARAR models criados vs especificados no plano
- ✅ **DEVE**: `LS api/services/` - COMPARAR services criados vs especificados no plano
- ✅ **DEVE**: `LS api/routers/` - COMPARAR routers criados vs especificados no plano
- ✅ **DEVE**: `LS components/ui/` - VERIFICAR componentes usados vs plano
- ✅ **DEVE**: `LS app/[locale]/admin/` - COMPARAR páginas criadas vs plano
- ✅ **DEVE**: `Bash npm run test` - EXECUTAR testes (conforme especificado no plano)
- ✅ **DEVE**: `Bash npm run typecheck` - VERIFICAR erros (conforme plano)

#### **🚨 VALIDAÇÃO OBRIGATÓRIA**
- ❌ **FALHA CRÍTICA**: Não usar ferramentas Read/LS/Bash para análise real
- ❌ **FALHA CRÍTICA**: Assumir estado da implementação sem verificação direta
- ❌ **FALHA CRÍTICA**: Review baseado em suposições sobre código
- ✅ **OBRIGATÓRIO**: Cada item acima DEVE ter evidência de leitura/execução real

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

### **FASE 3: VALIDAÇÃO PLANO vs CRITÉRIOS ROADMAP**

1. **Comparar critérios implementados** vs critérios preservados no plano
2. **Verificar que plano não removeu critérios** do roadmap original
3. **Validar que implementação atende** aos critérios originais
4. **Confirmar que plano foi seguido** na implementação

### **FASE 4: VALIDAÇÃO DE CONFORMIDADE COM ESPECIFICAÇÕES**

1. **Confirmar padrões técnicos** definidos no plano foram seguidos
2. **Validar organization isolation** conforme especificado no plano
3. **Verificar performance requirements** definidos no plano
4. **Testar funcionalidades** conforme success criteria do plano

### **FASE 5: QUALITY GATE FINAL**

1. **Comparar resultado final** vs plano completo exec-story
2. **Decidir status** baseado na conformidade: ✅/⚠️/❌
3. **Gerar relatório comparativo** implementação vs plano
4. **Marcar história como APROVADA** no roadmap apenas se 100% conforme

### **📋 CHECKLIST OBRIGATÓRIO - EVIDÊNCIAS DE LEITURA REAL**

```yaml
Leitura de Arquivos Realizada (FASE 0):
  ✅ docs/plans/[ID]-*.md: [LER e COLAR plano completo do exec-story]
  ✅ roadmap.md: [ENCONTRAR e COLAR história original sendo revisada]
  ✅ docs/refined/[ID]-*.md: [LER refinamento técnico se existir]
  ✅ git log: [COLAR commits da implementação atual]
  ✅ git status: [COLAR estado atual do branch]

Comparação Plano vs Implementação (FASE 0):
  ✅ api/models/: [COMPARAR criados vs especificados no plano]
  ✅ api/services/: [COMPARAR criados vs especificados no plano]
  ✅ api/routers/: [COMPARAR criados vs especificados no plano]
  ✅ components/ui/: [COMPARAR usados vs especificados no plano]
  ✅ app/[locale]/admin/: [COMPARAR criados vs especificados no plano]

Execução de Testes Conforme Plano (FASE 0):
  ✅ npm run test: [RESULTADO conforme esperado no plano]
  ✅ npm run typecheck: [RESULTADO conforme esperado no plano]

❌ FALHA CRÍTICA se qualquer item acima não tiver evidência REAL de comparação
```

### **IDENTIFICAÇÃO DA HISTÓRIA E PLANO (Baseada na Leitura)**

```yaml
História Original (roadmap.md):
  ID: [Extrair do roadmap.md LIDO]
  Título: [Título completo encontrado no roadmap]
  Sprint: [Sprint associada encontrada]
  Épico: [Nome do Épico identificado]
  Pontos: [Story points encontrados]

Plano de Execução (docs/plans/[ID]-*.md):
  Arquivo: [Nome exato do arquivo encontrado]
  Status: [Existe | Não existe - BLOQUEADOR se não existir]
  Timeline Planejado: [Horas estimadas no plano]
  Fases Planejadas: [Número de fases definidas no plano]
  Files Especificados: [Arquivos que deveriam ser criados]
  
Implementação Realizada (git log):
  Implementador: [Verificar commits git EXECUTADOS]
  Data: [Data da implementação dos commits]
  Commits Totais: [Número de commits relacionados]
  Timeline Real: [Tempo real gasto vs planejado]
```

---

## ✅ **CHECKLIST DE REVIEW DETALHADO**

### **🚨 1. VERIFICAÇÃO DE CONFORMIDADE COM PLANO EXEC-STORY**

- [ ] Implementação seguiu os steps exatos especificados no plano?
- [ ] Arquivos criados coincidem 100% com os especificados no plano?
- [ ] Bibliotecas instaladas são exatamente as definidas no plano?
- [ ] Estrutura de código segue padrões definidos no plano?
- [ ] Timeline real está dentro da estimativa do plano (+/- 30%)?
- [ ] Testes e2e foram implementados conforme especificado no plano?

**🔍 Análise de Conformidade Plano vs Implementação:**

```
✅ Conforme Plano:
- [Arquivos criados que coincidem com plano]
- [Bibliotecas instaladas conforme plano]
- [Padrões seguidos conforme plano]

❌ Divergente do Plano:
- [Implementações que não seguiram o plano]
- [Arquivos criados não especificados no plano]
- [Bibliotecas diferentes das especificadas]

⚠️ Gaps vs Plano:
- [Items do plano não implementados]
- [Steps do plano que foram pulados]
```

### **2. VALIDAÇÃO TRIPLA DOS CRITÉRIOS DE ACEITE**

**🔍 VALIDAÇÃO ROADMAP → PLANO → IMPLEMENTAÇÃO**

**Critérios no Roadmap Original (roadmap.md):**
```yaml
# Critérios ORIGINAIS extraídos do roadmap
- [ ] [Critério 1 original do roadmap]
- [ ] [Critério 2 original do roadmap]
- [ ] [Critério 3 original do roadmap]
```

**Critérios Preservados no Plano (docs/plans/[ID]-*.md):**
```yaml
# Verificar se plano preservou 100% dos critérios do roadmap
- [ ] [Critério 1 - PRESERVADO no plano? SIM/NÃO]
- [ ] [Critério 2 - PRESERVADO no plano? SIM/NÃO]  
- [ ] [Critério 3 - PRESERVADO no plano? SIM/NÃO]
```

**Critérios Implementados (código atual):**
```yaml
# Verificar se implementação atende aos critérios
- [ ] [Critério 1 - IMPLEMENTADO? SIM/NÃO/PARCIAL]
- [ ] [Critério 2 - IMPLEMENTADO? SIM/NÃO/PARCIAL]
- [ ] [Critério 3 - IMPLEMENTADO? SIM/NÃO/PARCIAL]
```

**🚨 VALIDAÇÃO CRÍTICA:**
- ✅ **Preservação Plano**: [X/Y critérios preservados no plano]
- ✅ **Atendimento Implementação**: [X/Y critérios implementados]
- ❌ **Critérios Removidos no Plano**: [Lista se houver - FALHA CRÍTICA]
- ❌ **Critérios Não Implementados**: [Lista se houver - REJEIÇÃO]

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
4. [Timeline mantida dentro da estimativa do plano]
```

### **⚠️ DESVIOS DO PLANO IDENTIFICADOS**

```
Minor (aceitáveis com justificativa):
- [Pequenas adaptações que melhoraram o resultado]
- [Otimizações não previstas no plano mas benéficas]

Major (devem ser corrigidos ou justificados):
- [Arquivos não especificados no plano que foram criados]
- [Steps do plano que foram pulados sem justificativa]
- [Bibliotecas diferentes das especificadas no plano]
```

### **❌ BLOQUEADORES CRÍTICOS** (impedem aprovação)

```
1. 🚨 PLANO EXEC-STORY NÃO ENCONTRADO (bloqueador automático)
2. 🚨 TESTES E2E DO PLANO NÃO PASSAM (bloqueador automático)  
3. 🚨 CRITÉRIOS DO ROADMAP REMOVIDOS NO PLANO (falha crítica)
4. 🚨 IMPLEMENTAÇÃO IGNORA COMPLETAMENTE O PLANO (rejeição automática)
5. [Problemas de segurança ou organization isolation quebrado]
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

# 4. Atualizar métricas de qualidade
# Registrar: Timeline real vs planejado, conformidade com plano
```

### **Se ⚠️ APROVADO COM RESSALVAS:**

```yaml
# 1. Marcar história como aprovada com observações
Status: ✅ APROVADO COM RESSALVAS ([DD/MM/YYYY])
Desvios Aceitos: [Lista de desvios menores do plano que foram aprovados]
Justificativas: [Por que os desvios foram aceitos]

# 2. Documentar lições para próximos planos
Melhorias para exec-story: [Como melhorar futuros planos baseado nos desvios]
```

### **Se ❌ REJEITADO (não conforme plano):**

```yaml
# 1. Feedback específico baseado na não-conformidade com plano
Plano Original: docs/plans/[ID]-*.md
Problemas de Conformidade:
  - Steps não seguidos: [Lista detalhada]
  - Arquivos divergentes: [O que foi criado vs especificado]
  - Testes falhou: [Comandos específicos que falharam]
  - Bibliotecas incorretas: [O que foi instalado vs especificado]

# 2. Ações corretivas obrigatórias
ANTES DE NOVO REVIEW:
  - [ ] Seguir exatamente os steps do plano docs/plans/[ID]-*.md
  - [ ] Criar apenas os arquivos especificados no plano
  - [ ] Usar apenas as bibliotecas definidas no plano
  - [ ] Executar testes e2e conforme especificado no plano
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
