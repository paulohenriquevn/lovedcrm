import { vi } from 'vitest'
import {
  createMockUser,
  createMockOrganization,
  mockOrgContext,
  mockAuthStore,
} from '../utils/test-utils'

// Mock useOrgContext hook
export const mockUseOrgContext = vi.fn(() => mockOrgContext)

// Mock useAuth hook (if exists)
export const mockUseAuth = vi.fn(() => mockAuthStore)

// Mock useLocalizedNavigation
export const mockUseLocalizedNavigation = vi.fn(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
}))

// Mock useTranslations
export const mockUseTranslations = vi.fn(() => (key: string) => key)

// Mock useLocale
export const mockUseLocale = vi.fn(() => 'en')

// Mock useTheme
export const mockUseTheme = vi.fn(() => ({
  theme: 'light',
  setTheme: vi.fn(),
  resolvedTheme: 'light',
}))

// Mock useForm from react-hook-form
export const mockUseForm = vi.fn(() => ({
  register: vi.fn(),
  handleSubmit: vi.fn(fn => (e: any) => {
    e?.preventDefault?.()
    return fn({})
  }),
  watch: vi.fn(),
  setValue: vi.fn(),
  getValues: vi.fn(() => ({})),
  reset: vi.fn(),
  trigger: vi.fn(),
  clearErrors: vi.fn(),
  setError: vi.fn(),
  formState: {
    errors: {},
    isSubmitting: false,
    isValid: true,
    isDirty: false,
    isLoading: false,
    dirtyFields: {},
    touchedFields: {},
    defaultValues: {},
  },
  control: {},
}))

// Mock React Query hooks
export const mockUseQuery = vi.fn(() => ({
  data: null,
  isLoading: false,
  isError: false,
  error: null,
  refetch: vi.fn(),
  isRefetching: false,
  isFetching: false,
}))

export const mockUseMutation = vi.fn(() => ({
  mutate: vi.fn(),
  mutateAsync: vi.fn(),
  isLoading: false,
  isError: false,
  error: null,
  data: null,
  reset: vi.fn(),
}))

// Mock useRouter from next/navigation
export const mockUseRouter = vi.fn(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn(),
}))

// Mock useSearchParams
export const mockUseSearchParams = vi.fn(() => new URLSearchParams())

// Mock usePathname
export const mockUsePathname = vi.fn(() => '/test')

// Mock custom hooks that might exist in the project
export const mockUsePasswordModal = vi.fn(() => ({
  isOpen: false,
  openModal: vi.fn(),
  closeModal: vi.fn(),
}))

export const mockUseSettingsData = vi.fn(() => ({
  data: {
    user: createMockUser(),
    organization: createMockOrganization(),
    notifications: {
      email_notifications: true,
      push_notifications: false,
      quiet_hours_enabled: false,
    },
  },
  loading: false,
  error: null,
  refetch: vi.fn(),
}))

// Mock Zustand stores
export const mockUseAuthStore = vi.fn(() => mockAuthStore)

export const mockUseOrganizationStore = vi.fn(() => ({
  organization: createMockOrganization(),
  members: [createMockUser()],
  invites: [],
  loading: false,
  error: null,
  setOrganization: vi.fn(),
  updateOrganization: vi.fn(),
  addMember: vi.fn(),
  removeMember: vi.fn(),
  updateMemberRole: vi.fn(),
}))

export const mockUseNotificationStore = vi.fn(() => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  addNotification: vi.fn(),
  markAsRead: vi.fn(),
  markAllAsRead: vi.fn(),
  removeNotification: vi.fn(),
}))

export const mockUseBillingStore = vi.fn(() => ({
  subscription: {
    id: 'sub_test',
    status: 'active',
    plan: 'basic',
    current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  invoices: [],
  loading: false,
  error: null,
  updateSubscription: vi.fn(),
  addInvoice: vi.fn(),
}))

// Export all mocks for easy importing
export const mockHooks = {
  useOrgContext: mockUseOrgContext,
  useAuth: mockUseAuth,
  useLocalizedNavigation: mockUseLocalizedNavigation,
  useTranslations: mockUseTranslations,
  useLocale: mockUseLocale,
  useTheme: mockUseTheme,
  useForm: mockUseForm,
  useQuery: mockUseQuery,
  useMutation: mockUseMutation,
  useRouter: mockUseRouter,
  useSearchParams: mockUseSearchParams,
  usePathname: mockUsePathname,
  usePasswordModal: mockUsePasswordModal,
  useSettingsData: mockUseSettingsData,
  useAuthStore: mockUseAuthStore,
  useOrganizationStore: mockUseOrganizationStore,
  useNotificationStore: mockUseNotificationStore,
  useBillingStore: mockUseBillingStore,
}
