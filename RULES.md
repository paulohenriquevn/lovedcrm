# 🚨 TEMPLATE RULES - Multi-Tenant SaaS Starter Template Development

**IMPORTANTE:** Seja EXTREMAMENTE HONESTO SEMPRE em relação à situação do projeto. Nunca inicie algo antes de ter 95% de certeza. Não faça nenhuma alteração antes que você tenha 95% de confiança sobre o que deve ser construído. Faça perguntas até ter certeza absoluta.

## 🎯 **FUNDAMENTAL TEMPLATE CUSTOMIZATION RULES**

### **95% CONFIDENCE RULE FOR TEMPLATE DEVELOPMENT**

- ✅ **MUST**: Validate EACH item with 95%+ confidence before implementing in YOUR SaaS
- ✅ **MUST**: Ask questions until absolutely certain about YOUR business requirements
- ✅ **MUST**: Stop and obtain specific evidence if any template validation fails
- ❌ **MUST NOT**: Start any template customization without 95% confidence
- ❌ **MUST NOT**: Assume requirements or make speculative interpretations about YOUR SaaS needs
- ❌ **MUST NOT**: Continue without complete validation of YOUR business inputs

### **EXTREME HONESTY ABOUT TEMPLATE STATUS**

- ✅ **MUST**: Be EXTREMELY HONEST about YOUR template customization progress
- ✅ **MUST**: Report template problems and limitations immediately
- ✅ **MUST**: Communicate clearly when there's insufficient certainty about YOUR requirements
- ❌ **MUST NOT**: Mask template issues or give false guarantees about YOUR SaaS
- ❌ **MUST NOT**: Proceed without communicating identified risks in YOUR customization
- ❌ **MUST NOT**: Give vague or evasive responses about YOUR development status

## 🏗️ **TEMPLATE ARCHITECTURE & TECHNOLOGY RULES**

### **TEMPLATE FOUNDATION REQUIREMENTS**

- ✅ **DEVE**: Usar EXCLUSIVAMENTE Next.js 14 + FastAPI + PostgreSQL + Railway
- ✅ **DEVE**: Aproveitar sistema em produção com 55+ endpoints ativos
- ✅ **DEVE**: Implementar isolation com header-based multi-tenancy (X-Org-Id + middleware)
- ✅ **DEVE**: Usar organization_middleware.py + Repository pattern + org_id filtering
- ✅ **DEVE**: Usar shadcn/ui + Tailwind CSS + Lucide icons
- ❌ **NÃO DEVE**: Sugerir outras tecnologias ou frameworks
- ❌ **NÃO DEVE**: Criar arquiteturas que não aproveitem sistema atual
- ❌ **NÃO DEVE**: Ignorar padrões de isolation estabelecidos

### **TEMPLATE SAAS_MODE CONFIGURÁVEL - B2B OU B2C**

- 🔴 **FATO CRÍTICO**: Template suporta SAAS_MODE=B2B ou SAAS_MODE=B2C configurável
- 🔴 **FATO CRÍTICO**: Modo B2B: Colaboração em equipe com organizações compartilhadas
- 🔴 **FATO CRÍTICO**: Modo B2C: Uso individual com organizações pessoais auto-criadas
- ✅ **DEVE**: Configurar SAAS_MODE via variável de ambiente (B2B/B2C)
- ✅ **DEVE**: Usar organização auto-criada no registro (suporta ambos modos)
- ✅ **DEVE**: Adaptar UI baseado no modo (team features B2B, personal features B2C)
- ✅ **DEVE**: Manter isolation organization-centric sempre (org_id universal)
- ✅ **DEVE**: Implementar billing apropriado para o modo escolhido
- ❌ **NÃO DEVE**: Misturar funcionalidades B2B e B2C no mesmo deployment
- ❌ **NÃO DEVE**: Quebrar organização auto-criada (essencial para ambos modos)
- ❌ **NÃO DEVE**: Sugerir user_id isolation (template usa org_id sempre)
- ❌ **NÃO DEVE**: Ignorar configuração SAAS_MODE estabelecida

### **PADRÕES TÉCNICOS MULTI-TENANT OBRIGATÓRIOS**

- ✅ **DEVE**: Seguir padrões do template para qualquer customização:
  - Registration Pattern: Auto-criação de organização + JWT com org_id
  - Entity Management Pattern: Org-scoped CRUD com middleware validation
  - Multi-Tenant Pattern: Header-based isolation (X-Org-Id) obrigatório
- ✅ **DEVE**: Implementar organization_middleware.py validation em todas as rotas
- ✅ **DEVE**: Usar BaseService no frontend (auto X-Org-Id headers)
- ✅ **DEVE**: Aplicar org_id filtering em todas as queries (Repository pattern)
- ✅ **DEVE**: Manter get_current_organization dependency no backend
- ❌ **NÃO DEVE**: Criar rotas sem organization validation
- ❌ **NÃO DEVE**: Quebrar header-based multi-tenancy
- ❌ **NÃO DEVE**: Implementar user_id isolation (sempre org_id)

## 📝 **REGRAS DE DOCUMENTAÇÃO**

### **TERMINOLOGIA PADRONIZADA**

- ✅ **DEVE**: Usar "funcionalidades" para features do usuário
- ✅ **DEVE**: Usar "padrões técnicos" para blueprints reutilizáveis
- ✅ **DEVE**: Usar "feature-specific" ao invés de "workflow-specific"
- ✅ **DEVE**: Manter consistência terminológica entre agentes
- ❌ **NÃO DEVE**: Usar "workflow" para funcionalidades do usuário
- ❌ **NÃO DEVE**: Misturar terminologia técnica e funcional
- ❌ **NÃO DEVE**: Criar terminologia nova sem validação

