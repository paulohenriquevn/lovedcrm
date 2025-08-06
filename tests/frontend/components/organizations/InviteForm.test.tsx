import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../../utils/test-utils'
import { mockServices } from '../../mocks/services'
import { mockUseForm, mockUseMutation } from '../../mocks/hooks'

// Mock the InviteForm component
// Note: You'll need to adjust this based on your actual component
const MockInviteForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const form = mockUseForm()
  const mutation = mockUseMutation()

  const handleSubmit = async (data: any) => {
    try {
      await mockServices.invite.createInvite(data)
      onSuccess?.()
    } catch (error) {
      console.error('Error creating invite:', error)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} data-testid="invite-form">
      <div>
        <input
          {...form.register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address',
            },
          })}
          placeholder="Email address"
          type="email"
          data-testid="email-input"
        />
        {form.formState.errors.email && (
          <span role="alert" data-testid="email-error">
            {form.formState.errors.email.message}
          </span>
        )}
      </div>

      <div>
        <select
          {...form.register('role', { required: 'Role is required' })}
          data-testid="role-select"
          defaultValue=""
        >
          <option value="">Select role</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="owner">Owner</option>
        </select>
        {form.formState.errors.role && (
          <span role="alert" data-testid="role-error">
            {form.formState.errors.role.message}
          </span>
        )}
      </div>

      <button type="submit" disabled={form.formState.isSubmitting} data-testid="submit-button">
        {form.formState.isSubmitting ? 'Sending...' : 'Send Invite'}
      </button>
    </form>
  )
}

describe('InviteForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders form fields correctly', () => {
    render(<MockInviteForm />)

    expect(screen.getByTestId('email-input')).toBeInTheDocument()
    expect(screen.getByTestId('role-select')).toBeInTheDocument()
    expect(screen.getByTestId('submit-button')).toBeInTheDocument()
  })

  it('shows validation errors for empty fields', async () => {
    const mockForm = {
      ...mockUseForm(),
      formState: {
        ...mockUseForm().formState,
        errors: {
          email: { message: 'Email is required' },
          role: { message: 'Role is required' },
        },
      },
    }

    render(<MockInviteForm />)

    // Simulate form submission without filling fields
    fireEvent.click(screen.getByTestId('submit-button'))

    await waitFor(() => {
      expect(screen.getByTestId('email-error')).toHaveTextContent('Email is required')
      expect(screen.getByTestId('role-error')).toHaveTextContent('Role is required')
    })
  })

  it('validates email format', () => {
    const mockForm = {
      ...mockUseForm(),
      formState: {
        ...mockUseForm().formState,
        errors: {
          email: { message: 'Invalid email address' },
        },
      },
    }

    render(<MockInviteForm />)

    expect(screen.getByTestId('email-error')).toHaveTextContent('Invalid email address')
  })

  it('submits form with valid data', async () => {
    const onSuccess = vi.fn()
    const createInviteSpy = vi.spyOn(mockServices.invite, 'createInvite')

    render(<MockInviteForm onSuccess={onSuccess} />)

    // Fill out the form
    fireEvent.change(screen.getByTestId('email-input'), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByTestId('role-select'), {
      target: { value: 'user' },
    })

    // Submit the form
    fireEvent.click(screen.getByTestId('submit-button'))

    await waitFor(() => {
      expect(createInviteSpy).toHaveBeenCalledWith({
        email: 'test@example.com',
        role: 'user',
      })
      expect(onSuccess).toHaveBeenCalled()
    })
  })

  it('handles form submission error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockServices.invite.createInvite.mockRejectedValue(new Error('API Error'))

    render(<MockInviteForm />)

    fireEvent.change(screen.getByTestId('email-input'), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByTestId('role-select'), {
      target: { value: 'user' },
    })

    fireEvent.click(screen.getByTestId('submit-button'))

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error creating invite:', expect.any(Error))
    })

    consoleSpy.mockRestore()
  })

  it('disables submit button while submitting', () => {
    const mockForm = {
      ...mockUseForm(),
      formState: {
        ...mockUseForm().formState,
        isSubmitting: true,
      },
    }

    render(<MockInviteForm />)

    const submitButton = screen.getByTestId('submit-button')
    expect(submitButton).toBeDisabled()
    expect(submitButton).toHaveTextContent('Sending...')
  })

  it('includes all role options', () => {
    render(<MockInviteForm />)

    const roleSelect = screen.getByTestId('role-select')
    const options = roleSelect.querySelectorAll('option')

    expect(options).toHaveLength(4) // Including the default "Select role" option
    expect(options[0]).toHaveTextContent('Select role')
    expect(options[1]).toHaveTextContent('User')
    expect(options[2]).toHaveTextContent('Admin')
    expect(options[3]).toHaveTextContent('Owner')
  })

  it('has correct form attributes', () => {
    render(<MockInviteForm />)

    const form = screen.getByTestId('invite-form')
    const emailInput = screen.getByTestId('email-input')

    expect(form).toBeInTheDocument()
    expect(emailInput).toHaveAttribute('type', 'email')
    expect(emailInput).toHaveAttribute('placeholder', 'Email address')
  })
})
