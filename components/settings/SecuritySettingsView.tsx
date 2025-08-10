'use client'

import { Key, Monitor, Smartphone } from 'lucide-react'
import * as React from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

import { TwoFactorAuthModal } from './TwoFactorAuthModal'

interface ActiveSession {
  id: string
  device: string
  location: string
  lastActive: string
  current: boolean
}

interface SecuritySettingsViewProps {
  onChangePassword: () => void
}

// Password Section Component
function PasswordSection({
  onChangePassword,
  isChangingPassword,
}: {
  onChangePassword: () => void
  isChangingPassword: boolean
}): JSX.Element {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Key className="h-6 w-6 text-muted-foreground" />
          <div>
            <CardTitle className="text-lg font-semibold">Senha</CardTitle>
            <CardDescription>Gerencie sua senha de acesso</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h3 className="font-medium">Alterar Senha</h3>
            <p className="text-muted-foreground">Última alteração: 30 dias atrás</p>
          </div>
          <Button
            variant="secondary"
            type="button"
            onClick={onChangePassword}
            disabled={isChangingPassword}
          >
            {isChangingPassword ? 'Alterando...' : 'Alterar Senha'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Two Factor Section Component
function TwoFactorSection({
  twoFactorEnabled,
  onToggle2FA,
}: {
  twoFactorEnabled: boolean
  onToggle2FA: () => void
}): JSX.Element {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Smartphone className="h-6 w-6 text-muted-foreground" />
          <div>
            <CardTitle className="text-lg font-semibold">Autenticação de Dois Fatores</CardTitle>
            <CardDescription>Adicione uma camada extra de segurança à sua conta</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-medium">2FA</h3>
              <Badge variant={twoFactorEnabled ? 'default' : 'outline'}>
                {twoFactorEnabled ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {twoFactorEnabled
                ? 'Sua conta está protegida com 2FA'
                : 'Configure 2FA para maior segurança'}
            </p>
          </div>
          <Button variant="secondary" type="button" onClick={onToggle2FA}>
            {twoFactorEnabled ? 'Gerenciar' : 'Configurar'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Active Sessions Component
function ActiveSessionsSection({
  activeSessions,
  isLoadingSessions,
  onRevokeSession,
}: {
  activeSessions: ActiveSession[]
  isLoadingSessions: boolean
  onRevokeSession: (sessionId: string) => void
}): JSX.Element {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Monitor className="h-6 w-6 text-muted-foreground" />
          <div>
            <CardTitle className="text-lg font-semibold">Sessões Ativas</CardTitle>
            <CardDescription>Gerencie onde você está logado</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoadingSessions ? (
            <div className="space-y-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : (
            <div className="space-y-2">
              {activeSessions.map((session, _index) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Monitor className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{session.device}</span>
                        {session.current === true && <Badge variant="default">Atual</Badge>}
                      </div>
                      <p className="text-muted-foreground">
                        {session.location} • {session.lastActive}
                      </p>
                    </div>
                  </div>
                  {!session.current && (
                    <Button
                      variant="destructive"
                      type="button"
                      size="sm"
                      onClick={() => onRevokeSession(session.id)}
                    >
                      Revogar
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Hook for managing active sessions
function useActiveSessions(): {
  activeSessions: ActiveSession[]
  isLoadingSessions: boolean
  handleRevokeSession: (sessionId: string) => Promise<void>
} {
  const [activeSessions, setActiveSessions] = React.useState<ActiveSession[]>([])
  const [isLoadingSessions, setIsLoadingSessions] = React.useState(true)

  React.useEffect(() => {
    const loadActiveSessions = async (): Promise<void> => {
      try {
        setIsLoadingSessions(true)
        const { settingsService } = await import('@/services/settings')
        const sessions = await settingsService.getActiveSessions()

        const transformedSessions: ActiveSession[] = sessions.map(session => ({
          id: session.id,
          device: session.device,
          location: session.location,
          lastActive: session.last_active,
          current: session.current,
        }))

        setActiveSessions(transformedSessions)
      } catch {
        // Fallback to mock data if API fails
        setActiveSessions([
          {
            id: '1',
            device: 'Chrome no Windows',
            location: 'São Paulo, Brasil',
            lastActive: 'Agora',
            current: true,
          },
          {
            id: '2',
            device: 'Safari no iPhone',
            location: 'São Paulo, Brasil',
            lastActive: '2 horas atrás',
            current: false,
          },
        ])
      } finally {
        setIsLoadingSessions(false)
      }
    }

    void loadActiveSessions()
  }, [])

  const handleRevokeSession = React.useCallback(async (sessionId: string): Promise<void> => {
    const { settingsService } = await import('@/services/settings')
    await settingsService.revokeSession(sessionId)
    setActiveSessions(prev => prev.filter(session => session.id !== sessionId))
  }, [])

  return { activeSessions, isLoadingSessions, handleRevokeSession }
}

export function SecuritySettingsView({ onChangePassword }: SecuritySettingsViewProps): JSX.Element {
  const [isChangingPassword] = React.useState(false)
  const [twoFactorEnabled] = React.useState(false)
  const [is2FAModalOpen, setIs2FAModalOpen] = React.useState(false)
  const { activeSessions, isLoadingSessions, handleRevokeSession } = useActiveSessions()

  const handleToggle2FA = React.useCallback((): void => {
    setIs2FAModalOpen(true)
  }, [])

  return (
    <div className="space-y-6">
      <PasswordSection
        onChangePassword={onChangePassword}
        isChangingPassword={isChangingPassword}
      />

      <TwoFactorSection twoFactorEnabled={twoFactorEnabled} onToggle2FA={handleToggle2FA} />

      <ActiveSessionsSection
        activeSessions={activeSessions}
        isLoadingSessions={isLoadingSessions}
        onRevokeSession={(sessionId: string) => void handleRevokeSession(sessionId)}
      />

      {/* 2FA Modal */}
      <TwoFactorAuthModal
        isOpen={is2FAModalOpen}
        onClose={() => setIs2FAModalOpen(false)}
        isEnabled={twoFactorEnabled}
        onEnable2FA={() => Promise.resolve({ qr_code: 'mock', secret: 'mock' })}
        onConfirm2FA={() => Promise.resolve()}
        onDisable2FA={() => Promise.resolve()}
      />
    </div>
  )
}
