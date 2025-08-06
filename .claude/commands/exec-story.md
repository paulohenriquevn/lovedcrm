# exec-story

**Especialista em PLANEJAMENTO DE EXECUÇÃO de user stories, integrando roadmap + refinamento técnico + análise do codebase atual para gerar planos de implementação contextualizados seguindo metodologia DevSolo Docs V4.1 com 99% de certeza técnica.**

**Entrada:**
- `story_id`: ID da história do roadmap (ex: "1.1", "2.3")

**Saída**: Plano de execução detalhado contextualizado com o estado atual do codebase

**Uso:**
```bash
/exec-story "1.1"
/exec-story "2.3"
```

---

## 🚨 **MISSÃO CRÍTICA: PLANEJAMENTO INTELIGENTE COM 99% CERTEZA**

### **PROCESSO AUTOMÁTICO EM 4 FASES**

**O agente NUNCA deve gerar plano sem 99% de certeza sobre implementação. SEMPRE integrar todas as fontes de informação até atingir clareza absoluta.**

- ✅ **DEVE**: Ler automaticamente história do roadmap pelo ID
- ✅ **DEVE**: Ler automaticamente refinamento técnico correspondente  
- ✅ **DEVE**: Analisar estado atual do codebase relevante
- ✅ **DEVE**: Gerar plano de execução contextualizado e viável
- ✅ **DEVE**: Identificar conflitos potenciais e adaptações necessárias
- ❌ **NUNCA**: Assumir estado do código sem verificação direta
- ❌ **NUNCA**: Gerar plano genérico sem contexto específico do projeto
- ❌ **NUNCA**: Ignorar especificações técnicas do refinement

---

## 🏗️ **CONTEXTO SISTEMA MULTI-TENANT SAAS**

### **Projeto**: Multi-Tenant SaaS System - Production Ready

- **Stack**: Next.js 14 + FastAPI + PostgreSQL + Railway
- **UI Framework**: ✅ 100% Shadcn/UI Compliance (31 componentes oficiais)
- **Arquitetura**: Clean Architecture + Header-Based Multi-Tenancy + i18n
- **Status**: ✅ PRODUCTION - 60+ endpoints live on Railway
- **Filosofia**: 99% de confiança + Organization Isolation + Anti-Scope Creep
- **Design System**: ✅ Zero customizações CSS - componentes default apenas

### 🚨 **PRINCÍPIOS FUNDAMENTAIS - EXTREMAMENTE IMPORTANTES (NUNCA QUEBRAR)**

