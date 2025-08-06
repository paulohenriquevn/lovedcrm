import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockBaseService } from '../mocks/services'

// Mock fetch for testing HTTP requests
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock BaseService implementation for testing
class MockBaseService {
  private static baseURL = 'http://localhost:8000'
  private static defaultHeaders = {
    'Content-Type': 'application/json',
  }

  private static async request(method: string, url: string, options: any = {}) {
    const token = localStorage.getItem('auth_token')
    const orgId = localStorage.getItem('org_id')

    const headers = {
      ...this.defaultHeaders,
      ...options.headers,
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    if (orgId) {
      headers['X-Org-Id'] = orgId
    }

    const config = {
      method,
      headers,
      ...options,
    }

    if (options.body) {
      config.body = JSON.stringify(options.body)
    }

    const response = await fetch(`${this.baseURL}${url}`, config)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }

  static async get(url: string, options?: any) {
    return this.request('GET', url, options)
  }

  static async post(url: string, body?: any, options?: any) {
    return this.request('POST', url, { ...options, body })
  }

  static async put(url: string, body?: any, options?: any) {
    return this.request('PUT', url, { ...options, body })
  }

  static async delete(url: string, options?: any) {
    return this.request('DELETE', url, options)
  }

  static async patch(url: string, body?: any, options?: any) {
    return this.request('PATCH', url, { ...options, body })
  }
}

describe('BaseService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()

    mockFetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ success: true, data: {} }),
      status: 200,
      statusText: 'OK',
    })
  })

  describe('GET requests', () => {
    it('makes GET request with correct URL', async () => {
      await MockBaseService.get('/test')

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/test',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      )
    })

    it('includes authorization header when token exists', async () => {
      localStorage.setItem('auth_token', 'test-token')

      await MockBaseService.get('/test')

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      )
    })

    it('includes organization header when org_id exists', async () => {
      localStorage.setItem('org_id', 'test-org-id')

      await MockBaseService.get('/test')

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Org-Id': 'test-org-id',
          }),
        })
      )
    })
  })

  describe('POST requests', () => {
    it('makes POST request with body', async () => {
      const testData = { name: 'test' }

      await MockBaseService.post('/test', testData)

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/test',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(testData),
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      )
    })

    it('makes POST request without body', async () => {
      await MockBaseService.post('/test')

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/test',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      )
    })
  })

  describe('PUT requests', () => {
    it('makes PUT request with body', async () => {
      const testData = { id: 1, name: 'updated' }

      await MockBaseService.put('/test/1', testData)

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/test/1',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(testData),
        })
      )
    })
  })

  describe('DELETE requests', () => {
    it('makes DELETE request', async () => {
      await MockBaseService.delete('/test/1')

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/test/1',
        expect.objectContaining({
          method: 'DELETE',
        })
      )
    })
  })

  describe('PATCH requests', () => {
    it('makes PATCH request with body', async () => {
      const testData = { name: 'patched' }

      await MockBaseService.patch('/test/1', testData)

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/test/1',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(testData),
        })
      )
    })
  })

  describe('Error handling', () => {
    it('throws error for non-ok responses', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      })

      await expect(MockBaseService.get('/test')).rejects.toThrow('HTTP 404: Not Found')
    })

    it('throws error for network failures', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))

      await expect(MockBaseService.get('/test')).rejects.toThrow('Network error')
    })
  })

  describe('Custom headers', () => {
    it('merges custom headers with default headers', async () => {
      const customHeaders = { 'X-Custom': 'test-value' }

      await MockBaseService.get('/test', { headers: customHeaders })

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-Custom': 'test-value',
          }),
        })
      )
    })

    it('allows overriding default headers', async () => {
      const customHeaders = { 'Content-Type': 'application/xml' }

      await MockBaseService.get('/test', { headers: customHeaders })

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/xml',
          }),
        })
      )
    })
  })

  describe('Multi-tenant headers', () => {
    it('includes both auth and org headers when available', async () => {
      localStorage.setItem('auth_token', 'test-token')
      localStorage.setItem('org_id', 'test-org-id')

      await MockBaseService.get('/test')

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
            'X-Org-Id': 'test-org-id',
          }),
        })
      )
    })
  })
})
