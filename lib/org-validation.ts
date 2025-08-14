/**
 * Utilities para valida��o organizacional em sistema multi-tenant.
 * Fornece fun��es para validar acesso, roles e contexto organizacional.
 */

import type { Organization } from '@/types/organization'
import type { User } from '@/types/user'

// Tipos de roles organizacionais
export type OrgRole = 'owner' | 'admin' | 'member'

// Hierarquia de roles (do mais alto para o mais baixo)
export const ROLE_HIERARCHY: Record<OrgRole, number> = {
  owner: 3,
  admin: 2,
  member: 1,
}

// Constants
const INSUFFICIENT_ROLE_ERROR = 'insufficient-role' as const

// Mensagens de erro padronizadas
export const ORG_ERROR_MESSAGES = {
  'missing-org-context': 'Organization context is missing. Please refresh the page.',
  'org-access-denied': 'You do not have access to this organization.',
  'org-not-found': 'Organization not found or has been deactivated.',
  'org-mismatch': 'Organization mismatch. Expected one organization but got another.',
  [INSUFFICIENT_ROLE_ERROR]: 'You do not have sufficient permissions for this action.',
  'invalid-org-id': 'Invalid organization ID format.',
  'org-inactive': 'This organization is currently inactive.',
} as const

export type OrgErrorType = keyof typeof ORG_ERROR_MESSAGES

/**
 * Valida se orgId � um UUID v�lido
 */
