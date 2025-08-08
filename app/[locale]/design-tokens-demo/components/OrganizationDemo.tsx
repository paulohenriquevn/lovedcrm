import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { OrganizationBadge } from "@/components/ui/organization-badge"

interface OrganizationDemoProps {
  selectedTier: 'free' | 'pro' | 'enterprise'
  onTierChange: (tier: 'free' | 'pro' | 'enterprise') => void
}

export function OrganizationDemo({ selectedTier, onTierChange }: OrganizationDemoProps): JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tiers de Organização</CardTitle>
        <CardDescription>
          Badges e indicadores para diferentes níveis de assinatura
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <OrganizationBadge tier="free" showLabel />
          <OrganizationBadge tier="pro" showLabel />
          <OrganizationBadge tier="enterprise" showLabel />
        </div>
        
        <div className="space-y-2">
          <p className="text-sm font-medium">Seletor de Tier:</p>
          <div className="flex gap-2">
            {(['free', 'pro', 'enterprise'] as const).map((tier) => (
              <Button
                key={tier}
                variant={selectedTier === tier ? 'default' : 'outline'}
                size="sm"
                onClick={() => onTierChange(tier)}
              >
                <OrganizationBadge tier={tier} />
              </Button>
            ))}
          </div>
        </div>

        <div className="org-scope-indicator p-4 rounded-lg">
          <p className="text-sm font-medium mb-2">Indicador de Contexto Organizacional</p>
          <p className="text-xs text-muted-foreground">
            Esta borda indica que você está no contexto de uma organização específica
          </p>
        </div>
      </CardContent>
    </Card>
  )
}