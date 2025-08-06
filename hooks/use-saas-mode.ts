/**
 * Hook para detectar o modo SaaS (B2B ou B2C) baseado em environment variables.
 *
 * Este hook lê a variável NEXT_PUBLIC_SAAS_MODE e fornece utilities para
 * adaptar a UI baseada no modo configurado.
 */

export type SaasMode = 'B2B' | 'B2C'

export interface UseSaasModeReturn {
  /** Modo atual do SaaS (B2B ou B2C) */
  mode: SaasMode
  /** True se estiver em modo B2C (individual/personal) */
  isB2C: boolean
  /** True se estiver em modo B2B (team/collaborative) */
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
 *   const { isB2C, isB2B, mode } = useSaasMode()
 *
 *   return (
 *     <h1>
 *       {isB2C ? 'My Dashboard' : 'Team Dashboard'}
 *     </h1>
 *   )
 * }
 * ```
 */
export function useSaasMode(): UseSaasModeReturn {
  // Lê a variável de ambiente, defaulta para B2C se não definida
  const mode = (process.env.NEXT_PUBLIC_SAAS_MODE || 'B2C') as SaasMode

  // Valida se o modo é válido, fallback para B2C
  const validMode = mode === 'B2B' || mode === 'B2C' ? mode : 'B2C'

  return {
    mode: validMode,
    isB2C: validMode === 'B2C',
    isB2B: validMode === 'B2B',
  }
}
