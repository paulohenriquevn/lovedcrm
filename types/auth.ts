export interface User {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  is_active: boolean
  is_verified: boolean
  is_superuser: boolean
  created_at: string
  updated_at: string | null
  last_login: string | null
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  full_name?: string
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface AuthState {
  user: User | null
  tokens: AuthTokens | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (fullName: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  setUser: (user: User) => void
}
