import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

// Simple smoke test to verify test setup is working
describe('Test Setup Verification', () => {
  it('renders a simple component', () => {
    const TestComponent = () => <div>Hello, Testing!</div>

    render(<TestComponent />)

    expect(screen.getByText('Hello, Testing!')).toBeInTheDocument()
  })

  it('has access to vitest globals', () => {
    expect(describe).toBeDefined()
    expect(it).toBeDefined()
    expect(expect).toBeDefined()
  })

  it('has access to testing library utilities', () => {
    expect(render).toBeDefined()
    expect(screen).toBeDefined()
  })

  it('mocks are working', () => {
    // Test that our mocks are accessible
    expect(global.ResizeObserver).toBeDefined()
    expect(global.IntersectionObserver).toBeDefined()
    expect(window.matchMedia).toBeDefined()
  })

  it('can create mock data', async () => {
    const { createMockUser, createMockOrganization } = await import('./utils/test-utils')

    const user = createMockUser()
    const org = createMockOrganization()

    expect(user.id).toBeDefined()
    expect(user.email).toBeDefined()
    expect(org.id).toBeDefined()
    expect(org.name).toBeDefined()
  })
})
