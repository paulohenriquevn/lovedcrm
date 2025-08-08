// Status config helper function using shadcn Badge variants
export function getInvoiceStatusConfig(status: string): {
  variant: 'default' | 'secondary' | 'destructive'
  label: string
} {
  switch (status) {
    case 'paid': {
      return { variant: 'default', label: 'Pago' }
    }
    case 'open': {
      return { variant: 'secondary', label: 'Aberto' }
    }
    default: {
      return { variant: 'destructive', label: 'Cancelado' }
    }
  }
}
