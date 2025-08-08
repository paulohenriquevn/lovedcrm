/**
 * Remove member confirmation dialog
 */

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

import { RemoveMemberDialogProps } from '../types/TeamTypes'

export function RemoveMemberDialog({
  member,
  isRemoving,
  onConfirm,
  onCancel,
}: RemoveMemberDialogProps) {
  return (
    <AlertDialog open={!!member} onOpenChange={open => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remover Membro</AlertDialogTitle>
          <AlertDialogDescription>
            Você está prestes a remover{' '}
            <strong>{member?.user?.full_name ?? member?.user?.email ?? 'Usuário'}</strong> da
            organização. Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isRemoving}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isRemoving}>
            {isRemoving ? 'Removendo...' : 'Remover'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
