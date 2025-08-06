/**
 * User service for user management operations
 */

import { BaseService } from './base'
import type { User, UserUpdate, UserResponse } from '@/types/user'

class UserService extends BaseService {
  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<UserResponse> {
    return this.get<UserResponse>('/api/users/me')
  }

  /**
   * Update current user profile
   */
  async updateProfile(data: UserUpdate): Promise<User> {
    return this.put<User>('/api/users/me', data)
  }

  /**
   * Get user by ID (admin only)
   */
  async getUserById(userId: string): Promise<UserResponse> {
    return this.get<UserResponse>(`/api/users/${userId}`)
  }

  /**
   * Update user by ID (admin only)
   */
  async updateUser(userId: string, data: UserUpdate): Promise<User> {
    return this.put<User>(`/api/users/${userId}`, data)
  }

  /**
   * Delete user account
   */
  async deleteAccount(): Promise<void> {
    return this.delete<void>('/api/users/me')
  }

  /**
   * Change password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    return this.put<void>('/api/users/me/password', {
      current_password: currentPassword,
      new_password: newPassword,
    })
  }

  /**
   * Upload avatar
   */
  async uploadAvatar(file: File): Promise<{ avatar_url: string }> {
    const formData = new FormData()
    formData.append('file', file)

    return this.post<{ avatar_url: string }>('/api/users/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  }

  /**
   * Delete avatar
   */
  async deleteAvatar(): Promise<void> {
    return this.delete<void>('/api/users/me/avatar')
  }
}

export const userService = new UserService()
export const usersService = userService // Alias for backward compatibility

// Backward compatibility type
export interface BackendUser extends User {}
