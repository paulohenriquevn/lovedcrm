/**
 * Pipeline Data Handlers  
 * Extracted data loading and manipulation logic
 */

import { useState, useEffect, useCallback } from 'react'

import { useAuthStore } from '@/stores/auth'

import { loadLeadsByStage, getErrorMessage } from './pipeline-data-utils'
import { PipelineStageDisplay } from './pipeline-types'

interface DataHandlersReturn {
  stages: PipelineStageDisplay[]
  loading: boolean
  error: string | null
  reloadLeadsData: () => Promise<void>
  setStages: React.Dispatch<React.SetStateAction<PipelineStageDisplay[]>>
  setError: React.Dispatch<React.SetStateAction<string | null>>
}

export function usePipelineDataHandlers(): DataHandlersReturn {
  const [stages, setStages] = useState<PipelineStageDisplay[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user, organization } = useAuthStore()

  const loadData = useCallback(async (): Promise<void> => {
    if (!user || !organization) {
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      const stagesData = await loadLeadsByStage()
      setStages(stagesData)
    } catch (error_) {
      const errorMessage = getErrorMessage(error_)
      setError(`Erro ao carregar dados do pipeline: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }, [user, organization])

  const reloadLeadsData = useCallback(async (): Promise<void> => {
    await loadData()
  }, [loadData])

  useEffect(() => {
    void loadData()
  }, [loadData])

  return {
    stages,
    loading,
    error,
    reloadLeadsData,
    setStages,
    setError
  }
}