import { Download, RefreshCcw, Shield } from 'lucide-react'

import { RoleGuard } from '@/components/admin/role-guard'
import { Button } from '@/components/ui/button'

interface AuditPageHeaderProps {
  isLoading: boolean
  onRefresh: () => void
  onExport: () => void
}

export function AuditPageHeader({ isLoading, onRefresh, onExport }: AuditPageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Shield className="h-8 w-8" />
          Security Audit Trail
        </h1>
        <p className="text-muted-foreground">
          Monitor organization security events and audit trail
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
          <RefreshCcw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>

        <RoleGuard requiredPermission="export_data">
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </RoleGuard>
      </div>
    </div>
  )
}
