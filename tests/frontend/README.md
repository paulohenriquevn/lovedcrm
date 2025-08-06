# Frontend Unit Tests

Este diretório contém a configuração completa para testes unitários do frontend usando Vitest e React Testing Library.

## Estrutura

```
tests/frontend/
├── components/          # Testes de componentes React
│   ├── ui/             # Componentes de interface (shadcn/ui)
│   ├── forms/          # Componentes de formulários
│   └── organizations/  # Componentes específicos de organizações
├── hooks/              # Testes de hooks customizados
├── services/           # Testes de serviços/APIs
├── mocks/              # Mocks para testes
│   ├── services.ts     # Mocks dos serviços
│   └── hooks.ts        # Mocks dos hooks
└── utils/              # Utilitários para testes
    └── test-utils.tsx  # Configurações e helpers
```

## Configuração

### Arquivo de Setup (`tests/setup.ts`)

- Configura mocks globais para Next.js, next-intl, Zustand stores
- Mock para contexto de organização (multi-tenancy)
- Mock para React Query, React Hook Form, Sonner
- Configurações para ResizeObserver, IntersectionObserver, matchMedia

### Test Utils (`tests/frontend/utils/test-utils.tsx`)

- Função `render` customizada com todos os providers necessários
- Factories para criar dados mock (usuários, organizações, convites)
- Helpers para respostas de API, funções async, formulários
- Re-exporta todas as funções do React Testing Library

## Como Usar

### 1. Executar Testes

```bash
# Todos os testes frontend
npm run test

# Modo watch (recomendado durante desenvolvimento)
npm run test:watch

# Teste específico
npm run test -- Button.test.tsx

# Com cobertura
npm run test -- --coverage
```

### 2. Estrutura de Teste Básica

```tsx
import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "../../utils/test-utils"
import { MyComponent } from "@/components/MyComponent"

describe("MyComponent", () => {
  it("renders correctly", () => {
    render(<MyComponent />)
    expect(screen.getByText("Hello")).toBeInTheDocument()
  })

  it("handles click events", () => {
    const handleClick = vi.fn()
    render(<MyComponent onClick={handleClick} />)

    fireEvent.click(screen.getByRole("button"))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### 3. Testando Componentes com Formulários

```tsx
import { render, screen, fireEvent, waitFor } from "../../utils/test-utils"
import { mockUseForm } from "../../mocks/hooks"

describe("FormComponent", () => {
  it("validates required fields", async () => {
    const mockForm = {
      ...mockUseForm(),
      formState: {
        ...mockUseForm().formState,
        errors: { email: { message: "Email is required" } },
      },
    }

    render(<FormComponent />)

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Email is required")
    })
  })
})
```

### 4. Testando Componentes com API

```tsx
import { mockServices } from "../../mocks/services"

describe("DataComponent", () => {
  it("loads and displays data", async () => {
    const mockData = { id: 1, name: "Test" }
    mockServices.api.getData.mockResolvedValue({ data: mockData })

    render(<DataComponent />)

    await waitFor(() => {
      expect(screen.getByText("Test")).toBeInTheDocument()
    })
  })
})
```

### 5. Testando Hooks

```tsx
import { renderHook, act } from "@testing-library/react"

describe("useCustomHook", () => {
  it("returns correct initial state", () => {
    const { result } = renderHook(() => useCustomHook())

    expect(result.current.value).toBe(0)
  })

  it("updates state correctly", () => {
    const { result } = renderHook(() => useCustomHook())

    act(() => {
      result.current.increment()
    })

    expect(result.current.value).toBe(1)
  })
})
```

## Padrões de Teste

### 1. Organização Obrigatória (Multi-tenancy)

Todos os testes devem considerar o contexto de organização:

```tsx
import { mockOrgContext, createMockOrganization } from "../../utils/test-utils"

