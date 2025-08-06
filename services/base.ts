/**
 * Service base para chamadas à API com suporte multi-tenant via X-Org-Id headers.
 */

interface RequestOptions extends RequestInit {
  skipAuth?: boolean
  skipOrgHeader?: boolean // Para endpoints que não precisam de org context
}

export class BaseService {
  protected baseURL: string

  // Endpoints que requerem organização obrigatoriamente
  private readonly ORG_REQUIRED_ENDPOINTS = [
    '/api/organizations/',
    '/api/members/',
    '/api/invites/',
    '/api/billing/',
    '/api/admin/',
  ]

  // Endpoints que podem funcionar sem organização
  private readonly ORG_OPTIONAL_ENDPOINTS = [
    '/api/auth/',
    '/api/users/me', // Alguns contextos precisam, outros não
    '/api/health',
    '/api/public/',
  ]

  constructor() {
    this.baseURL = ''
    console.log('BaseService - baseURL:', this.baseURL)
    console.log('BaseService - NODE_ENV:', process.env.NODE_ENV)
    console.log(
      'BaseService - NEXT_PUBLIC_API_URL (for rewrites only):',
      process.env.NEXT_PUBLIC_API_URL
    )
  }

  /**
   * Verifica se endpoint requer organização obrigatoriamente
   */
  private requiresOrganization(endpoint: string): boolean {
    return this.ORG_REQUIRED_ENDPOINTS.some(pattern => endpoint.startsWith(pattern))
  }

  /**
   * Verifica se endpoint pode funcionar sem organização
   */
  private isOptionalOrganization(endpoint: string): boolean {
    return this.ORG_OPTIONAL_ENDPOINTS.some(pattern => endpoint.startsWith(pattern))
  }

  /**
   * Valida se organização está disponível quando necessária
   */
  private validateOrganizationContext(
    endpoint: string,
    skipOrgHeader: boolean = false
  ): {
    orgId: string | null
    shouldIncludeHeader: boolean
  } {
    if (skipOrgHeader) {
      return { orgId: null, shouldIncludeHeader: false }
    }

    const requiresOrg = this.requiresOrganization(endpoint)
    const isOptional = this.isOptionalOrganization(endpoint)

    // Tentar obter organização do auth store
    let orgId: string | null = null
    if (typeof window !== 'undefined') {
      try {
        const authStore = localStorage.getItem('auth-store')
        if (authStore) {
          const parsed = JSON.parse(authStore)
          orgId = parsed?.state?.organization?.id || null
        }
      } catch {
        // Ignore parsing errors - will be handled below
      }
    }

    // Validações baseadas no tipo de endpoint
    if (requiresOrg && !orgId) {
      throw new Error(
        `Organization context required for endpoint ${endpoint}. Please ensure user is logged in and has an organization.`
      )
    }

    // Para endpoints opcionais, incluir header se disponível
    const shouldIncludeHeader = requiresOrg || (isOptional && !!orgId)

    return { orgId, shouldIncludeHeader }
  }

  /**
   * Faz uma requisição à API.
   *
   * @param endpoint - Endpoint da API (ex: /users)
   * @param options - Opções da requisição
   * @returns Resposta parseada
   */
  protected async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { skipAuth = false, skipOrgHeader = false, ...fetchOptions } = options

    // Configurar headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    // Validar e configurar contexto organizacional
    const { orgId, shouldIncludeHeader } = this.validateOrganizationContext(endpoint, skipOrgHeader)

    // Adicionar token de autenticação e org_id se necessário
    if (!skipAuth && typeof window !== 'undefined') {
      // Pegar token do localStorage (onde o Zustand persiste)
      const authStore = localStorage.getItem('auth-store')
      if (authStore) {
        try {
          const parsed = JSON.parse(authStore)
          const { state } = parsed

          // Adicionar Authorization header
          if (state?.token) {
            ;(headers as any).Authorization = `Bearer ${state.token}`
            console.log('Auth token added to request')
          }

          // MULTI-TENANT: Adicionar X-Org-Id header quando necessário
          if (shouldIncludeHeader && orgId) {
            ;(headers as any)['X-Org-Id'] = orgId
            console.log('Added X-Org-Id header:', orgId)
            console.log('Endpoint requires org:', this.requiresOrganization(endpoint))
          } else if (shouldIncludeHeader && !orgId) {
            console.warn('Endpoint expects X-Org-Id but organization not available:', endpoint)
          }
        } catch (error) {
          console.error('Error parsing auth store:', error)
          // Continue sem headers - let the backend handle the error
        }
      } else {
        console.warn('No auth store found in localStorage')
      }
    }

