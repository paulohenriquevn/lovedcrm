import { IntegrationItem } from './integration-item'

interface IntegrationData {
  name: string
  key: string
  color: string
}

interface IntegrationsSectionProps {
  integrations: IntegrationData[]
}

export function IntegrationsSection({ integrations }: IntegrationsSectionProps): React.ReactElement {
  return (
    <div className="text-center mb-12">
      <h3 className="text-2xl font-bold mb-4">Integrações Nativas</h3>
      <p className="text-muted-foreground mb-8">
        Conecte com as ferramentas que sua agência já usa
      </p>
      
      <div className="grid grid-cols-4 md:grid-cols-8 gap-4 max-w-4xl mx-auto mb-8">
        {integrations.map((integration) => (
          <IntegrationItem key={integration.key} integration={integration} />
        ))}
      </div>
    </div>
  )
}