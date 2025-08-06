# 06-solution_diagrams.md - Loved CRM

## **MODELO DETECTADO: B2B**

**Modelo confirmado**: B2B conforme 03-tech.md, 04-database.md e 05-apis.md
**Justificativa**: Agências digitais com equipes colaborativas, múltiplos usuários por organização, roles hierárquicos (owner/admin/member)
**Diagramação adaptada**: Organization-scoped para B2B (organizações compartilhadas + visualização de relacionamentos colaborativos + diagramas com escopo organizacional + padrões de interação de equipe)

## **DIAGRAMAÇÃO TÉCNICA MODELO-ESPECÍFICA**

**Framework**: Next.js 14 + FastAPI + PostgreSQL + Railway
**Foco**: Visualização de arquitetura + componentes + relacionamentos model-aware
**Escopo**: Representações específicas do codebase baseado em 60+ endpoints Sistema em Produção
**Abordagem**: Diagramas precisos + documentação visual + guias de interpretação conforme modelo B2B detectado

## **ARQUITETURA SISTEMA COMPLETA**

### **ARQUITETURA DE ALTO NÍVEL**

```
┌─────────────────────────────────────────────────────────────────┐
│ CAMADA CLIENTE - Next.js 14 (Porta 3000)                       │
├─────────────────────────────────────────────────────────────────┤
│ App Router (/[locale]/admin/*)                                  │
│ ├── Componentes shadcn/ui + Tailwind CSS                       │
│ ├── Contexto de Organização (hooks/use-org-context.ts)         │
│ ├── BaseService (services/base.ts - headers X-Org-Id auto)     │
│ └── Stores Zustand (estado com escopo org B2B)                 │
└─────────────────────────────────────────────────────────────────┘
                           │ HTTP/HTTPS
                           │ Header: X-Org-Id (B2B Context)
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│ CAMADA API - FastAPI (Porta 8000)                              │
├─────────────────────────────────────────────────────────────────┤
│ api/core/organization_middleware.py (validar X-Org-Id B2B)     │
│ ├── Autenticação JWT + claims org_id                           │
│ ├── Roteadores API (dependência get_current_organization)      │
│ ├── Camada de Serviço (lógica de negócio B2B)                  │
│ └── api/repositories/base.py (queries filtradas por org B2B)   │
└─────────────────────────────────────────────────────────────────┘
                           │ SQLAlchemy ORM
                           │ filtro organization_id (B2B)
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│ CAMADA BANCO DE DADOS - PostgreSQL 16 (Railway)               │
├─────────────────────────────────────────────────────────────────┤
│ ├── Todas tabelas têm FK organization_id (B2B)                 │
│ ├── Índices em (organization_id, primary_key)                  │
│ ├── Sistema de Migração Customizado (não Alembic)             │
│ └── Connection Pooling (otimização por organização B2B)        │
└─────────────────────────────────────────────────────────────────┘
```

## **COMUNICAÇÃO ENTRE COMPONENTES B2B**

### **1. Fluxo Frontend → Backend (Organizações Compartilhadas)**

```typescript
// 1. Ação do Usuário B2B (Frontend)
const { organization } = useOrgContext() // hooks/use-org-context.ts
const data = await itemsService.create(itemData)

// 2. services/base.ts Adiciona Headers B2B Automaticamente
const response = await fetch('/api/v1/items', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'X-Org-Id': organization.id,  // Auto-injetado para contexto B2B
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(itemData)
})

// 3. api/core/organization_middleware.py FastAPI B2B
// Valida X-Org-Id corresponde com claim org_id do JWT
// Injeta contexto organizacional B2B na requisição
// Previne acesso cross-organizacional entre agências
```

### **2. Fluxo de Processamento Backend B2B**

```python
# 1. Endpoint do Roteador B2B
@router.post("/items")
async def create_item(
    item_data: ItemCreateSchema,
    organization: Organization = Depends(get_current_organization),  # api/core/deps.py
    db: Session = Depends(get_db)
):
    # 2. Camada de Serviço B2B
    service = ItemService(db)
    return service.create_organization_item(organization.id, item_data)

# 3. Camada api/repositories/base.py B2B
class ItemRepository(SQLRepository[Item]):  # Baseado em api/repositories/base.py
    def create_for_organization(self, org_id: UUID, data: dict):
        # Auto-filtrado por organization_id (organizações compartilhadas B2B)
        item = Item(organization_id=org_id, **data)
        self.db.add(item)
        return item
```

