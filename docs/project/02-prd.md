# 02-prd.md - Loved CRM

## **1. OVERVIEW + MODELO + STACK**

**Resumo Visão**: CRM especializado para agências digitais brasileiras que unifica pipeline Kanban fixo, comunicação integrada (WhatsApp, VoIP, email) e IA em uma única plataforma.

**Modelo de Negócio**: B2B

**Stack**: Next.js 14 + FastAPI + PostgreSQL + Railway (confirmado - sem mudanças)

**Arquitetura**: Isolamento centrado em organizações universal (organization_id + query filtering)

**🔴 FONTE MODELO DE NEGÓCIO**: Definido pelo Agente 01 Visionário - NUNCA reinterpretado por este agente

## **2. CHECKLIST DE CONFORMIDADE**

**🔴 CONFORMIDADE PRD OBRIGATÓRIA:**

- [x] **Modelo Definido**: Modelo de Negócio B2B identificado no campo específico
- [x] **Isolamento organization_id**: Todas as funcionalidades usam filtragem organization_id
- [x] **Padrão BaseService**: Todas as chamadas API usam BaseService com X-Org-Id
- [x] **Padrão SQLRepository**: Todas as operações CRUD usam SQLRepository com filtro org
- [x] **Middleware Organizacional**: Todos os endpoints usam dependência get_current_organization
- [x] **Query Filtering**: Especificado organization_id filtering para todas as tabelas de negócio
- [x] **Prevenção Cross-Org**: Especificados testes de prevenção cross-organizacional
- [x] **Viabilidade Validada**: Verificado que funcionalidades são implementáveis no codebase atual
- [x] **Conformidade Stack**: Next.js 14 + FastAPI + PostgreSQL + Railway (sem mudanças)

## **3. RESULTADOS VERIFICAÇÃO VIABILIDADE**

**Compatibilidade Endpoints**: Sistema possui 55+ endpoints existentes com padrões CRUD + organization_id que servem como base para funcionalidades CRM. Padrões de pipeline, comunicação e IA são compatíveis com arquitetura existente.

**Padrão SQLRepository**: Operações CRUD de leads, deals, communications, AI summaries se encaixam perfeitamente no padrão SQLRepository existente com filtragem automática por organization_id.

**Cobertura shadcn/ui**: Componentes UI existentes (Card, Button, Dialog, Form, DataTable, Kanban) cobrem completamente os requisitos de interface CRM. Drag & drop e timeline são implementáveis com bibliotecas compatíveis.

**FK Organization_id**: Todas entidades CRM confirmadas como compatíveis: leads table, deals table, communications table, ai_summaries table podem ter organization_id como chave estrangeira.

**Query Filtering**: organization_id filtering é totalmente aplicável - todas queries CRM serão filtradas por organização (leads, deals, communications, AI summaries).

**Infraestrutura**: Railway suporta perfeitamente integrações externas (WhatsApp Business API, OpenAI GPT-4, VoIP providers) sem mudanças de infraestrutura.

## **4. JOBS-TO-BE-DONE (Com Escopo Organizacional)**

**Formato**: "Quando [situação], eu [persona] quero [ação org-isolada] para [resultado]"

### **Jobs Primários para Modelo B2B**

1. **Pipeline Management**: "Quando recebo um novo lead via WhatsApp da minha agência (org), eu (gestor) quero mover pela pipeline Kanban com escopo org para não perder oportunidades da minha organização"

2. **Comunicação Unificada**: "Quando preciso ver histórico de cliente da minha agência (org), eu (vendedor) quero visualizar timeline org-isolada para personalizar abordagem sem vazamento de dados entre organizações"

3. **IA Insights**: "Quando conversa fica longa na minha agência (org), eu (gestor) quero resumo automático org-isolado para tomar decisões informadas da minha organização"

**Validação Isolamento Organizacional**: Todos os jobs confirmados como com escopo organizacional com filtragem organization_id obrigatória

## **5. FUNCIONALIDADES MUST-HAVE (Exatamente 3)**

### **Funcionalidade 1: Pipeline Kanban de Leads**

**Problema Resolvido**: Agências digitais perdem leads por falta de organização visual do funil de vendas e não conseguem acompanhar progresso de cada lead.

**Implementação Com Escopo Organizacional**: Pipeline com 5 estágios fixos (Lead → Contato → Proposta → Negociação → Fechado) com drag & drop, métricas de conversão e tempo médio por fase. Todas operações filtradas por organization_id para isolamento total entre agências.

**Requisitos Técnicos**:
- Middleware organizacional: dependência get_current_organization
- SQLRepository: operações CRUD filtradas por org (leads, deals tables)
- Políticas RLS: segurança nível linha organization_id
- BaseService: integração header X-Org-Id

### **Funcionalidade 2: Timeline de Comunicação Integrada**

**Problema Resolvido**: Comunicações fragmentadas entre múltiplos canais (WhatsApp, email, VoIP) dificultam acompanhamento de clientes e geram perda de contexto.

**Implementação Com Escopo Organizacional**: Timeline cronológica unificada por cliente mostrando todas interações (WhatsApp Business API, parsing email Gmail/Outlook, gravações VoIP) com anexos centralizados. Histórico completamente org-isolado.

