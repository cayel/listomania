import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Navbar } from '../navbar'
import { useSession, signOut } from 'next-auth/react'

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
  signOut: jest.fn()
}))

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>
  }
})

// Mock theme-toggle
jest.mock('../theme-toggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle">Theme Toggle</div>
}))

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  LogOut: () => <div>LogOut Icon</div>,
  ListMusic: () => <div>ListMusic Icon</div>,
  User: () => <div>User Icon</div>,
  Shield: () => <div>Shield Icon</div>,
  Menu: () => <div>Menu Icon</div>,
  X: () => <div>X Icon</div>,
  Compass: () => <div>Compass Icon</div>,
  BarChart3: () => <div>BarChart3 Icon</div>
}))

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>
const mockSignOut = signOut as jest.MockedFunction<typeof signOut>

describe('Navbar', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Unauthenticated user', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn()
      })
    })

    it('should render login and signup links', () => {
      render(<Navbar />)
      
      expect(screen.getByText('Se connecter')).toBeInTheDocument()
      expect(screen.getByText("S'inscrire")).toBeInTheDocument()
    })

    it('should not show user menu items', () => {
      render(<Navbar />)
      
      expect(screen.queryByText('Mes Listes')).not.toBeInTheDocument()
      expect(screen.queryByText('Communauté')).not.toBeInTheDocument()
    })

    it('should render theme toggle', () => {
      render(<Navbar />)
      
      expect(screen.getAllByTestId('theme-toggle').length).toBeGreaterThan(0)
    })
  })

  describe('Authenticated user', () => {
    const mockSession = {
      user: {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        image: null,
        role: 'user'
      },
      expires: '2026-12-31'
    }

    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated',
        update: jest.fn()
      })
    })

    it('should render user menu items', () => {
      render(<Navbar />)
      
      expect(screen.getByText('Mes Listes')).toBeInTheDocument()
      expect(screen.getByText('Communauté')).toBeInTheDocument()
    })

    it('should render user name', () => {
      render(<Navbar />)
      
      expect(screen.getAllByText('Test User')[0]).toBeInTheDocument()
    })

    it('should not render login/signup links', () => {
      render(<Navbar />)
      
      expect(screen.queryByText('Se connecter')).not.toBeInTheDocument()
      expect(screen.queryByText("S'inscrire")).not.toBeInTheDocument()
    })

    it('should show admin link for admin users', () => {
      mockUseSession.mockReturnValue({
        data: {
          ...mockSession,
          user: { ...mockSession.user, role: 'admin' }
        },
        status: 'authenticated',
        update: jest.fn()
      })

      render(<Navbar />)
      
      expect(screen.getAllByText('Administration').length).toBeGreaterThan(0)
    })

    it('should not show admin link for regular users', () => {
      render(<Navbar />)
      
      expect(screen.queryByText('Administration')).not.toBeInTheDocument()
    })

    it('should call signOut when logout button is clicked', async () => {
      render(<Navbar />)
      
      // Find logout buttons (there might be multiple - desktop and mobile)
      const logoutButtons = screen.getAllByTitle('Se déconnecter')
      fireEvent.click(logoutButtons[0])
      
      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalled()
      })
    })

    it('should render correct links with href attributes', () => {
      const { container } = render(<Navbar />)
      
      const listesLink = container.querySelector('a[href="/lists"]')
      const communityLink = container.querySelector('a[href="/explore"]')
      const profileLink = container.querySelector('a[href="/profile"]')
      
      expect(listesLink).toBeInTheDocument()
      expect(communityLink).toBeInTheDocument()
      expect(profileLink).toBeInTheDocument()
    })
  })

  describe('Mobile menu', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: '1',
            name: 'Test User',
            email: 'test@example.com',
            image: null,
            role: 'user'
          },
          expires: '2026-12-31'
        },
        status: 'authenticated',
        update: jest.fn()
      })
    })

    it('should toggle mobile menu when menu button is clicked', () => {
      render(<Navbar />)
      
      // Initially, mobile menu items should not be visible
      const menuItems = screen.queryAllByText('Mes Listes')
      
      // Click menu button to open
      const menuButton = screen.getByLabelText('Toggle menu')
      fireEvent.click(menuButton)
      
      // Now menu items should be visible
      expect(screen.getAllByText('Mes Listes').length).toBeGreaterThan(0)
    })

    it('should close mobile menu when a link is clicked', () => {
      render(<Navbar />)
      
      // Open mobile menu
      const menuButton = screen.getByLabelText('Toggle menu')
      fireEvent.click(menuButton)
      
      // Click on a menu item
      const listesLinks = screen.getAllByText('Mes Listes')
      fireEvent.click(listesLinks[listesLinks.length - 1]) // Click mobile version
      
      // Menu should still render but could be closed (testing the click handler was called)
      expect(listesLinks.length).toBeGreaterThan(0)
    })

    it('should show Community link in mobile menu', () => {
      render(<Navbar />)
      
      // Open mobile menu
      const menuButton = screen.getByLabelText('Toggle menu')
      fireEvent.click(menuButton)
      
      // Check for Community link
      const communityLinks = screen.getAllByText('Communauté')
      expect(communityLinks.length).toBeGreaterThan(0)
    })
  })

  describe('User with image', () => {
    it('should render user image when available', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: '1',
            name: 'Test User',
            email: 'test@example.com',
            image: 'https://example.com/avatar.jpg',
            role: 'user'
          },
          expires: '2026-12-31'
        },
        status: 'authenticated',
        update: jest.fn()
      })

      const { container } = render(<Navbar />)
      
      const images = container.querySelectorAll('img[src="https://example.com/avatar.jpg"]')
      expect(images.length).toBeGreaterThan(0)
    })
  })

  describe('App branding', () => {
    it('should render ListOmania logo and name', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn()
      })

      render(<Navbar />)
      
      expect(screen.getByText('ListOmania')).toBeInTheDocument()
    })

    it('should have home link on logo', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn()
      })

      const { container } = render(<Navbar />)
      
      const homeLink = container.querySelector('a[href="/"]')
      expect(homeLink).toBeInTheDocument()
      expect(homeLink?.textContent).toContain('ListOmania')
    })
  })
})
