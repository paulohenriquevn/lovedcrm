import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

import type { OrganizationInviteCreate, OrganizationRole } from '@/types/organization'

interface FormErrors {
  email?: string
  message?: string
  role?: string
}

interface InviteFormFieldsProps {
  formData: OrganizationInviteCreate
  errors: FormErrors
  canInviteAdmins: boolean
  isSubmitting: boolean
  updateField: <K extends keyof OrganizationInviteCreate>(
    field: K,
    value: OrganizationInviteCreate[K]
  ) => void
}

function EmailField({
  formData,
  errors,
  isSubmitting,
  updateField,
}: Pick<
  InviteFormFieldsProps,
  'formData' | 'errors' | 'isSubmitting' | 'updateField'
>): JSX.Element {
  return (
    <div className="space-y-2">
      <Label htmlFor="email" className="text-sm font-medium">
        Email *
      </Label>
      <Input
        id="email"
        type="email"
        value={formData.email}
        onChange={e => updateField('email', e.target.value)}
        placeholder="usuario@exemplo.com"
        disabled={isSubmitting}
      />
      {Boolean(errors.email) && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
    </div>
  )
}

function RoleField({
  formData,
  errors,
  canInviteAdmins,
  isSubmitting,
  updateField,
}: Pick<
  InviteFormFieldsProps,
  'formData' | 'errors' | 'canInviteAdmins' | 'isSubmitting' | 'updateField'
>): JSX.Element {
  return (
    <div className="space-y-2">
      <Label htmlFor="role" className="text-sm font-medium">
        Função *
      </Label>
      <Select
        value={formData.role}
        onValueChange={value => updateField('role', value as OrganizationRole)}
        disabled={isSubmitting}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={'member' as OrganizationRole}>Membro</SelectItem>
          {Boolean(canInviteAdmins) && (
            <SelectItem value={'admin' as OrganizationRole}>Admin</SelectItem>
          )}
        </SelectContent>
      </Select>
      {Boolean(errors.role) && <p className="text-sm text-red-600 mt-1">{errors.role}</p>}
    </div>
  )
}

export function InviteFormFields({
  formData,
  errors,
  canInviteAdmins,
  isSubmitting,
  updateField,
}: InviteFormFieldsProps): JSX.Element {
  return (
    <>
      <EmailField
        formData={formData}
        errors={errors}
        isSubmitting={isSubmitting}
        updateField={updateField}
      />

      <div className="space-y-2">
        <Label htmlFor="invited_name" className="text-sm font-medium">
          Nome (opcional)
        </Label>
        <Input
          id="invited_name"
          type="text"
          value={formData.invited_name ?? ''}
          onChange={e => updateField('invited_name', e.target.value)}
          placeholder="Nome da pessoa"
          disabled={isSubmitting}
        />
      </div>

      <RoleField
        formData={formData}
        errors={errors}
        canInviteAdmins={canInviteAdmins}
        isSubmitting={isSubmitting}
        updateField={updateField}
      />

      <div className="space-y-2">
        <Label htmlFor="message" className="text-sm font-medium">
          Mensagem personalizada (opcional)
        </Label>
        <Textarea
          id="message"
          value={formData.message ?? ''}
          onChange={e => updateField('message', e.target.value)}
          rows={3}
          placeholder="Mensagem de boas-vindas personalizada..."
          disabled={isSubmitting}
        />
        {Boolean(errors.message) && <p className="text-sm text-red-600 mt-1">{errors.message}</p>}
      </div>
    </>
  )
}
