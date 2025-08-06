import { FileText } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Invoice } from '@/types/billing'

import { getInvoiceStatusConfig } from './BillingHelpers'

// Invoice status badge component
export function InvoiceStatusBadge({ status }: { status: string }): JSX.Element {
  const { variant, label } = getInvoiceStatusConfig(status)
  return (
    <Badge variant={variant}>
      {label}
    </Badge>
  )
}

// Invoice table header component - using shadcn Table
function InvoiceTableHeader(): JSX.Element {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Data</TableHead>
        <TableHead>Valor</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Ações</TableHead>
      </TableRow>
    </TableHeader>
  )
}

// Invoice row component - using shadcn Table
function InvoiceRow({ invoice }: { invoice: Invoice }): JSX.Element {
  return (
    <TableRow>
      <TableCell>
        {new Date(String(invoice.created_at)).toLocaleDateString('pt-BR')}
      </TableCell>
      <TableCell>
        R$ {(Number(invoice.amount) / 100).toFixed(2)}
      </TableCell>
      <TableCell>
        <InvoiceStatusBadge status={invoice.status} />
      </TableCell>
      <TableCell>
        <Button variant="ghost" size="sm" asChild>
          <a
            href={String(invoice.invoice_pdf)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FileText className="h-4 w-4 mr-1" />
            Download
          </a>
        </Button>
      </TableCell>
    </TableRow>
  )
}

// Invoices table component - using shadcn Table
function InvoicesTable({ invoices }: { invoices: Invoice[] }): JSX.Element {
  return (
    <Table>
      <InvoiceTableHeader />
      <TableBody>
        {invoices.map(invoice => (
          <InvoiceRow key={invoice.id} invoice={invoice} />
        ))}
      </TableBody>
    </Table>
  )
}

// Invoices section component
export function InvoicesSection({ invoices }: { invoices: Invoice[] }): JSX.Element {
  return (
    <div className="pt-8 border-t">
      <h2 className="text-xl font-bold mb-4">Faturas</h2>
      {invoices.length === 0 ? (
        <p className="text-gray-600">Nenhuma fatura encontrada.</p>
      ) : (
        <InvoicesTable invoices={invoices} />
      )}
    </div>
  )
}
