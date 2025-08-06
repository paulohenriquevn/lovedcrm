import type { OrganizationRole } from './organization'

/**
 * Frontend form data interface using camelCase
 */
export interface InviteFormData {
  email: string
  role: OrganizationRole
  message?: string
  invitedName?: string
}

/**
 * Default form values
 */
export const DEFAULT_INVITE_FORM_DATA: InviteFormData = {
  email: '',
  role: 'member' as OrganizationRole,
  message: '',
  invitedName: '',
}
