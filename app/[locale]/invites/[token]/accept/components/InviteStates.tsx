import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

function StateCard({
  icon,
  title,
  message,
  button,
}: {
  icon: React.ReactNode
  title: string
  message: string
  button?: React.ReactNode
}): JSX.Element {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full">
        <Card className="w-full">
          <CardContent className="p-6">
            <div className="text-center">
              {icon}
              <h1 className="text-xl font-semibold text-gray-900 mb-2">{title}</h1>
              <p className="text-gray-600 mb-4">{message}</p>
              {button}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export function LoadingState(): JSX.Element {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">Carregando convite...</p>
      </div>
    </div>
  )
}

export function ErrorState({ error, onGoHome }: { error: string; onGoHome: () => void }): JSX.Element {
  return (
    <StateCard
      icon={<XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />}
      title="Erro"
      message={error}
      button={
        <Button onClick={onGoHome} className="w-full">
          Ir para página inicial
        </Button>
      }
    />
  )
}

export function ResultState({ result }: { result: { type: 'success' | 'error'; message: string } }): JSX.Element {
  const isSuccess = result.type === 'success'
  return (
    <StateCard
      icon={
        isSuccess ? (
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
        ) : (
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        )
      }
      title={isSuccess ? 'Sucesso!' : 'Erro'}
      message={result.message}
      button={
        <Button onClick={() => (window.location.href = '/')} className="w-full">
          Ir para página inicial
        </Button>
      }
    />
  )
}

export function ConditionalStateRenderer({
  loading,
  error,
  result,
}: {
  loading: boolean
  error: string | null
  result: { type: 'success' | 'error'; message: string } | null
}): JSX.Element | null {
  if (loading) {
    return <LoadingState />
  }
  if (error !== null) {
    return <ErrorState error={error} onGoHome={() => {}} />
  }
  if (result !== null) {
    return <ResultState result={result} />
  }
  return null
}