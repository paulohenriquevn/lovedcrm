/**
 * Tipos para organizações.
 */

export interface Organization {
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
  updated_at: string
  members?: OrganizationMember[]
  subscription?: {
    id: string
    status: string
    plan_name: string
    [key: string]: unknown
  }
}

export interface OrganizationCreate {
  name: string
  slug: string
  description?: string
}

export interface OrganizationUpdate {
  name?: string
  description?: string
  website?: string
  logo_url?: string
  max_members?: string
}

export enum OrganizationRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
}

export interface OrganizationMember {
  id: string
  user_id: string
  organization_id: string
  role: OrganizationRole
  is_active: boolean
  invited_email?: string
  invitation_token?: string
  invited_at?: string
  joined_at?: string
  created_at: string
  updated_at?: string
  user?: {
    id: string
    email: string
    full_name: string | null
    avatar_url: string | null
    is_active: boolean
    created_at: string
    last_login: string | null
  }
}

export interface OrganizationMemberCreate {
  email: string
  role: OrganizationRole
}

// Organization Invite Types
export enum InviteStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

export interface OrganizationInvite {
  id: string
  organization_id: string
  email: string
  role: OrganizationRole
  status: InviteStatus
  message?: string
  invited_name?: string
  created_at: string
  expires_at: string
  responded_at?: string
  is_active: boolean

  // Computed properties
  is_expired: boolean
  is_pending: boolean
  can_be_accepted: boolean
  can_be_cancelled: boolean

  // Organization and inviter info
  organization_name?: string
  invited_by_name?: string
}

export interface OrganizationInviteCreate {
  email: string
  role: OrganizationRole
  message?: string
  invited_name?: string
}

export interface OrganizationInviteStats {
  total_invites: number
  pending_invites: number
  accepted_invites: number
  rejected_invites: number
  expired_invites: number
  cancelled_invites: number
}
