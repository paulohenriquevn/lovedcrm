import '@testing-library/jest-dom'
import { vi } from 'vitest'
import React from 'react'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/test',
}))

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
  useMessages: () => ({}),
}))

// Mock next-intl/navigation
vi.mock('next-intl/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  useLocalizedNavigation: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  Link: ({ children, href, ...props }: any) =>
    React.createElement('a', { href, ...props }, children),
}))

// Mock organization context
const mockOrganization = {
  id: 'test-org-id',
  name: 'Test Organization',
  slug: 'test-org',
  plan: 'basic',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

vi.mock('@/hooks/use-org-context', () => ({
  useOrgContext: () => ({
    organization: mockOrganization,
    loading: false,
    error: null,
    validateOrgAccess: vi.fn(() => true),
    refreshOrganization: vi.fn(),
  }),
}))

// Mock Zustand stores
vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
      organization_id: 'test-org-id',
    },
    isAuthenticated: true,
    loading: false,
    error: null,
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
    updateUser: vi.fn(),
  }),
}))

// Mock React Query
vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({
    data: null,
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  }),
  useMutation: () => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    isLoading: false,
    error: null,
    data: null,
  }),
  QueryClient: vi.fn(() => ({
    invalidateQueries: vi.fn(),
    setQueryData: vi.fn(),
    getQueryData: vi.fn(),
  })),
  QueryClientProvider: ({ children }: any) => children,
}))

// Mock services
vi.mock('@/services/base', () => ({
  BaseService: class {
    static async get() {
      return { data: null }
    }
    static async post() {
      return { data: null }
    }
    static async put() {
      return { data: null }
    }
    static async delete() {
      return { data: null }
    }
  },
}))

// Mock theme provider
vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: vi.fn(),
    resolvedTheme: 'light',
  }),
  ThemeProvider: ({ children }: any) => children,
}))

// Mock Sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}))

// Mock React Hook Form
vi.mock('react-hook-form', () => ({
  useForm: () => ({
    register: vi.fn(),
    handleSubmit: vi.fn(fn => fn),
    watch: vi.fn(),
    setValue: vi.fn(),
    getValues: vi.fn(),
    reset: vi.fn(),
    formState: {
      errors: {},
      isSubmitting: false,
      isValid: true,
      isDirty: false,
    },
  }),
  Controller: ({ render }: any) => render({ field: {} }),
}))

// Global test utilities
global.ResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Suppress console errors during tests
const originalError = console.error
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})
