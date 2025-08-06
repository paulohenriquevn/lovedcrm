'use client'

import { usePathname } from 'next/navigation'

import { useAuthStore } from '@/stores/auth'

import { Navbar } from './navbar'

export function ConditionalNavbar(): JSX.Element | null {
  const pathname = usePathname()
  const { user } = useAuthStore()

  // Não mostrar navbar em páginas admin quando logado (considera estrutura localizada)
  if (pathname.includes('/admin') && user) {
    return null
  }

  // Mostrar navbar em páginas públicas ou quando não logado
  return <Navbar />
}
