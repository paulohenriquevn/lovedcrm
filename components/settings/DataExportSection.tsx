'use client'

import { Download, FileText, Database, Shield } from 'lucide-react'
import * as React from 'react'

import { Organization } from '@/types/organization'

import { DataExportCard } from './DataExportCard'

interface DataExportSectionProps {
  organization: Organization | null
  onExportData: (type: 'personal' | 'organization') => Promise<void>
  isExporting: boolean
}

export function DataExportSection({
  organization,
  onExportData,
  isExporting,
}: DataExportSectionProps): JSX.Element {
  const personalDataItems = [
    'Informações do perfil',
    'Preferências de configuração',
    'Histórico de atividades',
    'Logs de segurança',
  ]

  const organizationDataItems = [
    'Lista de membros',
    'Configurações organizacionais',
    'Relatórios e analytics',
    'Histórico de faturas',
  ]

  return (
    <div>
      <div className="flex items-center mb-6">
        <Download className="h-6 w-6 text-gray-400 mr-3" />
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Exportação de Dados</h2>
          <p className="text-sm text-gray-600">Baixe uma cópia dos seus dados (GDPR compliance)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DataExportCard
          title="Dados Pessoais"
          description="Perfil, configurações, histórico"
          icon={FileText}
          iconColor="text-blue-500"
          items={personalDataItems}
          exportType="personal"
          onExport={onExportData}
          isExporting={isExporting}
        />

        {organization !== null && (
          <DataExportCard
            title="Dados da Organização"
            description="Membros, configurações, analytics"
            icon={Database}
            iconColor="text-green-500"
            items={organizationDataItems}
            exportType="organization"
            onExport={onExportData}
            isExporting={isExporting}
          />
        )}
      </div>

      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start">
          <Shield className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Sobre a exportação de dados:</p>
            <ul className="space-y-1 text-xs">
              <li>• Os dados são exportados em formato JSON</li>
              <li>• O processo pode levar alguns minutos</li>
              <li>• Você receberá um email quando estiver pronto</li>
              <li>• O arquivo expira em 7 dias por segurança</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
