/**
 * Date formatting utilities for team management
 */

export const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export const formatLastLogin = (dateStr: string | null): string => {
  if (dateStr === null || dateStr === '') {
    return 'Nunca'
  }

  const date = new Date(dateStr)
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

  if (diffInHours < 1) {
    return 'Agora'
  }
  if (diffInHours < 24) {
    return `${diffInHours}h atrás`
  }
  if (diffInHours < 168) {
    return `${Math.floor(diffInHours / 24)}d atrás`
  }

  return formatDate(dateStr)
}
