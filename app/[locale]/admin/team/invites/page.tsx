'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { InviteManagement } from '@/components/organizations/InviteManagement'
import { Button } from '@/components/ui/button'
import { OrganizationRole } from '@/types/organization'

export default function TeamInvitesPage() {
  const router = useRouter()

  return (
    <div className="w-full h-full space-y-6">
      {/* Header */}
      <div className="w-full space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between w-full">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="default"
              onClick={() => router.back()}
              className="h-8 px-3 text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>

            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">Convites da Equipe</h1>
              <p className="text-sm text-muted-foreground">
                Gerencie convites pendentes e histórico de convites
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Invite Management Component */}
      <div className="w-full space-y-4">
        <InviteManagement userRole={OrganizationRole.ADMIN} isUpdating={false} />
      </div>
    </div>
  )
}
