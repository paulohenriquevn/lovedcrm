/**
 * Service de autenticação.
 */

import { BaseService } from './base'

interface LoginData {
  email: string
  password: string
  recaptcha_token?: string
}

interface RegisterData {
  email: string
  password: string
  full_name: string
  terms_accepted: boolean
  recaptcha_token?: string
}

interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
}

interface User {
  id: string
  email: string
  full_name: string
  is_active: boolean
  is_verified: boolean
  is_superuser: boolean
  status?: string
  is_email_verified?: boolean
  created_at: string
  updated_at: string
}

interface Organization {
  id: string
  name: string
  slug: string
  description?: string
  website?: string
  logo_url?: string
  owner_id: string
  is_active: boolean
  max_members: string
  created_at: string
  updated_at?: string
}

interface LoginResponse extends TokenResponse {
  user: User
  organization?: Organization
}

interface GoogleAuthResponse {
  authorization_url: string
}

class AuthService extends BaseService {
  /**
   * Faz login do usuário.
   */
  async login(data: LoginData): Promise<LoginResponse> {
    // Validações FAIL-FAST
    if (!data.email) {
      throw new Error('Email é obrigatório')
    }
    if (!data.password) {
      throw new Error('Senha é obrigatória')
    }
    if (!data.email.includes('@')) {
      throw new Error('Email inválido')
    }

    const response = await this.post<LoginResponse>('/api/auth/login', data, {
      skipAuth: true,
    })

    return response
  }

  /**
   * Registra novo usuário.
   */
  async register(data: RegisterData): Promise<{ user: User; message: string }> {
    // Validações FAIL-FAST
    if (!data.email) {
      throw new Error('Email é obrigatório')
    }
    if (!data.password) {
      throw new Error('Senha é obrigatória')
    }
    if (!data.full_name) {
      throw new Error('Nome completo é obrigatório')
    }
    if (!data.email.includes('@')) {
      throw new Error('Email inválido')
    }
    if (data.password.length < 8) {
      throw new Error('Senha deve ter pelo menos 8 caracteres')
    }

    return this.post<{ user: User; message: string }>('/api/auth/register', data, {
      skipAuth: true,
    })
  }

  /**
   * Obtém dados do usuário atual.
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      return await this.get<User>('/api/auth/me')
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        // Token inválido/expirado ou sem permissão - retorna null silenciosamente
        return null
      }
      // Para outros erros (network, 500, etc), propagar o erro
      console.warn('AuthService.getCurrentUser failed:', error.message)
      return null
    }
  }

  /**
   * Faz logout do usuário.
   */
  async logout(): Promise<void> {
    try {
      await this.post('/api/auth/logout')
    } catch (error) {
      // Ignorar erros de rede no logout
    }
    // Os cookies são limpos automaticamente pelo backend
  }

  /**
   * Renova o access token.
   */
  async refreshToken(): Promise<TokenResponse> {
    const response = await this.post<TokenResponse>(
      '/api/auth/refresh',
      {},
      {
        skipAuth: true,
      }
    )

    // Os cookies são atualizados automaticamente pelo backend
    return response
  }

  /**
   * Solicita reset de senha.
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    return await this.post(
      '/api/auth/forgot-password',
      { email },
      {
        skipAuth: true,
      }
    )
  }

  /**
   * Reseta a senha com token.
   */
  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    return await this.post(
      '/api/auth/reset-password',
      {
        token,
        new_password: newPassword,
      },
      {
        skipAuth: true,
      }
    )
  }

  /**
   * Verifica email com token.
   */
  async verifyEmail(token: string): Promise<{ message: string }> {
    return await this.post(
      '/api/auth/verify-email',
      { token },
      {
        skipAuth: true,
      }
    )
  }

  /**
   * Reenvia email de verificação.
   */
  async resendVerification(email: string): Promise<{ message: string }> {
    return await this.post(
      '/api/auth/resend-verification',
      { email },
      {
        skipAuth: true,
      }
    )
  }

  /**
   * Inicia o fluxo de autenticação Google OAuth.
   */
  async getGoogleAuthUrl(state?: string): Promise<string> {
    console.log('🔍 AuthService: getGoogleAuthUrl called with state:', state)
    const url = `/api/auth/google/authorize${state ? `?state=${encodeURIComponent(state)}` : ''}`
    console.log('🔍 AuthService: Calling API endpoint:', url)

    const response = await this.get<GoogleAuthResponse>(url, {
      skipAuth: true,
    })

    console.log('🔍 AuthService: Received response:', response)
    return response.authorization_url
  }

  /**
   * Processa callback do Google OAuth.
   */
  async handleGoogleCallback(
    code: string,
    state?: string
  ): Promise<TokenResponse & { user?: User; organization?: Organization }> {
    // Validações FAIL-FAST
    if (!code) {
      throw new Error('Código de autorização é obrigatório')
    }

    const response = await this.post<TokenResponse & { user?: User; organization?: Organization }>(
      '/api/auth/google/callback',
      { code, state },
      {
        skipAuth: true,
      }
    )

    // Os cookies são definidos automaticamente pelo backend
    return response
  }

  /**
   * Inicia login com Google (redirecionamento).
   */
  async loginWithGoogle(state?: string): Promise<void> {
    console.log('🔍 AuthService: loginWithGoogle called with state:', state)

    try {
      const authUrl = await this.getGoogleAuthUrl(state)
      console.log('🔍 AuthService: Got auth URL:', authUrl)

      // Redirecionar para Google OAuth
      if (typeof window !== 'undefined') {
        console.log('🔍 AuthService: Redirecting to:', authUrl)
        window.location.href = authUrl
      } else {
        console.warn('AuthService: Window is undefined, cannot redirect')
      }
    } catch (error) {
      console.error('AuthService: Failed to get Google auth URL:', error)
      throw error
    }
  }

  /**
   * Verifica se usuário está autenticado.
   * Agora verifica através de uma chamada à API.
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser()
      return !!user
    } catch {
      return false
    }
  }
}

export const authService = new AuthService()
