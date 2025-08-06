import { Mail, Plus, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useInviteForm } from '@/hooks/use-invite-form'

import { InviteFormFields } from './InviteFormFields'

import type { OrganizationInviteCreate, OrganizationRole } from '@/types/organization'

interface InviteFormProps {
  onSubmit: (data: OrganizationInviteCreate) => void
  isSubmitting: boolean
  userRole: OrganizationRole | string
}

export function InviteForm({ onSubmit, isSubmitting, userRole }: InviteFormProps): JSX.Element {
  const { formData, errors, isOpen, setIsOpen, handleSubmit, updateField, canInviteAdmins } =
    useInviteForm({
      onSubmit,
      userRole,
      isSubmitting,
    })

  if (!isOpen) {
    return (
      <Button type="button" onClick={() => setIsOpen(true)} disabled={isSubmitting}>
        <Plus className="h-4 w-4 mr-2" />
        Convidar Membro
      </Button>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Novo Convite</CardTitle>
          <Button type="button" onClick={() => setIsOpen(false)} variant="ghost" size="sm">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <InviteFormFields
            formData={formData}
            errors={errors}
            canInviteAdmins={canInviteAdmins}
            isSubmitting={isSubmitting}
            updateField={updateField}
          />

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Mail className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Enviando...' : 'Enviar Convite'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
