import { Building, User, Calendar, AlertTriangle } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface PublicInviteInfo {
  organization_name: string
  organization_slug: string
  invited_by_name: string
  role: string
  created_at: string
  expires_at: string
  is_expired: boolean
  message?: string
  invited_email: string
}

interface InviteInfoProps {
  inviteInfo: PublicInviteInfo
  formatDate: (dateString: string) => string
  formatRole: (role: string) => string
}

export function InviteInfo({ inviteInfo, formatDate, formatRole }: InviteInfoProps): JSX.Element {
  if (inviteInfo.is_expired) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Convite Expirado</h1>
            <p className="text-gray-600 mb-4">
              Este convite para {inviteInfo.organization_name} expirou em{' '}
              {formatDate(inviteInfo.expires_at)}
            </p>
            <p className="text-sm text-gray-500">
              Entre em contato com {inviteInfo.invited_by_name} para solicitar um novo convite.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="w-5 h-5" />
          Convite para {inviteInfo.organization_name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium">Convidado por</p>
              <p className="text-sm text-gray-600">{inviteInfo.invited_by_name}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Building className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium">Função</p>
              <p className="text-sm text-gray-600">{formatRole(inviteInfo.role)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium">Válido até</p>
              <p className="text-sm text-gray-600">{formatDate(inviteInfo.expires_at)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium">Email convidado</p>
              <p className="text-sm text-gray-600">{inviteInfo.invited_email}</p>
            </div>
          </div>
        </div>

        {inviteInfo.message !== null &&
          inviteInfo.message !== undefined &&
          inviteInfo.message.length > 0 && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium mb-1">Mensagem:</p>
              <p className="text-sm text-gray-600">{inviteInfo.message}</p>
            </div>
          )}
      </CardContent>
    </Card>
  )
}
