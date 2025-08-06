/**
 * Service para gerenciamento de configurações.
 */
import { BaseService } from './base'

import type { UserUpdate, UserResponse, UserPreferences } from '@/types/user'

class SettingsService extends BaseService {
  /**
   * Obtém preferências do usuário.
   */
  async getUserPreferences(): Promise<UserPreferences> {
    return this.get<UserPreferences>('/api/users/me')
  }

  /**
   * Atualiza preferências do usuário.
   */
  async updateUserPreferences(preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    return this.put<UserPreferences>('/api/users/me', preferences)
  }

  /**
   * Atualiza perfil do usuário.
   */
  async updateProfile(data: UserUpdate): Promise<UserResponse> {
    return this.put<UserResponse>('/api/users/me', data)
  }

  /**
   * Atualiza senha do usuário.
   */
  async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
    return this.put('/api/users/me/password', {
      current_password: currentPassword,
      new_password: newPassword,
      confirm_password: newPassword,
    })
  }

  /**
   * Habilita autenticação de dois fatores.
   */
  async enable2FA(): Promise<{ qr_code: string; secret: string }> {
    return this.post('/api/users/me/2fa/enable')
  }

  /**
   * Confirma autenticação de dois fatores.
   */
  async confirm2FA(code: string): Promise<void> {
    return this.post('/api/users/me/2fa/confirm', { code })
  }

  /**
   * Desabilita autenticação de dois fatores.
   */
  async disable2FA(code: string): Promise<void> {
    return this.post('/api/users/me/2fa/disable', { code })
  }

  /**
   * Lista sessões ativas do usuário.
   */
  async getActiveSessions(): Promise<
    Array<{
      id: string
      device: string
      ip: string
      location: string
      last_active: string
      current: boolean
    }>
  > {
    return this.get('/api/users/me/sessions')
  }

  /**
   * Revoga uma sessão específica.
   */
  async revokeSession(sessionId: string): Promise<void> {
    return this.delete(`/api/users/me/sessions/${sessionId}`)
  }

  /**
   * Revoga todas as sessões exceto a atual.
   */
  async revokeAllSessions(): Promise<void> {
    return this.post('/api/users/me/sessions/revoke-all')
  }
}

export const settingsService = new SettingsService()
