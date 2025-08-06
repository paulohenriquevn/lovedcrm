# React Best Practices - Multi-Tenant SaaS System

Este documento detalha as melhores práticas do React implementadas no projeto multi-tenant, baseadas nas recomendações oficiais do [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) e adaptadas para arquitetura organization-centric com i18n.

## Configuração Atual

### ESLint Rules Implementadas

```json
{
  "extends": ["plugin:react/recommended"],
  "rules": {
    // Component Definition
    "react/function-component-definition": [
      "error",
      {
        "namedComponents": "function-declaration",
        "unnamedComponents": "function-expression"
      }
    ],

    // JSX Best Practices
    "react/jsx-key": "error",
    "react/jsx-no-useless-fragment": "error",
    "react/jsx-handler-names": [
      "error",
      {
        "eventHandlerPrefix": "handle",
        "eventHandlerPropPrefix": "on"
      }
    ],
    "react/jsx-no-leaked-render": "error",
    "react/jsx-boolean-value": ["error", "never"],

    // Performance
    "react/jsx-no-bind": [
      "warn",
      {
        "allowArrowFunctions": true,
        "allowBind": false,
        "ignoreRefs": true
      }
    ],
    "react/no-unstable-nested-components": "error",

    // Hooks
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "react/hook-use-state": "error"
  }
}
```

## Melhores Práticas Implementadas

### 1. **Component Definition Pattern (Multi-Tenant + i18n)**

```tsx
//  Correto - Function Declaration com org context + i18n
export function InviteUserContainer({ orgId }: { orgId: string }): JSX.Element {
  const t = useTranslations("admin.team")
  const { organization, validateOrgAccess } = useOrgContext()

  return <div>{t("inviteUser")}</div>
}

//  Correto - Page component com locale
export default function TeamPage({ params }: { params: { locale: string } }) {
  const { user } = useAuthStore()
  const orgId = user.organization.id

  return <InviteUserContainer orgId={orgId} />
}

//  Evitar - Arrow Function sem tipos
export const SecuritySettingsView = ({ onChangePassword }) => {
  return <div>...</div>
}
```

### 2. **Event Handler Naming (Organization-Aware)**

```tsx
//  Correto - Handlers com org context
const handleInviteMember = React.useCallback(
  async (data: InviteData): Promise<void> => {
    validateOrgAccess() // Validação org obrigatória
    await membersService.inviteMember(data) // BaseService adiciona X-Org-Id
  },
  [validateOrgAccess]
)

const handleToggle2FA = React.useCallback((): void => {
  setIs2FAModalOpen(true)
}, [])

//  Correto - Props com org-aware typing
interface InviteUserContainerProps {
  orgId: string // Organization context obrigatório
  onInviteSuccess: (member: OrganizationMember) => void
  onInviteError: (error: string) => void
}
```

### 3. **Performance Optimization**

```tsx
//  Correto - useCallback para handlers
const handleRevokeSession = React.useCallback(async (sessionId: string) => {
  // implementation
}, [])

//  Correto - Componentes estáveis
function PasswordSection({ onChangePassword, isChangingPassword }: Props) {
  // Component não será recriado a cada render
}
```

### 4. **JSX Key Pattern**

```tsx
//  Correto - Keys únicas e estáveis
{
  activeSessions.map(session => (
    <div key={session.id} className="session-item">
      {session.device}
    </div>
  ))
}

//  Evitar - Index como key
{
  sessions.map((session, index) => <div key={index}>...</div>)
}
```

### 5. **Conditional Rendering (Leaked Render Prevention)**

```tsx
//  Correto - Comparação explícita
{
  session.current === true && <Badge variant="success">Atual</Badge>
}

//  Correto - Verificação de null/undefined
{
  qrData !== null && qrData !== undefined && <QRCodeDisplay data={qrData} />
}

//  Evitar - Pode causar leaked renders
{
  session.current && <Badge>Atual</Badge>
}
{
  qrData && <QRCodeDisplay data={qrData} />
}
```

### 6. **Fragment Usage**

```tsx
//  Correto - Fragment apenas quando necessário
return (
  <>
    <Header />
    <Content />
  </>
)

//  Correto - Sem fragment para elemento único
return <div>Single element</div>

//  Evitar - Fragment desnecessário
return <>{children}</>
```

### 7. **Boolean Props**

```tsx
//  Correto - Sintaxe concisa
<Button disabled loading />

//  Evitar - Verbosidade desnecessária
<Button disabled={true} loading={true} />
```

### 8. **Component Composition (Multi-Tenant + i18n)**

