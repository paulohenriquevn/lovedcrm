import { Card, CardContent } from '@/components/ui/card'

interface AdvancedFeature {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  items: string[]
}

interface AdvancedFeatureCardProps {
  feature: AdvancedFeature
  index?: number
}

export function AdvancedFeatureCard({ feature }: AdvancedFeatureCardProps): React.ReactElement {
  return (
    <Card className="bg-card border border-border hover:border-primary/10 hover:shadow-lg transition-all duration-300 group">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <feature.icon className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-foreground mb-2">{feature.title}</h4>
            <p className="text-sm text-muted-foreground mb-4">{feature.description}</p>
            <div className="space-y-1">
              {feature.items.map(item => (
                <div
                  key={`${feature.title}-item-${item.slice(0, 15)}`}
                  className="flex items-center gap-2 text-xs"
                >
                  <div className="h-1 w-1 bg-emerald-500 rounded-full" />
                  <span className="text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
