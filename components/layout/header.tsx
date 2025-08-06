/**
 * Header - Main Application Header
 * Header principal com contexto organizacional e navegação
 * Baseado na especificação do agente 09-ui-ux-designer.md
 */

'use client'

import { 
  Search,
  Bell,
  Settings,
  User,
  LogOut,
  Moon,
  Sun,
  ChevronDown,
  Building2,
  Shield,
  Users
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { useState } from 'react'

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'

// Hooks para dados reais
import { useMemberCount } from '@/hooks/use-member-count'
import { useNotifications } from '@/hooks/use-notifications'
import { useUserOrganizations } from '@/hooks/use-user-organizations'
import { useAuthStore } from '@/stores/auth'

interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  const [commandOpen, setCommandOpen] = useState(false)
  const [orgSwitcherOpen, setOrgSwitcherOpen] = useState(false)
  const { setTheme, theme } = useTheme()
  
  // Hooks para dados reais
  const { user, organization, logout } = useAuthStore()
  const { 
    organizations, 
    currentOrganization, 
    switchOrganization,
    isLoading: orgLoading 
  } = useUserOrganizations()
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    isLoading: notificationsLoading 
  } = useNotifications()
  const { memberCount, isLoading: memberLoading } = useMemberCount()

  // Fallbacks para dados de loading
  const currentUser = user || { id: '', email: '', full_name: 'User' }
  const currentOrg = currentOrganization || organization || {
    id: '',
    name: 'Organização',
    tier: 'free',
    owner_id: '',
    created_at: '',
    updated_at: ''
  }

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'owner': {
        return 'bg-primary/10 text-primary border-primary/20'
      }
      case 'admin': {
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
      }
      case 'member': {
        return 'bg-muted text-muted-foreground border-border'
      }
      default: {
        return 'bg-muted text-muted-foreground border-border'
      }
    }
  }

  const getTierBadgeStyle = (tier: string) => {
    switch (tier) {
      case 'free': {
        return 'bg-muted text-muted-foreground border-border'
      }
      case 'pro': {
        return 'bg-primary/10 text-primary border-primary/20'
      }
      case 'enterprise': {
        return 'bg-foreground text-background border-foreground'
      }
      default: {
        return 'bg-muted text-muted-foreground border-border'
      }
    }
  }

  const handleOrgSwitch = async (orgId: string) => {
    try {
      await switchOrganization(orgId)
      setOrgSwitcherOpen(false)
    } catch (error) {
      console.error('Failed to switch organization:', error)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Failed to logout:', error)
    }
  }

  const handleNotificationClick = async (notificationId: string) => {
    try {
      await markAsRead(notificationId)
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  // Extrair informações do usuário para exibição
  const userDisplayName = currentUser.full_name || currentUser.email?.split('@')[0] || 'User'
  const userInitials = userDisplayName.split(' ').map(name => name[0]).join('').slice(0, 2).toUpperCase()
  const orgInitials = currentOrg.name.slice(0, 2).toUpperCase()
  
  // Determinar role do usuário na organização atual
  const userRole = currentOrg.owner_id === currentUser.id ? 'owner' : 'member'

  return (
    <>
      <header className={`h-16 bg-background border-b border-border ${className}`}>
        <div className="flex items-center justify-between h-full px-6">
          
          {/* Left: Organization Context */}
          <div className="flex items-center gap-4">
            <DropdownMenu open={orgSwitcherOpen} onOpenChange={setOrgSwitcherOpen}>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="flex items-center gap-3 h-10 px-3 hover:bg-muted/50 focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  aria-label="Trocar organização"
                  disabled={orgLoading}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {orgInitials}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex flex-col items-start">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground truncate max-w-[180px]">
                        {currentOrg.name}
                      </span>
                      <Badge className={getTierBadgeStyle(currentOrg.tier || 'free')}>
                        {(currentOrg.tier || 'free').toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge className={getRoleBadgeStyle(userRole)}>
                        {userRole === 'owner' ? 'Dono' : 
                         userRole === 'admin' ? 'Admin' : 'Membro'}
                      </Badge>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {memberLoading ? '...' : memberCount} membros
                      </span>
                    </div>
                  </div>
                  
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent className="w-80" align="start">
                <DropdownMenuLabel className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Organizações
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {organizations.map((org) => {
                  const orgRole = org.role || (org.owner_id === currentUser.id ? 'owner' : 'member')
                  const isCurrentOrg = org.id === currentOrg.id
                  
                  return (
                    <DropdownMenuItem
                      key={org.id}
                      onClick={() => handleOrgSwitch(org.id)}
                      className={`p-3 cursor-pointer ${
                        isCurrentOrg ? 'bg-primary/5' : ''
                      }`}
                      disabled={orgLoading}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                            {org.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">{org.name}</span>
                            {isCurrentOrg ? <Shield className="h-4 w-4 text-primary" /> : null}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Badge className={getRoleBadgeStyle(orgRole)}>
                              {orgRole === 'owner' ? 'Dono' : 
                               orgRole === 'admin' ? 'Admin' : 'Membro'}
                            </Badge>
                            <Badge className={getTierBadgeStyle(org.tier || 'free')}>
                              {(org.tier || 'free').toUpperCase()}
                            </Badge>
                            <span>• {org.member_count || 0} membros</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {org.last_activity || 'Agora'}
                          </p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Center: Command Search */}
          <div className="flex-1 max-w-md mx-6">
            <Button
              variant="outline"
              className="relative w-full justify-start text-sm text-muted-foreground h-9"
              onClick={() => setCommandOpen(true)}
            >
              <Search className="mr-2 h-4 w-4" />
              <span>Buscar leads, clientes, conversas...</span>
              <kbd className="pointer-events-none absolute right-2 top-1.5 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium opacity-100 sm:flex">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative h-9 w-9" disabled={notificationsLoading}>
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 bg-red-500 text-white text-xs">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Badge>
                  )}
                  <span className="sr-only">Notificações</span>
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent className="w-80" align="end">
                <DropdownMenuLabel>Notificações</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {notificationsLoading ? (
                  <DropdownMenuItem className="p-3">
                    <div className="text-center text-sm text-muted-foreground">
                      Carregando notificações...
                    </div>
                  </DropdownMenuItem>
                ) : notifications.length === 0 ? (
                  <DropdownMenuItem className="p-3">
                    <div className="text-center text-sm text-muted-foreground">
                      Nenhuma notificação
                    </div>
                  </DropdownMenuItem>
                ) : (
                  notifications.map((notification) => (
                    <DropdownMenuItem 
                      key={notification.id} 
                      className="p-3 cursor-pointer" 
                      onClick={() => handleNotificationClick(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`h-2 w-2 rounded-full mt-1 ${
                          notification.unread ? 'bg-primary' : 'bg-muted'
                        }`} />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{notification.title}</p>
                          <p className="text-xs text-muted-foreground">{notification.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
                
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-center text-sm text-primary">
                  Ver todas as notificações
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="h-9 w-9"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Alternar tema</span>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={currentUser.avatar_url} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userDisplayName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {currentUser.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem asChild>
                  <div className="flex items-center cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                  </div>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild>
                  <div className="flex items-center cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configurações</span>
                  </div>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Command Dialog */}
      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput placeholder="Digite para buscar..." />
        <CommandList>
          <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
          <CommandGroup heading="Sugestões">
            <CommandItem>
              <Search className="mr-2 h-4 w-4" />
              <span>Buscar leads ativos</span>
            </CommandItem>
            <CommandItem>
              <Users className="mr-2 h-4 w-4" />
              <span>Ver pipeline atual</span>
            </CommandItem>
            <CommandItem>
              <Bell className="mr-2 h-4 w-4" />
              <span>Conversas WhatsApp</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}