**Requisitos Técnicos**:
- Middleware organizacional: dependência get_current_organization
- SQLRepository: operações CRUD filtradas por org (communications table)
- Políticas RLS: segurança nível linha organization_id
- BaseService: integração header X-Org-Id

### **Funcionalidade 3: Resumos de Conversa com IA**

**Problema Resolvido**: Conversas longas via WhatsApp e email dificultam extração de insights, próximas ações e tomada de decisão para gestores de agência.

**Implementação Com Escopo Organizacional**: OpenAI GPT-4 gera resumos automáticos de conversas, análise de sentimento e sugestões de próximas ações. Processamento em português com dados org-isolados para proteção total entre organizações.

**Requisitos Técnicos**:
- Middleware organizacional: dependência get_current_organization
- SQLRepository: operações CRUD filtradas por org (ai_summaries table)
- Políticas RLS: segurança nível linha organization_id
- BaseService: integração header X-Org-Id

## **6. TIERS ASSINATURA (Regras Fixas por Modelo)**

### **🔴 REGRAS APLICADAS PARA MODELO B2B:**

- **Tier Free**: Até 3 usuários por organização + funcionalidades básicas + 1 admin + 100 leads + 10 resumos IA/mês
- **Tier Pro**: Até 10 usuários por organização + funcionalidades avançadas + múltiplos admins + leads ilimitados + 100 resumos IA/mês + WhatsApp Business API
- **Tier Enterprise**: Usuários ilimitados + funcionalidades premium + controles avançados + SSO + resumos IA ilimitados + API customizada + VoIP avançado

### **Implementação Feature Gates:**

```typescript
<FeatureGate tier="pro" feature="whatsapp_integration">
  <WhatsAppIntegrationComponent />
</FeatureGate>

<FeatureGate tier="enterprise" feature="advanced_ai">
  <AdvancedAIComponent />
</FeatureGate>
```

**Contexto Billing**: organization.subscription_tier (universal para ambos modelos)

**Prompts Upgrade**: Quando limites atingidos → caminho claro upgrade para próximo tier

## **7. CRITÉRIOS DE ACEITE (Formato Given-When-Then)**

### **🔴 OBRIGATÓRIO: Cenários Prevenção Cross-Organizacional**

**Cenário 1: Isolamento Criação Pipeline**

```
Dado: Usuário da Organização A cria lead no pipeline
Quando: Usuário da Organização B tenta acessar esse lead
Então: Sistema retorna 403 Forbidden E registra tentativa segurança E preserva dados Organização A
```

**Cenário 2: Validação Filtragem Timeline**

```
Dado: Organização A tem 20 comunicações, Organização B tem 15 comunicações
Quando: Usuário Organização A solicita "GET /communications/timeline"
Então: Sistema retorna exatamente 20 comunicações (apenas da Org A) E tempo resposta < 500ms E query filtrada por organization_id
```

**Cenário 3: Segurança Validação IA**

```
Dado: Token JWT válido para Organização A
Quando: Requisição enviada com header X-Org-Id para Organização B (org diferente)
Então: Sistema retorna 403 Forbidden E invalida sessão E registra incidente segurança
```

### **Requisitos Performance e Segurança**

- Tempo resposta API: ≤ 500ms para endpoints CRM com escopo org
- Performance query banco dados: ≤ 200ms com query filtering
- Taxa prevenção cross-org: ≥ 99.9% bloqueada com sucesso
- Carregamento contexto organizacional: ≤ 100ms

## **8. MÉTRICAS MÍNIMAS OBRIGATÓRIAS**

### **🔴 MÉTRICAS QUALIDADE BASELINE (Não-Negociáveis)**

**Métricas Segurança e Isolamento:**

- **Taxa Filtragem Organizacional**: ≥ 100% requisições CRM filtradas por organization_id
- **Taxa Prevenção Cross-Org**: ≥ 99.9% tentativas cross-org bloqueadas com sucesso
- **Auditoria Isolamento Dados**: 0 vazamentos dados entre organizações (tolerância zero)

**Métricas Performance:**

- **Tempo Resposta API Com Escopo Org**: ≤ 500ms média para endpoints CRM filtrados por organização
- **Performance Query Banco Dados**: ≤ 200ms para queries CRM com escopo org com query filtering
- **Carregamento Contexto Organizacional**: ≤ 100ms para execução hook useOrgContext()

**Métricas Negócio (Específicas para Modelo B2B):**

Taxa ativação equipe ≥ 80%, adoção multi-usuário ≥ 60%, uso colaboração ≥ 70%
Taxa retenção organização ≥ 85%, conversão assinatura ≥ 15%

**Métricas Saúde Técnica:**

- **Cobertura Feature Gate**: 100% funcionalidades premium atrás componentes FeatureGate
- **Uso Middleware Organizacional**: 100% endpoints CRM usam get_current_organization
- **Cobertura Query Filtering**: 100% tabelas CRM têm organization_id filtering implementado
- **Conformidade BaseService**: 100% chamadas API CRM usam BaseService com headers X-Org-Id