- **KISS (Keep It Simple, Stupid)**: **SEMPRE** escolher a solução mais simples que funciona
- **YAGNI (You Aren't Gonna Need It)**: **NUNCA** implementar funcionalidades "para o futuro"
- **DRY (Don't Repeat Yourself)**: **SEMPRE** reutilizar código existente antes de criar novo
- **⚠️ CRITICAL**: Quebrar estes princípios é considerado falha crítica

### **Fundação Organization-Centric**

- **Isolamento**: organization_id filtering obrigatório em TODAS as queries
- **Middleware**: api/core/organization_middleware.py validation em TODOS os endpoints
- **Frontend**: useOrgContext() + BaseService com X-Org-Id headers automáticos
- **Compliance**: Reutilização obrigatória dos 60+ endpoints existentes

---

## 🔍 **PROCESSO DE PLANEJAMENTO EM 4 FASES**

### **FASE 1: COLETA DE INFORMAÇÕES (15min)**

#### **1.1 Parsing do Story ID**
```yaml
Input: "1.1"
Parse: 
  Epic: 1
  Slice: 1
  Format: [Epic].[Slice]
```

#### **1.2 Leitura Automática do Roadmap**
**Arquivo**: `docs/project/11-roadmap.md`

```yaml
Busca Automática:
  Pattern: "Slice [ID]:" ou "[ID]:" ou "História [ID]:"
  Extract:
    - ID: [Número da história]
    - Título: [Nome exato da história]
    - Epic: [Epic pai]
    - User Story: [Como/Eu quero/Para que]
    - Acceptance Criteria: [Lista completa]
    - Technical Tasks: [Tarefas técnicas se existirem]
    - Deliverables: [Entregáveis esperados]
    - Estimativa: [Story points/horas se definido]
```

#### **1.3 Leitura Automática do Refinement**
**Arquivo**: `docs/refined-stories/[ID]-[nome_snake_case].md`

```yaml
Busca Automática:
  Filename Pattern: "/[1.1]-*.md" ou "/1.1-*.md"
  Extract:
    - Status Refinamento: [99% certainty, bibliotecas identificadas]
    - Pesquisa Técnica: [Documentação oficial, bibliotecas open source]
    - Especificação Técnica: [Arquitetura, modelos, endpoints, componentes]
    - Bibliotecas Aceleradoras: [Versões específicas, setup, justificativas]
    - Riscos e Mitigações: [Alto/Médio/Baixo com planos de ação]
    - Critérios Aceite Técnicos: [Checklist técnico específico]
    - Timeline Estimado: [Horas de implementação detalhadas]
```

#### **1.4 Falha Graceful se Refinement Não Existe**
```yaml
Se refinement não encontrado (padrão: [ID]-*.md):
  - Log warning sobre ausência de refinamento técnico
  - Sugerir execução de /exec-roadmap [ID] primeiro
  - Continuar com plano baseado apenas no roadmap (menos certeza)
  - Marcar plano como "BAIXA CERTEZA - REFINEMENT NECESSÁRIO"
```

### **FASE 2: ANÁLISE DO CODEBASE ATUAL (20min)**

#### **2.1 Mapeamento de Arquivos Relevantes**
```yaml
Com base no refinement, analisar:

Backend Files:
  Models: api/models/[modelos_mencionados].py
  Repositories: api/repositories/[repositories_mencionados].py  
  Services: api/services/[services_mencionados].py
  Routers: api/routers/[routers_mencionados].py
  Migrations: migrations/[migrations_relacionadas].sql

Frontend Files:
  Pages: app/[locale]/admin/[rotas_mencionadas]/
  Components: components/[componentes_mencionados]/
  Services: services/[services_mencionados].ts
  Hooks: hooks/[hooks_mencionados].ts
  Types: types/[types_mencionados].ts
```

#### **2.2 Análise do Estado Atual**
```yaml
Para cada arquivo relevante:
  Status: [Existe | Não existe | Parcialmente implementado]
  Conteúdo Atual: [Resumo do que já está implementado]
  Compatibilidade: [Compatible | Needs modification | Conflicts]
  Organization Context: [Já tem org filtering | Precisa adicionar]
  Dependencies: [Já importado | Precisa instalar | Conflitos]
```

#### **2.3 Análise de Dependencies/Bibliotecas**
```yaml
Bibliotecas do Refinement vs Estado Atual:
  package.json: [Bibliotecas já instaladas vs necessárias]
  requirements.txt: [Python packages atuais vs necessários]
  shadcn/ui: [Componentes já disponíveis vs necessários]
  Conflicts: [Versões conflitantes ou incompatibilidades]
```

#### **2.4 Database Schema Analysis**
```yaml
Schema Atual vs Necessário:
  Tabelas Existentes: [Lista de tabelas atuais relacionadas]
  Migrations Aplicadas: [Últimas migrations e versão atual]
  Schema Gap: [O que precisa ser criado/modificado]
  Índices: [Índices atuais vs necessários para performance]
```

### **FASE 3: INTEGRAÇÃO E ANÁLISE DE GAPS (15min)**

#### **3.1 Gap Analysis Detalhado**
```yaml
Roadmap vs Refinement vs Codebase:
  Functional Gaps:
    - [Funcionalidades no roadmap não cobertas no refinement]
    - [Especificações técnicas não implementadas no codebase]
  
  Technical Gaps:
    - [Arquivos que precisam ser criados]
    - [Arquivos que precisam ser modificados]
    - [Dependências que precisam ser instaladas]
  
  Architecture Gaps:
    - [Padrões organization-centric não implementados]
    - [Middleware/validações ausentes]
    - [Testes de isolation não implementados]
```

#### **3.2 Conflict Detection**
```yaml
Conflitos Potenciais:
  Code Conflicts:
    - [Implementações existentes que conflitam com specs]
    - [Naming conventions inconsistentes]
    - [Arquitetura patterns diferentes]
  
  Dependency Conflicts:
    - [Versões incompatíveis de bibliotecas]
    - [Bibliotecas que conflitam entre si]
  
  Performance Conflicts:
    - [Implementações que podem degradar performance]
    - [Queries que podem causar N+1 problems]
```

#### **3.3 Risk Assessment Contextualizado**
```yaml
Riscos do Refinement vs Estado Atual:
  Technical Risks:
    - [Riscos do refinement ainda válidos]
    - [Novos riscos identificados pela análise do codebase]
  
  Integration Risks:
    - [Riscos de quebrar funcionalidades existentes]
    - [Riscos de isolation/multi-tenancy]
  
  Timeline Risks:
    - [Estimativas do refinement vs complexidade real do codebase]
    - [Dependências não mapeadas que podem atrasar]
```

### **FASE 4: GERAÇÃO DO PLANO DE EXECUÇÃO (20min)**

#### **4.1 Sequenciamento Otimizado**
```yaml
Sequência de Implementação:
  Phase 1 - Foundation:
    - [Dependencies installation]
    - [Database migrations]
    - [Base models/repositories]
  
  Phase 2 - Backend Core:
    - [Services implementation]
    - [API endpoints]
    - [Organization middleware integration]
  
  Phase 3 - Frontend Integration:
    - [Components development]
    - [Pages implementation]
    - [Service integration]
  
  Phase 4 - Testing & Validation:
    - [Unit tests]
    - [Integration tests]
    - [Organization isolation tests]
```

#### **4.2 Step-by-Step Implementation Plan**
```yaml
Detailed Steps:
  Step 1: [Ação específica]
    - Time: [X] minutes
    - Files: [Arquivos específicos para modificar/criar]
    - Commands: [Comandos exatos para executar]
    - Validation: [Como validar que step foi concluído]
  
  Step 2: [Próxima ação específica]
    - Dependencies: [Depende do Step 1]
    - Time: [Y] minutes
    - Files: [Arquivos específicos]
    - Commands: [Comandos exatos]
    - Validation: [Validação específica]
  
  [Continuar para todos os steps...]
```

#### **4.3 Context-Aware Adaptations**
```yaml
Adaptações Baseadas no Codebase Atual:
  Modifications:
    - [Arquivos existentes que precisam ser modificados]
    - [Seções específicas de código para alterar]
  
  Extensions:
    - [Funcionalidades existentes para estender]
    - [Padrões existentes para reutilizar]
  
  Integrations:
    - [Como integrar com código existente]
    - [Pontos de integração específicos]
```

---

## 📋 **TEMPLATE DE OUTPUT OBRIGATÓRIO**

### **Estrutura do Plano: CONTEXTUALIZED EXECUTION PLAN**

```markdown
# PLANO DE EXECUÇÃO: [ID] - [TÍTULO]

## 📊 Status da Análise
- **Roadmap Lido**: ✅ História [ID] identificada e parseada
- **Refinement Lido**: ✅ docs/refined-stories/[ID] - [Nome].md processado
- **Codebase Analisado**: ✅ [X] arquivos relevantes analisados
- **Certeza Técnica**: ✅ 99% (com refinement) | ⚠️ 70% (sem refinement)
- **Conflitos Detectados**: [Nenhum | X conflitos identificados]
- **Timeline Estimado**: ⏱️ [X] horas (ajustado ao contexto atual)

---

## 🎯 **HISTÓRIA INTEGRADA**

### **Do Roadmap (docs/project/11-roadmap.md)**
#### **User Story**
- **Como**: [Persona específica]
- **Eu quero**: [Ação desejada]  
- **Para que**: [Valor de negócio]

#### **Acceptance Criteria**
- [Critério 1 do roadmap]
- [Critério 2 do roadmap]
- [...]

### **Do Refinement Técnico (docs/refined-stories/[ID]-[nome].md)**
#### **Especificações Técnicas Validadas**
- **Bibliotecas Identificadas**: [Lista com versões específicas]
- **Arquitetura Definida**: [Camadas e fluxo de dados]
- **Riscos Mapeados**: [Alto/Médio/Baixo com mitigações]
- **Performance Requirements**: [Benchmarks específicos]

#### **Bibliotecas Aceleradoras Pré-Pesquisadas**
```yaml
[Nome da Biblioteca]:
  Versão: [Versão específica]
  Função: [O que acelera]
  Bundle Impact: [Tamanho]
  Setup: [Comandos de instalação]
  Justificativa: [Por que foi escolhida]
```

---

## 🔍 **ANÁLISE DO CODEBASE ATUAL**

### **Estado dos Arquivos Relevantes**

#### **✅ Arquivos Existentes**
```yaml
Backend:
  api/models/[modelo].py: 
    Status: [Completo | Parcial | Compatível]
    Org Context: [Implementado | Precisa adicionar]
  
  api/routers/[router].py:
    Status: [Existe | Não existe]  
    Endpoints: [Lista de endpoints atuais]

Frontend:
  app/[locale]/admin/[rota]/: 
    Status: [Implementado | Não existe]
  components/ui/: 
    shadcn Components: [Lista dos 31 disponíveis]
```

#### **❌ Gaps Identificados**
```yaml
Missing Files:
  - [Arquivo 1 que precisa ser criado]
  - [Arquivo 2 que precisa ser criado]

Missing Dependencies:
  - [Biblioteca 1 que precisa ser instalada]
  - [Biblioteca 2 que precisa ser instalada]

Missing Database:
  - [Tabela 1 que precisa ser criada]
  - [Índice 1 que precisa ser criado]
```

#### **⚠️ Conflitos Detectados**
```yaml
Code Conflicts:
  - [Conflito 1: descrição e resolução]
  - [Conflito 2: descrição e resolução]

Version Conflicts:
  - [Biblioteca X versão atual vs necessária]

Architecture Conflicts:
  - [Pattern atual vs pattern necessário]
```

---

## 🚀 **PLANO DE EXECUÇÃO CONTEXTUALIZADO**

### **Timeline Ajustado ao Estado Atual**
- **Total Estimado**: [X] horas (ajustado do refinement)
- **Setup**: [X]h (bibliotecas + configurações necessárias)
- **Backend**: [X]h (considerando código existente)
- **Frontend**: [X]h (considerando componentes disponíveis)
- **Testing**: [X]h (org isolation + funcionalidade)
- **Integration**: [X]h (integração com código existente)

### **Fase 1: Foundation Setup ([X]h)**

#### **Step 1.1: Dependencies Installation ([X]min)**
```bash
# Bibliotecas identificadas no refinement
npm install [biblioteca1]@[versao] [biblioteca2]@[versao]
pip install [python_package1]==[versao]

# Verificar compatibilidade
npm list [biblioteca]
pip list | grep [package]
```
**Files Modified**: package.json, requirements.txt
**Validation**: Bibliotecas instaladas sem conflitos

#### **Step 1.2: Database Migration ([X]min)**
```sql
-- Baseado no refinement + análise atual do schema
-- Migration: [numero]_[nome].sql
CREATE TABLE [tabela] (
    -- Estrutura definida no refinement
    organization_id UUID NOT NULL REFERENCES organizations(id),
    -- Campos específicos...
);

CREATE INDEX [index_name] ON [tabela](organization_id, [campo]);
```
**Files Created**: migrations/[numero]_[nome].sql
**Validation**: `./migrate status` confirma aplicação

#### **Step 1.3: Base Models ([X]min)**
```python
# api/models/[modelo].py
# Baseado na especificação do refinement + padrões existentes

class [Modelo](Base):
    __tablename__ = "[tabela]"
    
    # Organization isolation obrigatório
    organization_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), 
        ForeignKey("organizations.id"), 
        nullable=False
    )
    # Campos específicos baseados no refinement...