### **3. Padrão de Query do Banco de Dados B2B**

```sql
-- Todas queries automaticamente com escopo org B2B
SELECT * FROM items
WHERE organization_id = $1  -- Sempre presente para isolamento B2B
  AND active = true
  ORDER BY created_at DESC
  LIMIT 20;

-- Queries cross-organization impossíveis no modelo B2B
-- Toda tabela tem constraint FK organization_id
-- Previne vazamentos de dados entre agências
```

## **COMPONENTES CENTRAIS DO SISTEMA B2B**

### **Sistema de Gerenciamento de Organizações B2B**

```python
# Gerenciamento de Contexto Organizacional B2B
class OrganizationService:
    - create_organization(user: User) -> Organization  # Criar agência
    - add_member(org_id: UUID, user_id: UUID, role: str)  # Adicionar membro equipe
    - validate_membership(org_id: UUID, user_id: UUID) -> bool  # Validar acesso B2B
    - switch_organization(user: User, org_id: UUID) -> JWT  # Trocar contexto

# api/core/organization_middleware.py B2B
class OrganizationMiddleware:
    - validate_org_header(request: Request) -> UUID  # Validar contexto B2B
    - inject_org_context(request: Request, org_id: UUID)  # Injetar contexto
    - prevent_cross_org_access(user_org_id: UUID, request_org_id: UUID)  # Anti-leak
```

### **Sistema de Autenticação e Segurança B2B**

```python
# JWT com Claims Organizacionais B2B
{
  "user_id": "uuid",
  "org_id": "uuid",        # Organização ativa (agência)
  "organizations": [       # Todas agências acessíveis ao usuário
    {"org_id": "uuid", "role": "owner"},     # Owner da agência
    {"org_id": "uuid", "role": "admin"},     # Admin em outra agência
    {"org_id": "uuid", "role": "member"}     # Membro de outra agência
  ],
  "exp": timestamp
}

# Dependências de Segurança B2B
- get_current_user() -> User  # Usuário autenticado
- get_current_organization() -> Organization  # api/core/deps.py - Valida X-Org-Id B2B
- get_organization_member() -> OrganizationMember  # Membership na agência
- require_admin() -> Organization (role admin requerido na agência)
- require_owner() -> Organization (role owner requerido na agência)
```

### **Camada de Acesso a Dados B2B**

```python
# Padrão api/repositories/base.py (Com Escopo Organizacional B2B)
class SQLRepository(Generic[T]):  # Definido em api/repositories/base.py
    def get_by_organization(self, org_id: UUID) -> List[T]:
        # Buscar por organização (agência)
        return self.db.query(self.model)\
            .filter(self.model.organization_id == org_id)\
            .all()

    def create_for_organization(self, org_id: UUID, data: dict) -> T:
        # Criar com escopo organizacional B2B
        instance = self.model(organization_id=org_id, **data)
        self.db.add(instance)
        return instance

# Todos Modelos de Negócio B2B
class BaseModel:
    id: UUID = primary_key
    organization_id: UUID = foreign_key(organizations.id)  # OBRIGATÓRIO B2B
    created_at: datetime
    updated_at: datetime
    
    # Relacionamento com organização (agência)
    organization = relationship("Organization", back_populates="items")
```

### **Gerenciamento de Estado Frontend B2B**

```typescript
// Contexto de Organização B2B (hooks/use-org-context.ts)
const OrgContext = createContext<{
  organization: Organization  // Agência ativa
  switchOrganization: (orgId: string) => Promise<void>  // Trocar agência
  validateOrgAccess: (orgId: string) => boolean  // Validar acesso B2B
  isOwner: boolean  // É owner da agência
  isAdmin: boolean  // É admin da agência
  isMember: boolean  // É membro da agência
}>()

// Padrão services/base.ts (Headers Automáticos B2B)
class BaseService {
  private async request(endpoint: string, options: RequestInit) {
    const { organization } = useOrgContext()  # hooks/use-org-context.ts B2B

    return fetch(endpoint, {
      ...options,
      headers: {
        "X-Org-Id": organization.id, // Auto-injetado contexto B2B
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    })
  }
}

// Store Zustand (Com Escopo Organizacional B2B)
interface OrgStore {
  currentOrg: Organization  // Agência ativa
  orgData: Record<string, any>  // Dados com escopo por agência
  availableOrgs: Organization[]  // Agências do usuário
  setCurrentOrg: (org: Organization) => void  // Ativar agência
  clearOrgData: () => void  // Limpar dados organizacionais
}
```

