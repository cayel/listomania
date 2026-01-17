import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ThemeToggle } from '../theme-toggle'
import { useTheme } from 'next-themes'

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: jest.fn()
}))

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Moon: ({ className }: { className?: string }) => (
    <svg data-testid="moon-icon" className={className}>Moon</svg>
  ),
  Sun: ({ className }: { className?: string }) => (
    <svg data-testid="sun-icon" className={className}>Sun</svg>
  )
}))

describe('ThemeToggle', () => {
  const mockSetTheme = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    // Reset mounted state between tests
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should not render before mounting (server-side)', () => {
    // Mock useState to simulate server-side rendering where mounted = false
    const mockUseState = jest.spyOn(React, 'useState')
    mockUseState.mockImplementationOnce(() => [false, jest.fn()])

    ;(useTheme as jest.Mock).mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme
    })

    const { container } = render(<ThemeToggle />)
    
    // Avant le mount, le composant retourne null
    expect(container.firstChild).toBeNull()

    mockUseState.mockRestore()
  })

  it('should render sun icon in dark mode after mounting', async () => {
    ;(useTheme as jest.Mock).mockReturnValue({
      theme: 'dark',
      setTheme: mockSetTheme
    })

    render(<ThemeToggle />)

    // Attendre que le composant soit monté
    await waitFor(() => {
      expect(screen.getByTestId('sun-icon')).toBeInTheDocument()
    })
  })

  it('should render moon icon in light mode after mounting', async () => {
    ;(useTheme as jest.Mock).mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme
    })

    render(<ThemeToggle />)

    await waitFor(() => {
      expect(screen.getByTestId('moon-icon')).toBeInTheDocument()
    })
  })

  it('should toggle from light to dark theme when clicked', async () => {
    ;(useTheme as jest.Mock).mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme
    })

    render(<ThemeToggle />)

    await waitFor(() => {
      expect(screen.getByTestId('moon-icon')).toBeInTheDocument()
    })

    const button = screen.getByRole('button', { name: /toggle theme/i })
    fireEvent.click(button)

    expect(mockSetTheme).toHaveBeenCalledWith('dark')
  })

  it('should toggle from dark to light theme when clicked', async () => {
    ;(useTheme as jest.Mock).mockReturnValue({
      theme: 'dark',
      setTheme: mockSetTheme
    })

    render(<ThemeToggle />)

    await waitFor(() => {
      expect(screen.getByTestId('sun-icon')).toBeInTheDocument()
    })

    const button = screen.getByRole('button', { name: /toggle theme/i })
    fireEvent.click(button)

    expect(mockSetTheme).toHaveBeenCalledWith('light')
  })

  it('should have accessible aria-label', async () => {
    ;(useTheme as jest.Mock).mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme
    })

    render(<ThemeToggle />)

    await waitFor(() => {
      const button = screen.getByRole('button', { name: /toggle theme/i })
      expect(button).toBeInTheDocument()
      expect(button).toHaveAttribute('aria-label', 'Toggle theme')
    })
  })

  it('should apply correct CSS classes for hover states', async () => {
    ;(useTheme as jest.Mock).mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme
    })

    render(<ThemeToggle />)

    await waitFor(() => {
      const button = screen.getByRole('button')
      expect(button).toHaveClass('p-2', 'rounded-lg', 'hover:bg-gray-200', 'dark:hover:bg-gray-700', 'transition-colors')
    })
  })

  it('should handle system theme', async () => {
    ;(useTheme as jest.Mock).mockReturnValue({
      theme: 'system',
      setTheme: mockSetTheme
    })

    render(<ThemeToggle />)

    await waitFor(() => {
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button'))
    
    // Si le thème n'est ni 'dark', il devrait basculer vers 'light'
    expect(mockSetTheme).toHaveBeenCalledWith('dark')
  })

  it('should render icon with correct size', async () => {
    ;(useTheme as jest.Mock).mockReturnValue({
      theme: 'dark',
      setTheme: mockSetTheme
    })

    render(<ThemeToggle />)

    await waitFor(() => {
      const icon = screen.getByTestId('sun-icon')
      expect(icon).toHaveClass('h-5', 'w-5')
    })
  })
})
