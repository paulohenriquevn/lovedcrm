import { Sparkles } from "lucide-react"

import { CurrentOrganizationBadge } from "@/components/ui/organization-badge"

interface DemoHeaderProps {
  selectedTier: 'free' | 'pro' | 'enterprise'
  demoOrgName: string
}

export function DemoHeader({ selectedTier, demoOrgName }: DemoHeaderProps): JSX.Element {
  return (
    <div className="text-center space-y-4">
      <div className="flex items-center justify-center gap-3">
        <Sparkles className="h-8 w-8 text-primary animate-pulse" />
        <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
          Loved CRM Design System
        </h1>
      </div>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
        Sistema completo de design tokens para CRM B2B brasileiro com paleta Loved Purple e componentes específicos para agências digitais.
      </p>
      <div className="flex items-center justify-center gap-2">
        <CurrentOrganizationBadge orgName={demoOrgName} tier={selectedTier} />
      </div>
    </div>
  )
}