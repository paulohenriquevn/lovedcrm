/**
 * Communication Channel Components
 * Main export module for communication channel components
 * Refactored for better maintainability and line limits
 */

import { FileText } from "lucide-react"

import { cn } from "@/lib/utils"

import { 
  channelConfig,
  MessageBubbleProps
} from "./communication-channel-config"
import { 
  MessageBubbleHeader, 
  MessageBubbleFooter 
} from "./message-bubble-components"

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

// Re-export WhatsApp component from separate file
export { WhatsAppMessage } from "./whatsapp-message"

// Hook para obter cor do canal  
export function useCommunicationChannelColor(channel: string): string {
  return channelConfig[channel as keyof typeof channelConfig]?.color ?? 'hsl(220, 9%, 46%)'
}

// Re-export types and components
export type {
  CommunicationChannel,
  MessageDirection, 
  MessageStatus,
  CommunicationChannelBadgeProps,
  MessageBubbleProps
} from "./communication-channel-config"

export { CommunicationChannelBadge } from "./communication-channel-badge"