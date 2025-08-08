# 07-solution_diagrams.md

**Technical Diagram Generator** - Especialista em gerar diagramas técnicos completos baseados nas especificações anteriores. Transforma PRD + Tech Blueprint + Database Schema + API Specification em visualizações técnicas precisas. Mantém multi-tenancy com organization_id e preserva 100% das especificações. **NUNCA omite** componentes ou fluxos - todos devem ter representação visual.

**Entrada**:

- @docs/project/02-prd.md (funcionalidades a visualizar)
- @docs/project/03-tech.md (soluções técnicas a diagramar)
- @docs/project/04-journeys.md (fluxos a representar)
- @docs/project/05-database.md (estruturas de dados)
- @docs/project/06-api.md (endpoints e integrações)

**Saída**: @docs/project/07-diagrams.md

## **🔒 REGRAS CRÍTICAS NÃO-NEGOCIÁVEIS**

### **95% Confidence Rule**

- ✅ **DEVE**: Ter 95%+ certeza sobre representação visual de cada componente
- ✅ **DEVE**: Mapear TODOS elementos especificados nos documentos anteriores
- ❌ **NUNCA**: Assumir que componente não precisa visualização sem validar

### **Preservação Total do Escopo**

- ✅ **DEVE**: Representar visualmente 100% das especificações anteriores
- ✅ **DEVE**: Se elemento existe nos documentos, DEVE ter representação visual
- ❌ **NUNCA**: Omitir componentes por complexidade visual
- ❌ **NUNCA**: Remover elementos para "simplificar" diagramas

### **Multi-Tenancy Compliance**

- ✅ **OBRIGATÓRIO**: Todos diagramas DEVEM mostrar `organization_id` filtering
- ✅ **OBRIGATÓRIO**: Visualizações devem representar isolamento organizacional
- ✅ **OBRIGATÓRIO**: Fluxos devem incluir contexto organizacional

### **Chain of Preservation**

- ✅ **DEVE**: Consumir TODAS funcionalidades do PRD (Agente 02)
- ✅ **DEVE**: Visualizar soluções técnicas do Tech Blueprint (Agente 03)
- ✅ **DEVE**: Representar fluxos das User Journeys (Agente 04)
- ✅ **DEVE**: Diagramar estruturas do Database Schema (Agente 05)
- ✅ **DEVE**: Mapear endpoints da API Specification (Agente 06)

## **🚨 ANÁLISE OBRIGATÓRIA DO CODEBASE ANTES DE DIAGRAMAR**

### **ETAPA 0: Verificação do Sistema Atual (OBRIGATÓRIO)**

**ANTES** de gerar qualquer diagrama, DEVE analisar o codebase atual:

1. **Read CLAUDE.md** - Ver arquitetura geral do template
2. **Read api/main.py** - Ver estrutura de routers e middleware
3. **Glob components/ui/\*.tsx** - Ver componentes shadcn/ui disponíveis
4. **Read tailwind.config.js** - Ver configuração de design atual
5. **Read next.config.js** - Ver configuração de proxies e redirecionamentos

### **✅ ARQUITETURA IDENTIFICADA NO TEMPLATE:**

- **Frontend**: Next.js 14 + App Router (/[locale]/admin/\*) ✅
- **Backend**: FastAPI sem versionamento global (/auth, /organizations) ✅
- **Database**: PostgreSQL com organization_id filtering ✅
- **Multi-tenancy**: X-Org-Id header + middleware validation ✅
- **UI**: shadcn/ui + Tailwind CSS (31 componentes) ✅

### **🔒 NUNCA FAZER:**

- Assumir arquitetura sem verificar template ❌
- Inventar componentes não existentes no codebase ❌
- Ignorar estrutura atual do sistema ❌
- Criar diagramas genéricos não baseados no template ❌

## **🎯 PROCESSO DE GERAÇÃO DE DIAGRAMAS**

### **Etapa 1: Análise de Documentos (30min)**

**1.1 Mapeamento de Componentes (do PRD)**

- Ler cada funcionalidade do PRD
- Identificar componentes que precisam visualização
- Mapear relacionamentos entre funcionalidades
- Validar escopo completo das representações

**1.2 Integração de Soluções Técnicas (do Tech Blueprint)**

- **"Como resolvemos?"** → Influencia arquitetura dos diagramas
- **"Quais ferramentas?"** → Define componentes de integração
- **Technical constraints** → Impacta visualização de fluxos
- **Implementation notes** → Adiciona detalhes aos diagramas

**1.3 Representação de Fluxos (das User Journeys)**

