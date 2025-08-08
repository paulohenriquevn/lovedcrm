/**
 * Pipeline Handlers
 * Event handlers and business logic for pipeline operations
 */

import { useState } from 'react'

import { Lead, PipelineStage } from '@/services/crm-leads'

import { usePipelineDragLogic } from './pipeline-drag-logic'
import { DragParams } from './pipeline-types'

interface PipelineHandlersReturn {
  // State
  draggedLead: Lead | null
  selectedLead: Lead | null
  isCreateModalOpen: boolean
  createModalStage: PipelineStage
  isDetailsModalOpen: boolean
  isEditModalOpen: boolean
  isDeleteDialogOpen: boolean

  // Handlers
  handleDragStart: (lead: Lead) => void
  handleDrop: (params: DragParams) => Promise<void>
  handleAddLead: (stageId?: string) => void
  handleCreateSuccess: () => void
  handleModalClose: () => void
  handleCreateModalClose: () => void
  handleEditSuccess: () => void
  handleDeleteSuccess: () => void
  handleFavoriteToggle: () => void
  handleEditFromDetails: (lead: Lead) => void
  handleDeleteFromDetails: (lead: Lead) => void
  handleViewDetails: (lead: Lead) => void
  handleEditLead: (lead: Lead) => void
  handleSendEmail: (lead: Lead) => void
  handleRemoveLead: (lead: Lead) => void
  handleCall: (lead: Lead) => void
  handleWhatsApp: (lead: Lead) => void
}

// Helper function for contact validation
function hasValidEmail(lead: Lead): boolean {
  return lead.email !== null && lead.email !== undefined && lead.email !== ''
}

// Helper function for phone validation
function hasValidPhone(lead: Lead): boolean {
  return lead.phone !== null && lead.phone !== undefined && lead.phone !== ''
}

// Helper function for email handling
function openEmailClient(lead: Lead): void {
  if (hasValidEmail(lead)) {
    window.open(`mailto:${lead.email}`, '_blank')
  } else {
    alert(`Lead ${lead.name} não possui email cadastrado`)
  }
}

// Helper function for phone call handling
function initiatePhoneCall(lead: Lead): void {
  if (hasValidPhone(lead) && typeof lead.phone === 'string') {
    window.open(`tel:${lead.phone}`, '_self')
  } else {
    alert(`Lead ${lead.name} não possui telefone cadastrado`)
  }
}

// Helper function for WhatsApp handling
function openWhatsApp(lead: Lead): void {
  if (hasValidPhone(lead) && typeof lead.phone === 'string') {
    const cleanPhone = lead.phone.replaceAll(/\D/g, '')
    const message = encodeURIComponent(`Olá ${lead.name}, tudo bem?`)
    window.open(`https://wa.me/55${cleanPhone}?text=${message}`, '_blank')
  } else {
    alert(`Lead ${lead.name} não possui telefone cadastrado`)
  }
}

// Hook for modal state management
function useModalStates(): {
  modalState: {
    isCreateModalOpen: boolean
    createModalStage: PipelineStage
    isDetailsModalOpen: boolean
    isEditModalOpen: boolean
    isDeleteDialogOpen: boolean
    selectedLead: Lead | null
  }
  modalActions: {
    setIsCreateModalOpen: (open: boolean) => void
    setCreateModalStage: (stage: PipelineStage) => void
    setIsDetailsModalOpen: (open: boolean) => void
    setIsEditModalOpen: (open: boolean) => void
    setIsDeleteDialogOpen: (open: boolean) => void
    setSelectedLead: (lead: Lead | null) => void
    closeAllModals: () => void
  }
} {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [createModalStage, setCreateModalStage] = useState<PipelineStage>(PipelineStage.LEAD)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

  const closeAllModals = (): void => {
    setSelectedLead(null)
    setIsDetailsModalOpen(false)
    setIsEditModalOpen(false)
    setIsDeleteDialogOpen(false)
  }

  return {
    modalState: {
      isCreateModalOpen,
      createModalStage,
      isDetailsModalOpen,
      isEditModalOpen,
      isDeleteDialogOpen,
      selectedLead,
    },
    modalActions: {
      setIsCreateModalOpen,
      setCreateModalStage,
      setIsDetailsModalOpen,
      setIsEditModalOpen,
      setIsDeleteDialogOpen,
      setSelectedLead,
      closeAllModals,
    },
  }
}

export function usePipelineHandlers(reloadLeadsData: () => Promise<void>): PipelineHandlersReturn {
  const { modalState, modalActions } = useModalStates()
  const { draggedLead, handleDragStart, handleDrop } = usePipelineDragLogic(reloadLeadsData)

  const handleAddLead = (stageId?: string): void => {
    const targetStage =
      stageId !== null && stageId !== undefined ? (stageId as PipelineStage) : PipelineStage.LEAD
    modalActions.setCreateModalStage(targetStage)
    modalActions.setIsCreateModalOpen(true)
  }

  const handleCreateSuccess = (): void => {
    void reloadLeadsData()
  }

  const handleModalClose = (): void => {
    modalActions.closeAllModals()
  }

  const handleCreateModalClose = (): void => {
    modalActions.setIsCreateModalOpen(false)
  }

  const handleEditSuccess = (): void => {
    void reloadLeadsData()
  }

  const handleDeleteSuccess = (): void => {
    void reloadLeadsData()
  }

  const handleFavoriteToggle = (): void => {
    void reloadLeadsData()
  }

  const handleEditFromDetails = (lead: Lead): void => {
    modalActions.setIsDetailsModalOpen(false)
    modalActions.setSelectedLead(lead)
    modalActions.setIsEditModalOpen(true)
  }

  const handleDeleteFromDetails = (lead: Lead): void => {
    modalActions.setIsDetailsModalOpen(false)
    modalActions.setSelectedLead(lead)
    modalActions.setIsDeleteDialogOpen(true)
  }

  const handleViewDetails = (lead: Lead): void => {
    modalActions.setSelectedLead(lead)
    modalActions.setIsDetailsModalOpen(true)
  }

  const handleEditLead = (lead: Lead): void => {
    modalActions.setSelectedLead(lead)
    modalActions.setIsEditModalOpen(true)
  }

  const handleRemoveLead = (lead: Lead): void => {
    modalActions.setSelectedLead(lead)
    modalActions.setIsDeleteDialogOpen(true)
  }

  return {
    // State
    draggedLead,
    selectedLead: modalState.selectedLead,
    isCreateModalOpen: modalState.isCreateModalOpen,
    createModalStage: modalState.createModalStage,
    isDetailsModalOpen: modalState.isDetailsModalOpen,
    isEditModalOpen: modalState.isEditModalOpen,
    isDeleteDialogOpen: modalState.isDeleteDialogOpen,

    // Handlers
    handleDragStart,
    handleDrop,
    handleAddLead,
    handleCreateSuccess,
    handleModalClose,
    handleCreateModalClose,
    handleEditSuccess,
    handleDeleteSuccess,
    handleFavoriteToggle,
    handleEditFromDetails,
    handleDeleteFromDetails,
    handleViewDetails,
    handleEditLead,
    handleSendEmail: openEmailClient,
    handleRemoveLead,
    handleCall: initiatePhoneCall,
    handleWhatsApp: openWhatsApp,
  }
}
