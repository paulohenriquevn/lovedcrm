/**
 * Team page header component
 */

import { Mail } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'

interface TeamPageHeaderProps {
  onNavigateToInvites: () => void
}

export function TeamPageHeader({ onNavigateToInvites }: TeamPageHeaderProps) {
  const tTeam = useTranslations('admin.team')

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between w-full">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{tTeam('title')}</h1>
          <p className="text-sm text-muted-foreground">{tTeam('subtitle')}</p>
        </div>

        <div className="flex gap-2 items-center">
          <Button
            variant="default"
            size="default"
            onClick={onNavigateToInvites}
            className="h-10 px-4 text-sm font-medium gap-2"
          >
            <Mail className="h-4 w-4" />
            {tTeam('manageInvites')}
          </Button>
        </div>
      </div>
    </div>
  )
}
