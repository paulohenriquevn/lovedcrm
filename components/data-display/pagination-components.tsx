'use client'

import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { generatePageNumbers } from './pagination-utils'

export function ItemsPerPageSelector({
  itemsPerPage,
  itemsPerPageOptions,
  onItemsPerPageChange,
}: {
  itemsPerPage: number
  itemsPerPageOptions: number[]
  onItemsPerPageChange: (itemsPerPage: number) => void
}): JSX.Element {
  return (
    <>
      <span>•</span>
      <div className="flex items-center space-x-2">
        <span>Show</span>
        <Select
          value={itemsPerPage.toString()}
          onValueChange={value => onItemsPerPageChange(Number.parseInt(value, 10))}
        >
          <SelectTrigger className="h-8 w-16">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {itemsPerPageOptions.map(option => (
              <SelectItem key={option} value={option.toString()}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span>per page</span>
      </div>
    </>
  )
}

export function PageButton({
  page,
  currentPage,
  onPageChange,
}: {
  page: number | string
  currentPage: number
  onPageChange: (page: number) => void
}): JSX.Element {
  if (page === '...') {
    return (
      <Button variant="ghost" size="sm" disabled>
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <Button
      variant={currentPage === page ? 'default' : 'outline'}
      size="sm"
      onClick={() => onPageChange(page as number)}
      className="w-9"
    >
      {page}
    </Button>
  )
}

export function NavigationButton({
  direction,
  currentPage,
  totalPages,
  onPageChange,
}: {
  direction: 'previous' | 'next'
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}): JSX.Element {
  const isNext = direction === 'next'
  const isDisabled = isNext ? currentPage >= totalPages : currentPage <= 1
  const targetPage = isNext ? currentPage + 1 : currentPage - 1

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => onPageChange(targetPage)}
      disabled={isDisabled}
    >
      {Boolean(!isNext) && <ChevronLeft className="h-4 w-4" />}
      {isNext ? 'Next' : 'Previous'}
      {Boolean(isNext) && <ChevronRight className="h-4 w-4" />}
    </Button>
  )
}

export function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}): JSX.Element {
  return (
    <div className="flex items-center space-x-2">
      <NavigationButton
        direction="previous"
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
      <div className="flex items-center space-x-1">
        {generatePageNumbers(currentPage, totalPages).map(page => (
          <PageButton
            key={`page-${page}`}
            page={page}
            currentPage={currentPage}
            onPageChange={onPageChange}
          />
        ))}
      </div>
      <NavigationButton
        direction="next"
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  )
}
