'use client'

import { LucideIcon } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'

interface DataExportCardProps {
  title: string
  description: string
  icon: LucideIcon
  iconColor: string
  items: string[]
  exportType: 'personal' | 'organization'
  onExport: (type: 'personal' | 'organization') => Promise<void>
  isExporting: boolean
}

export function DataExportCard({
  title,
  description,
  icon: Icon,
  iconColor,
  items,
  exportType,
  onExport,
  isExporting,
}: DataExportCardProps): JSX.Element {
  const handleExport = React.useCallback((): void => {
    onExport(exportType).catch((error: unknown) => {
      // Error handling is done in parent component
      // This wrapper ensures ESLint compliance for async onClick
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('Export failed:', error)
      }
    })
  }, [onExport, exportType])

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center mb-4">
        <Icon className={`h-8 w-8 ${iconColor} mr-3`} />
        <div>
          <h3 className="font-medium text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="space-y-2 text-sm text-muted-foreground mb-4">
        {items.map(item => (
          <div key={item}>• {item}</div>
        ))}
      </div>
      <Button onClick={handleExport} disabled={isExporting} className="w-full" variant="outline">
        {isExporting ? 'Preparando...' : `Exportar ${title}`}
      </Button>
    </div>
  )
}
