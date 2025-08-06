import { vi } from 'vitest'
import {
  createMockUser,
  createMockOrganization,
  createMockInvite,
  mockApiResponse,
} from '../utils/test-utils'

// Mock BaseService
export const mockBaseService = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  patch: vi.fn(),
}

// Mock AuthService
export const mockAuthService = {
  login: vi.fn().mockResolvedValue(
    mockApiResponse({
      user: createMockUser(),
      token: 'mock-jwt-token',
    })
  ),
  register: vi.fn().mockResolvedValue(
    mockApiResponse({
      user: createMockUser(),
      token: 'mock-jwt-token',
    })
  ),
  logout: vi.fn().mockResolvedValue(mockApiResponse({})),
  refreshToken: vi.fn().mockResolvedValue(
    mockApiResponse({
      token: 'new-mock-jwt-token',
    })
  ),
  forgotPassword: vi.fn().mockResolvedValue(mockApiResponse({})),
  resetPassword: vi.fn().mockResolvedValue(mockApiResponse({})),
  verifyEmail: vi.fn().mockResolvedValue(mockApiResponse({})),
  resendVerification: vi.fn().mockResolvedValue(mockApiResponse({})),
}

// Mock UserService
export const mockUserService = {
  getCurrentUser: vi.fn().mockResolvedValue(mockApiResponse(createMockUser())),
  updateProfile: vi.fn().mockResolvedValue(mockApiResponse(createMockUser())),
  updatePassword: vi.fn().mockResolvedValue(mockApiResponse({})),
  deleteAccount: vi.fn().mockResolvedValue(mockApiResponse({})),
  uploadAvatar: vi.fn().mockResolvedValue(
    mockApiResponse({
      avatar_url: 'https://example.com/avatar.jpg',
    })
  ),
}

// Mock OrganizationService
export const mockOrganizationService = {
  getOrganization: vi.fn().mockResolvedValue(mockApiResponse(createMockOrganization())),
  updateOrganization: vi.fn().mockResolvedValue(mockApiResponse(createMockOrganization())),
  deleteOrganization: vi.fn().mockResolvedValue(mockApiResponse({})),
  getMembers: vi.fn().mockResolvedValue(mockApiResponse([createMockUser()])),
  removeMember: vi.fn().mockResolvedValue(mockApiResponse({})),
  updateMemberRole: vi.fn().mockResolvedValue(mockApiResponse({})),
  getSettings: vi.fn().mockResolvedValue(
    mockApiResponse({
      notifications_enabled: true,
      two_factor_required: false,
    })
  ),
  updateSettings: vi.fn().mockResolvedValue(mockApiResponse({})),
}

// Mock InviteService
export const mockInviteService = {
  getInvites: vi.fn().mockResolvedValue(mockApiResponse([createMockInvite()])),
  createInvite: vi.fn().mockResolvedValue(mockApiResponse(createMockInvite())),
  resendInvite: vi.fn().mockResolvedValue(mockApiResponse({})),
  revokeInvite: vi.fn().mockResolvedValue(mockApiResponse({})),
  acceptInvite: vi.fn().mockResolvedValue(mockApiResponse({})),
  declineInvite: vi.fn().mockResolvedValue(mockApiResponse({})),
}

// Mock BillingService
export const mockBillingService = {
  getSubscription: vi.fn().mockResolvedValue(
    mockApiResponse({
      id: 'sub_test',
      status: 'active',
      plan: 'basic',
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    })
  ),
  getInvoices: vi.fn().mockResolvedValue(mockApiResponse([])),
  createCheckoutSession: vi.fn().mockResolvedValue(
    mockApiResponse({
      url: 'https://checkout.stripe.com/test',
    })
  ),
  createPortalSession: vi.fn().mockResolvedValue(
    mockApiResponse({
      url: 'https://billing.stripe.com/test',
    })
  ),
  cancelSubscription: vi.fn().mockResolvedValue(mockApiResponse({})),
}

// Mock NotificationService
export const mockNotificationService = {
  getNotifications: vi.fn().mockResolvedValue(mockApiResponse([])),
  markAsRead: vi.fn().mockResolvedValue(mockApiResponse({})),
  markAllAsRead: vi.fn().mockResolvedValue(mockApiResponse({})),
  deleteNotification: vi.fn().mockResolvedValue(mockApiResponse({})),
  getSettings: vi.fn().mockResolvedValue(
    mockApiResponse({
      email_notifications: true,
      push_notifications: false,
      quiet_hours_enabled: false,
    })
  ),
  updateSettings: vi.fn().mockResolvedValue(mockApiResponse({})),
}

// Export all mocks for easy importing
export const mockServices = {
  auth: mockAuthService,
  user: mockUserService,
  organization: mockOrganizationService,
  invite: mockInviteService,
  billing: mockBillingService,
  notification: mockNotificationService,
}