```
**Files Created**: api/models/[modelo].py
**Validation**: Import sem erros + SQLAlchemy validation

### **Fase 2: Backend Implementation ([X]h)**

#### **Step 2.1: Repository Layer ([X]min)**
```python
# api/repositories/[repository].py
# Seguindo pattern existente + org filtering obrigatório

class [Repository](BaseRepository):
    def get_by_organization(self, org_id: UUID) -> List[[Model]]:
        return self.db.query([Model]).filter(
            [Model].organization_id == org_id
        ).all()
    
    # Métodos específicos baseados no refinement...
```
**Files Created**: api/repositories/[repository].py
**Validation**: Queries com org filtering + tests básicos

#### **Step 2.2: Service Layer ([X]min)**
```python
# api/services/[service].py
# Business logic baseada no refinement + org validation

class [Service]:
    async def create_[entity](
        self, 
        data: [Schema], 
        org_id: UUID
    ) -> [Model]:
        # Validação org context
        # Business rules do refinement
        # Return with org isolation
```
**Files Created**: api/services/[service].py  
**Validation**: Business logic + org context validation

#### **Step 2.3: API Endpoints ([X]min)**
```python
# api/routers/[router].py
# Endpoints baseados na especificação do refinement

@router.get("/[resource]")
async def list_[resource](
    org: Organization = Depends(get_current_organization),
    service: [Service] = Depends()
):
    return await service.get_organization_[resources](org.id)

