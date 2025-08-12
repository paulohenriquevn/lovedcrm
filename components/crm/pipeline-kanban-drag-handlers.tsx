/**
 * Pipeline Kanban Drag Handlers
 * Extracted drag and drop handlers to reduce file complexity
 */

export function useDragHandlers(
  setIsDropZoneActive: React.Dispatch<React.SetStateAction<boolean>>,
  onDrop: (stageId: string) => void,
  stageId: string
): {
  handleDragEnter: (e: React.DragEvent) => void
  handleDragLeave: (e: React.DragEvent) => void
  handleDropEnhanced: (e: React.DragEvent) => void
} {
  const handleDragEnter = (e: React.DragEvent): void => {
    e.preventDefault()
    setIsDropZoneActive(true)
  }

  const handleDragLeave = (e: React.DragEvent): void => {
    e.preventDefault()
    if (e.currentTarget.contains(e.relatedTarget as Node)) {
      return
    }
    setIsDropZoneActive(false)
  }

  const handleDropEnhanced = (e: React.DragEvent): void => {
    e.preventDefault()
    setIsDropZoneActive(false)
    onDrop(stageId)
  }

  return { handleDragEnter, handleDragLeave, handleDropEnhanced }
}

export const handleDragOver = (e: React.DragEvent): void => {
  e.preventDefault()
}
