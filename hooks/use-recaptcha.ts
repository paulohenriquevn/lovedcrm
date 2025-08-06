/**
 * 🤖 useRecaptcha Hook - React Integration
 * =======================================
 * Hook customizado para integração fácil do reCAPTCHA v3 em componentes React.
 * Gerencia estado, loading e execução automática de challenges.
 */

import { useCallback, useEffect, useState } from 'react'

import { recaptchaService, RecaptchaAction } from '@/services/recaptcha'

interface UseRecaptchaOptions {
  /**
   * Executar challenge automaticamente ao montar componente.
   * @default false
   */
  autoExecute?: boolean

  /**
   * Reexecutar challenge quando action muda.
   * @default true
   */
  reExecuteOnChange?: boolean

  /**
   * Timeout para execução do challenge (ms).
   * @default 10000
   */
  timeout?: number

  /**
   * Callback quando challenge é executado com sucesso.
   */
  onSuccess?: (token: string) => void

  /**
   * Callback quando challenge falha.
   */
  onError?: (error: Error) => void

  /**
   * Habilitar logs de debug.
   * @default false
   */
  debug?: boolean
}

interface UseRecaptchaReturn {
  /**
   * Token reCAPTCHA atual (vazio se não executado ou falhou).
   */
  token: string

  /**
   * Indica se o challenge está sendo executado.
   */
  isLoading: boolean

  /**
   * Erro do último challenge (null se sucesso).
   */
  error: Error | null

  /**
   * Indica se reCAPTCHA está habilitado.
   */
  isEnabled: boolean

  /**
   * Executa challenge manualmente para a action especificada.
   */
  execute: (action: RecaptchaAction) => Promise<string>

  /**
   * Limpa token e erro atual.
   */
  reset: () => void

  /**
   * Recarrega serviço reCAPTCHA (útil para debug).
   */
  reload: () => Promise<void>
}

/**
 * Hook para integração com reCAPTCHA v3.
 *
 * @example
 * ```tsx
 * function LoginForm() {
 *   const { token, isLoading, execute, error } = useRecaptcha()
 *
 *   const handleSubmit = async () => {
 *     const recaptchaToken = await execute(RecaptchaAction.LOGIN)
 *     await authService.login({ email, password, recaptcha_token: recaptchaToken })
 *   }
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       {error && <div>reCAPTCHA Error: {error.message}</div>}
 *       <button disabled={isLoading}>
 *         {isLoading ? 'Verifying...' : 'Login'}
 *       </button>
 *     </form>
 *   )
 * }
 * ```
 */
export function useRecaptcha(options: UseRecaptchaOptions = {}): UseRecaptchaReturn {
  const { autoExecute = false, timeout = 10000, onSuccess, onError, debug = false } = options

  const [token, setToken] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)
  const [isEnabled] = useState<boolean>(recaptchaService.isEnabled())

  /**
   * Executa challenge reCAPTCHA.
   */
  const execute = useCallback(
    async (action: RecaptchaAction): Promise<string> => {
      if (debug) {
        console.log(`🤖 useRecaptcha: Executing challenge for ${action}`)
      }

      // Skip se desabilitado
      if (!isEnabled) {
        if (debug) {
          console.log('🤖 useRecaptcha: reCAPTCHA disabled, returning empty token')
        }
        return ''
      }

      setIsLoading(true)
      setError(null)

      try {
        // Executar com timeout
        const executePromise = recaptchaService.executeChallenge(action)
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('reCAPTCHA timeout')), timeout)
        })

        const challengeToken = await Promise.race([executePromise, timeoutPromise])

        setToken(challengeToken)
        setIsLoading(false)

        if (debug) {
          console.log(`useRecaptcha: Challenge completed for ${action}`)
        }

        onSuccess?.(challengeToken)
        return challengeToken
      } catch (err) {
        const error = err instanceof Error ? err : new Error('reCAPTCHA challenge failed')

        setError(error)
        setToken('')
        setIsLoading(false)

        if (debug) {
          console.error(`useRecaptcha: Challenge failed for ${action}:`, error)
        }

        onError?.(error)
        throw error
      }
    },
    [isEnabled, timeout, onSuccess, onError, debug]
  )

  /**
   * Limpa estado atual.
   */
  const reset = useCallback(() => {
    setToken('')
    setError(null)
    setIsLoading(false)

    if (debug) {
      console.log('🤖 useRecaptcha: State reset')
    }
  }, [debug])

  /**
   * Recarrega serviço reCAPTCHA.
   */
  const reload = useCallback(async () => {
    if (debug) {
      console.log('🤖 useRecaptcha: Reloading reCAPTCHA script')
    }

    setIsLoading(true)
    try {
      await recaptchaService.reloadScript()
      reset()
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to reload reCAPTCHA')
      setError(error)
      if (debug) {
        console.error('useRecaptcha: Reload failed:', error)
      }
    } finally {
      setIsLoading(false)
    }
  }, [debug, reset])

  // Auto-execute no mount se habilitado
  useEffect(() => {
    if (autoExecute && isEnabled) {
      // Aguardar um frame para garantir que componente montou
      const timer = setTimeout(() => {
        // Não podemos executar sem uma action específica
        // Este comportamento seria implementado pelo componente pai
        if (debug) {
          console.log('🤖 useRecaptcha: Auto-execute enabled but no default action')
        }
      }, 0)

      return () => clearTimeout(timer)
    }
    return undefined
  }, [autoExecute, isEnabled, debug])

  return {
    token,
    isLoading,
    error,
    isEnabled,
    execute,
    reset,
    reload,
  }
}

/**
 * Hook especializado para formulários de autenticação.
 * Inclui helpers específicos para login, register, etc.
 */
export function useAuthRecaptcha() {
  const recaptcha = useRecaptcha({ debug: process.env.NODE_ENV === 'development' })

  return {
    ...recaptcha,

    /**
     * Executa challenge para login.
     */
    executeLogin: () => recaptcha.execute(RecaptchaAction.LOGIN),

    /**
     * Executa challenge para registro.
     */
    executeRegister: () => recaptcha.execute(RecaptchaAction.REGISTER),

    /**
     * Executa challenge para forgot password.
     */
    executeForgotPassword: () => recaptcha.execute(RecaptchaAction.FORGOT_PASSWORD),

    /**
     * Executa challenge para reset password.
     */
    executeResetPassword: () => recaptcha.execute(RecaptchaAction.RESET_PASSWORD),
  }
}