## **DIAGRAMAS DE VISUALIZAÇÃO TÉCNICA B2B**

### **Diagrama de Classes - Modelo B2B**

```
┌─────────────────────────┐    ┌─────────────────────────┐
│     Organization        │    │         User            │
│     (Agência)          │    │      (Usuário)         │
├─────────────────────────┤    ├─────────────────────────┤
│ + id: UUID             │    │ + id: UUID             │
│ + name: String         │◄──┐│ + email: String        │
│ + slug: String         │   ││ + password_hash: String│
│ + subscription_tier    │   ││ + is_active: Boolean   │
│ + is_personal: False   │   ││ + created_at: DateTime │
│ + owner_id: UUID       │   │└─────────────────────────┘
│ + settings: JSONB      │   │             │
│ + created_at: DateTime │   │             │ 1..*
├─────────────────────────┤   │             ▼
│ + add_member()         │   │ ┌─────────────────────────┐
│ + remove_member()      │   │ │  OrganizationMember     │
│ + get_members()        │   │ │   (Membership B2B)      │
│ + validate_access()     │   │ ├─────────────────────────┤
└─────────────────────────┘   │ │ + id: UUID             │
           │ 1..*             │ │ + organization_id: UUID │
           ▼                  │ │ + user_id: UUID        │
┌─────────────────────────┐   │ │ + role: Enum           │
│        Leads            │   │ │   (owner/admin/member)  │
│   (Leads da Agência)    │   │ │ + is_active: Boolean   │
├─────────────────────────┤   │ │ + joined_at: DateTime  │
│ + id: UUID             │   │ ├─────────────────────────┤
│ + organization_id: UUID │───┘ │ + promote_to_admin()   │
│ + name: String         │     │ + demote_to_member()   │
│ + email: String        │     │ + deactivate()         │
│ + phone: String        │     └─────────────────────────┘
│ + stage: Enum          │
│ + assigned_user_id: UUID│
│ + created_at: DateTime │
├─────────────────────────┤
│ + move_to_stage()      │
│ + assign_to_user()     │
│ + get_communications() │
└─────────────────────────┘
           │ 1..*
           ▼
┌─────────────────────────┐
│    Communications       │
│ (Timeline da Agência)   │
├─────────────────────────┤
│ + id: UUID             │
│ + organization_id: UUID │
│ + lead_id: UUID        │
│ + channel: Enum        │
│ + direction: Enum      │
│ + content: Text        │
│ + sent_at: DateTime    │
├─────────────────────────┤
│ + mark_as_read()       │
│ + create_follow_up()   │
└─────────────────────────┘
```

### **Diagrama de Componentes - Frontend B2B**

```
┌─────────────────────────────────────────────────────────────────┐
│                      Frontend Next.js 14                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  OrgSelector    │  │  TeamManagement │  │  RoleManager    │ │
│  │   Component     │  │    Component    │  │   Component     │ │
│  │                 │  │                 │  │                 │ │
│  │ - Listar orgs   │  │ - Listar membros│  │ - Gerenciar     │ │
│  │ - Trocar org    │  │ - Convidar      │  │   permissões    │ │
│  │ - Contexto ativo│  │ - Remover       │  │ - Owner/Admin   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│           │                      │                      │       │
│           └──────────────────────┼──────────────────────┘       │
│                                  │                              │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │           useOrgContext (hooks/use-org-context.ts)           │ │
│  │                    Hook de Contexto B2B                     │ │
│  ├─────────────────────────────────────────────────────────────┤ │
│  │ + organization: Organization (Agência ativa)                │ │
│  │ + isOwner: boolean (É dono da agência?)                     │ │
│  │ + isAdmin: boolean (É admin da agência?)                    │ │
│  │ + isMember: boolean (É membro da agência?)                  │ │
│  │ + validateOrgAccess(orgId): boolean                         │ │
│  │ + requireOrgAccess(orgId): void                             │ │
│  │ + hasRole(roles): boolean                                   │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                  │                              │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │              BaseService (services/base.ts)                 │ │
│  │                   Service Layer B2B                         │ │
│  ├─────────────────────────────────────────────────────────────┤ │
│  │ + validateOrganizationContext(): OrgContext                 │ │
│  │ + request<T>(endpoint, options): Promise<T>                 │ │
│  │ + headers: { "X-Org-Id": organization.id }                 │ │
│  │ + handleOrganizationError(): void                           │ │
│  │ + handleOrganizationHeaderError(): void                     │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                                 │ HTTP/HTTPS + X-Org-Id
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Backend FastAPI                           │
│                 (API Layer com Contexto B2B)                   │
└─────────────────────────────────────────────────────────────────┘
```