    // Fazer requisição direta para FastAPI
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...fetchOptions,
      headers,
      credentials: 'include', // Essential for cross-origin cookies
    })

    // Tratar resposta
    if (!response.ok) {
      await this.handleError(response, endpoint)
    }

    // Retornar JSON parseado
    if (response.status === 204) {
      return {} as T
    }

    return response.json()
  }

  /**
   * Trata erros da API com contexto organizacional.
   */
  private async handleError(response: Response, endpoint?: string): Promise<never> {
    let errorMessage = 'Erro na requisição'
    let errorDetail: any = {}

    try {
      const errorData = await response.json()
      errorMessage = errorData.detail || errorData.message || errorMessage
      errorDetail = errorData
    } catch {
      // Se não conseguir fazer parse do JSON, usar status text
      errorMessage = response.statusText || errorMessage
    }

    // Criar erro customizado
    const error = new Error(errorMessage) as any
    error.response = {
      status: response.status,
      statusText: response.statusText,
      data: errorDetail,
    }

    // Tratar casos específicos com contexto organizacional
    if (response.status === 401) {
      // Token expirado ou inválido
      this.handleUnauthorized()
    } else if (response.status === 403) {
      // Possível erro organizacional
      this.handleOrganizationError(errorDetail, endpoint)
    } else if (response.status === 400 && errorDetail.detail?.includes('X-Org-Id')) {
      // Erro específico de header organizacional
      this.handleOrganizationHeaderError(errorDetail, endpoint)
    }

    throw error
  }

  /**
   * Trata erros específicos de organização (403 Forbidden).
   */
  private handleOrganizationError(errorDetail: any, endpoint?: string): void {
    const detail = errorDetail.detail || ''

    if (detail.includes('organization') || detail.includes('org')) {
      console.error('🏢 Organization access error:', {
        endpoint,
        error: detail,
        suggestion:
          'User may not have access to this organization or organization context is missing',
      })

      // Opcional: dispatch event para components reagirem
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('org-access-error', {
            detail: { endpoint, error: detail },
          })
        )
      }
    }
  }

  /**
   * Trata erros específicos de header X-Org-Id.
   */
  private handleOrganizationHeaderError(errorDetail: any, endpoint?: string): void {
    console.error('🏢 X-Org-Id header error:', {
      endpoint,
      error: errorDetail.detail,
      suggestion: 'Endpoint requires X-Org-Id header but it was missing or invalid',
    })

    // Tentar recarregar organization context
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('org-header-error', {
          detail: { endpoint, error: errorDetail.detail },
        })
      )
    }
  }

  /**
   * Trata erro de autenticação.
   */
  private handleUnauthorized(): void {
    // Limpar token inválido do localStorage
    if (typeof window !== 'undefined') {
      try {
        const authStore = localStorage.getItem('auth-store')
        if (authStore) {
          const parsed = JSON.parse(authStore)
          if (parsed.state) {
            // Manter outros dados mas limpar tokens
            parsed.state.token = null
            parsed.state.refreshToken = null
            parsed.state.isAuthenticated = false
            localStorage.setItem('auth-store', JSON.stringify(parsed))
          }
        }
      } catch {
        // Se não conseguir limpar, não faz nada - o erro vai ser propagado
      }
    }

    // NÃO redirecionar automaticamente - deixar componentes decidirem
    // A aplicação deve lidar com 401 errors de forma apropriada para cada contexto
  }

  /**
   * Métodos auxiliares para diferentes tipos de requisição.
   */
  protected get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  }

  protected post<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : null,
    })
  }

  protected put<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : null,
    })
  }

  protected patch<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : null,
    })
  }

  protected delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' })
  }
}
