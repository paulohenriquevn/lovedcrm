import { useState } from 'react'

interface UsePasswordModalReturn {
  isPasswordModalOpen: boolean
  handlePasswordModalOpen: () => void
  handlePasswordModalClose: () => void
}

export function usePasswordModal(): UsePasswordModalReturn {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)

  const handlePasswordModalOpen = (): void => {
    setIsPasswordModalOpen(true)
  }

  const handlePasswordModalClose = (): void => {
    setIsPasswordModalOpen(false)
  }

  return {
    isPasswordModalOpen,
    handlePasswordModalOpen,
    handlePasswordModalClose,
  }
}
