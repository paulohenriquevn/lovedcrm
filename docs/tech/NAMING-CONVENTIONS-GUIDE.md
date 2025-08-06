# Naming Conventions & File Organization Guide

**Comprehensive guide** for consistent naming and file organization across the multi-tenant system.

> ** Related**: [Backend Style Guide](../api/CLAUDE.md) • [Frontend Style Guide](FRONTEND-IMPLEMENTATION-GUIDE.md)

---

## **General Principles**

### **1. Consistency First**

- Use the same pattern throughout the entire codebase
- When in doubt, follow existing patterns in the project
- Prefer explicit over implicit naming

### **2. Clarity Over Brevity**

- Names should be self-documenting
- Avoid abbreviations unless universally understood
- Use full words: `organization` not `org` (except in variables)

### **3. Context-Aware Naming**

- Include context when it adds clarity
- Namespace appropriately to avoid conflicts
- Use prefixes/suffixes consistently

---

## **Backend (Python) Conventions**

### **File Naming**

```python
# Files: snake_case
user_service.py              #  Good
organization_repository.py   #  Good
billing_webhook_handler.py   #  Good

# Avoid
UserService.py              #  PascalCase for files
user-service.py             #  kebab-case
userservice.py              #  No separation
```

### **Directory Structure**

```
api/
├── core/                   # Infrastructure & config
├── models/                 # SQLAlchemy ORM models
├── schemas/                # Pydantic request/response schemas
├── repositories/           # Data access layer
├── services/               # Business logic layer
├── routers/                # FastAPI route handlers
└── tests/                  # Test files mirror structure
```

### **Class Naming**

```python
# Classes: PascalCase
class OrganizationService:      #  Business service
class UserRepository:           #  Data repository
class OrganizationMember:       #  SQLAlchemy model
class OrganizationCreateSchema: #  Pydantic schema

# Suffixes by type
class *Service              # Business logic
class *Repository           # Data access
class *Schema               # Pydantic schemas
class *Model (optional)     # SQLAlchemy models
```

### **Function & Variable Naming**

```python
# Functions: snake_case (verbs)
def create_organization():      #  Action verb
def get_user_by_email():       #  Descriptive
def validate_org_access():     #  Clear purpose

# Variables: snake_case (nouns)
user_id = current_user.id      #  Descriptive
org_members = []               #  Plural for collections
is_active = True               #  Boolean with 'is_'

# Constants: UPPER_CASE
MAX_ORGANIZATION_MEMBERS = 100
DEFAULT_PAGE_SIZE = 20
DATABASE_URL = "postgresql://..."
```

### **Method Naming Patterns**

```python
# Repository methods
def get_by_id(id: UUID)                    # Single item
def get_by_organization(org_id: UUID)      # Collection
def create(data: dict)                     # Create new
def update(item, data: dict)               # Update existing
def delete(item)                           # Delete item
def exists_by_email(email: str)            # Boolean check

# Service methods
def create_organization(data: CreateSchema)    # Business operation
def add_member_to_organization()               # Business action
def validate_organization_access()             # Validation
def process_organization_invite()              # Business process
```

### **Database Model Conventions**

```python
class Organization(Base):
    __tablename__ = "organizations"  #  Plural, snake_case

    # Primary key: always 'id'
    id = Column(UUID, primary_key=True)

    # Foreign keys: model_name + _id
    organization_id = Column(UUID, ForeignKey("organizations.id"))
    created_by_user_id = Column(UUID, ForeignKey("users.id"))

    # Timestamps: standard names
    created_at = Column(DateTime)
    updated_at = Column(DateTime)

    # Booleans: is_, has_, can_
    is_active = Column(Boolean, default=True)
    has_billing = Column(Boolean, default=False)
    can_invite_members = Column(Boolean, default=True)
```

---

## **Frontend (TypeScript) Conventions**

### **File Naming**

```typescript
// Components: PascalCase
FeatureCard.tsx             #  Component
FeatureList.tsx             #  Component
OrganizationSettings.tsx    #  Component

// Utilities: camelCase
userService.ts              #  Service
organizationStore.ts        #  Store
useOrgContext.ts           #  Hook

// Pages: kebab-case (Next.js convention)
feature-detail/             #  Page directory
[feature-id]/              #  Dynamic route
```

### **Directory Structure**

```
src/
├── app/                    # Next.js App Router
│   └── [locale]/          # Internationalization
│       └── admin/         # Multi-tenant routes
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── feature-name/     # Feature-specific components
├── containers/           # Business logic containers
├── services/             # API service classes
├── stores/               # Zustand state stores
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and helpers
└── types/                # TypeScript type definitions
```

### **Component Naming**

```typescript
// Components: PascalCase
export function FeatureCard() {}      #  Functional component
export function FeatureList() {}      #  Functional component
export function UserProfile() {}      #  Functional component

// Component files: match component name
FeatureCard.tsx -> export function FeatureCard()
FeatureList.tsx -> export function FeatureList()

// Props interfaces: ComponentName + Props
interface FeatureCardProps {}
interface FeatureListProps {}
interface UserProfileProps {}
```

### **Service & Store Naming**

