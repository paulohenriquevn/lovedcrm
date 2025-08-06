/**
 * Main Layout - Complete CRM Layout with Header + Sidebar
 * Layout principal com header organizacional e sidebar CRM
 * Baseado na especificação do agente 09-ui-ux-designer.md
 */

'use client'

import { cn } from '@/lib/utils'

import { Header } from './header'
import { Sidebar } from './sidebar'

interface MainLayoutProps {
  children: React.ReactNode
  className?: string
}

export function MainLayout({ children, className }: MainLayoutProps): JSX.Element {
  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <Header />
      
      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content */}
        <main className={cn(
          "flex-1 overflow-auto bg-background",
          className
        )}>
          <div className="h-full p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}