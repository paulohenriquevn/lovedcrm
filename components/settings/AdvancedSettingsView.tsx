'use client'

import * as React from 'react'

import { useAuthStore } from '@/stores/auth'

import { DangerZoneSection } from './DangerZoneSection'
import { DataExportSection } from './DataExportSection'

export function AdvancedSettingsView(): JSX.Element {
  const { user, organization } = useAuthStore()
  const [isExporting, setIsExporting] = React.useState<boolean>(false)

  const handleExportData = React.useCallback(
    async (type: 'personal' | 'organization'): Promise<void> => {
      setIsExporting(true)
      try {
        // TODO: Implementar exportação de dados
        // Temporary development logging - remove in production
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.log(`Exportando dados: ${type}`)
        }

        // Simular processo de exportação
        await new Promise<void>(resolve => setTimeout(resolve, 3000))

        // Simular download do arquivo
        const filename =
          type === 'personal'
            ? `meus-dados-${new Date().toISOString().split('T')[0]}.json`
            : `dados-organizacao-${new Date().toISOString().split('T')[0]}.json`

        // Temporary development logging - remove in production
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.log(`Arquivo ${filename} foi baixado`)
        }
      } catch (error) {
        // Temporary development logging - remove in production
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.error('Erro ao exportar dados:', error)
        }
      } finally {
        setIsExporting(false)
      }
    },
    []
  )

  const handleDeleteAccount = React.useCallback((): void => {
    // TODO: Implementar exclusão de conta
    // Temporary development logging - remove in production
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log('Excluindo conta...')
    }
  }, [])

  const handleDeleteOrganization = React.useCallback((): void => {
    // TODO: Implementar exclusão de organização
    // Temporary development logging - remove in production
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log('Excluindo organização...')
    }
  }, [])

  return (
    <div className="space-y-8">
      <DataExportSection
        organization={organization}
        onExportData={handleExportData}
        isExporting={isExporting}
      />

      <DangerZoneSection
        user={user}
        organization={organization}
        onDeleteAccount={handleDeleteAccount}
        onDeleteOrganization={handleDeleteOrganization}
      />
    </div>
  )
}
