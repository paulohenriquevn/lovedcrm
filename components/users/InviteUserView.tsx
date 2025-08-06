import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { OrganizationMemberCreate, OrganizationRole } from '@/types/organization'

interface InviteUserViewProps {
  isInviting: boolean
  error?: string
  onInviteUser: (data: OrganizationMemberCreate) => void
  onCancel: () => void
}

// Error message component
function ErrorMessage({ error }: { error?: string }): JSX.Element | null {
  if (error === null || error === undefined || error === '') {
    return null
  }

  return (
    <div className="rounded-md border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950">
      <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
    </div>
  )
}

// Email input field component
function EmailField({
  value,
  onChange,
  disabled,
}: {
  value: string
  onChange: (email: string) => void
  disabled: boolean
}): JSX.Element {
  return (
    <div className="space-y-2">
      <Label htmlFor="invite-email">Email *</Label>
      <Input
        id="invite-email"
        type="email"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="usuario@exemplo.com"
        required
        disabled={disabled}
      />
    </div>
  )
}

// Role selection field component
function RoleField({
  value,
  onChange,
  disabled,
}: {
  value: OrganizationRole
  onChange: (role: OrganizationRole) => void
  disabled: boolean
}): JSX.Element {
  return (
    <div className="space-y-2">
      <Label htmlFor="invite-role">Função</Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={OrganizationRole.MEMBER}>Membro</SelectItem>
          <SelectItem value={OrganizationRole.ADMIN}>Administrador</SelectItem>
        </SelectContent>
      </Select>
      <p className="text-sm text-muted-foreground">
        Administradores podem gerenciar usuários e configurações da organização.
      </p>
    </div>
  )
}

// Form action buttons component
function FormActions({
  onCancel,
  isInviting,
}: {
  onCancel: () => void
  isInviting: boolean
}): JSX.Element {
  return (
    <div className="flex justify-end space-x-2">
      <Button variant="outline" type="button" onClick={onCancel} disabled={isInviting}>
        Cancelar
      </Button>
      <Button type="submit" disabled={isInviting}>
        {isInviting ? 'Enviando convite...' : 'Enviar Convite'}
      </Button>
    </div>
  )
}

// Invitation info component
function InvitationInfo(): JSX.Element {
  return (
    <div className="mt-6 pt-6 border-t">
      <h3 className="text-sm font-medium mb-2">Sobre os convites</h3>
      <ul className="text-sm text-muted-foreground space-y-1">
        <li>• O usuário receberá um email com instruções para aceitar o convite</li>
        <li>• O convite expira em 7 dias</li>
        <li>• O usuário precisa criar uma conta se ainda não tiver uma</li>
        <li>• Você pode reenviar ou cancelar convites pendentes</li>
      </ul>
    </div>
  )
}

export function InviteUserView({
  isInviting,
  error,
  onInviteUser,
  onCancel,
}: InviteUserViewProps): JSX.Element {
  const [formData, setFormData] = useState<OrganizationMemberCreate>({
    email: '',
    role: OrganizationRole.MEMBER,
  })

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    onInviteUser(formData)
  }

  const updateEmail = (email: string): void => {
    setFormData({ ...formData, email })
  }

  const updateRole = (role: OrganizationRole): void => {
    setFormData({ ...formData, role })
  }

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Convidar Novo Usuário</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ErrorMessage error={error} />

          <form onSubmit={handleSubmit} className="space-y-4">
            <EmailField value={formData.email} onChange={updateEmail} disabled={isInviting} />
            <RoleField value={formData.role} onChange={updateRole} disabled={isInviting} />
            <FormActions onCancel={onCancel} isInviting={isInviting} />
          </form>

          <InvitationInfo />
        </CardContent>
      </Card>
    </div>
  )
}
