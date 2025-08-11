/**
 * Providers Tab Content Components
 *
 * Helper components for ProvidersTabContent following the decomposition pattern.
 */

import { ProviderDashboard } from '@/components/providers/ProviderDashboard'
import { ProviderMigrationWizard } from '@/components/providers/ProviderMigrationWizard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProvidersData } from '@/hooks/use-provider-data'

/**
 * Permission denied component
 */
export function ProvidersPermissionDenied({ userRole }: { userRole?: string }): JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle>🔌 Gerenciamento de Provedores</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 15v2m0 0v2m0-2h2m-2 0H10m12-6V9a2 2 0 00-2-2H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Acesso Restrito
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Você não tem permissão para gerenciar provedores. Entre em contato com um administrador.
          </p>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Função atual: {userRole ?? 'Não definida'}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Loading state component
 */
export function ProvidersLoading(): JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle>🔌 Gerenciamento de Provedores</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            ))}
          </div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Error state component
 */
export function ProvidersError({ onRetry }: { onRetry: () => void }): JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle>🔌 Gerenciamento de Provedores</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <div className="text-red-400 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Erro ao Carregar Provedores
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Não foi possível carregar as informações dos provedores. Verifique sua conexão e tente
            novamente.
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Main providers content component
 */
export function ProvidersMainContent({
  providers,
  onSwitchProvider,
  migrationWizardOpen,
  selectedProviderType,
  onMigrationClose,
  onMigrationComplete,
}: {
  providers: ProvidersData
  onSwitchProvider: (providerType: string) => void
  migrationWizardOpen: boolean
  selectedProviderType: string
  onMigrationClose: () => void
  onMigrationComplete: () => void
}): JSX.Element {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">🔌 Gerenciamento de Provedores</CardTitle>
          <p className="text-sm text-muted-foreground">
            Configure e gerencie seus provedores de comunicação. Mantenha múltiplos provedores para
            redundância e otimização de custos.
          </p>
        </CardHeader>
        <CardContent>
          <ProviderDashboard providers={providers} onSwitchProvider={onSwitchProvider} />
        </CardContent>
      </Card>

      {/* Migration Wizard Modal */}
      {Boolean(migrationWizardOpen && selectedProviderType) && (
        <ProviderMigrationWizard
          providerType={selectedProviderType}
          providers={providers}
          onClose={onMigrationClose}
          onComplete={onMigrationComplete}
        />
      )}
    </div>
  )
}
