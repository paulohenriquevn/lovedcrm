'use client'

import { cn } from '@/lib/utils'

import { ItemsPerPageSelector, PaginationControls } from './pagination-components'

interface PaginationWrapperProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  onItemsPerPageChange?: (itemsPerPage: number) => void
  className?: string
  showItemsPerPage?: boolean
  itemsPerPageOptions?: number[]
}

export function PaginationWrapper({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  className,
  showItemsPerPage = true,
  itemsPerPageOptions = [10, 20, 50, 100],
}: PaginationWrapperProps): JSX.Element | null {
  if (totalPages <= 1) {
    return null
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  return (
    <div className={cn('flex items-center justify-between space-x-2', className)}>
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <span>
          Showing {startItem} to {endItem} of {totalItems} results
        </span>
        {showItemsPerPage && onItemsPerPageChange !== undefined ? (
          <ItemsPerPageSelector
            itemsPerPage={itemsPerPage}
            itemsPerPageOptions={itemsPerPageOptions}
            onItemsPerPageChange={onItemsPerPageChange}
          />
        ) : null}
      </div>
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  )
}