# Endpoints específicos do refinement...
```
**Files Created**: api/routers/[router].py
**Validation**: Endpoints com org middleware + documentation

### **Fase 3: Frontend Implementation ([X]h)**

#### **Step 3.1: Services Layer ([X]min)**
```typescript
// services/[service].ts
// Baseado no BaseService + especificações do refinement

export class [Service] extends BaseService {
  async get[Resources](): Promise<[Type][]> {
    return this.get<[Type][]>('/api/[resource]')
    // X-Org-Id adicionado automaticamente pelo BaseService
  }
  
  // Métodos específicos do refinement...
}

export const [service] = new [Service]()
```
**Files Created**: services/[service].ts
**Validation**: Service calls com org context automático

#### **Step 3.2: Components ([X]min)**
```tsx
// components/[feature]/[Component].tsx  
// Usando APENAS shadcn/ui componentes oficiais

import { [ComponentsShadcn] } from "@/components/ui/[component]"
import { useOrgContext } from "@/hooks/use-org-context"
import { [service] } from "@/services/[service]"

export function [Component]() {
  const { organization } = useOrgContext()
  // Implementação baseada no refinement...
  
  // Usando bibliotecas aceleradoras identificadas
  // Ex: @dnd-kit/core para drag & drop
}
```
**Files Created**: components/[feature]/[Component].tsx
**Validation**: Render + org context + shadcn/ui compliance

#### **Step 3.3: Pages Integration ([X]min)**
```tsx
// app/[locale]/admin/[rota]/page.tsx
// Seguindo estrutura multi-tenant obrigatória

