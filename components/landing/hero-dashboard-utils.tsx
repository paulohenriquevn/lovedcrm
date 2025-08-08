/**
 * Hero Dashboard Utils - Dashboard-related components
 * Extracted from hero-section-components.tsx to reduce file length
 */

'use client'

import { motion } from 'framer-motion'

function TimelineSection(): JSX.Element {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h4 className="text-sm font-medium mb-3">Timeline Recente</h4>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-whatsapp rounded-full flex items-center justify-center">
            <span className="text-white text-xs">W</span>
          </div>
          <div className="flex-1 text-xs text-muted-foreground">
            Cliente interessado em marketing digital...
          </div>
          <span className="text-xs text-muted-foreground/60">5min</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-ai-summary rounded-full flex items-center justify-center">
            <span className="text-white text-xs">IA</span>
          </div>
          <div className="flex-1 text-xs text-muted-foreground">
            Resumo automático gerado: Lead qualificado, orçamento R$ 5k/mês
          </div>
          <span className="text-xs text-muted-foreground/60">8min</span>
        </div>
      </div>
    </div>
  )
}

function FeatureHighlights(): JSX.Element {
  return (
    <>
      <motion.div 
        className="absolute top-20 left-4 bg-primary text-primary-foreground px-3 py-1 rounded-lg text-sm font-medium"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.5, duration: 0.5 }}
      >
        Pipeline Kanban
      </motion.div>
      <motion.div 
        className="absolute top-20 right-4 bg-whatsapp text-white px-3 py-1 rounded-lg text-sm font-medium"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.7, duration: 0.5 }}
      >
        WhatsApp Integrado
      </motion.div>
      <motion.div 
        className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-ai-summary text-white px-3 py-1 rounded-lg text-sm font-medium"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.9, duration: 0.5 }}
      >
        IA Assistente
      </motion.div>
    </>
  )
}

export { TimelineSection, FeatureHighlights }