### **Diagrama de Sequência - Fluxo B2B Completo**

```
Usuario    OrgContext   BaseService   Middleware   Deps    Service   Repository   Database
  │            │           │            │          │        │          │          │
  │ 1. Ação    │           │            │          │        │          │          │
  │─────────►  │           │            │          │        │          │          │
  │            │ 2. Get    │            │          │        │          │          │
  │            │   OrgId   │            │          │        │          │          │
  │            │────────►  │            │          │        │          │          │
  │            │           │ 3. Add     │          │        │          │          │
  │            │           │   Headers  │          │        │          │          │
  │            │           │   X-Org-Id │          │        │          │          │
  │            │           │────────────┼──────────┼────────┼──────────┼─────────►│
  │            │           │            │ 4. Validate      │          │          │
  │            │           │            │   X-Org-Id       │          │          │
  │            │           │            │   vs JWT         │          │          │
  │            │           │            │──────────►       │          │          │
  │            │           │            │          │ 5. Get │          │          │
  │            │           │            │          │   Org  │          │          │
  │            │           │            │          │──────► │          │          │
  │            │           │            │          │        │ 6. Query │          │
  │            │           │            │          │        │   Filtered         │
  │            │           │            │          │        │   by OrgId         │
  │            │           │            │          │        │────────► │          │
  │            │           │            │          │        │          │ 7. SQL   │
  │            │           │            │          │        │          │   WHERE  │
  │            │           │            │          │        │          │   org_id │
  │            │           │            │          │        │          │────────► │
  │            │           │            │          │        │          │ 8. Results │
  │            │           │            │          │        │          │◄──────── │
  │            │           │            │          │        │ 9. Data  │          │
  │            │           │            │          │        │◄──────── │          │
  │            │           │            │          │ 10. Response    │          │
  │            │           │            │          │◄────── │          │          │
  │            │           │ 11. Success│          │        │          │          │
  │            │           │◄───────────┼──────────┼────────┼──────────┼──────────│
  │ 12. Data   │           │            │          │        │          │          │
  │◄───────────┼───────────│            │          │        │          │          │
  │            │           │            │          │        │          │          │
```

### **Diagrama de Fluxo de Dados - Pipeline B2B**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Lead Capture  │    │  Lead Assignment │    │  Communication  │
│   (Agência A)   │───►│   (Team Member)  │───►│   Tracking      │
│                 │    │                 │    │   (Timeline)    │
│ ○ Web Form      │    │ ○ Auto-assign   │    │ ○ WhatsApp      │
│ ○ WhatsApp      │    │ ○ Manual assign │    │ ○ Email         │
│ ○ Email         │    │ ○ Round-robin   │    │ ○ VoIP          │
│ ○ Phone         │    │ ○ Skill-based   │    │ ○ Internal Notes│
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Database Layer B2B                         │
│              (organization_id filtering on all)                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐ │
│  │    Leads    │  │ Communications│  │ AI Summaries │  │ Members │ │
│  │   Table     │  │    Table      │  │    Table     │  │  Table  │ │
│  │             │  │               │  │              │  │         │ │
│  │ org_id (FK) │  │  org_id (FK)  │  │ org_id (FK)  │  │org_id   │ │
│  │ lead_data   │  │  lead_id (FK) │  │ summary_data │  │user_id  │ │
│  │ stage       │  │  channel      │  │ sentiment    │  │role     │ │
│  │ assigned_to │  │  content      │  │ actions      │  │active   │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Pipeline      │    │   AI Analysis   │    │   Reporting     │
│   Management    │    │   & Insights    │    │   & Analytics   │
│                 │    │                 │    │                 │
│ ○ Kanban View   │    │ ○ Auto Summaries│    │ ○ Team Stats    │
│ ○ Stage Changes │    │ ○ Sentiment     │    │ ○ Conversion    │
│ ○ Assignments   │    │ ○ Next Actions  │    │ ○ Performance   │
│ ○ Filters       │    │ ○ Smart Alerts  │    │ ○ Revenue       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## **SEGURANÇA E ISOLAMENTO B2B**

