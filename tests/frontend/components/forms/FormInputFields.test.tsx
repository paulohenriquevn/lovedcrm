import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../../utils/test-utils'
import { mockUseForm } from '../../mocks/hooks'

// Mock the form input component
// Note: You'll need to adjust this import based on your actual component structure
const MockFormInputFields = ({ register, errors }: any) => (
  <div>
    <input
      {...register('email', { required: 'Email is required' })}
      placeholder="Email"
      type="email"
      data-testid="email-input"
    />
    {errors.email && (
      <span role="alert" data-testid="email-error">
        {errors.email.message}
      </span>
    )}

    <input
      {...register('password', { required: 'Password is required' })}
      placeholder="Password"
      type="password"
      data-testid="password-input"
    />
    {errors.password && (
      <span role="alert" data-testid="password-error">
        {errors.password.message}
      </span>
    )}
  </div>
)

describe('FormInputFields Component', () => {
  it('renders email and password inputs', () => {
    const mockForm = mockUseForm()

    render(<MockFormInputFields register={mockForm.register} errors={{}} />)

    expect(screen.getByTestId('email-input')).toBeInTheDocument()
    expect(screen.getByTestId('password-input')).toBeInTheDocument()
  })

  it('displays validation errors', () => {
    const mockForm = mockUseForm()
    const errors = {
      email: { message: 'Email is required' },
      password: { message: 'Password is required' },
    }

    render(<MockFormInputFields register={mockForm.register} errors={errors} />)

    expect(screen.getByTestId('email-error')).toHaveTextContent('Email is required')
    expect(screen.getByTestId('password-error')).toHaveTextContent('Password is required')
  })

  it('calls register function for each input', () => {
    const mockRegister = vi.fn()

    render(<MockFormInputFields register={mockRegister} errors={{}} />)

    expect(mockRegister).toHaveBeenCalledWith('email', { required: 'Email is required' })
    expect(mockRegister).toHaveBeenCalledWith('password', { required: 'Password is required' })
  })

  it('handles input changes correctly', async () => {
    const mockForm = mockUseForm()

    render(<MockFormInputFields register={mockForm.register} errors={{}} />)

    const emailInput = screen.getByTestId('email-input')
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })

    await waitFor(() => {
      expect(emailInput).toHaveValue('test@example.com')
    })
  })

  it('shows email format validation', () => {
    const mockForm = mockUseForm()
    const errors = {
      email: { message: 'Please enter a valid email address' },
    }

    render(<MockFormInputFields register={mockForm.register} errors={errors} />)

    expect(screen.getByTestId('email-error')).toHaveTextContent(
      'Please enter a valid email address'
    )
  })

  it('shows password strength validation', () => {
    const mockForm = mockUseForm()
    const errors = {
      password: { message: 'Password must be at least 8 characters' },
    }

    render(<MockFormInputFields register={mockForm.register} errors={errors} />)

    expect(screen.getByTestId('password-error')).toHaveTextContent(
      'Password must be at least 8 characters'
    )
  })

  it('has correct input types and placeholders', () => {
    const mockForm = mockUseForm()

    render(<MockFormInputFields register={mockForm.register} errors={{}} />)

    const emailInput = screen.getByTestId('email-input')
    const passwordInput = screen.getByTestId('password-input')

    expect(emailInput).toHaveAttribute('type', 'email')
    expect(emailInput).toHaveAttribute('placeholder', 'Email')
    expect(passwordInput).toHaveAttribute('type', 'password')
    expect(passwordInput).toHaveAttribute('placeholder', 'Password')
  })
})
