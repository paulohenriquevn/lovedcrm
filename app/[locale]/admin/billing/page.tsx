import { BillingSettingsContainer } from '@/app/containers/settings/BillingSettingsContainer'

export default function BillingPage() {
  return (
    <div className="w-full h-full space-y-6">
      {/* Header */}
      <div className="w-full space-y-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Faturamento</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie sua assinatura e histórico de pagamentos
          </p>
        </div>
      </div>

      {/* Billing Content */}
      <div className="w-full space-y-4">
        <BillingSettingsContainer />
      </div>
    </div>
  )
}