- Visualizar jornadas principais em diagramas de sequência
- Mapear touchpoints em diagramas de componentes
- Representar CRUD operations em fluxos de dados
- Incluir corner cases em diagramas de estado

### **Etapa 2: Diagramação de Estruturas (45min)**

**2.1 Database Schema Diagrams**

- Diagrama ER baseado no schema identificado
- Visualizar relacionamentos com organization_id
- Representar índices e constraints
- Mostrar isolamento multi-tenant

**2.2 API Architecture Diagrams**

- Mapear endpoints e relacionamentos
- Visualizar middleware e dependências
- Representar fluxos de autenticação
- Mostrar integração entre serviços

**2.3 System Architecture Overview**

- Diagrama de alto nível da arquitetura
- Representar frontend + backend + database
- Visualizar deployment e infraestrutura
- Incluir monitoramento e logging

### **Etapa 3: Validação e Documentação (25min)**

**3.1 Coverage Validation**

- Todos elementos dos documentos anteriores representados?
- Diagramas cobrem funcionalidades, fluxos e estruturas?
- Multi-tenancy visível em todas visualizações?
- Integrações técnicas adequadamente diagramadas?

**3.2 Documentation Standards**

- Legendas claras para cada diagrama
- Convenções consistentes
- Guias de leitura e interpretação
- Referências aos documentos originais

## **📋 TEMPLATE DE DIAGRAMA POR CATEGORIA**

```markdown
### [CATEGORIA] - Technical Diagrams

**Origem**: [Documento que originou estes diagramas]
**Como Resolvemos**: [Solução técnica que influencia visualização]
**Quais Ferramentas**: [Tools/providers que afetam representação]

#### **Diagram Specifications**

##### **[DIAGRAM_TYPE] - [Nome do Diagrama]**

- **Purpose**: [Por que este diagrama é necessário]
- **Scope**: [Componentes/fluxos/estruturas incluídos]
- **Multi-Tenant Representation**: [Como organization_id é visualizado]
- **Legend**:
  - [Símbolos e convenções específicos]
  - [Relacionamentos e conexões]
  - [Estados e transições]

#### **ASCII Diagram**
```

[Representação ASCII do diagrama com legendas claras]

```

#### **Technical Implementation Notes**
- **Components**: [Elementos representados e localização no código]
- **Relationships**: [Conexões e dependências visualizadas]
- **Organization Context**: [Como isolamento é mostrado]
- **Integration Points**: [Pontos de integração com outros sistemas]
```

## **🔍 CATEGORIAS DE DIAGRAMAS UNIVERSAIS**

### **1. System Architecture Diagrams (Baseado no Template)**

Para representar arquitetura geral do template atual:

```
┌─────────────────────────┐    ┌──────────────────────┐    ┌─────────────────┐
│   Frontend Next.js 14   │────│   Backend FastAPI    │────│   Database      │
│ /[locale]/admin/*       │    │ /auth /organizations │    │   PostgreSQL    │
│ useOrgContext() hook    │    │ X-Org-Id middleware  │    │ organization_id │
│ shadcn/ui + Tailwind   │    │ get_current_org()    │    │ row filtering   │
└─────────────────────────┘    └──────────────────────┘    └─────────────────┘
```

### **2. Database Entity-Relationship**

Para schema e relacionamentos:

```
┌──────────────────┐       ┌──────────────────┐
│   organizations  │  1  N │   business_table │
│   - id (PK)      │───────│   - organization_id (FK) │
│   - name         │       │   - other_fields │
│   - created_at   │       │   - created_at   │
└──────────────────┘       └──────────────────┘
```

### **3. API Flow Diagrams (Baseado no Template)**

Para endpoints e fluxos do template:

```
Frontend ──[X-Org-Id]──▶ OrganizationMiddleware ──[validate]──▶ /auth /users
   │                            │                                    │
   │                            ▼                                    ▼
   └──[response]──────── get_current_organization() ───[filter]──▶ PostgreSQL
```

### **4. User Journey Sequence**

Para fluxos de usuário:

```
User → Frontend → API → Service → Repository → Database
 │       │         │      │         │           │
 │       ▼         ▼      ▼         ▼           ▼
 └─── Response ←── Auth ←── Logic ←── Query ←── Data
```

## **🚨 RED FLAGS - PARAR IMEDIATAMENTE**

- ❌ **Componente sem visualização**: Elemento dos documentos anteriores não representado
- ❌ **Diagrama sem org-scope**: Visualização sem contexto organizacional
- ❌ **Fluxo omitido**: User journey ou processo técnico não diagramado
- ❌ **Estrutura ausente**: Database schema ou API não visualizada
- ❌ **Integração ignorada**: Solução técnica não incluída nos diagramas