### **Segurança Multi-Tenant B2B**

```python
# Validação Organizacional B2B Obrigatória
def validate_organization_access(user: User, org_id: UUID) -> bool:
    # Verificar se usuário é membro da agência
    member = db.query(OrganizationMember)\
        .filter(
            OrganizationMember.user_id == user.id,
            OrganizationMember.organization_id == org_id,
            OrganizationMember.is_active == True  # Membership ativa
        ).first()
    return member is not None

# Prevenção de Acesso Cross-Organization B2B
class SecurityMiddleware:
    def prevent_cross_org_access(self, request: Request):
        jwt_org_id = request.state.user.primary_org_id
        header_org_id = request.headers.get('X-Org-Id')

        # Validação crítica: JWT org_id deve === header org_id
        if jwt_org_id != header_org_id:
            logger.warning(f"B2B org access denied: JWT={jwt_org_id}, header={header_org_id}")
            raise HTTPException(403, "Organization mismatch - B2B isolation")
```

### **Auditoria e Monitoramento B2B**

```python
# Trilha de Auditoria Com Escopo Organizacional B2B
class AuditLog:
    organization_id: UUID    # OBRIGATÓRIO - rastrear por agência
    user_id: UUID           # Usuário da agência
    action: str             # Ação realizada
    resource_type: str      # Tipo de recurso (lead, communication, etc)
    resource_id: UUID       # ID do recurso
    timestamp: datetime     # Quando aconteceu
    ip_address: str         # IP do usuário
    role_at_time: str       # Role do usuário no momento da ação

# Métricas de Monitoramento B2B
- org_api_requests_total{org_id="uuid", role="owner"}     # Requests por agência/role
- org_response_time_seconds{org_id="uuid", endpoint=""}  # Tempo resposta por agência
- org_active_users{org_id="uuid", role="member"}         # Usuários ativos por agência
- org_database_queries{org_id="uuid", table="leads"}     # Queries por agência/tabela
- org_feature_usage{org_id="uuid", feature="ai_summary"} # Uso features por agência
```

## **ARQUITETURA DE DEPLOY B2B (RAILWAY)**

### **Estratégia de Container B2B**

```dockerfile
# Build Multi-stage para SaaS B2B
FROM node:18-alpine as frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build  # Build bundle Next.js para B2B

FROM python:3.11-slim as backend-builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
# Setup para FastAPI B2B com multi-tenancy

FROM nginx:alpine as production
# Configurar nginx para servir SaaS B2B
COPY --from=frontend-builder /app/.next ./next
COPY --from=backend-builder /app ./api
# Proxy configuration para APIs B2B
```

### **Configuração Railway B2B**

```yaml
# railway.toml para SaaS B2B
[build]
  builder = "dockerfile"

[deploy]
  startCommand = "gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker"

[environments.production]
  DATABASE_URL = "${{ postgresql.DATABASE_URL }}"  # PostgreSQL B2B
  REDIS_URL = "${{ redis.REDIS_URL }}"             # Cache por organização
  OPENAI_API_KEY = "${{ secrets.OPENAI_API_KEY }}" # AI features B2B

# Configuração Auto-scaling B2B
min_instances = 2      # Mínimo para B2B
max_instances = 10     # Máximo para B2B growth
cpu_threshold = 70     # Scale up quando CPU > 70%
memory_threshold = 80  # Scale up quando Memory > 80%
```

