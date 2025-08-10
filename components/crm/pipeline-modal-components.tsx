/**
 * Pipeline Modal Components
 * Modal components extracted from pipeline-kanban-helpers to reduce file complexity
 */

import { Lead, PipelineStage } from '@/services/crm-leads'

import { LeadCreateModal } from './lead-create-modal'
import { LeadDeleteDialog } from './lead-delete-dialog'
import { LeadDetailsModal } from './lead-details-modal'
import { LeadEditModal } from './lead-edit-modal'

export function PipelineModals({
  isCreateModalOpen,
  onCreateModalClose,
  onCreateSuccess,
  createModalStage,
  isDetailsModalOpen,
  onModalClose,
  selectedLead,
  onEditFromDetails,
  onDeleteFromDetails,
  onFavoriteToggle,
  isEditModalOpen,
  onEditSuccess,
  isDeleteDialogOpen,
  onDeleteSuccess,
}: {
  isCreateModalOpen: boolean
  onCreateModalClose: () => void
  onCreateSuccess: () => void
  createModalStage: PipelineStage | null
  isDetailsModalOpen: boolean
  onModalClose: () => void
  selectedLead: Lead | null
  onEditFromDetails: (lead: Lead) => void
  onDeleteFromDetails: (lead: Lead) => void
  onFavoriteToggle: () => void
  isEditModalOpen: boolean
  onEditSuccess: () => void
  isDeleteDialogOpen: boolean
  onDeleteSuccess: () => void
}): React.ReactElement {
  return (
    <>
      <LeadCreateModal
        isOpen={isCreateModalOpen}
        onClose={onCreateModalClose}
        onSuccess={onCreateSuccess}
        initialStage={createModalStage ?? undefined}
      />
      <LeadDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={onModalClose}
        lead={selectedLead}
        onEdit={onEditFromDetails}
        onDelete={onDeleteFromDetails}
        onFavoriteToggle={onFavoriteToggle}
      />
      <LeadEditModal
        isOpen={isEditModalOpen}
        onClose={onModalClose}
        onSuccess={onEditSuccess}
        lead={selectedLead}
      />
      <LeadDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={onModalClose}
        onSuccess={onDeleteSuccess}
        lead={selectedLead}
      />
    </>
  )
}
