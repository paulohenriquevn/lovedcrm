import { vi } from 'vitest'

// Test data factories
export const createMockUser = (overrides = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  organization_id: 'test-org-id',
  role: 'user',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
})

export const createMockOrganization = (overrides = {}) => ({
  id: 'test-org-id',
  name: 'Test Organization',
  slug: 'test-org',
  plan: 'basic',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
})

export const createMockInvite = (overrides = {}) => ({
  id: 'test-invite-id',
  email: 'invite@example.com',
  role: 'user',
  status: 'pending',
  organization_id: 'test-org-id',
  invited_by: 'test-user-id',
  created_at: new Date().toISOString(),
  expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  ...overrides,
})

// Mock API responses
export const mockApiResponse = <T>(data: T, success = true) => ({
  data,
  success,
  message: success ? 'Success' : 'Error',
})

// Mock async function that resolves
export const mockAsyncSuccess = <T>(data: T) => vi.fn().mockResolvedValue(mockApiResponse(data))

// Mock async function that rejects
export const mockAsyncError = (message = 'Test error') =>
  vi.fn().mockRejectedValue(new Error(message))

// Mock form submission
export const mockFormSubmit = (fn: any) =>
  vi.fn(callback => (event: any) => {
    event.preventDefault()
    return callback()
  })

// Helper to wait for async operations
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0))

// Mock toast notifications
export const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
}

// Mock router push
export const mockRouterPush = vi.fn()

// Mock organization context
export const mockOrgContext = {
  organization: createMockOrganization(),
  loading: false,
  error: null,
  validateOrgAccess: vi.fn(() => true),
  refreshOrganization: vi.fn(),
}

// Mock auth store
export const mockAuthStore = {
  user: createMockUser(),
  isAuthenticated: true,
  loading: false,
  error: null,
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  updateUser: vi.fn(),
}

// Re-export everything from React Testing Library
export * from '@testing-library/react'