### **Arquitetura de Ambiente B2B**

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRODUÇÃO (Railway)                          │
├─────────────────────────────────────────────────────────────────┤
│ ├── PostgreSQL 16 (Multi-tenant B2B)                           │
│ ├── Redis (Cache por organização)                              │
│ ├── Auto-scaling (2-10 instances)                              │
│ └── Load Balancer (Traffic B2B)                                │
└─────────────────────────────────────────────────────────────────┘
                             │
┌─────────────────────────────────────────────────────────────────┐
│                    STAGING (Railway Branch)                    │
├─────────────────────────────────────────────────────────────────┤
│ ├── PostgreSQL Separado (Testing B2B)                          │
│ ├── Redis Testing                                              │
│ └── Single Instance                                             │
└─────────────────────────────────────────────────────────────────┘
                             │
┌─────────────────────────────────────────────────────────────────┐
│                 DESENVOLVIMENTO (Local)                        │
├─────────────────────────────────────────────────────────────────┤
│ ├── PostgreSQL Local (Docker)                                  │
│ ├── Redis Local (Docker)                                       │
│ └── Hot Reload (Next.js + FastAPI)                             │
└─────────────────────────────────────────────────────────────────┘
                             │
┌─────────────────────────────────────────────────────────────────┐
│                      TESTES (Isolado)                          │
├─────────────────────────────────────────────────────────────────┤
│ ├── SQLite In-Memory (Fast testing B2B)                        │
│ ├── Redis Mock                                                 │
│ └── Isolated Organizations (Test isolation)                    │
└─────────────────────────────────────────────────────────────────┘
```

## **VISUALIZAÇÃO DE ARQUITETURA B2B**

### **Legendas e Convenções B2B**

```
┌─────────┐  Componente Frontend B2B (Next.js)
│ [B2B]   │  - Contexto organizacional
└─────────┘  - Multi-user interface

┌─────────┐  Serviço Backend B2B (FastAPI)  
│ {B2B}   │  - Organization-scoped logic
└─────────┘  - Team collaboration features

┌─────────┐  Modelo de Dados B2B (PostgreSQL)
│ <B2B>   │  - organization_id FK required
└─────────┘  - Multi-tenant isolation

───────────▶ Fluxo de dados B2B (com org context)
- - - - - ▶ Dependência organizacional
═══════════▶ Relacionamento de banco B2B (FK org_id)
▓▓▓▓▓▓▓▓▓▶ Isolamento de segurança (org boundaries)
```

### **Padrões de Representação B2B**

```
🏢 Organization-scoped: Todos componentes incluem contexto organizacional B2B
📊 Data Flow: Visualização clara de filtros organization_id em queries
🔗 Component Dependencies: Mapeamento de dependências entre componentes B2B
🚀 API Relationships: Conexões entre endpoints e modelos com escopo B2B
👥 Team Context: Múltiplos usuários por organização (roles: owner/admin/member)
🔒 Security Boundaries: Isolamento total entre organizações (agências)
⚡ Performance: Índices otimizados para queries multi-tenant B2B
```

### **Diagrama de Estados - Fluxo de Lead B2B**

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   LEAD          │────►│   CONTACT       │────►│   PROPOSAL      │
│                 │     │                 │     │                 │
│ • Novo lead     │     │ • Primeiro      │     │ • Proposta      │
│ • Auto-assign   │     │   contato       │     │   enviada       │
│ • Team member   │     │ • Qualificação  │     │ • Negociação    │
│                 │     │ • Team collab   │     │ • Team review   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         ▲                       │                       │
         │                       ▼                       ▼
         │               ┌─────────────────┐     ┌─────────────────┐
         │               │   NEGOTIATION   │────►│     CLOSED      │
         │               │                 │     │                 │
         └───────────────│ • Discussão     │     │ • Won/Lost      │
           (Re-qualify)  │ • Termos        │     │ • Team stats    │
                         │ • Team input    │     │ • Commission    │
                         │ • Final review  │     │ • Post-sale     │
                         └─────────────────┘     └─────────────────┘

Regras B2B:
• Todos estados são organization-scoped (agência)
• Transitions requerem team member authentication
• Audit log para todas mudanças de estado
• Notifications para team members relevantes
• Performance metrics por organização
```

