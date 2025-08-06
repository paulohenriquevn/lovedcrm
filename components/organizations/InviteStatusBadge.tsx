import { AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { InviteStatus } from '@/types/organization'

interface StatusBadgeProps {
  status: InviteStatus
}

interface StatusConfig {
  icon: React.ComponentType<{ className?: string }>
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
  label: string
}

const STATUS_CONFIGS: Record<InviteStatus, StatusConfig> = {
  [InviteStatus.PENDING]: {
    icon: Clock,
    variant: 'secondary',
    label: 'Pendente',
  },
  [InviteStatus.ACCEPTED]: {
    icon: CheckCircle,
    variant: 'default',
    label: 'Aceito',
  },
  [InviteStatus.REJECTED]: {
    icon: XCircle,
    variant: 'destructive',
    label: 'Rejeitado',
  },
  [InviteStatus.EXPIRED]: {
    icon: AlertCircle,
    variant: 'outline',
    label: 'Expirado',
  },
  [InviteStatus.CANCELLED]: {
    icon: XCircle,
    variant: 'outline',
    label: 'Cancelado',
  },
}

export function InviteStatusBadge({ status }: StatusBadgeProps): JSX.Element {
  const config = STATUS_CONFIGS[status]
  const Icon = config.icon

  return (
    <Badge variant={config.variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  )
}