export default function [Page]() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <[Component] />
    </div>
  )
}
```
**Files Created**: app/[locale]/admin/[rota]/page.tsx
**Validation**: Page accessible + layout correto

### **Fase 4: Testing & Validation ([X]h)**

#### **Step 4.1: Organization Isolation Tests ([X]min)**
```python
# tests/e2e/api/test_[feature]_isolation.py
# CRÍTICO: Baseado nos testes do refinement

@pytest.mark.asyncio
async def test_organization_isolation():
    # Criar item na org A
    # Tentar acessar da org B
    # DEVE falhar com 403/404
    # Validar org A ainda pode acessar
```
**Files Created**: tests/e2e/api/test_[feature]_isolation.py
**Validation**: 100% org isolation garantido

#### **Step 4.2: Frontend Tests ([X]min)**
```typescript
// __tests__/components/[Component].test.tsx
// Baseado nos testes do refinement

describe('[Component]', () => {
  test('uses organization context correctly', () => {
    // Test org context usage
    // Test service integration
    // Test component rendering
  })
})
```
**Files Created**: __tests__/components/[Component].test.tsx
**Validation**: Component tests + org context validation

#### **Step 4.3: Integration Validation ([X]min)**
```bash
# Validação end-to-end baseada nos critérios do refinement

