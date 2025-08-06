'use client'

import { Menu, ChevronLeft, ChevronRight } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useSidebarStore } from '@/stores/sidebar'

import { AdminNavigation, MobileNavigation } from './admin-navigation'

export function AdminSidebar(): JSX.Element {
  const { isCollapsed, toggleSidebar } = useSidebarStore()

  return (
    <div className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center justify-between border-b px-4 lg:h-[60px] lg:px-6">
          {!isCollapsed && <h2 className="text-lg font-semibold">Admin</h2>}
          <Button
            onClick={toggleSidebar}
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            title={isCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
        <div className="flex-1">
          <AdminNavigation />
        </div>
      </div>
    </div>
  )
}

export function MobileSidebar(): JSX.Element {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="shrink-0 md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <h2 className="text-lg font-semibold">Admin</h2>
        </div>
        <MobileNavigation />
      </SheetContent>
    </Sheet>
  )
}
