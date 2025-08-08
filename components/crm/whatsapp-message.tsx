/**
 * WhatsApp Message Component
 * Specialized component for WhatsApp-style messages
 */

import { 
  CheckCheck,
  Clock,
  AlertCircle,
  FileText
} from "lucide-react"

import { cn } from "@/lib/utils"

import { 
  MessageStatus, 
  MessageBubbleProps
} from "./communication-channel-config"

function WhatsAppMessageHeader({
  isOutbound,
  senderName
}: {
  isOutbound: boolean
  senderName?: string
}): React.ReactElement | null {
  if (isOutbound || senderName === null || senderName === undefined || senderName.length === 0) {
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
  if (status === null || status === undefined || !isOutbound) {
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

// WhatsApp-specific message component
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