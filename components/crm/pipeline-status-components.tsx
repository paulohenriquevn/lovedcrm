/**
 * Pipeline Status Components
 * Components extracted from pipeline-kanban-helpers for status display
 */

import { cn } from '@/lib/utils'

// Helper component for connection status indicator
export function ConnectionStatusIndicator({
  isConnected,
  isPolling,
}: {
  isConnected: boolean
  isPolling: boolean
}): React.ReactElement {
  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          'h-2 w-2 rounded-full',
          isConnected ? 'bg-emerald-500' : isPolling ? 'bg-amber-500' : 'bg-red-500'
        )}
      />
      <span className="text-xs text-muted-foreground">
        {isConnected
          ? 'Conectado - Updates em tempo real'
          : isPolling
            ? 'Modo Fallback - Updates via polling'
            : 'Desconectado - Sem updates automáticos'}
      </span>
    </div>
  )
}

// Helper component for active users display
export function ActiveUsersDisplay({
  activeUsers,
}: {
  activeUsers: { user_id?: string; full_name?: string }[]
}): React.ReactElement | null {
  if (activeUsers.length === 0) {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">
        {activeUsers.length} {activeUsers.length === 1 ? 'usuário ativo' : 'usuários ativos'}
      </span>
      <div className="flex -space-x-1">
        {activeUsers.slice(0, 3).map((activeUser, index) => (
          <div
            key={activeUser.user_id ?? `user-${index}`}
            className="h-6 w-6 rounded-full bg-primary/20 border border-background flex items-center justify-center"
            title={String(activeUser.full_name ?? 'Usuário ativo')}
          >
            <span className="text-xs font-medium">
              {String(activeUser.full_name ?? 'U').charAt(0).toUpperCase()}
            </span>
          </div>
        ))}
        {activeUsers.length > 3 && (
          <div className="h-6 w-6 rounded-full bg-muted border border-background flex items-center justify-center">
            <span className="text-xs">+{activeUsers.length - 3}</span>
          </div>
        )}
      </div>
    </div>
  )
}

// Helper component for connection status header
export function ConnectionStatusHeader({
  isConnected,
  isPolling,
  activeUsers,
}: {
  isConnected: boolean
  isPolling: boolean
  activeUsers: { user_id?: string; full_name?: string }[]
}): React.ReactElement {
  return (
    <div className="flex items-center justify-between mb-4 p-2 bg-muted/30 rounded-lg">
      <ConnectionStatusIndicator isConnected={isConnected} isPolling={isPolling} />
      <ActiveUsersDisplay activeUsers={activeUsers} />
    </div>
  )
}