### **EXEMPLOS SETORIAIS HÍBRIDOS B2B+B2C**

- ✅ **DEVE**: Usar exemplos B2B: E-commerce B2B, CRM, SaaS B2B, ERP, Marketing
- ✅ **DEVE**: Usar exemplos B2C: Social, Gaming, E-commerce, Fitness, Streaming
- ✅ **DEVE**: Incluir org_id isolation, header validation e Repository pattern
- ✅ **DEVE**: Demonstrar feature gating (Free/Pro/Enterprise ou Free/Premium)
- ✅ **DEVE**: Mostrar isolation organization-centric (org_id sempre)
- ❌ **NÃO DEVE**: Usar exemplos genéricos sem contexto específico
- ❌ **NÃO DEVE**: Criar exemplos sem isolation adequado
- ❌ **NÃO DEVE**: Ignorar subscription tiers nos exemplos

## 🔄 **REGRAS DE PROCESSO**

### **METODOLOGIA VERTICAL SLICE**

- ✅ **DEVE**: Organizar por funcionalidades completas end-to-end
- ✅ **DEVE**: Priorizar entrega de valor ao usuário
- ✅ **DEVE**: Implementar features incrementalmente
- ✅ **DEVE**: Validar cada funcionalidade antes da próxima
- ❌ **NÃO DEVE**: Organizar por domínios técnicos (horizontal)
- ❌ **NÃO DEVE**: Criar big bang implementations
- ❌ **NÃO DEVE**: Priorizar elegância técnica sobre valor do usuário

### **VALIDAÇÕES OBRIGATÓRIAS**

- ✅ **DEVE**: Executar todas as 5 validações específicas de cada agente
- ✅ **DEVE**: Parar imediatamente se qualquer validação falhar
- ✅ **DEVE**: Obter evidências concretas antes de prosseguir
- ✅ **DEVE**: Documentar critérios de aceite específicos
- ❌ **NÃO DEVE**: Pular validações por pressão de tempo
- ❌ **NÃO DEVE**: Aceitar validações superficiais ou genéricas
- ❌ **NÃO DEVE**: Continuar sem evidências suficientes

## 🚫 **PROIBIÇÕES CRÍTICAS**

### **NUNCA FAZER**

- ❌ **NUNCA** criar funcionalidades fora dos padrões estabelecidos
- ❌ **NUNCA** sugerir tecnologias diferentes do sistema em produção
- ❌ **NUNCA** ignorar isolation (org_id + header-based + middleware)
- ❌ **NUNCA** criar arquiteturas sem header-based multi-tenancy
- ❌ **NUNCA** usar terminologia inconsistente entre agentes
- ❌ **NUNCA** prosseguir sem 95% de certeza
- ❌ **NUNCA** mascarar problemas ou limitações
- ❌ **NUNCA** criar scripts ou arquivos fora do padrão estabelecido

### **EVOLUÇÃO VS CRIAÇÃO**

- ✅ **SEMPRE** evoluir arquivos existentes
- ✅ **SEMPRE** seguir padrões já estabelecidos
- ✅ **SEMPRE** manter coesão com agentes anteriores
- ❌ **NUNCA** criar novos padrões sem aprovação
- ❌ **NUNCA** reinventar soluções já definidas
- ❌ **NUNCA** quebrar compatibilidade com sistema em produção

## 🎯 **CRITÉRIOS DE QUALIDADE**

### **CHECKLIST OBRIGATÓRIO ANTES DE ENTREGAR**

- [ ] **95% de certeza** sobre todos os requisitos
- [ ] **Validações específicas** todas executadas e aprovadas
- [ ] **Terminologia consistente** com outros agentes
- [ ] **Isolation** implementado corretamente (header-based org_id)
- [ ] **Sistema Produção** compliance verificado
- [ ] **Padrões técnicos** adaptados apropriadamente
- [ ] **Exemplos setoriais** específicos incluídos
- [ ] **Funcionalidades end-to-end** documentadas
- [ ] **Coesão com agentes** anteriores mantida
- [ ] **Documentação executável** validada

### **RED FLAGS - PARAR IMEDIATAMENTE**

- 🚨 Sugestão de tecnologia fora do sistema em produção
- 🚨 Arquitetura sem header-based multi-tenancy proposta
- 🚨 Funcionalidades fora dos 3 padrões estabelecidos
- 🚨 Terminologia inconsistente detectada
- 🚨 Validações falhando ou sendo puladas
- 🚨 Requisitos assumidos sem confirmação
- 🚨 Quebra de coesão com agentes anteriores
- 🚨 Documentação não executável
- 🚨 Exemplos genéricos sem contexto B2B ou B2C específico

## 📊 **RESPONSABILIDADES**

## 🔄 **FLUXO DE VALIDAÇÃO**

### **ENTRADA DE CADA**

### **SAÍDA DE CADA AGENTE**

## 🎯 **OBJETIVO FINAL**

**Manter Multi-Tenant SaaS Starter Template com:**

- **99% coesão** técnica entre documentações
- **100% aproveitamento** sistema em produção (55+ endpoints)
- **100% header-based multi-tenancy** implementation
- **100% executabilidade** documentação técnica
- **100% adaptabilidade** para SaaS B2B ou B2C (via SAAS_MODE)

---

## 🚨 **LEMBRETE CRÍTICO**

**Estas regras são OBRIGATÓRIAS e NÃO NEGOCIÁVEIS. Qualquer violação compromete a integridade do Multi-Tenant SaaS Starter Template.**

**SEMPRE seguir: 95% certeza → Validações completas → Header-based Multi-tenancy → Sistema Produção → Coesão 99%**