### **Diagrama de Entidade-Relacionamento B2B**

```
                              ┌──────────────────┐
                              │   Organization   │
                              │    (Agência)     │
                              ├──────────────────┤
                         ┌────┤ id (PK)          │
                         │    │ name             │
                         │    │ subscription_tier│
                         │    │ is_personal=false│ ◄── B2B Flag
                         │    │ owner_id (FK)    │
                         │    └──────────────────┘
                         │             │ 1..*
                         │             ▼
    ┌──────────────────┐ │    ┌──────────────────┐     ┌──────────────────┐
    │      User        │ │    │ OrganizationMember│     │      Leads       │
    │   (Usuário)      │ │    │  (Membership)     │     │  (Leads Agência) │
    ├──────────────────┤ │    ├──────────────────┤     ├──────────────────┤
    │ id (PK)          │─┘    │ id (PK)          │ ┌───┤ id (PK)          │
    │ email            │      │ organization_id  │ │   │ organization_id  │
    │ password_hash    │      │ user_id (FK)     │ │   │ name             │
    │ is_active        │      │ role (enum)      │ │   │ email            │
    │ created_at       │      │ is_active        │ │   │ stage (enum)     │
    └──────────────────┘      │ joined_at        │ │   │ assigned_user_id │
             │                └──────────────────┘ │   │ created_at       │
             │ 1..*                    │ 1..*      │   └──────────────────┘
             ▼                         ▼           │            │ 1..*
    ┌──────────────────┐      ┌──────────────────┐ │            ▼
    │  UserSessions    │      │   Subscriptions  │ │   ┌──────────────────┐
    │                  │      │   (Billing)      │ │   │ Communications   │
    ├──────────────────┤      ├──────────────────┤ │   │ (Timeline Agência)│
    │ id (PK)          │      │ id (PK)          │ │   ├──────────────────┤
    │ user_id (FK)     │      │ organization_id  │─┘   │ id (PK)          │
    │ organization_id  │      │ tier (enum)      │     │ organization_id  │
    │ refresh_token    │      │ status (enum)    │     │ lead_id (FK)     │
    │ expires_at       │      │ limits (JSONB)   │     │ channel (enum)   │
    └──────────────────┘      │ usage_tracking   │     │ direction (enum) │
                              └──────────────────┘     │ content          │
                                                       │ sent_at          │
                                                       └──────────────────┘
                                                                │ 1..*
                                                                ▼
                                                       ┌──────────────────┐
                                                       │   AI_Summaries   │
                                                       │ (AI para Agência)│
                                                       ├──────────────────┤
                                                       │ id (PK)          │
                                                       │ organization_id  │
                                                       │ lead_id (FK)     │
                                                       │ summary          │
                                                       │ sentiment        │
                                                       │ confidence_score │
                                                       │ created_at       │
                                                       └──────────────────┘

Relacionamentos B2B:
• Organization (1) ←→ (N) OrganizationMember: Múltiplos usuários por agência
• Organization (1) ←→ (N) Leads: Todos leads pertencem a uma agência
• Organization (1) ←→ (1) Subscription: Billing por agência
• Todas tabelas têm organization_id (FK) para isolamento B2B
• Índices compostos: (organization_id, primary_key) para performance
• Constraints: Previnem cross-org data access
```

## **DOCUMENTAÇÃO VISUAL B2B**

### **Guias de Leitura B2B**

1. **Contexto Organizacional**: Todo diagrama inclui contexto de agência (B2B)
2. **Isolamento de Dados**: Setas vermelhas (▓▓▓) indicam boundaries de segurança entre agências
3. **Fluxo Multi-User**: Componentes com [👥] suportam múltiplos usuários por organização
4. **Roles e Permissões**: Componentes com [🔑] implementam controle de acesso por role
5. **Performance B2B**: Componentes com [⚡] têm otimizações específicas para multi-tenancy

### **Convenções de Nomenclatura B2B**

```python
# Classes e Serviços B2B
class OrganizationLeadService:     # ✅ Prefixo organizacional
class TeamCommunicationService:   # ✅ Indica contexto de equipe
class MultiTenantRepository:      # ✅ Indica multi-tenancy

# Métodos B2B
def get_organization_leads():     # ✅ Escopo organizacional explícito
def create_team_member():        # ✅ Contexto de equipe
def validate_org_access():       # ✅ Validação organizacional

# Variáveis B2B
org_scoped_query = "SELECT..."   # ✅ Indica escopo organizacional
team_member_count = 5            # ✅ Contexto de equipe
cross_org_blocked = True         # ✅ Indica proteção cross-org
```

