/**
 * Formats a date string for invite display
 */
export function formatInviteDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Checks if an invite is expiring within 24 hours
 */
export function isInviteExpiringSoon(expiresAt: string): boolean {
  const expiryDate = new Date(expiresAt)
  const now = new Date()
  const hoursUntilExpiry = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60)
  return hoursUntilExpiry <= 24 && hoursUntilExpiry > 0
}
