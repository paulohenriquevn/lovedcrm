/**
 * Role change confirmation dialog
 */

import { useTranslations } from 'next-intl'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

import { RoleChangeDialogProps } from '../types/TeamTypes'
import { formatRoleDisplay } from '../utils/roleUtils'

export function RoleChangeDialog({
  member,
  newRole,
  isUpdating,
  onConfirm,
  onCancel,
}: RoleChangeDialogProps) {
  const tTeam = useTranslations('admin.team.dialogs')
  const tCommon = useTranslations('common')

  return (
    <AlertDialog open={!!member} onOpenChange={open => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{tTeam('changeRole.title')}</AlertDialogTitle>
          <AlertDialogDescription>
            {tTeam('changeRole.description', {
              name: member?.user?.full_name ?? member?.user?.email ?? tCommon('user'),
              role: formatRoleDisplay(newRole),
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isUpdating}>{tCommon('cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isUpdating}>
            {isUpdating ? tCommon('updating') : tCommon('confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