### **Checklist de Validação B2B**

**Arquitetura:**
- [ ] ✅ Todos modelos incluem organization_id (FK)
- [ ] ✅ Todas queries filtram por organization_id  
- [ ] ✅ Headers X-Org-Id validados em todos endpoints
- [ ] ✅ JWT contém org_id e é validado vs header
- [ ] ✅ Roles implementados (owner/admin/member)

**Frontend:**
- [ ] ✅ useOrgContext usado em todos componentes B2B
- [ ] ✅ BaseService adiciona X-Org-Id automaticamente
- [ ] ✅ Interface suporta múltiplos usuários por org
- [ ] ✅ Role-based UI (admin features para admins)
- [ ] ✅ Organization selector para usuários multi-org

**Backend:**
- [ ] ✅ get_current_organization dependency usado
- [ ] ✅ OrganizationMiddleware ativo e funcional
- [ ] ✅ Repositories filtram por organization_id
- [ ] ✅ Services validam acesso organizacional
- [ ] ✅ Audit logs incluem contexto organizacional

**Segurança:**
- [ ] ✅ Zero vazamentos cross-organizacionais
- [ ] ✅ Testes de isolamento organizacional passando
- [ ] ✅ Rate limiting por organização
- [ ] ✅ Logging com contexto organizacional
- [ ] ✅ Error handling não expõe dados de outras orgs

**Performance:**
- [ ] ✅ Índices compostos (organization_id, other_fields)
- [ ] ✅ Query optimization para multi-tenancy
- [ ] ✅ Cache com escopo organizacional
- [ ] ✅ Database connection pooling otimizado
- [ ] ✅ Monitoring por organização ativo

## **RESUMO IMPLEMENTAÇÃO DIAGRAMAS B2B**

### **Diagramas Implementados:**

- ✅ **Arquitetura de Alto Nível**: Visualização completa Next.js 14 + FastAPI + PostgreSQL + Railway B2B
- ✅ **Comunicação Entre Componentes**: Fluxo frontend → backend → database com contexto B2B
- ✅ **Diagrama de Classes**: Modelos organizacionais B2B com relacionamentos corretos
- ✅ **Diagrama de Componentes**: Frontend B2B com contexto organizacional e roles
- ✅ **Diagrama de Sequência**: Fluxo completo autenticação → validação → dados B2B
- ✅ **Fluxo de Dados**: Pipeline CRM com isolamento organizacional B2B
- ✅ **Estados de Lead**: Workflow B2B com aprovações de equipe
- ✅ **ER Database**: Schema completo multi-tenant B2B com organization_id
- ✅ **Deploy Railway**: Configuração produção B2B com auto-scaling

### **Padrões B2B Implementados:**

- 🏢 **Organization-Centric**: Todos diagramas baseados em organizações compartilhadas
- 👥 **Multi-User Support**: Interfaces e fluxos para múltiplos usuários por organização  
- 🔒 **Security Boundaries**: Isolamento total entre organizações (agências)
- ⚡ **Performance**: Otimizações específicas para queries multi-tenant
- 🔑 **Role-Based**: Controle acesso owner/admin/member em todos componentes
- 📊 **Team Analytics**: Métricas e dashboards com escopo de equipe/organização

### **Conformidade Arquitetural:**

- ✅ **Sistema Produção**: Baseado em codebase atual (60+ endpoints)
- ✅ **Modelo B2B**: Organizações compartilhadas com múltiplos usuários
- ✅ **Stack Atual**: Next.js 14 + FastAPI + PostgreSQL + Railway
- ✅ **Multi-Tenancy**: Headers X-Org-Id + middleware + repository filtering
- ✅ **Isolamento**: Prevenção cross-org + audit logs + security boundaries

**Input Próximo Agente**: Diagramação técnica B2B completa com visualizações organization-aware para UI/UX Designer implementar interfaces colaborativas de equipe conforme modelo detectado.