// Pagination utility functions

export function generatePageNumbers(currentPage: number, totalPages: number): (number | string)[] {
  const delta = 2
  const range = []
  const rangeWithDots: (number | string)[] = []

  for (
    let i = Math.max(2, currentPage - delta);
    i <= Math.min(totalPages - 1, currentPage + delta);
    i++
  ) {
    range.push(i)
  }

  if (currentPage - delta > 2) {
    rangeWithDots.push(1, '...')
  } else {
    rangeWithDots.push(1)
  }

  rangeWithDots.push(...range)

  if (currentPage + delta < totalPages - 1) {
    rangeWithDots.push('...', totalPages)
  } else {
    rangeWithDots.push(totalPages)
  }

  return rangeWithDots
}
