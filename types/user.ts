/**
 * Tipos para usuários.
 */

export interface User {
  id: string
  email: string
  full_name?: string | undefined
  phone?: string | undefined
  avatar_url?: string | undefined
  status: UserStatus
  is_email_verified: boolean
  timezone?: string | undefined
  language?: string | undefined
  created_at: string
  updated_at?: string | undefined
}

export interface UserResponse extends User {
  organization_memberships?: Array<{
    id: string
    organization_id: string
    role: string
    organization?: Pick<import('./organization').Organization, 'id' | 'name' | 'slug'>
  }>
}

export interface UserCreate {
  email: string
  password: string
  full_name?: string
}

export interface UserUpdate {
  full_name?: string | undefined
  phone?: string | undefined
  avatar_url?: string | undefined
  timezone?: string | undefined
  language?: string | undefined
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  notifications_email: boolean
  notifications_push: boolean
  notifications_sms: boolean
  marketing_emails: boolean
  language: string
  timezone: string
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}