# Backend health
curl http://localhost:8000/api/[resource] -H "X-Org-Id: [org-id]"

# Frontend functionality  
npm run test -- [Component].test.tsx

# Database integrity
./migrate status
```
**Validation**: Full flow functional + performance requirements met

---

## ⚠️ **RISCOS E MITIGAÇÕES CONTEXTUALIZADOS**

### **Riscos do Refinement Ainda Válidos**
```yaml
[Risco do Refinement]:
  Status: [Ainda válido | Mitigado pelo estado atual | Novo contexto]
  Mitigation: [Ação específica considerando codebase atual]
  Timeline Impact: [Sem impacto | +X horas]
```

### **Novos Riscos Identificados pela Análise do Codebase**
```yaml
Integration Risk: [Descrição]
  Probability: [Alta/Média/Baixa]
  Impact: [Descrição específica]
  Mitigation: [Ação específica]
  
Code Conflict Risk: [Descrição]
  Current Conflict: [Conflito específico identificado]
  Resolution: [Como resolver]
  Time Cost: [+X horas para resolução]
```

---

## 📋 **CRITÉRIOS DE ACEITE INTEGRADOS**

### **Do Roadmap (Business)**
- [ ] [Critério 1 do roadmap]
- [ ] [Critério 2 do roadmap]
- [ ] [...]

### **Do Refinement (Técnico)**
- [ ] Organization isolation 100% implementado
- [ ] Performance requirements atendidos ([metrics específicos])
- [ ] shadcn/ui compliance mantido
- [ ] Bibliotecas aceleradoras integradas corretamente

### **Do Codebase (Integração)**
- [ ] Zero quebra de funcionalidades existentes
- [ ] Padrões arquiteturais mantidos consistentes
- [ ] Dependencies conflicts resolvidos
- [ ] Migration aplicada sem dados corrompidos

---

## 🔧 **COMANDOS DE EXECUÇÃO**

### **Setup Environment**
```bash
# Install dependencies identified in refinement
npm install [specific versions from refinement]
pip install [specific versions from refinement]

# Apply database migrations
cd migrations && ./migrate apply

# Verify setup
npm run typecheck
python3 -c "import api.models.[new_model]; print('OK')"
```

### **Development Commands**
```bash
# Start development servers
npm run dev

# Run specific tests as you implement
npm run test -- [Component].test.tsx
python3 -m pytest tests/e2e/api/test_[feature]_isolation.py -v

# Validate org isolation (CRITICAL)
python3 -m pytest -m "isolation" -v
```

### **Validation Commands**
```bash
# Verify implementation matches plan
curl http://localhost:8000/api/[resource] -H "X-Org-Id: [test-org-id]"

# Check performance requirements
python3 -m pytest -m "performance" -v

