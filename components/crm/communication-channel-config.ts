/**
 * Communication Channel Configuration
 * Constants and configuration for different communication channels
 */

import { 
  MessageCircle,
  Mail,
  Phone,
  FileText,
  Clock,
  CheckCheck,
  AlertCircle
} from "lucide-react"

export type CommunicationChannel = 'whatsapp' | 'email' | 'voip' | 'note'
export type MessageDirection = 'inbound' | 'outbound'
export type MessageStatus = 'sent' | 'delivered' | 'read' | 'failed'

export const channelConfig = {
  whatsapp: {
    icon: MessageCircle,
    styles: "bg-green-50 text-green-700 border-green-200",
    color: 'hsl(142, 76%, 36%)'
  },
  email: {
    icon: Mail,
    styles: "bg-blue-50 text-blue-700 border-blue-200",
    color: 'hsl(217, 91%, 60%)'
  },
  voip: {
    icon: Phone,
    styles: "bg-violet-50 text-violet-700 border-violet-200",
    color: 'hsl(262, 83%, 58%)'
  },
  note: {
    icon: FileText,
    styles: "bg-gray-50 text-gray-700 border-gray-200",
    color: 'hsl(220, 9%, 46%)'
  }
}

export const statusConfig = {
  sent: { icon: Clock, color: 'text-gray-500', label: 'Enviado' },
  delivered: { icon: CheckCheck, color: 'text-blue-500', label: 'Entregue' },
  read: { icon: CheckCheck, color: 'text-green-500', label: 'Lido' },
  failed: { icon: AlertCircle, color: 'text-red-500', label: 'Falhou' }
}

export interface CommunicationChannelBadgeProps {
  channel: CommunicationChannel
  status?: MessageStatus
  className?: string
  showLabel?: boolean
}

export interface MessageBubbleProps {
  content: string
  direction: MessageDirection
  channel: CommunicationChannel
  timestamp: Date
  status?: MessageStatus
  senderName?: string
  className?: string
  attachmentCount?: number
  onMenuClick?: () => void
}