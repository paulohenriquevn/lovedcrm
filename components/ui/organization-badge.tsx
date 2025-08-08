/**
 * Organization Badge Component
 * Badge para indicar tier da organização com cores específicas do Loved CRM
 * Baseado na especificação do agente 07-design-tokens.md
 */

import { cn } from "@/lib/utils"
import { organizationTierLabels } from "@/types/design-tokens"

interface OrganizationBadgeProps {
  tier: 'free' | 'pro' | 'enterprise'
  children?: React.ReactNode
  className?: string
  showLabel?: boolean
}

export function OrganizationBadge({ 
  tier, 
  children, 
  className,
  showLabel = false 
}: OrganizationBadgeProps): JSX.Element {
  const tierStyles = {
    free: "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200",
    pro: "bg-violet-100 text-violet-700 border-violet-200 hover:bg-violet-200",
    enterprise: "bg-gray-900 text-gray-100 border-gray-800 hover:bg-gray-800"
  }

  const tierIcons = {
    free: "🆓",
    pro: "⭐",
    enterprise: "👑"
  }

  const tierKey = `tier${tier.charAt(0).toUpperCase() + tier.slice(1)}` as keyof typeof organizationTierLabels
  const displayContent = children ?? (showLabel === true ? organizationTierLabels[tierKey] : tierIcons[tier])
  
  return (
    <span 
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2",
        tierStyles[tier],
        className
      )}
      title={`Plano ${organizationTierLabels[tierKey]}`}
    >
      {typeof displayContent === 'string' && children === null && (
        <span className="text-[10px]" aria-hidden="true">
          {tierIcons[tier]}
        </span>
      )}
      <span className="font-medium">
        {displayContent}
      </span>
    </span>
  )
}

// Variante para indicar contexto organizacional ativo
export function CurrentOrganizationBadge({ 
  orgName, 
  tier, 
  className 
}: { 
  orgName: string
  tier: 'free' | 'pro' | 'enterprise'
  className?: string 
}): JSX.Element {
  return (
    <div className={cn(
      "inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-violet-200 bg-gradient-to-r from-violet-50 to-purple-50",
      "transition-colors duration-200 hover:from-violet-100 hover:to-purple-100",
      className
    )}>
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-violet-500 animate-pulse" />
        <span className="text-sm font-medium text-violet-900 truncate max-w-[150px]">
          {orgName}
        </span>
      </div>
      <OrganizationBadge tier={tier} />
    </div>
  )
}