'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { InviteUserView } from '@/components/users/InviteUserView'
import { membersService } from '@/services/members'
import { useAuthStore } from '@/stores/auth'
import { useOrganizationsStore } from '@/stores/organizations'

import type {
  Organization,
  OrganizationMember,
  OrganizationMemberCreate,
} from '@/types/organization'
import type { User } from '@/types/user'

interface InviteUserContainerProps {
  organizationId?: string
}

export function InviteUserContainer({ organizationId }: InviteUserContainerProps) {
  const router = useRouter()
  const { user } = useAuthStore()
  const { currentOrganization, addMember } = useOrganizationsStore()
  const [isInviting, setIsInviting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [invitedEmails, setInvitedEmails] = useState<string[]>([])

  const orgId = organizationId ?? currentOrganization?.id

  const handleInviteUser = useInviteUserHandler({
    orgId,
    setErrors,
    setIsInviting,
    invitedEmails,
    setInvitedEmails,
    addMember,
  })

  const handleCancel = useHandleCancel(organizationId, router)

  return useRenderInviteContainer({
    user,
    router,
    orgId,
    currentOrganization,
    isInviting,
    errors,
    handleInviteUser,
    handleCancel,
  })
}

// Custom hooks
function useInviteUserHandler(params: {
  orgId: string | undefined
  setErrors: (errors: Record<string, string>) => void
  setIsInviting: (loading: boolean) => void
  invitedEmails: string[]
  setInvitedEmails: (emails: string[]) => void
  addMember: (member: OrganizationMember) => void
}) {
  const { orgId, setErrors, setIsInviting, invitedEmails, setInvitedEmails, addMember } = params

  return async (data: OrganizationMemberCreate) => {
    if (orgId === null || orgId === undefined || orgId.length === 0) {
      // toast({ title: "Erro", description: 'Nenhuma organização selecionada', variant: "destructive" })
      return false
    }

    setErrors({})
    setIsInviting(true)

    try {
      return await processInviteUser(data, orgId, {
        invitedEmails,
        setInvitedEmails,
        setErrors,
        addMember,
      })
    } catch (error) {
      return handleInviteError(error, setErrors)
    } finally {
      setIsInviting(false)
    }
  }
}

function useHandleCancel(
  organizationId: string | undefined,
  router: { push: (path: string) => void }
) {
  return () => {
    const basePath =
      organizationId !== null && organizationId !== undefined && organizationId.length > 0
        ? `/admin/organizations/${organizationId}/members`
        : '/admin'
    router.push(basePath)
  }
}

function useRenderInviteContainer(params: {
  user: User | null
  router: { push: (path: string) => void }
  orgId: string | undefined
  currentOrganization: Organization | null
  isInviting: boolean
  errors: Record<string, string>
  handleInviteUser: (data: OrganizationMemberCreate) => Promise<boolean>
  handleCancel: () => void
}) {
  const { user, router, orgId, currentOrganization } = params

  const validationResult = useInviteValidation({ user, router, orgId, currentOrganization })
  if (validationResult) {
    return validationResult
  }

  return <InviteUserForm {...params} />
}

interface InviteValidationProps {
  user: User | null
  router: { push: (path: string) => void }
  orgId: string | undefined
  currentOrganization: Organization | null
}

function useInviteValidation(props: InviteValidationProps) {
  const { user, router, orgId, currentOrganization } = props
  if (!user) {
    router.push('/auth/login')
    return null
  }

  if (orgId === null || orgId === undefined || orgId.length === 0) {
    return renderNoOrganizationMessage()
  }

  const currentMember = currentOrganization?.members?.find(
    (m: OrganizationMember) => m.user_id === user.id
  )
  const canInvite = Boolean(currentMember && ['owner', 'admin'].includes(currentMember.role))

  if (!canInvite) {
    return renderNoPermissionMessage()
  }

  return null
}

function InviteUserForm({
  isInviting,
  errors,
  handleInviteUser,
  handleCancel,
}: {
  isInviting: boolean
  errors: Record<string, string>
  handleInviteUser: (data: OrganizationMemberCreate) => Promise<boolean>
  handleCancel: () => void
}) {
  return (
    <InviteUserView
      isInviting={isInviting}
      error={Object.values(errors)[0] ?? ''}
      onInviteUser={data => {
        void handleInviteUser(data)
      }}
      onCancel={handleCancel}
    />
  )
}

// Helper functions
async function processInviteUser(
  data: OrganizationMemberCreate,
  orgId: string,
  inviteContext: {
    invitedEmails: string[]
    setInvitedEmails: (emails: string[]) => void
    setErrors: (errors: Record<string, string>) => void
    addMember: (member: OrganizationMember) => void
  }
): Promise<boolean> {
  // Validações FAIL-FAST
  const validationErrors = validateInviteData(data)
  if (Object.keys(validationErrors).length > 0) {
    inviteContext.setErrors(validationErrors)
    return false
  }

  const { invitedEmails, setInvitedEmails, setErrors, addMember } = inviteContext

  // Verificar se já foi convidado nesta sessão
  if (invitedEmails.includes(data.email.toLowerCase())) {
    setErrors({ email: 'Este email já foi convidado' })
    return false
  }

  // Enviar convite
  const result = await membersService.inviteMember(data)
  // Create a member object from invite result
  // Database/API model with snake_case properties - ESLint camelcase disabled
  /* eslint-disable camelcase */
  const newMember: OrganizationMember = {
    id: result.invite_id,
    user_id: '',
    organization_id: orgId,
    role: data.role,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_active: false, // Pending invite
    user: {
      id: '',
      email: data.email,
      full_name: data.email,
      avatar_url: null,
      is_active: false,
      created_at: new Date().toISOString(),
      last_login: null,
    },
  }
  /* eslint-enable camelcase */

  // Atualizar store
  addMember(newMember)

  // Adicionar à lista de convidados
  setInvitedEmails([...invitedEmails, data.email.toLowerCase()])

  // toast({ title: "Sucesso", description: `Convite enviado para ${data.email}` })
  return true
}

function handleInviteError(
  error: unknown,
  setErrors: (errors: Record<string, string>) => void
): boolean {
  const message = error instanceof Error ? error.message : 'Erro ao enviar convite'

  // Verificar erros específicos
  if (message.includes('já é membro')) {
    setErrors({ email: 'Este usuário já é membro da organização' })
  } else if (message.includes('limite')) {
    // toast({ title: "Erro", description: 'Limite de membros atingido. Atualize seu plano.', variant: "destructive" })
  } else {
    // toast({ title: "Erro", description: message, variant: "destructive" })
  }

  // Mapear erros de validação do backend
  if (error instanceof Error && 'errors' in error) {
    const backendError = error as Error & { errors: Record<string, string> }
    setErrors(backendError.errors)
  }

  return false
}

// Helper components
function renderNoOrganizationMessage() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <p>Nenhuma organização selecionada</p>
    </div>
  )
}

function renderNoPermissionMessage() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <p>Você não tem permissão para convidar membros</p>
    </div>
  )
}

// Função de validação
function validateInviteData(data: OrganizationMemberCreate): Record<string, string> {
  const errors: Record<string, string> = {}

  // Email é obrigatório e válido
  if (!data.email?.trim()) {
    errors.email = 'Email é obrigatório'
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Email inválido'
  }

  // Role deve ser válido
  if (data.role === null || data.role === undefined || !['member', 'admin'].includes(data.role)) {
    errors.role = 'Função inválida'
  }

  return errors
}

// Validação de email
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
