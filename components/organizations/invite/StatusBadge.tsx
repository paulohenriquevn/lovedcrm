import { AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { InviteStatus } from '@/types/organization'

interface StatusBadgeProps {
  status: InviteStatus
}

export function StatusBadge({ status }: StatusBadgeProps): JSX.Element {
  const configs = {
    [InviteStatus.PENDING]: { icon: Clock, variant: 'secondary' as const, label: 'Pendente' },
    [InviteStatus.ACCEPTED]: { icon: CheckCircle, variant: 'default' as const, label: 'Aceito' },
    [InviteStatus.REJECTED]: { icon: XCircle, variant: 'destructive' as const, label: 'Rejeitado' },
    [InviteStatus.EXPIRED]: { icon: AlertCircle, variant: 'outline' as const, label: 'Expirado' },
    [InviteStatus.CANCELLED]: { icon: XCircle, variant: 'outline' as const, label: 'Cancelado' },
  }

  const config = configs[status]
  const Icon = config.icon

  return (
    <Badge variant={config.variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  )
}
