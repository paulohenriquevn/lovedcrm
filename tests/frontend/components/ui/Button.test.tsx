import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '../../utils/test-utils'
import { Button } from '@/components/ui/button'

describe('Button Component', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>)

    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies variant styles correctly', () => {
    render(<Button variant="destructive">Delete</Button>)

    const button = screen.getByRole('button')
    expect(button).toHaveClass('destructive')
  })

  it('applies size styles correctly', () => {
    render(<Button size="lg">Large Button</Button>)

    const button = screen.getByRole('button')
    expect(button).toHaveClass('lg')
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>)

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('shows loading state correctly', () => {
    render(<Button loading>Loading Button</Button>)

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    // You might want to check for a loading spinner or text
  })

  it('forwards ref correctly', () => {
    const ref = vi.fn()
    render(<Button ref={ref}>Button with ref</Button>)

    expect(ref).toHaveBeenCalled()
  })

  it('applies custom className', () => {
    render(<Button className="custom-class">Custom Button</Button>)

    const button = screen.getByRole('button')
    expect(button).toHaveClass('custom-class')
  })

  it('renders as different element when asChild is true', () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    )

    expect(screen.getByRole('link')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
