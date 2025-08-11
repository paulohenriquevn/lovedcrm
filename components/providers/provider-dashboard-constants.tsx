/**
 * Provider Dashboard Constants
 *
 * Constants and type definitions for the Provider Dashboard component.
 */

/**
 * Provider type information with friendly names and icons
 * Using proper camelCase naming for object keys
 */
export const PROVIDER_TYPE_INFO: Record<string, { name: string; icon: string }> = {
  whatsapp: { name: 'WhatsApp', icon: '📱' },
  gmail: { name: 'Gmail', icon: '✉️' },
  outlook: { name: 'Outlook', icon: '📧' },
  twilio: { name: 'Twilio Voice', icon: '📞' },
  voipProvider: { name: 'VoIP', icon: '☎️' },
  emailProvider: { name: 'Email', icon: '📬' },
}

/**
 * Legacy provider type mappings for backward compatibility with API responses
 * These keys use underscores as they come from the API
 */
// eslint-disable-next-line camelcase
const LEGACY_PROVIDER_MAPPINGS: Record<string, string> = {
  // eslint-disable-next-line camelcase
  voip_provider: 'voipProvider',
  // eslint-disable-next-line camelcase
  email_provider: 'emailProvider',
}

/**
 * Gets provider type information, with fallback for unknown types
 */
export function getProviderTypeInfo(providerType: string): { name: string; icon: string } {
  // First check for direct match
  const directMatch = PROVIDER_TYPE_INFO[providerType]
  if (directMatch) {
    return directMatch
  }

  // Check legacy mappings
  const legacyKey = LEGACY_PROVIDER_MAPPINGS[providerType]
  if (legacyKey !== null && legacyKey !== undefined) {
    const legacyInfo = PROVIDER_TYPE_INFO[legacyKey]
    if (legacyInfo) {
      return legacyInfo
    }
  }

  // Fallback for unknown types
  return {
    name: providerType.charAt(0).toUpperCase() + providerType.slice(1),
    icon: '🔗',
  }
}
