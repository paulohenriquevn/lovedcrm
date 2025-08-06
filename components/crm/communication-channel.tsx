/**
 * Communication Channel Components
 * Componentes para diferentes canais de comunicação do CRM
 * Baseado na especificação do agente 07-design-tokens.md
 */

import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { 
  MessageCircle,
  Mail,
  Phone,
  FileText,
  Clock,
  CheckCheck,
  AlertCircle,
  MoreHorizontal
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { communicationChannelLabels } from "@/types/design-tokens"


type CommunicationChannel = 'whatsapp' | 'email' | 'voip' | 'note'
type MessageDirection = 'inbound' | 'outbound'
type MessageStatus = 'sent' | 'delivered' | 'read' | 'failed'

interface CommunicationChannelBadgeProps {
  channel: CommunicationChannel
  status?: MessageStatus
  className?: string
  showLabel?: boolean
}

const channelConfig = {
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

const statusConfig = {
  sent: { icon: Clock, color: 'text-gray-500', label: 'Enviado' },
  delivered: { icon: CheckCheck, color: 'text-blue-500', label: 'Entregue' },
  read: { icon: CheckCheck, color: 'text-green-500', label: 'Lido' },
  failed: { icon: AlertCircle, color: 'text-red-500', label: 'Falhou' }
}

export function CommunicationChannelBadge({ 
  channel, 
  status, 
  className, 
  showLabel = false 
}: CommunicationChannelBadgeProps): React.ReactElement {
  const config = channelConfig[channel]
  const Icon = config.icon
  const StatusIcon = status == null ? null : statusConfig[status].icon

  return (
    <Badge 
      variant="secondary" 
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium border",
        config.styles,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {showLabel ? communicationChannelLabels[channel] : null}
      {StatusIcon != null && status != null ? <StatusIcon className={cn("h-3 w-3", statusConfig[status].color)} /> : null}
    </Badge>
  )
}

interface MessageBubbleProps {
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

function MessageBubbleHeader({
  isOutbound,
  senderName,
  channel,
  onMenuClick
}: {
  isOutbound: boolean
  senderName?: string
  channel: CommunicationChannel
  onMenuClick?: () => void
}): React.ReactElement {
  return <div className="flex items-center justify-between mb-2">
    <div className="flex items-center gap-2">
      {!isOutbound && senderName != null && senderName.length > 0 ? <span className="text-xs font-medium opacity-75">
          {senderName}
        </span> : null}
      <CommunicationChannelBadge 
        channel={channel} 
        className="scale-75 origin-left" 
      />
    </div>
    {onMenuClick == null ? null : <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={onMenuClick}
      >
        <MoreHorizontal className="h-3 w-3" />
      </Button>}
  </div>
}

function MessageBubbleFooter({
  timestamp,
  status,
  isOutbound
}: {
  timestamp: Date
  status?: MessageStatus
  isOutbound: boolean
}): React.ReactElement {
  const StatusIcon = status == null ? null : statusConfig[status].icon

  return (
    <div className="flex items-center justify-between mt-3 pt-2 border-t border-current/10">
      <time className="text-xs opacity-75" title={timestamp.toLocaleString('pt-BR')}>
        {formatDistanceToNow(timestamp, { 
          addSuffix: true, 
          locale: ptBR 
        })}
      </time>
      
      {status != null && StatusIcon != null ? <div className="flex items-center gap-1">
          <StatusIcon className={cn(
            "h-3 w-3", 
            isOutbound ? "text-white/70" : statusConfig[status].color
          )} />
          <span className={cn(
            "text-xs",
            isOutbound ? "text-white/70" : "opacity-75"
          )}>
            {statusConfig[status].label}
          </span>
        </div> : null}
    </div>
  )
}

export function MessageBubble({
  content,
  direction,
  channel,
  timestamp,
  status,
  senderName,
  className,
  attachmentCount = 0,
  onMenuClick
}: MessageBubbleProps): React.ReactElement {
  const config = channelConfig[channel]
  const isOutbound = direction === 'outbound'

  return (
    <div className={cn(
      "flex gap-3 group",
      isOutbound ? "justify-end" : "justify-start",
      className
    )}>
      <div className={cn(
        "max-w-[70%] rounded-xl px-4 py-3 relative transition-all duration-200",
        isOutbound 
          ? "bg-violet-500 text-white ml-auto" 
          : cn("bg-white border-2", config.styles.replace('text-', 'border-').replace('bg-', '').replace('border-', 'border-')),
        "hover:shadow-sm"
      )}>
        <MessageBubbleHeader 
          isOutbound={isOutbound}
          senderName={senderName}
          channel={channel}
          onMenuClick={onMenuClick}
        />

        {/* Conteúdo da mensagem */}
        <div className="text-sm leading-relaxed">
          {content}
        </div>

        {/* Attachments indicator */}
        {attachmentCount > 0 && (
          <div className="mt-2 text-xs opacity-75 flex items-center gap-1">
            <FileText className="h-3 w-3" />
            {attachmentCount} anexo{attachmentCount > 1 ? 's' : ''}
          </div>
        )}

        <MessageBubbleFooter 
          timestamp={timestamp}
          status={status}
          isOutbound={isOutbound}
        />
      </div>
    </div>
  )
}

function WhatsAppMessageHeader({
  isOutbound,
  senderName
}: {
  isOutbound: boolean
  senderName?: string
}): React.ReactElement | null {
  if (isOutbound || senderName == null || senderName.length === 0) {
    return null
  }

  return (
    <div className="text-xs font-semibold text-green-600 mb-1">
      {senderName}
    </div>
  )
}

function WhatsAppMessageStatus({
  status,
  isOutbound
}: {
  status?: MessageStatus
  isOutbound: boolean
}): React.ReactElement | null {
  if (status == null || !isOutbound) {
    return null
  }

  return (
    <div className="ml-2">
      {status === 'read' && <CheckCheck className="h-4 w-4 text-blue-500" />}
      {status === 'delivered' && <CheckCheck className="h-4 w-4 text-gray-400" />}
      {status === 'sent' && <Clock className="h-3 w-3 text-gray-400" />}
      {status === 'failed' && <AlertCircle className="h-4 w-4 text-red-500" />}
    </div>
  )
}

// Componente específico para mensagens do WhatsApp
export function WhatsAppMessage({
  content,
  direction,
  timestamp,
  status,
  senderName,
  className,
  attachmentCount = 0
}: Omit<MessageBubbleProps, 'channel'>): React.ReactElement {
  const isOutbound = direction === 'outbound'
  
  return (
    <div className={cn(
      "flex gap-3",
      isOutbound ? "justify-end" : "justify-start",
      className
    )}>
      <div className={cn(
        "max-w-[70%] rounded-2xl px-4 py-3 relative shadow-sm",
        isOutbound 
          ? "bg-[#dcf8c6] text-gray-800 ml-auto" // WhatsApp outgoing green
          : "bg-white text-gray-800 border border-gray-200", // WhatsApp incoming white
      )}>
        <WhatsAppMessageHeader 
          isOutbound={isOutbound}
          senderName={senderName}
        />

        <div className="text-sm leading-relaxed">
          {content}
        </div>

        {attachmentCount > 0 && (
          <div className="mt-2 text-xs text-gray-600 flex items-center gap-1">
            <FileText className="h-3 w-3" />
            {attachmentCount} anexo{attachmentCount > 1 ? 's' : ''}
          </div>
        )}

        <div className="flex items-center justify-between mt-2 pt-1">
          <time className="text-xs text-gray-500">
            {timestamp.toLocaleTimeString('pt-BR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </time>
          
          <WhatsAppMessageStatus 
            status={status}
            isOutbound={isOutbound}
          />
        </div>
      </div>
    </div>
  )
}

// Hook para obter cor do canal
export function useCommunicationChannelColor(channel: CommunicationChannel): string {
  return channelConfig[channel].color
}