```typescript
// Services: PascalCase class, camelCase instance
export class FeatureService extends BaseService {}
export const featureService = new FeatureService()

export class OrganizationService extends BaseService {}
export const organizationService = new OrganizationService()

// Stores: camelCase with descriptive name
export const useFeatureStore = create<FeatureState>()
export const useOrganizationStore = create<OrgState>()
export const useAuthStore = create<AuthState>()

// Hook naming: use + descriptive name
export function useOrgContext() {}
export function useLocalizedNavigation() {}
export function useFeatureActions() {}
```

### **Variable Naming Patterns**

```typescript
// Booleans: is, has, can, should
const isLoading = false
const hasPermission = true
const canEditOrganization = false
const shouldValidateAccess = true

// Collections: plural nouns
const features = []
const organizationMembers = []
const userPermissions = []

// Handlers: handle + action
const handleSubmit = () => {}
const handleDelete = () => {}
const handleOrganizationChange = () => {}

// State setters: set + noun
const [loading, setLoading] = useState(false)
const [error, setError] = useState(null)
const [features, setFeatures] = useState([])
```

---

## **File Organization Patterns**

### **Feature-Based Organization**

```
feature-name/
├── components/
│   ├── FeatureCard.tsx        # Individual item display
│   ├── FeatureList.tsx        # Collection display
│   ├── FeatureForm.tsx        # Create/edit form
│   ├── FeatureActions.tsx     # Action buttons
│   └── index.ts               # Export all components
├── containers/
│   └── FeatureContainer.tsx   # Business logic container
├── services/
│   └── featureService.ts      # API integration
├── stores/
│   └── featureStore.ts        # State management
└── types/
    └── feature.types.ts       # TypeScript definitions
```

### **Multi-Tenant Route Structure**

```
app/
└── [locale]/                  # Internationalization
    ├── auth/                  # Public authentication
    │   ├── login/
    │   └── register/
    └── admin/                 # Multi-tenant routes
        ├── dashboard/         # Organization dashboard
        ├── team/             # Team management
        ├── settings/         # Organization settings
        └── feature-name/     # Feature pages
```

### **API Route Naming**

```
api/
└── routers/
    ├── auth.py               # Authentication endpoints
    ├── users.py              # User management
    ├── organizations.py      # Organization CRUD
    ├── organization_members.py # Team management
    ├── organization_invites.py # Invitation system
    └── feature_name.py       # Feature-specific endpoints
```

---

## **Cross-System Naming Consistency**

### **Entity Naming (Frontend ↔ Backend)**

```typescript
// Frontend (TypeScript)
interface Organization {
  id: string
  name: string
  created_at: string
}

// Backend (Python)
class Organization(Base):
    id = Column(UUID)
    name = Column(String)
    created_at = Column(DateTime)

// API Response
{
  "id": "uuid",
  "name": "string",
  "created_at": "ISO string"
}
```

### **Endpoint Naming Consistency**

```python
# Backend endpoint
@router.get("/organizations/{org_id}/members")

# Frontend service method
async getOrganizationMembers(orgId: string)

# Frontend store action
fetchOrganizationMembers: (orgId: string) => Promise<void>
```

### **Event & Action Naming**

```typescript
// Frontend events (past tense)
onFeatureCreated
onMemberAdded
onOrganizationUpdated

// Store actions (present tense verbs)
createFeature
addMember
updateOrganization

// Backend methods (present tense verbs)
create_feature
add_member
update_organization
```

---

## **Testing File Conventions**

### **Test File Naming**

```python
# Backend tests: test_ prefix
test_organization_service.py
test_user_repository.py
test_auth_endpoints.py

# Frontend tests: .test. or .spec. suffix
FeatureCard.test.tsx
organizationService.test.ts
useOrgContext.spec.ts
```

### **Test Function Naming**

```python
# Backend: test_ + descriptive_name
def test_create_organization_success():
def test_organization_isolation():
def test_invalid_member_role_raises_error():

# Frontend: descriptive sentences
test('should create organization successfully')
test('should prevent cross-organization access')
test('should display error when API fails')
```

---

## **Quick Reference Checklist**

### **Before Creating New Files**

- [ ] Follow existing directory structure
- [ ] Use consistent naming convention for file type
- [ ] Include appropriate suffix (Service, Repository, etc.)
- [ ] Match component name with file name

### **Before Naming Variables/Functions**

- [ ] Use descriptive, self-documenting names
- [ ] Follow language-specific case conventions
- [ ] Include context when it adds clarity
- [ ] Use consistent prefixes/suffixes (is*, has*, handle\_)

### **Before Creating New Features**

- [ ] Plan directory structure following existing patterns
- [ ] Ensure frontend/backend naming consistency
- [ ] Document any new naming patterns introduced
- [ ] Update this guide if creating new conventions

---

## **Examples: Good vs Bad**

### **Good Examples**

```typescript
// Clear, descriptive, consistent
function useOrganizationMembers(orgId: string)
const handleMemberInvitation = async (email: string) => {}
interface OrganizationMemberProps {
  member: Member
  onEdit: () => void
}
const organizationService = new OrganizationService()
```

### **Bad Examples**

```typescript
// Unclear, inconsistent, abbreviated
function useMems(id: string)
const handleInv = async (e: string) => {}
interface MemberProps {
  m: Member
  edit: () => void
}
const orgSvc = new OrgService()
```

---

**Result**: Com estas convenções, qualquer desenvolvedor pode navegar e contribuir para o codebase com confiança, sabendo exatamente onde encontrar e como nomear novos arquivos e funções.