export function isValidOrgId(orgId: string | null | undefined): boolean {
  if (orgId === null || orgId === undefined || orgId === '') {
    return false
  }

  // UUID v4 regex pattern
  const uuidRegex = /^[\da-f]{8}-[\da-f]{4}-[1-5][\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i
  return uuidRegex.test(orgId)
}

/**
 * Valida se usu�rio tem acesso � organiza��o especificada
 */
export function validateOrgAccess(
  userOrg: string | null | undefined,
  requiredOrg?: string | null | undefined
): boolean {
  // Se n�o especificou org requerida, apenas verificar se tem alguma org
  if (requiredOrg === null || requiredOrg === undefined || requiredOrg === '') {
    return validateUserOrgOnly(userOrg)
  }

  return validateUserAndRequiredOrg(userOrg, requiredOrg)
}

/**
 * Helper para validar apenas org do usuário
 */
function validateUserOrgOnly(userOrg: string | null | undefined): boolean {
  return userOrg !== null && userOrg !== undefined && userOrg !== '' && isValidOrgId(userOrg)
}

/**
 * Helper para validar org do usuário contra org requerida
 */
function validateUserAndRequiredOrg(
  userOrg: string | null | undefined,
  requiredOrg: string
): boolean {
  // Verificar se user org é válida
  if (!isValidUserOrg(userOrg)) {
    return false
  }

  // Verificar se são UUIDs válidos e iguais
  return validateOrgMatch(userOrg as string, requiredOrg)
}

/**
 * Helper para validar se user org é válida
 */
function isValidUserOrg(userOrg: string | null | undefined): boolean {
  return userOrg !== null && userOrg !== undefined && userOrg !== ''
}

/**
 * Helper para validar se orgs são UUIDs válidos e iguais
 */
function validateOrgMatch(userOrg: string, requiredOrg: string): boolean {
  // Verificar se são UUIDs válidos
  if (!isValidOrgId(userOrg) || !isValidOrgId(requiredOrg)) {
    return false
  }

  // Verificar se são iguais
  return userOrg === requiredOrg
}

/**
 * Requer acesso � organiza��o (throw error se n�o tiver)
 */
export function requireOrgAccess(
  userOrg: string | null | undefined,
  requiredOrg?: string | null | undefined
): void {
  if (!validateOrgAccess(userOrg, requiredOrg)) {
    const errorType: OrgErrorType =
      requiredOrg !== null && requiredOrg !== undefined && requiredOrg !== ''
        ? 'org-mismatch'
        : 'missing-org-context'
    throw new OrgValidationError(errorType, {
      userOrg,
      requiredOrg,
    })
  }
}

/**
 * Valida se organiza��o est� ativa
 */
export function validateOrgStatus(organization: Organization | null): boolean {
  return organization?.is_active === true
}

/**
 * Requer que organiza��o esteja ativa
 */
export function requireActiveOrg(organization: Organization | null): void {
  if (!organization) {
    throw new OrgValidationError('org-not-found')
  }

  if (!validateOrgStatus(organization)) {
    throw new OrgValidationError('org-inactive', { organization })
  }
}

/**
 * Valida se usu�rio tem role espec�fica ou superior
 */
export function validateRole(userRole: OrgRole, requiredRole: OrgRole): boolean {
  const userLevel = ROLE_HIERARCHY[userRole] || 0
  const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0

  return userLevel >= requiredLevel
}

/**
 * Requer role espec�fica ou superior
 */
export function requireRole(userRole: OrgRole, requiredRole: OrgRole): void {
  if (!validateRole(userRole, requiredRole)) {
    throw new OrgValidationError(INSUFFICIENT_ROLE_ERROR, {
      userRole,
      requiredRole,
    })
  }
}

/**
 * Valida se usu�rio � owner da organiza��o
 */
export function validateOwnership(user: User | null, organization: Organization | null): boolean {
  if (user === null || organization === null) {
    return false
  }
  return organization.owner_id === user.id
}

/**
 * Requer que usu�rio seja owner da organiza��o
 */
export function requireOwnership(user: User | null, organization: Organization | null): void {
  if (!validateOwnership(user, organization)) {
    throw new OrgValidationError(INSUFFICIENT_ROLE_ERROR, {
      userRole: 'unknown',
      requiredRole: 'owner',
    })
  }
}

/**
 * Valida m�ltiplas condi��es organizacionais
 */
export function validateOrgContext(params: {
  userOrg?: string | null
  requiredOrg?: string | null
  organization?: Organization | null
  user?: User | null
  requiredRole?: OrgRole
  requireActive?: boolean
  requireOwnership?: boolean
}): { valid: boolean; errors: OrgErrorType[] } {
  const errors: OrgErrorType[] = []

  // Validar acesso � organiza��o
  const orgAccessErrors = validateOrgAccessErrors(params.userOrg, params.requiredOrg)
  if (orgAccessErrors !== null) {
    errors.push(orgAccessErrors)
  }

  // Validar se organiza��o est� ativa
  const statusErrors = validateOrgStatusErrors(params.requireActive, params.organization)
  if (statusErrors !== null) {
    errors.push(statusErrors)
  }

  // Validar ownership
  const ownershipErrors = validateOwnershipErrors(
    params.requireOwnership,
    params.user,
    params.organization
  )
  if (ownershipErrors !== null) {
    errors.push(ownershipErrors)
  }

  // Validar role (se especificada)
  const roleErrors = validateRoleErrors(params.requiredRole, params.user, params.organization)
  if (roleErrors !== null) {
    errors.push(roleErrors)
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Helper para validar acesso organizacional
 */
function validateOrgAccessErrors(
  userOrg?: string | null,
  requiredOrg?: string | null
): OrgErrorType | null {
  if (!validateOrgAccess(userOrg, requiredOrg)) {
    return requiredOrg !== null && requiredOrg !== undefined && requiredOrg !== ''
      ? 'org-mismatch'
      : 'missing-org-context'
  }
  return null
}

/**
 * Helper para validar status organizacional
 */
function validateOrgStatusErrors(
  requireActive?: boolean,
  organization?: Organization | null
): OrgErrorType | null {
  if (requireActive !== true) {
    return null
  }

  if (!validateOrgStatus(organization ?? null)) {
    return getOrgStatusErrorType(organization)
  }

  return null
}

/**
 * Helper para determinar tipo de erro de status organizacional
 */
function getOrgStatusErrorType(organization?: Organization | null): OrgErrorType {
  return organization !== null && organization !== undefined ? 'org-inactive' : 'org-not-found'
}

/**
 * Helper para validar ownership
 */
function validateOwnershipErrors(
  requireOwnership?: boolean,
  user?: User | null,
  organization?: Organization | null
): OrgErrorType | null {
  if (requireOwnership === true && !validateOwnership(user ?? null, organization ?? null)) {
    return INSUFFICIENT_ROLE_ERROR
  }
  return null
}

/**
 * Helper para validar role
 */
function validateRoleErrors(
  requiredRole?: OrgRole,
  user?: User | null,
  organization?: Organization | null
): OrgErrorType | null {
  if (!hasRoleValidationParams(requiredRole, user, organization)) {
    return null
  }

  return checkRolePermissions(requiredRole!, user as User, organization as Organization)
}

/**
 * Helper para verificar se tem parâmetros necessários para validação de role
 */
function hasRoleValidationParams(
  requiredRole?: OrgRole,
  user?: User | null,
  organization?: Organization | null
): boolean {
  return Boolean(requiredRole && user && organization)
}

/**
 * Helper para verificar permissões de role
 */
function checkRolePermissions(
  requiredRole: OrgRole,
  user: User,
  organization: Organization
): OrgErrorType | null {
  // Role management implementado via RBAC system
  // Por enquanto, owner tem todas as permiss�es
  const isOwner = validateOwnership(user, organization)
  if (!isOwner && requiredRole !== 'member') {
    return INSUFFICIENT_ROLE_ERROR
  }
  return null
}

/**
 * Classe de erro espec�fica para valida��es organizacionais
 */
export class OrgValidationError extends Error {
  public readonly type: OrgErrorType
  public readonly context?: Record<string, unknown>

  constructor(type: OrgErrorType, context?: Record<string, unknown>) {
    const message = ORG_ERROR_MESSAGES[type] || 'Unknown organization validation error'
    super(message)

    this.name = 'OrgValidationError'
    this.type = type
    this.context = context
  }
}

/**
 * Type guard para OrgValidationError
 */
export function isOrgValidationError(error: unknown): error is OrgValidationError {
  return error instanceof OrgValidationError
}

/**
 * Utility para extrair mensagem de erro user-friendly
 */
export function getOrgErrorMessage(error: unknown): string {
  if (isOrgValidationError(error)) {
    return error.message
  }

  if (
    error instanceof Error &&
    (error.message.includes('organization') || error.message.includes('org'))
  ) {
    return error.message
  }

  return 'An organization-related error occurred'
}

/**
 * Hook-friendly utility para valida��o organizacional
 */
export function createOrgValidator(params: {
  userOrg?: string | null
  organization?: Organization | null
  user?: User | null
}): {
  validateAccess: (requiredOrg?: string) => boolean
  requireAccess: (requiredOrg?: string) => void
  validateRole: (requiredRole: OrgRole) => boolean
  requireRole: (requiredRole: OrgRole) => void
  validateStatus: () => boolean
  requireActiveOrg: () => void
  isOwner: () => boolean
  isValid: () => boolean
} {
  return {
    validateAccess: (requiredOrg?: string) => validateOrgAccess(params.userOrg, requiredOrg),

    requireAccess: (requiredOrg?: string) => requireOrgAccess(params.userOrg, requiredOrg),

    validateRole: (requiredRole: OrgRole) => {
      const isOwner = validateOwnership(params.user ?? null, params.organization ?? null)
      return isOwner || requiredRole === 'member'
    },

    requireRole: function (
      this: ReturnType<typeof createOrgValidator>,
      requiredRole: OrgRole
    ): void {
      if (!this.validateRole(requiredRole)) {
        throw new OrgValidationError(INSUFFICIENT_ROLE_ERROR, { requiredRole })
      }
    },

    validateStatus: () => validateOrgStatus(params.organization ?? null),

    requireActiveOrg: () => requireActiveOrg(params.organization ?? null),

    isOwner: () => validateOwnership(params.user ?? null, params.organization ?? null),

    isValid: () => {
      const validation = validateOrgContext(params)
      return validation.valid
    },
  }
}
