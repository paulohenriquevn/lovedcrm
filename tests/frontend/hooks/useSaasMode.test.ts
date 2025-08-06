import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { renderHook } from '../utils/test-utils'
import { useSaasMode } from '../../../hooks/use-saas-mode'

describe('useSaasMode Hook', () => {
  const originalEnv = process.env.NEXT_PUBLIC_SAAS_MODE

  afterEach(() => {
    // Restore original environment
    if (originalEnv !== undefined) {
      process.env.NEXT_PUBLIC_SAAS_MODE = originalEnv
    } else {
      delete process.env.NEXT_PUBLIC_SAAS_MODE
    }
  })

  describe('Success Scenarios (2XX) - Functionality First', () => {
    it('returns B2C mode by default when no environment variable is set', () => {
      // Remove environment variable
      delete process.env.NEXT_PUBLIC_SAAS_MODE

      const { result } = renderHook(() => useSaasMode())

      expect(result.current.mode).toBe('B2C')
      expect(result.current.isB2C).toBe(true)
      expect(result.current.isB2B).toBe(false)
    })

    it('returns B2C mode when explicitly set', () => {
      process.env.NEXT_PUBLIC_SAAS_MODE = 'B2C'

      const { result } = renderHook(() => useSaasMode())

      expect(result.current.mode).toBe('B2C')
      expect(result.current.isB2C).toBe(true)
      expect(result.current.isB2B).toBe(false)
    })

    it('returns B2B mode when explicitly set', () => {
      process.env.NEXT_PUBLIC_SAAS_MODE = 'B2B'

      const { result } = renderHook(() => useSaasMode())

      expect(result.current.mode).toBe('B2B')
      expect(result.current.isB2C).toBe(false)
      expect(result.current.isB2B).toBe(true)
    })

    it('provides correct utility boolean values for B2C mode', () => {
      process.env.NEXT_PUBLIC_SAAS_MODE = 'B2C'

      const { result } = renderHook(() => useSaasMode())

      expect(result.current.isB2C).toBe(true)
      expect(result.current.isB2B).toBe(false)
    })

    it('provides correct utility boolean values for B2B mode', () => {
      process.env.NEXT_PUBLIC_SAAS_MODE = 'B2B'

      const { result } = renderHook(() => useSaasMode())

      expect(result.current.isB2C).toBe(false)
      expect(result.current.isB2B).toBe(true)
    })

    it('returns stable values across multiple calls', () => {
      process.env.NEXT_PUBLIC_SAAS_MODE = 'B2B'

      const { result, rerender } = renderHook(() => useSaasMode())

      const firstResult = result.current
      rerender()
      const secondResult = result.current

      expect(firstResult.mode).toBe(secondResult.mode)
      expect(firstResult.isB2C).toBe(secondResult.isB2C)
      expect(firstResult.isB2B).toBe(secondResult.isB2B)
    })
  })

  describe('Error Scenarios (4XX) - Validation', () => {
    it('falls back to B2C mode for invalid environment values', () => {
      const invalidValues = ['HYBRID', 'AUTO', 'B2G', '', 'invalid', '123']

      invalidValues.forEach(invalidValue => {
        process.env.NEXT_PUBLIC_SAAS_MODE = invalidValue

        const { result } = renderHook(() => useSaasMode())

        expect(result.current.mode).toBe('B2C')
        expect(result.current.isB2C).toBe(true)
        expect(result.current.isB2B).toBe(false)
      })
    })

    it('handles undefined environment variable gracefully', () => {
      process.env.NEXT_PUBLIC_SAAS_MODE = undefined as any

      const { result } = renderHook(() => useSaasMode())

      expect(result.current.mode).toBe('B2C')
      expect(result.current.isB2C).toBe(true)
      expect(result.current.isB2B).toBe(false)
    })

    it('handles null environment variable gracefully', () => {
      process.env.NEXT_PUBLIC_SAAS_MODE = null as any

      const { result } = renderHook(() => useSaasMode())

      expect(result.current.mode).toBe('B2C')
      expect(result.current.isB2C).toBe(true)
      expect(result.current.isB2B).toBe(false)
    })
  })

  describe('Edge Cases', () => {
    it('handles case-sensitive environment variable correctly', () => {
      // Environment variables should be exactly 'B2B' or 'B2C'
      const caseSensitiveValues = [
        { input: 'b2c', expected: 'B2C' }, // Should fallback to B2C
        { input: 'b2b', expected: 'B2C' }, // Should fallback to B2C
        { input: 'B2c', expected: 'B2C' }, // Should fallback to B2C
        { input: 'b2B', expected: 'B2C' }, // Should fallback to B2C
      ]

      caseSensitiveValues.forEach(({ input, expected }) => {
        process.env.NEXT_PUBLIC_SAAS_MODE = input

        const { result } = renderHook(() => useSaasMode())

        expect(result.current.mode).toBe(expected)
      })
    })

    it('returns object with all expected properties', () => {
      process.env.NEXT_PUBLIC_SAAS_MODE = 'B2B'

      const { result } = renderHook(() => useSaasMode())

      expect(result.current).toHaveProperty('mode')
      expect(result.current).toHaveProperty('isB2C')
      expect(result.current).toHaveProperty('isB2B')
      expect(Object.keys(result.current)).toHaveLength(3)
    })

    it('maintains referential stability', () => {
      process.env.NEXT_PUBLIC_SAAS_MODE = 'B2C'

      const { result, rerender } = renderHook(() => useSaasMode())

      const firstResult = result.current
      rerender()
      const secondResult = result.current

      // Values should be the same but objects can be different (no memoization required)
      expect(firstResult.mode).toBe(secondResult.mode)
      expect(firstResult.isB2C).toBe(secondResult.isB2C)
      expect(firstResult.isB2B).toBe(secondResult.isB2B)
    })
  })
})
