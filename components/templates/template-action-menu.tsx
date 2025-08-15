/**
 * Template Action Menu
 * Dropdown menu component extracted from TemplateActions
 */

import { Edit, MoreVertical, Star, StarOff, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import type { MessageTemplate } from '@/types/template'

interface TemplateActionMenuProps {
  template: MessageTemplate
  onEdit?: (template: MessageTemplate) => void
  onDelete?: (template: MessageTemplate) => void
  onToggleFavorite?: (template: MessageTemplate) => void
}

export function TemplateActionMenu({
  template,
  onEdit,
  onDelete,
  onToggleFavorite,
}: TemplateActionMenuProps): React.ReactElement {
  const handleEdit = (): void => {
    onEdit?.(template)
  }

  const handleDelete = (): void => {
    onDelete?.(template)
  }

  const handleToggleFavorite = (): void => {
    onToggleFavorite?.(template)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreVertical className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {onToggleFavorite !== null && onToggleFavorite !== undefined && (
          <>
            <DropdownMenuItem onClick={handleToggleFavorite}>
              {template.is_favorite === true ? (
                <>
                  <StarOff className="mr-2 h-4 w-4" />
                  Remover dos favoritos
                </>
              ) : (
                <>
                  <Star className="mr-2 h-4 w-4" />
                  Adicionar aos favoritos
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {onEdit !== null && (
          <DropdownMenuItem onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
        )}

        {onDelete !== null && (
          <DropdownMenuItem
            onClick={handleDelete}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