# Validate frontend integration
npm run test -- [feature]
```

---

## 🎯 **SUCCESS CRITERIA**

### **Technical Success**
- [ ] All files created/modified as planned
- [ ] All tests passing (unit + integration + isolation)
- [ ] Performance benchmarks met
- [ ] Zero code conflicts remaining

### **Business Success**  
- [ ] User story acceptance criteria met
- [ ] Feature usable end-to-end
- [ ] Organization isolation verified
- [ ] No regression in existing features

### **Integration Success**
- [ ] Seamless integration with existing codebase
- [ ] Consistent with established patterns
- [ ] Documentation updated appropriately
- [ ] Ready for production deployment

---

## ⏱️ **TIMELINE SUMMARY**

**Estimated Total**: [X] hours (contextualized to current codebase state)

- **Foundation Setup**: [X]h
- **Backend Implementation**: [X]h  
- **Frontend Implementation**: [X]h
- **Testing & Validation**: [X]h
- **Integration & Polish**: [X]h

**Critical Path**: [Identify dependencies that could block progress]
**Parallel Work**: [Steps that can be done simultaneously]
**Validation Gates**: [Key checkpoints before proceeding to next phase]

---

**🚨 EXECUTION READY**: Este plano foi gerado com base em análise completa do roadmap + refinement técnico + estado atual do codebase. Implementação pode começar imediatamente seguindo os steps sequenciais.

### **🔴 ATUALIZAÇÃO ROADMAP OBRIGATÓRIA**

**SEMPRE QUE UMA HISTÓRIA FOR COMPLETADA:**
- ✅ **DEVE**: Marcar história como "✅ CONCLUÍDO" no roadmap (`docs/project/11-roadmap.md`)
- ✅ **DEVE**: Atualizar status da história de "⏳ Em andamento" para "✅ Implementado"
- ✅ **DEVE**: Adicionar data de conclusão ao lado do status
- ✅ **DEVE**: Atualizar progresso do Epic pai se aplicável
- ❌ **NUNCA**: Deixar história implementada sem marcação de conclusão no roadmap

**Exemplo de atualização:**
```markdown
## Slice 1.1: Pipeline Foundation ✅ CONCLUÍDO (08/01/2025)
- Status: ~~⏳ Em andamento~~ → ✅ Implementado em 08/01/2025
```
```

---

## 🎯 **VALIDAÇÕES FINAIS OBRIGATÓRIAS**

### **INTEGRATED ANALYSIS CHECKLIST**
- [ ] **Roadmap Story**: História identificada e parseada corretamente
- [ ] **Technical Refinement**: Especificações técnicas integradas ao plano
- [ ] **Codebase Analysis**: Estado atual mapeado e gaps identificados  
- [ ] **Conflict Resolution**: Todos os conflitos potenciais endereçados
- [ ] **Organization Isolation**: Validação multi-tenant em todos os steps
- [ ] **Timeline Realistic**: Estimativas ajustadas ao contexto real do projeto
- [ ] **Step-by-Step Detail**: Cada step executável independentemente
- [ ] **Validation Gates**: Critérios de sucesso claros para cada fase

### **QUALITY GATES**
- ❌ **REJEIÇÃO AUTOMÁTICA se roadmap story não for encontrada**
- ❌ **REJEIÇÃO AUTOMÁTICA se quebrar princípios KISS/YAGNI/DRY**
- ❌ **REJEIÇÃO AUTOMÁTICA se não manter organization isolation**
- ❌ **REJEIÇÃO AUTOMÁTICA se conflitar com codebase existente sem resolução**

---

## 🚫 **ANTI-PATTERNS DETECTADOS AUTOMATICAMENTE**

### **RED FLAGS - PARAR IMEDIATAMENTE**
- 🚨 História não encontrada no roadmap especificado
- 🚨 Refinement existe mas não é compatível com roadmap
- 🚨 Plano quebra funcionalidades existentes do codebase
- 🚨 Organization isolation não implementado em algum step
- 🚨 Dependencies conflitam com versões atuais
- 🚨 Timeline irrealista considerando complexidade atual
- 🚨 Steps não executáveis independentemente
- 🚨 Critérios de aceite não verificáveis objetivamente

### **INTEGRATION REQUIREMENTS**
- **Minimum Compatibility**: Plano deve ser 100% compatível com codebase atual
- **Zero Regression**: Nenhuma funcionalidade existente pode ser quebrada
- **Pattern Consistency**: Deve seguir padrões arquiteturais estabelecidos
- **Org Isolation Mandatory**: Todos os steps devem manter isolamento organization_id

---

**LEMBRETE CRÍTICO**: Este agente gera PLANOS DE EXECUÇÃO, não implementa diretamente. O plano deve ser tão detalhado e contextualizado que qualquer desenvolvedor possa executá-lo step-by-step com 99% de certeza de sucesso. Integração roadmap + refinement + codebase atual é obrigatória para máxima precisão.