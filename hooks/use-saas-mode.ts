/**
 * Hook para detectar o modo SaaS (B2B only) baseado em environment variables.
 *
 * Este hook sempre retorna B2B mode, pois o sistema agora é exclusivamente B2B.
 */

export type SaasMode = 'B2B'

export interface UseSaasModeReturn {
  /** Modo atual do SaaS (sempre B2B) */
  mode: SaasMode
  /** True se estiver em modo B2B (sempre true) */
  isB2B: boolean
}

/**
 * Hook para detectar o modo SaaS atual.
 *
 * @returns {UseSaasModeReturn} Objeto com informações do modo SaaS
 *
 * @example
 * ```tsx
 * function DashboardHeader() {
 *   const { isB2B, mode } = useSaasMode()
 *
 *   return (
 *     <h1>Team Dashboard</h1>
 *   )
 * }
 * ```
 */
export function useSaasMode(): UseSaasModeReturn {
  return {
    mode: 'B2B',
    isB2B: true,
  }
}
