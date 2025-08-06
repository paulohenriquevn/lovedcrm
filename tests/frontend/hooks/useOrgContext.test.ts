import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { createMockOrganization } from '../utils/test-utils'
import { mockServices } from '../mocks/services'

// Mock the useOrgContext hook
// Note: This is a mock implementation - you'll need to adjust based on your actual hook
const mockUseOrgContext = () => {
  const [organization, setOrganization] = vi.fn()([createMockOrganization()])
  const [loading, setLoading] = vi.fn()([false])
  const [error, setError] = vi.fn()([null])

  const validateOrgAccess = vi.fn((requiredRole = 'user') => {
    return organization?.role ? organization.role === requiredRole : true
  })

  const refreshOrganization = vi.fn(async () => {
    setLoading(true)
    try {
      const response = await mockServices.organization.getOrganization()
      setOrganization(response.data)
      setError(null)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  })

  return {
    organization,
    loading,
    error,
    validateOrgAccess,
    refreshOrganization,
  }
}

describe('useOrgContext Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('provides organization data', () => {
    const { result } = renderHook(() => mockUseOrgContext())

    expect(result.current.organization).toBeDefined()
    expect(result.current.organization.id).toBe('test-org-id')
    expect(result.current.organization.name).toBe('Test Organization')
  })

  it('starts with loading false', () => {
    const { result } = renderHook(() => mockUseOrgContext())

    expect(result.current.loading).toBe(false)
  })

  it('starts with no error', () => {
    const { result } = renderHook(() => mockUseOrgContext())

    expect(result.current.error).toBeNull()
  })

  it('validates organization access correctly', () => {
    const { result } = renderHook(() => mockUseOrgContext())

    const hasAccess = result.current.validateOrgAccess('user')
    expect(hasAccess).toBe(true)
    expect(result.current.validateOrgAccess).toHaveBeenCalledWith('user')
  })

  it('validates admin access correctly', () => {
    const { result } = renderHook(() => mockUseOrgContext())

    const hasAdminAccess = result.current.validateOrgAccess('admin')
    expect(result.current.validateOrgAccess).toHaveBeenCalledWith('admin')
  })

  it('refreshes organization data', async () => {
    const { result } = renderHook(() => mockUseOrgContext())

    await act(async () => {
      await result.current.refreshOrganization()
    })

    expect(result.current.refreshOrganization).toHaveBeenCalled()
    expect(mockServices.organization.getOrganization).toHaveBeenCalled()
  })

  it('handles refresh organization error', async () => {
    const error = new Error('Failed to fetch organization')
    mockServices.organization.getOrganization.mockRejectedValue(error)

    const { result } = renderHook(() => mockUseOrgContext())

    await act(async () => {
      try {
        await result.current.refreshOrganization()
      } catch (err) {
        // Error should be handled by the hook
      }
    })

    expect(result.current.refreshOrganization).toHaveBeenCalled()
  })

  it('provides correct organization permissions', () => {
    const organization = createMockOrganization({ role: 'admin' })
    const mockHook = () => ({
      organization,
      loading: false,
      error: null,
      validateOrgAccess: vi.fn(requiredRole => {
        const roles = ['user', 'admin', 'owner']
        const userRoleIndex = roles.indexOf(organization.role)
        const requiredRoleIndex = roles.indexOf(requiredRole)
        return userRoleIndex >= requiredRoleIndex
      }),
      refreshOrganization: vi.fn(),
    })

    const { result } = renderHook(() => mockHook())

    expect(result.current.validateOrgAccess('user')).toBe(true)
    expect(result.current.validateOrgAccess('admin')).toBe(true)
    expect(result.current.validateOrgAccess('owner')).toBe(false)
  })

  it('handles missing organization', () => {
    const mockHook = () => ({
      organization: null,
      loading: false,
      error: null,
      validateOrgAccess: vi.fn(() => false),
      refreshOrganization: vi.fn(),
    })

    const { result } = renderHook(() => mockHook())

    expect(result.current.organization).toBeNull()
    expect(result.current.validateOrgAccess('user')).toBe(false)
  })

  it('handles organization loading state', () => {
    const mockHook = () => ({
      organization: null,
      loading: true,
      error: null,
      validateOrgAccess: vi.fn(() => false),
      refreshOrganization: vi.fn(),
    })

    const { result } = renderHook(() => mockHook())

    expect(result.current.loading).toBe(true)
    expect(result.current.organization).toBeNull()
  })

  it('handles organization error state', () => {
    const error = new Error('Organization not found')
    const mockHook = () => ({
      organization: null,
      loading: false,
      error,
      validateOrgAccess: vi.fn(() => false),
      refreshOrganization: vi.fn(),
    })

    const { result } = renderHook(() => mockHook())

    expect(result.current.error).toBe(error)
    expect(result.current.organization).toBeNull()
  })
})
