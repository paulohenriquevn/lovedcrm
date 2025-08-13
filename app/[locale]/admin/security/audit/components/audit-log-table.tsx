import { Eye } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

import type { AuditLogEntry } from '../types'

interface AuditLogTableProps {
  logs: AuditLogEntry[]
  isLoading: boolean
}

export function AuditLogTable({ logs, isLoading }: AuditLogTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={`skeleton-${i}`} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {logs.map((log) => (
        <Card key={log.id} className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Badge 
                  variant={
                    log.action === 'DELETE' ? 'destructive' :
                    log.action === 'CREATE' ? 'default' : 'secondary'
                  }
                >
                  {log.action}
                </Badge>
                <span className="text-sm text-muted-foreground">{log.tableName}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </div>
              
              <p className="text-sm font-medium mb-1">{log.summary}</p>
              
              {Boolean(log.ipAddress) && (
                <p className="text-xs text-muted-foreground">
                  IP: {log.ipAddress}
                </p>
              )}
            </div>
            
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  )
}