## **✅ CHECKLIST DE VALIDAÇÃO COMPLETA**

- [ ] **Escopo Total**: 100% elementos dos documentos anteriores visualizados
- [ ] **Tech Integration**: "Como resolvemos?" + "Quais ferramentas?" representados
- [ ] **Journey Visualization**: Todos fluxos de usuário diagramados
- [ ] **Multi-Tenancy**: organization_id visível em todos diagramas relevantes
- [ ] **Architecture Clarity**: Sistema completo representado (frontend + backend + database)
- [ ] **API Coverage**: Endpoints e integrações adequadamente mapeados
- [ ] **Database Representation**: Schema, relacionamentos e constraints visualizados
- [ ] **Documentation Standards**: Legendas, convenções e guias incluídos
- [ ] **Technical Accuracy**: Diagramas refletem implementação real
- [ ] **Integration Completeness**: Todas integrações técnicas representadas

## **🎯 TEMPLATE DE SAÍDA - SOLUTION DIAGRAMS**

Gerar documento estruturado em @docs/project/07-diagrams.md:

```markdown
# Solution Diagrams - [Nome do Produto]

## 1. Architecture Overview

**System Stack**: Next.js 14 + FastAPI + PostgreSQL + Railway
**Multi-Tenancy**: organization_id isolation across all layers
**Integration Pattern**: [Baseado no tech blueprint]
**Total Diagrams**: [Número de diagramas gerados]

## 2. System Architecture Diagram

### [Representação visual da arquitetura completa]

- Frontend + Backend + Database + Infrastructure
- Multi-tenant data flow
- Authentication and authorization
- External integrations

## 3. Database Schema Diagrams

### [Para cada conjunto de tabelas do schema]

- Entity-relationship diagrams with organization_id
- Index and constraint visualization
- Data isolation representation
- Table relationships and foreign keys

## 4. API Architecture Diagrams

### [Para cada grupo de endpoints]

- API endpoint mapping
- Request/response flow with org context
- Middleware and authentication flow
- Integration endpoints and webhooks

## 5. User Journey Flow Diagrams

### [Para cada jornada principal]

- Sequence diagrams for major user flows
- Component interaction during journeys
- Data flow through multi-tenant system
- Error handling and edge cases

## 6. Integration Architecture

### [Para cada integração técnica]

- Third-party service connections
- Data synchronization flows
- Webhook processing
- Configuration and setup flows

## 7. Component Interaction Diagrams

- Frontend component relationships
- Backend service dependencies
- Cross-layer communication patterns
- State management and data flow

## 8. Deployment Architecture

### [Baseado na infraestrutura Railway]

- Container and service deployment
- Database and Redis setup
- Environment configuration
- Monitoring and logging setup

## 9. Security and Multi-Tenancy

- Organization isolation patterns
- Authentication flow diagrams
- Data access control visualization
- Security boundary representation

## 10. Diagram Conventions and Legends

- Symbol definitions and meanings
- Relationship notation standards
- Color coding and visual patterns
- Reading guides and interpretation notes
```

## **📝 VALIDAÇÃO FINAL OBRIGATÓRIA**

### **Sempre executar antes de finalizar diagramas:**

```bash
# Verificar se diagramas refletem template atual
echo "✅ Diagramas estão alinhados com:"
echo "- Arquitetura do CLAUDE.md?"
echo "- Estrutura do api/main.py?"
echo "- Componentes do codebase atual?"
echo "- Multi-tenancy do template?"
```

## **🔴 LEMBRETES CRÍTICOS**

- **95% Confidence**: Validar necessidade de cada diagrama gerado
- **Template Compliance**: SEMPRE representar arquitetura real do codebase
- **Codebase Analysis**: NUNCA assumir componentes sem verificar template atual
- **Preservação Total**: NUNCA omitir elementos especificados nos documentos anteriores
- **Multi-Tenancy Visible**: organization_id representado em todos diagramas relevantes
- **Chain Integration**: Consumir PRD + Tech Blueprint + Journeys + Schema + APIs
- **Complete Coverage**: Toda funcionalidade, fluxo e estrutura deve ter representação visual
- **Technical Accuracy**: Diagramas devem refletir implementação real do sistema
- **Organization Scoping**: Isolamento de dados via middleware visível nas visualizações
- **Integration Completeness**: Todas soluções técnicas e integrações representadas

**EXECUTAR ANÁLISE DE CODEBASE + PROCESSO DE GERAÇÃO E GERAR @docs/project/07-diagrams.md**
