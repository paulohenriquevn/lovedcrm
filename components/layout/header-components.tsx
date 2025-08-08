/**
 * Header Components - Extracted header components
 * Reduces header.tsx complexity and file length
 */

'use client'

import { Search, Bell, Settings, User, LogOut, Moon, Sun, ChevronDown, Building2, Shield, Users } from 'lucide-react'

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
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

import { getRoleBadgeStyle, getTierBadgeStyle, type SafeOrganization } from './header-utils'

interface SearchCommandProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchCommand({ open, onOpenChange }: SearchCommandProps): JSX.Element {
  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Buscar..." />
      <CommandList>
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
        <CommandGroup heading="Sugestões">
          <CommandItem>
            <Search className="mr-2 h-4 w-4" />
            <span>Leads recentes</span>
          </CommandItem>
          <CommandItem>
            <Users className="mr-2 h-4 w-4" />
            <span>Equipe</span>
          </CommandItem>
          <CommandItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Configurações</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}

interface NotificationButtonProps {
  unreadCount: number
  onClick: () => void
}

export function NotificationButton({ unreadCount, onClick }: NotificationButtonProps): JSX.Element {
  return (
    <Button variant="ghost" size="sm" className="relative" onClick={onClick}>
      <Bell className="h-4 w-4" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
      <span className="sr-only">Notificações</span>
    </Button>
  )
}

interface ThemeToggleProps {
  theme: string | undefined
  onToggle: () => void
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps): JSX.Element {
  return (
    <Button variant="ghost" size="sm" onClick={onToggle}>
      {theme === 'dark' ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
      <span className="sr-only">Alternar tema</span>
    </Button>
  )
}

interface OrgSwitcherProps {
  organizations: SafeOrganization[]
  currentOrg: SafeOrganization
  memberCount: number
  memberLoading: boolean
  onOrgSwitch: (orgId: string) => void
}

// Move formatCount outside component to avoid function scoping warning
const formatCount = (count: number, loading: boolean): string => {
  return loading ? '...' : count.toString()
}

export function OrgSwitcher({ 
  organizations, 
  currentOrg, 
  memberCount, 
  memberLoading, 
  onOrgSwitch 
}: OrgSwitcherProps): JSX.Element {

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-10 justify-start gap-2 px-3">
          <div className="flex items-center gap-2 min-w-0">
            <Building2 className="h-4 w-4 shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate font-medium text-sm">
                  {currentOrg.name}
                </span>
                <Badge 
                  className={`text-xs ${getTierBadgeStyle(currentOrg.tier)}`}
                  variant="secondary"
                >
                  {currentOrg.tier.toUpperCase()}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                {formatCount(memberCount, memberLoading)} membros
              </div>
            </div>
          </div>
          <ChevronDown className="h-4 w-4 shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-80">
        <DropdownMenuLabel>Organização Atual</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {organizations.map((org) => (
          <DropdownMenuItem 
            key={org.id} 
            onClick={() => onOrgSwitch(org.id)}
            className={org.id === currentOrg.id ? 'bg-muted' : ''}
          >
            <div className="flex items-center gap-3 w-full">
              <Building2 className="h-4 w-4" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium">{org.name}</span>
                  <Badge 
                    className={getTierBadgeStyle(org.tier)}
                    variant="secondary"
                  >
                    {org.tier.toUpperCase()}
                  </Badge>
                </div>
              </div>
              {org.id === currentOrg.id && (
                <Shield className="h-4 w-4 text-green-600" />
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

interface UserMenuProps {
  user: { fullName?: string; email?: string; role?: string } | null
  displayName: string
  userInitials: string
  onLogout: () => void
}

export function UserMenu({ user, displayName, userInitials, onLogout }: UserMenuProps): JSX.Element {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-10 gap-2 px-3">
          <Avatar className="h-7 w-7">
            <AvatarImage src={user?.email} alt={displayName} />
            <AvatarFallback className="text-xs">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:flex flex-col items-start">
            <span className="text-sm font-medium truncate max-w-32">
              {displayName}
            </span>
{Boolean(user?.role) && (
              <Badge 
                className={`${getRoleBadgeStyle(user.role ?? '')} text-xs`}
                variant="secondary"
              >
                {user.role}
              </Badge>
            )}
          </div>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
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
        <DropdownMenuItem onClick={onLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}