/**
 * Componente para exibir mensagens de erro.
 */
'use client'

import { AlertCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface ErrorMessageProps {
  message: string
  onRetry?: () => void
  className?: string
}

export function ErrorMessage({ message, onRetry, className }: ErrorMessageProps): JSX.Element {
  return (
    <div className={`flex flex-col items-center justify-center p-6 ${className}`}>
      <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
      <p className="text-center text-gray-700 mb-4">{message}</p>
      {onRetry ? (
        <Button onClick={onRetry} variant="outline">
          Tentar Novamente
        </Button>
      ) : null}
    </div>
  )
}
