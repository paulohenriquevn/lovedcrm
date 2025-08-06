'use client'

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Column<TData> {
  key: keyof TData
  header: string
  cell?: (value: TData[keyof TData], row: TData) => React.ReactNode
  id?: string
}

interface DataTableProps<TData> {
  data: TData[]
  columns: Column<TData>[]
  pagination?: {
    page: number
    pageSize: number
    total: number
    onPageChange: (page: number) => void
    onPageSizeChange: (pageSize: number) => void
  }
  loading?: boolean
  emptyMessage?: string
}

function DataTableSkeleton<TData>({ columns }: { columns: Column<TData>[] }): JSX.Element {
  // Generate unique IDs for skeleton rows
  const skeletonRows = Array.from({ length: 5 }, (_, idx) => `skeleton-row-${idx}`)

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map(column => (
              <TableHead key={String(column.key)}>{column.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {skeletonRows.map(rowId => (
            <TableRow key={rowId}>
              {columns.map(column => (
                <TableCell key={`${rowId}-${String(column.key)}`}>
                  <div className="h-4 bg-muted animate-pulse rounded" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function DataTableContent<TData>({
  data,
  columns,
  emptyMessage,
}: {
  data: TData[]
  columns: Column<TData>[]
  emptyMessage: string
}): JSX.Element {
  const renderCell = (column: Column<TData>, row: TData): React.ReactNode => {
    const value = row[column.key]
    if (column.cell) {
      return column.cell(value, row)
    }
    return String(value ?? '')
  }

  // Try to get a unique identifier from the row data, fallback to index
  const getRowKey = (row: TData, index: number): string => {
    // Try common ID fields
    const possibleIds = ['id', 'uuid', 'key', '_id'] as (keyof TData)[]
    for (const idField of possibleIds) {
      if (idField in row && row[idField] !== null && row[idField] !== undefined) {
        return String(row[idField])
      }
    }
    // Fallback to index (this will still trigger the warning but is safer than using the index directly)
    return `row-${index}-${Date.now()}`
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map(column => (
              <TableHead key={String(column.key)}>{column.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((row, idx) => {
              const rowKey = getRowKey(row, idx)
              return (
                <TableRow key={rowKey}>
                  {columns.map(column => (
                    <TableCell key={`${rowKey}-${String(column.key)}`}>
                      {renderCell(column, row)}
                    </TableCell>
                  ))}
                </TableRow>
              )
            })
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export function DataTable<TData>({
  data,
  columns,
  pagination,
  loading = false,
  emptyMessage = 'Nenhum resultado encontrado.',
}: DataTableProps<TData>): JSX.Element {
  if (loading) {
    return <DataTableSkeleton columns={columns} />
  }

  return (
    <div className="space-y-4">
      <DataTableContent data={data} columns={columns} emptyMessage={emptyMessage} />
      {pagination !== undefined && (
        <DataTablePagination
          page={pagination.page}
          pageSize={pagination.pageSize}
          total={pagination.total}
          handlePageChange={pagination.onPageChange}
          handlePageSizeChange={pagination.onPageSizeChange}
        />
      )}
    </div>
  )
}

interface DataTablePaginationProps {
  page: number
  pageSize: number
  total: number
  handlePageChange: (page: number) => void
  handlePageSizeChange: (pageSize: number) => void
}

function DataTablePagination({
  page,
  pageSize,
  total,
  handlePageChange,
  handlePageSizeChange,
}: DataTablePaginationProps): JSX.Element {
  const totalPages = Math.ceil(total / pageSize)
  const startItem = (page - 1) * pageSize + 1
  const endItem = Math.min(page * pageSize, total)

  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Linhas por página</p>
          <Select
            value={`${pageSize}`}
            onValueChange={value => handlePageSizeChange(Number(value))}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map(size => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          {startItem}-{endItem} de {total}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => handlePageChange(1)}
            disabled={page <= 1}
          >
            <span className="sr-only">Ir para primeira página</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
          >
            <span className="sr-only">Ir para página anterior</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages}
          >
            <span className="sr-only">Ir para próxima página</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => handlePageChange(totalPages)}
            disabled={page >= totalPages}
          >
            <span className="sr-only">Ir para última página</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
