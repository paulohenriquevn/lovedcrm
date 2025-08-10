import { useState } from 'react'

import type { OrganizationInviteCreate, OrganizationRole } from '@/types/organization'

interface FormErrors {
  email?: string
  message?: string
  role?: string
}

interface UseInviteFormOptions {
  onSubmit: (data: OrganizationInviteCreate) => void
  userRole: OrganizationRole | string
  _isSubmitting: boolean
}

interface UseInviteFormReturn {
  formData: OrganizationInviteCreate
  errors: FormErrors
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  handleSubmit: (e: React.FormEvent) => void
  updateField: <K extends keyof OrganizationInviteCreate>(
    field: K,
    value: OrganizationInviteCreate[K]
  ) => void
  resetForm: () => void
  canInviteAdmins: boolean
}

const INITIAL_FORM_DATA: OrganizationInviteCreate = {
  email: '',
  role: 'member' as OrganizationRole,
  message: '',
  // eslint-disable-next-line camelcase
  invited_name: '',
}

function validateForm(formData: OrganizationInviteCreate, canInviteAdmins: boolean): FormErrors {
  const errors: FormErrors = {}

  // Email validation
  if (!formData.email?.trim()) {
    errors.email = 'Email é obrigatório'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'Email inválido'
  }

  // Message validation
  if (formData.message && formData.message.trim().length < 10) {
    errors.message = 'Mensagem deve ter pelo menos 10 caracteres'
  }

  // Role validation
  if (String(formData.role) === 'admin' && !canInviteAdmins) {
    errors.role = 'Apenas owners podem convidar admins'
  }

  return errors
}

function sanitizeFormData(formData: OrganizationInviteCreate): OrganizationInviteCreate {
  return {
    ...formData,
    email: formData.email.trim().toLowerCase(),
    message: formData.message?.trim() ?? undefined,
    // eslint-disable-next-line camelcase
    invited_name: formData.invited_name?.trim() ?? undefined,
  }
}

export function useInviteForm({
  onSubmit,
  userRole,
  _isSubmitting,
}: UseInviteFormOptions): UseInviteFormReturn {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState<OrganizationInviteCreate>(INITIAL_FORM_DATA)
  const [errors, setErrors] = useState<FormErrors>({})

  const canInviteAdmins = userRole === 'owner'

  const updateField = <K extends keyof OrganizationInviteCreate>(
    field: K,
    value: OrganizationInviteCreate[K]
  ): void => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    const fieldError = errors[field as keyof FormErrors]
    if (fieldError !== undefined) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const resetForm = (): void => {
    setFormData(INITIAL_FORM_DATA)
    setErrors({})
    setIsOpen(false)
  }

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()

    const validationErrors = validateForm(formData, canInviteAdmins)
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    const sanitizedData = sanitizeFormData(formData)
    onSubmit(sanitizedData)
    resetForm()
  }

  return {
    formData,
    errors,
    isOpen,
    setIsOpen,
    handleSubmit,
    updateField,
    resetForm,
    canInviteAdmins,
  }
}
