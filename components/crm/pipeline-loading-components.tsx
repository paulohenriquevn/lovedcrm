/**
 * Pipeline Loading Components
 * Loading states and error components extracted for better organization
 */

import { motion } from 'framer-motion'
import { AlertCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { useUXEnhancements } from './pipeline-ux-enhancements'

export function LoadingState({ className }: { className?: string }): React.ReactElement {
  const { detectReducedMotion } = useUXEnhancements()
  const reducedMotion = detectReducedMotion()

  return (
    <div className={cn('h-full p-4', className)}>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 h-full">
        {Array.from({ length: 5 }, (_, i) => (
          <motion.div
            key={i}
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.3,
              delay: reducedMotion ? 0 : i * 0.1, // Stagger animation
            }}
            className="space-y-3"
          >
            {/* Stage header skeleton */}
            <div className="bg-muted/50 rounded-lg p-3 animate-pulse">
              <div className="h-4 bg-muted rounded w-24 mb-2" />
              <div className="h-3 bg-muted rounded w-8" />
            </div>

            {/* Lead cards skeletons */}
            {Array.from({ length: 3 }, (_, j) => (
              <motion.div
                key={j}
                initial={reducedMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  duration: 0.3,
                  delay: reducedMotion ? 0 : i * 0.1 + j * 0.05,
                }}
                className="bg-card border border-border rounded-lg p-4 animate-pulse"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="h-4 bg-muted rounded flex-1 max-w-[120px]" />
                    <div className="h-4 w-4 bg-muted rounded" />
                  </div>
                  <div className="h-3 bg-muted rounded w-20" />
                  <div className="h-3 bg-muted rounded w-16" />
                  <div className="flex gap-1">
                    <div className="h-6 bg-muted rounded flex-1" />
                    <div className="h-6 bg-muted rounded flex-1" />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export function ErrorState({
  error,
  className,
}: {
  error: string
  className?: string
}): React.ReactElement {
  return (
    <div className={cn('h-full flex items-center justify-center', className)}>
      <div className="text-center">
        <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 mb-4">{error}</p>
        <Button type="button" variant="outline" onClick={() => window.location.reload()}>
          Tentar novamente
        </Button>
      </div>
    </div>
  )
}
