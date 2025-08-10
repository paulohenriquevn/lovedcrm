/**
 * Sidebar Components - Extracted sidebar components
 * Reduces sidebar.tsx file length and complexity
 */

import { Badge } from '@/components/ui/badge'

import type { Organization } from '@/types/organization'

interface ExtendedOrganization extends Organization {
  tier?: string
}

function getTierDisplayName(tier = 'free'): string {
  return tier.charAt(0).toUpperCase() + tier.slice(1)
}

function getTierShortName(tier = 'FREE'): string {
  return tier.slice(0, 3).toUpperCase()
}

interface SidebarFooterProps {
  collapsed: boolean
  currentOrg: ExtendedOrganization
  memberCount: number
  memberLoading: boolean
}

export function SidebarFooter({
  collapsed,
  currentOrg,
  memberCount,
  memberLoading,
}: SidebarFooterProps): JSX.Element {
  if (collapsed) {
    return (
      <div className="p-4 border-t border-border">
        <div className="flex flex-col items-center space-y-2">
          <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
          <Badge variant="secondary" className="text-xs rotate-90 whitespace-nowrap">
            {getTierShortName(currentOrg.tier)}
          </Badge>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 border-t border-border">
      <div className="space-y-2">
        <div className="bg-violet-50 rounded-lg p-3 border border-violet-200">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-2 w-2 bg-violet-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-violet-700">Organização Ativa</span>
          </div>
          <p className="text-xs text-violet-600 truncate">{currentOrg.name}</p>
          <p className="text-xs text-violet-500">
            {memberLoading ? '...' : memberCount} membros conectados
          </p>
        </div>

        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium">Plano {getTierDisplayName(currentOrg.tier)}</span>
            <Badge variant="secondary" className="text-xs">
              Ativo
            </Badge>
          </div>
          <div className="w-full bg-muted rounded-full h-2 mb-1">
            <div className="bg-primary h-2 rounded-full w-3/4" />
          </div>
          <p className="text-xs text-muted-foreground">Funcionalidades disponíveis</p>
        </div>
      </div>
    </div>
  )
}