// Teste com organização específica
const org = createMockOrganization({ plan: "premium" })
mockOrgContext.organization = org
```

### 2. Internacionalização

Use as traduções mockadas:

```tsx
// O mock já retorna a chave como valor
expect(screen.getByText("admin.dashboard.title")).toBeInTheDocument()
```

### 3. Autenticação

Use o store de auth mockado:

```tsx
import { mockAuthStore } from "../../utils/test-utils"

mockAuthStore.isAuthenticated = false
// Testa comportamento quando não autenticado
```

### 4. Formulários

Use mocks do React Hook Form:

```tsx
import { mockUseForm } from "../../mocks/hooks"

const form = mockUseForm()
// form.handleSubmit, form.register, etc. estão disponíveis
```

## Mocks Disponíveis

### Serviços

- `mockAuthService` - Login, registro, logout
- `mockUserService` - Perfil, senha, avatar
- `mockOrganizationService` - CRUD de organizações
- `mockInviteService` - Gerenciamento de convites
- `mockBillingService` - Stripe, assinaturas
- `mockNotificationService` - Notificações

### Hooks

- `mockUseOrgContext` - Contexto de organização
- `mockUseForm` - React Hook Form
- `mockUseQuery/useMutation` - React Query
- `mockUseRouter` - Next.js navigation
- `mockUseTranslations` - next-intl

### Stores (Zustand)

- `mockUseAuthStore` - Estado de autenticação
- `mockUseOrganizationStore` - Estado da organização
- `mockUseBillingStore` - Estado de cobrança

## Cobertura de Código

A configuração do Vitest está definida para:

- Provider: `v8`
- Formatos: `text`, `json`, `html`
- Exclusões: `node_modules/`, `tests/`, `**/*.d.ts`, `**/*.config.*`, `api/**/*`

```bash
# Gerar relatório de cobertura
npm run test -- --coverage

# Ver relatório HTML
open coverage/index.html
```

## Integração com CI/CD

Os testes são executados automaticamente no pipeline:

```bash
# CI pipeline
npm run ci              # Inclui testes frontend
npm run ci:quick        # Apenas linting
```

## Debugging

### 1. Debug Mode

```bash
# Executar com logs detalhados
npm run test -- --reporter=verbose

# Debug específico
npm run test -- --reporter=verbose Button.test.tsx
```

### 2. Screen Debug

```tsx
import { screen } from "../../utils/test-utils"

// Mostra o DOM atual
screen.debug()

// Mostra elemento específico
screen.debug(screen.getByRole("button"))
```

### 3. Queries Disponíveis

```tsx
// Por role (recomendado)
screen.getByRole("button", { name: /submit/i })

// Por texto
screen.getByText("Hello World")

// Por test ID
screen.getByTestId("submit-button")

// Por placeholder
screen.getByPlaceholderText("Enter email")
```

## Boas Práticas

### 1. Prefer queries por role/texto

```tsx
// ✅ Bom
screen.getByRole("button", { name: /submit/i })
screen.getByText("Error message")

// ❌ Evitar
screen.getByTestId("submit-btn")
```

### 2. Test behavior, not implementation

```tsx
// ✅ Bom - testa comportamento
expect(screen.getByText('Success!')).toBeInTheDocument()

// ❌ Evitar - testa implementação
expect(mockFunction).toHaveBeenCalledWith(...)
```

### 3. Use factories para dados

```tsx
// ✅ Bom
const user = createMockUser({ role: 'admin' })

// ❌ Evitar
const user = { id: 1, name: 'Test', role: 'admin', ... }
```

### 4. Clean up mocks

```tsx
beforeEach(() => {
  vi.clearAllMocks()
})
```

## Troubleshooting

### Erro: "Cannot find module"

Verifique os aliases no `vitest.config.ts`:

```ts
resolve: {
  alias: {
    '@': path.resolve(__dirname, './'),
  },
},
```

### Erro: "ResizeObserver is not defined"

Já configurado no `setup.ts` - verifique se está importado.

### Erro: "matchMedia is not a function"

Já configurado no `setup.ts` - verifique se está importado.

### Componente não renderiza corretamente

Verifique se todos os providers necessários estão no `test-utils.tsx`.
