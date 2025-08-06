'use client'

import * as React from 'react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

interface SimpleDataTableProps {
  headers: string[]
  data: Array<Record<string, React.ReactNode>>
  className?: string
  emptyMessage?: string
  isLoading?: boolean
}

function DataTableSkeleton({
  headers,
  className,
}: {
  headers: string[]
  className?: string
}): JSX.Element {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {headers.map(header => (
                <TableHead key={`skeleton-header-${header}`}>
                  <div className="h-4 bg-muted animate-pulse rounded" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }, (_, rowIndex) => (
              <TableRow key={`skeleton-row-${rowIndex}`}>
                {headers.map(header => (
                  <TableCell key={`skeleton-cell-${header}-${rowIndex}`}>
                    <div className="h-4 bg-muted animate-pulse rounded" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function DataTableHeader({ headers }: { headers: string[] }): JSX.Element {
  return (
    <TableHeader>
      <TableRow>
        {headers.map(header => (
          <TableHead key={`content-header-${header}`}>{header}</TableHead>
        ))}
      </TableRow>
    </TableHeader>
  )
}

function DataTableRows({
  data,
  headers,
  emptyMessage,
}: {
  data: Array<Record<string, React.ReactNode>>
  headers: string[]
  emptyMessage: string
}): JSX.Element {
  if (data.length === 0) {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={headers.length} className="h-24 text-center">
            {emptyMessage}
          </TableCell>
        </TableRow>
      </TableBody>
    )
  }

  return (
    <TableBody>
      {data.map((row, rowIndex) => {
        const rowId =
          row.id !== undefined && row.id !== null && typeof row.id === 'string'
            ? row.id
            : `row-${rowIndex}`
        return (
          <TableRow key={`data-row-${rowId}`}>
            {headers.map(header => (
              <TableCell key={`data-cell-${rowId}-${header}`}>{row[header] ?? '-'}</TableCell>
            ))}
          </TableRow>
        )
      })}
    </TableBody>
  )
}

function DataTableContent({
  headers,
  data,
  emptyMessage,
}: {
  headers: string[]
  data: Array<Record<string, React.ReactNode>>
  emptyMessage: string
}): JSX.Element {
  return (
    <Table>
      <DataTableHeader headers={headers} />
      <DataTableRows data={data} headers={headers} emptyMessage={emptyMessage} />
    </Table>
  )
}

export function DataTableWrapper({
  headers,
  data,
  className,
  emptyMessage = 'No results found.',
  isLoading = false,
}: SimpleDataTableProps): JSX.Element {
  if (isLoading) {
    return (
      <DataTableSkeleton
        headers={headers}
        {...(className !== null && className !== undefined && className.length > 0
          ? { className }
          : {})}
      />
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="rounded-md border">
        <DataTableContent headers={headers} data={data} emptyMessage={emptyMessage} />
      </div>
    </div>
  )
}
