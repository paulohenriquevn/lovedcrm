import { Button } from '@/components/ui/button'

// Form actions props interface
interface FormActionsProps {
  isEditing: boolean
  onEdit: () => void
  onCancel: () => void
  onSave: () => void
  isLoading: boolean
}

// Form actions component
export function FormActions(props: FormActionsProps): JSX.Element {
  const { isEditing, onEdit, onCancel, onSave, isLoading } = props
  return (
    <div className="flex justify-end space-x-3">
      {isEditing ? (
        <>
          <Button variant="outline" type="button" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="button" onClick={onSave} disabled={isLoading}>
            {isLoading ? 'Salvando...' : 'Salvar alterações'}
          </Button>
        </>
      ) : (
        <Button type="button" onClick={onEdit}>
          Editar perfil
        </Button>
      )}
    </div>
  )
}
