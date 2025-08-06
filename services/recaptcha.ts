/**
 * 🤖 reCAPTCHA v3 Service - Frontend Integration
 * ==============================================
 * Service completo para integração com Google reCAPTCHA v3.
 * Inclui carregamento do script, execução de challenges e cache de tokens.
 */

import { BaseService } from './base'

/**
 * Actions disponíveis para reCAPTCHA v3.
 * Devem bater com RecaptchaAction do backend.
 */
export enum RecaptchaAction {
  LOGIN = 'login',
  REGISTER = 'register',
  FORGOT_PASSWORD = 'forgot_password',
  RESET_PASSWORD = 'reset_password',
  CONTACT_FORM = 'contact',
  INVITE_USER = 'invite_user',
}

interface RecaptchaResponse {
  success: boolean
  score: number
  action: string
  error?: string
}

interface RecaptchaConfig {
  siteKey: string
  enabled: boolean
  threshold: number
}

class RecaptchaService extends BaseService {
  private siteKey: string | null = null
  private enabled: boolean = true
  private threshold: number = 0.5
  private scriptLoaded: boolean = false
  private scriptLoading: Promise<void> | null = null
  // tokenCache removido: Tokens reCAPTCHA são single-use

  constructor() {
    super()
    this.loadConfig()
  }

  /**
   * Carrega configuração do reCAPTCHA do ambiente.
   */
  private loadConfig(): void {
    // Site key vem do ambiente (Next.js public env vars)
    this.siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || null
    this.enabled = process.env.NEXT_PUBLIC_RECAPTCHA_ENABLED !== 'false'
    this.threshold = parseFloat(process.env.NEXT_PUBLIC_RECAPTCHA_THRESHOLD || '0.5')

    if (this.enabled && !this.siteKey) {
      console.warn('reCAPTCHA enabled but NEXT_PUBLIC_RECAPTCHA_SITE_KEY not configured')
      this.enabled = false
    }

    console.log('reCAPTCHA Config:', {
      enabled: this.enabled,
      siteKey: this.siteKey ? `${this.siteKey.substring(0, 20)}...` : null,
      threshold: this.threshold,
    })
  }

  /**
   * Carrega o script reCAPTCHA v3 do Google.
   */
  private async loadScript(): Promise<void> {
    if (this.scriptLoaded) return
    if (this.scriptLoading) return this.scriptLoading

    if (!this.siteKey) {
      throw new Error('reCAPTCHA site key not configured')
    }

    this.scriptLoading = new Promise((resolve, reject) => {
      // Verificar se já existe
      const existingScript = document.querySelector(`script[src*="recaptcha"]`)
      if (existingScript) {
        this.scriptLoaded = true
        resolve()
        return
      }

      // Criar e carregar script
      const script = document.createElement('script')
      script.src = `https://www.google.com/recaptcha/api.js?render=${this.siteKey}`
      script.async = true
      script.defer = true

      script.onload = () => {
        this.scriptLoaded = true
        console.log('reCAPTCHA script loaded successfully')
        resolve()
      }

      script.onerror = () => {
        console.error('Failed to load reCAPTCHA script')
        reject(new Error('Failed to load reCAPTCHA script'))
      }

      document.head.appendChild(script)
    })

    return this.scriptLoading
  }

  /**
   * Aguarda o reCAPTCHA estar pronto.
   */
  private async waitForRecaptcha(): Promise<void> {
    return new Promise((resolve, reject) => {
      const maxAttempts = 50 // 5 segundos total
      let attempts = 0

      const checkReady = () => {
        if (
          typeof window !== 'undefined' &&
          window.grecaptcha &&
          typeof window.grecaptcha.ready === 'function'
        ) {
          resolve()
          return
        }

        attempts++
        if (attempts >= maxAttempts) {
          reject(new Error('reCAPTCHA not ready after timeout'))
          return
        }

        setTimeout(checkReady, 100)
      }

      checkReady()
    })
  }

  /**
   * Executa challenge reCAPTCHA v3 para uma action específica.
   */
  async executeChallenge(action: RecaptchaAction): Promise<string> {
    if (!this.enabled) {
      console.log('🤖 reCAPTCHA disabled, returning empty token')
      return ''
    }

    // CACHE DESABILITADO: Tokens reCAPTCHA são single-use
    // Sempre gerar novo token para evitar "token expired or already used"
    console.log(`🤖 Generating fresh reCAPTCHA token for ${action}`)

    try {
      // Carregar script se necessário
      await this.loadScript()
      await this.waitForRecaptcha()

      // Executar challenge
      const token = await new Promise<string>((resolve, reject) => {
        window.grecaptcha.ready(() => {
          window.grecaptcha
            .execute(this.siteKey!, { action })
            .then((token: string) => {
              console.log(`reCAPTCHA token generated for ${action}`)
              resolve(token)
            })
            .catch((error: any) => {
              console.error(`reCAPTCHA challenge failed for ${action}:`, error)
              reject(error)
            })
        })
      })

      // CACHE REMOVIDO: Tokens são single-use, não podem ser reutilizados
      return token
    } catch (error) {
      console.error('reCAPTCHA execution failed:', error)
      throw new Error('reCAPTCHA challenge failed')
    }
  }

  /**
   * Valida token reCAPTCHA no backend (para debug/testing).
   */
  async validateToken(token: string, action: string): Promise<RecaptchaResponse> {
    try {
      const response = await this.post<RecaptchaResponse>('/api/auth/validate-recaptcha', {
        token,
        action,
      })
      return response
    } catch (error) {
      console.error('reCAPTCHA validation failed:', error)
      return {
        success: false,
        score: 0,
        action,
        error: error instanceof Error ? error.message : 'Validation failed',
      }
    }
  }

  /**
   * Limpa cache de tokens (no-op - tokens são single-use).
   */
  clearCache(): void {
    // No-op: tokens reCAPTCHA são single-use, não há cache para limpar
    console.log('🤖 reCAPTCHA cache clear requested (no-op)')
  }

  /**
   * Verifica se reCAPTCHA está habilitado.
   */
  isEnabled(): boolean {
    return this.enabled
  }

  /**
   * Obtém configuração atual.
   */
  getConfig(): RecaptchaConfig {
    return {
      siteKey: this.siteKey || '',
      enabled: this.enabled,
      threshold: this.threshold,
    }
  }

  /**
   * Helper para debugging - força recarregamento do script.
   */
  async reloadScript(): Promise<void> {
    // Remove script existente
    const existingScript = document.querySelector(`script[src*="recaptcha"]`)
    if (existingScript) {
      existingScript.remove()
    }

    // Reset estado
    this.scriptLoaded = false
    this.scriptLoading = null
    this.clearCache()

    // Recarrega
    await this.loadScript()
    console.log('🔄 reCAPTCHA script reloaded')
  }
}

// Instância global do serviço
export const recaptchaService = new RecaptchaService()

// Type declarations para window.grecaptcha
declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void
      execute: (siteKey: string, options: { action: string }) => Promise<string>
    }
  }
}