```tsx
//  Correto - Container-Component pattern real do projeto
function InviteUserContainer({ orgId }: { orgId: string }) {
  const t = useTranslations("admin.team")
  const { inviteMember, loading, error } = useMembersService()
  const { validateOrgAccess } = useOrgContext()

  const handleInvite = React.useCallback(
    async (data: InviteData) => {
      validateOrgAccess()
      await inviteMember(data)
    },
    [validateOrgAccess, inviteMember]
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("inviteUser")}</CardTitle>
        <CardDescription>{t("inviteUserDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <InviteUserForm
          onSubmit={handleInvite}
          loading={loading}
          error={error}
        />
      </CardContent>
    </Card>
  )
}

//  Correto - Page com locale routing
export default function TeamPage({ params }: { params: { locale: string } }) {
  const { user } = useAuthStore()
  const orgId = user.organization.id

  return (
    <div className="space-y-6">
      <TeamHeader orgId={orgId} />
      <InviteUserContainer orgId={orgId} />
      <TeamMembersContainer orgId={orgId} />
    </div>
  )
}
```

### 9. **Multi-Tenant Specific Patterns**

```tsx
//  Correto - Always pass orgId to business components
interface TeamComponentProps {
  orgId: string // ALWAYS required for business components
  children?: React.ReactNode
}

//  Correto - Use organization context validation
function TeamMembersContainer({ orgId }: { orgId: string }) {
  const { organization, validateOrgAccess } = useOrgContext()

  React.useEffect(() => {
    validateOrgAccess() // Validate on mount
  }, [validateOrgAccess])

  return <TeamMembersList orgId={orgId} />
}

//  Correto - i18n with organization context
function OrganizationSettingsForm({ orgId }: { orgId: string }) {
  const t = useTranslations("admin.settings")
  const { formatCurrency } = useLocale()
  const { organization } = useOrgContext()

  return (
    <form>
      <h2>
        {t("organizationName")}: {organization.name}
      </h2>
      <p>
        {t("billingAmount")}: {formatCurrency(organization.billing.amount)}
      </p>
    </form>
  )
}

//  Evitar - Components without org context
function GenericComponent() {
  // Missing orgId - can't validate organization access
  return <div>...</div>
}
```

### 10. **BaseService Integration Pattern**

```tsx
//  Correto - Use custom hooks that wrap BaseService
function useInviteManagement() {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const inviteMember = React.useCallback(async (data: InviteData) => {
    setLoading(true)
    setError(null)

    try {
      // BaseService automatically adds X-Org-Id header
      await membersService.inviteMember(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to invite member")
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { inviteMember, loading, error }
}

//  Correto - Use in components
function InviteForm({ orgId }: { orgId: string }) {
  const { inviteMember, loading, error } = useInviteManagement()

  const handleSubmit = React.useCallback(
    async (data: InviteData) => {
      await inviteMember(data) // X-Org-Id automatically handled
    },
    [inviteMember]
  )

  return (
    <form onSubmit={handleSubmit}>
      {error && <ErrorMessage message={error} />}
      <Button loading={loading}>Invite Member</Button>
    </form>
  )
}
```

## Próximos Melhoramentos

### 1. **Context Optimization**

```tsx
// Implementar useMemo para context values
const contextValue = React.useMemo(
  () => ({
    user,
    settings,
    updateUser: handleUpdateUser,
  }),
  [user, settings, handleUpdateUser]
)
```

### 2. **Error Boundaries**

```tsx
// Adicionar Error Boundaries para componentes críticos
<ErrorBoundary fallback={<ErrorFallback />}>
  <TwoFactorAuthModal />
</ErrorBoundary>
```

### 3. **Suspense Integration**

```tsx
// Implementar Suspense para lazy loading
const LazySettingsModal = React.lazy(() => import('./SettingsModal'))

<Suspense fallback={<SettingsModalSkeleton />}>
  <LazySettingsModal />
</Suspense>
```

## Métricas de Qualidade

### Antes das Melhorias

- Componentes > 80 linhas: 3
- Funções sem useCallback: 5
- Leaked renders: 2
- Handler naming inconsistente: 4

### Depois das Melhorias

- Componentes divididos e focados
- Handlers otimizados com useCallback
- Rendering condicional seguro
- Naming convention padronizado

## Scripts Úteis

```bash
# Verificar compliance com React rules
npx eslint --ext .tsx components/ | grep "react/"

# Auto-fix de regras React
npx eslint --fix --ext .tsx components/

# Análise de performance (com React DevTools)
npm run dev # + React DevTools Profiler
```

## Referências

- [React ESLint Plugin](https://github.com/jsx-eslint/eslint-plugin-react)
- [React Hooks ESLint Plugin](https://github.com/facebook/react/tree/main/packages/eslint-plugin-react-hooks)
- [React Best Practices](https://react.dev/learn)
- [Next.js Performance Best Practices](https://nextjs.org/docs/advanced-features/performance)

---

**Status**: Implementado + Multi-Tenant Patterns  
**Última Atualização**: Janeiro 2025  
**Arquitetura**: Next.js 14 + i18n + Organization-Centric + BaseService Pattern  
**Próxima Revisão**: Implementar Error Boundaries e Suspense organization-aware
