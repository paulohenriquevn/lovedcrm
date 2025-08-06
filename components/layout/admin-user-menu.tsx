'use client'

import { LogOut, Settings, User } from 'lucide-react'
import Link from 'next/link'
import * as React from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
}

function UserHeader({
  user,
  userDisplayName,
}: {
  user: User
  userDisplayName: string
}): JSX.Element {
  return (
    <DropdownMenuLabel className="font-normal">
      <div className="flex flex-col space-y-1">
        <p className="text-sm font-medium leading-none">{userDisplayName}</p>
        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
      </div>
    </DropdownMenuLabel>
  )
}

function NavigationItems(): JSX.Element {
  return (
    <>
      <DropdownMenuItem asChild>
        <Link href="/admin/profile">
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link href="/admin/settings">
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </Link>
      </DropdownMenuItem>
    </>
  )
}

function LogoutItem({ onLogout }: { onLogout: () => Promise<void> }): JSX.Element {
  const handleLogout = async (): Promise<void> => {
    await onLogout()
  }

  return (
    <DropdownMenuItem
      className="cursor-pointer"
      onSelect={() => {
        void handleLogout()
      }}
    >
      <LogOut className="mr-2 h-4 w-4" />
      <span>Log out</span>
    </DropdownMenuItem>
  )
}

function UserDropdownContent({
  user,
  userDisplayName,
  onLogout,
}: {
  user: User
  userDisplayName: string
  onLogout: () => Promise<void>
}): JSX.Element {
  return (
    <DropdownMenuContent className="w-56" align="end" forceMount>
      <UserHeader user={user} userDisplayName={userDisplayName} />
      <DropdownMenuSeparator />
      <NavigationItems />
      <DropdownMenuSeparator />
      <LogoutItem onLogout={onLogout} />
    </DropdownMenuContent>
  )
}

function UserAvatarTrigger({
  user,
  userDisplayName,
}: {
  user: User
  userDisplayName: string
}): JSX.Element {
  const initials = userDisplayName
    .split(' ')
    .map(name => name[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.avatar_url} alt={userDisplayName} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </Button>
    </DropdownMenuTrigger>
  )
}

export function UserDropdownMenu({
  user,
  onLogout,
}: {
  user: User
  onLogout: () => Promise<void>
}): JSX.Element {
  const userDisplayName = user.full_name ?? user.email?.split('@')[0] ?? 'User'

  return (
    <DropdownMenu>
      <UserAvatarTrigger user={user} userDisplayName={userDisplayName} />
      <UserDropdownContent user={user} userDisplayName={userDisplayName} onLogout={onLogout} />
    </DropdownMenu>
  )
}
