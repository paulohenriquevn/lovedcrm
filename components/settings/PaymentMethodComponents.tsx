import { CreditCard } from 'lucide-react'

import { PaymentMethod } from '@/types/billing'

// Payment method info component
export function PaymentMethodInfo({ method }: { method: PaymentMethod }): JSX.Element {
  return (
    <div className="flex items-center">
      <CreditCard className="h-5 w-5 text-gray-400 mr-3" />
      <div>
        <p className="font-medium">**** **** **** {method.last4}</p>
        <p className="text-sm text-gray-500">
          {method.brand?.toUpperCase()} • {String(method.exp_month).padStart(2, '0')}/
          {String(method.exp_year)}
        </p>
      </div>
    </div>
  )
}

// Payment method actions component
export function PaymentMethodActions({
  method,
  isDefault,
  onSetDefault,
  onRemove,
}: {
  method: PaymentMethod
  isDefault: boolean
  onSetDefault: (id: string) => void
  onRemove: (id: string) => void
}): JSX.Element {
  return (
    <div className="flex items-center space-x-2">
      {isDefault === true && (
        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Padrão</span>
      )}
      {isDefault === false && (
        <button
          type="button"
          onClick={() => onSetDefault(method.id)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Definir como padrão
        </button>
      )}
      <button
        type="button"
        onClick={() => onRemove(method.id)}
        className="text-sm text-red-600 hover:text-red-800"
      >
        Remover
      </button>
    </div>
  )
}

// Payment method card component
export function PaymentMethodCard({
  method,
  isDefault,
  onSetDefault,
  onRemove,
}: {
  method: PaymentMethod
  isDefault: boolean
  onSetDefault: (id: string) => void
  onRemove: (id: string) => void
}): JSX.Element {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between">
        <PaymentMethodInfo method={method} />
        <PaymentMethodActions
          method={method}
          isDefault={isDefault}
          onSetDefault={onSetDefault}
          onRemove={onRemove}
        />
      </div>
    </div>
  )
}
