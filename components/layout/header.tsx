/**
 * Header - Main Application Header
 * Header principal com contexto organizacional e navegação
 * Baseado na especificação do agente 09-ui-ux-designer.md
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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

interface HeaderProps {
  className?: string
}

// Mock data - in real app, this would come from useOrgContext hook
const currentOrganization = {
  id: '1',
  name: 'Silva Digital Agency',
  logo: '/api/placeholder/32/32',
  tier: 'pro' as const,
  memberCount: 12,
  role: 'owner' as const
}

const currentUser = {
  id: '1',
  name: 'João Silva',
  email: 'joao@silva.digital',
  avatar: '/api/placeholder/32/32'
}

const userOrganizations = [
  {
    id: '1',
    name: 'Silva Digital Agency',
    role: 'owner',
    tier: 'pro',
    lastActivity: '2 min atrás',
    memberCount: 12
  },
  {
    id: '2', 
    name: 'Creative Lab',
    role: 'admin',
    tier: 'enterprise',
    lastActivity: '1 hora atrás',
    memberCount: 28
  },
  {
    id: '3',
    name: 'Start Marketing',
    role: 'member',
    tier: 'free',
    lastActivity: '1 dia atrás',
    memberCount: 3
  }
]

const recentNotifications = [
  {
    id: '1',
    type: 'lead',
    title: 'Novo lead capturado',
    description: 'Maria Santos interessada em marketing digital',
    time: '5 min atrás',
    unread: true
  },
  {
    id: '2',
    type: 'team',
    title: 'Pedro adicionou nova proposta',
    description: 'Proposta para ClienteCorp - R$ 8.500/mês',
    time: '15 min atrás', 
    unread: true
  },
  {
    id: '3',
    type: 'ai',
    title: 'Resumo IA disponível',
    description: 'Análise completa da conversa com TechStart',
    time: '30 min atrás',
    unread: false
  }
]

export function Header({ className }: HeaderProps) {
  const [commandOpen, setCommandOpen] = useState(false)
  const [orgSwitcherOpen, setOrgSwitcherOpen] = useState(false)
  const { setTheme, theme } = useTheme()

  const unreadNotifications = recentNotifications.filter(n => n.unread).length

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-violet-100 text-violet-700 border-violet-200'
      case 'admin':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'member':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getTierBadgeStyle = (tier: string) => {
    switch (tier) {
      case 'free':
        return 'bg-gray-100 text-gray-600 border-gray-200'
      case 'pro':
        return 'bg-violet-100 text-violet-700 border-violet-200'
      case 'enterprise':
        return 'bg-gray-900 text-gray-100 border-gray-800'
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200'
    }
  }

  const handleOrgSwitch = (orgId: string) => {
    // In real app: switchOrganization(orgId)
    console.log('Switching to organization:', orgId)
    setOrgSwitcherOpen(false)
  }

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
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={currentOrganization.logo} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {currentOrganization.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex flex-col items-start">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground truncate max-w-[180px]">
                        {currentOrganization.name}
                      </span>
                      <Badge className={getTierBadgeStyle(currentOrganization.tier)}>
                        {currentOrganization.tier.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge className={getRoleBadgeStyle(currentOrganization.role)}>
                        {currentOrganization.role === 'owner' ? 'Dono' : 
                         currentOrganization.role === 'admin' ? 'Admin' : 'Membro'}
                      </Badge>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {currentOrganization.memberCount} membros
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
                
                {userOrganizations.map((org) => (
                  <DropdownMenuItem
                    key={org.id}
                    onClick={() => handleOrgSwitch(org.id)}
                    className={`p-3 cursor-pointer ${
                      org.id === currentOrganization.id ? 'bg-violet-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                          {org.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{org.name}</span>
                          {org.id === currentOrganization.id && (
                            <Shield className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge className={getRoleBadgeStyle(org.role)}>
                            {org.role === 'owner' ? 'Dono' : 
                             org.role === 'admin' ? 'Admin' : 'Membro'}
                          </Badge>
                          <Badge className={getTierBadgeStyle(org.tier)}>
                            {org.tier.toUpperCase()}
                          </Badge>
                          <span>• {org.memberCount} membros</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {org.lastActivity}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}
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
                <Button variant="ghost" size="sm" className="relative h-9 w-9">
                  <Bell className="h-4 w-4" />
                  {unreadNotifications > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 bg-red-500 text-white text-xs">
                      {unreadNotifications}
                    </Badge>
                  )}
                  <span className="sr-only">Notificações</span>
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent className="w-80" align="end">
                <DropdownMenuLabel>Notificações</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {recentNotifications.map((notification) => (
                  <DropdownMenuItem key={notification.id} className="p-3">
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
                ))}
                
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
                    <AvatarImage src={currentUser.avatar} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {currentUser.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {currentUser.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configurações</span>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem>
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