import { Mail } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { InputField } from './FormFields'

import type { User as UserType } from '@/types/user'

// Account info section
export function AccountInfoSection({ user }: { user: UserType }): JSX.Element {
  return (
    <Card className="w-full mb-6">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center">
          <Mail className="h-4 w-4 mr-2" />
          Informações da conta
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <InputField
            label="ID da conta"
            value={user.id}
            disabled
            note="Identificador único da sua conta"
          />

          <InputField
            label="Data de criação"
            value={user.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : 'N/A'}
            disabled
          />

          <InputField
            label="Status da conta"
            value={String(user.status) === 'active' ? 'Ativa' : 'Inativa'}
            disabled
          />
        </div>
      </CardContent>
    </Card>
  )
}
