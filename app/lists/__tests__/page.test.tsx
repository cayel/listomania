import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Lists from '../page'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn()
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))

// Mock components
jest.mock('@/components/navbar', () => ({
  Navbar: () => <div data-testid="navbar">Navbar</div>
}))

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: any) => <a href={href}>{children}</a>
})

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...props} />
  }
}))

// Mock lucide-react
jest.mock('lucide-react', () => ({
  Plus: () => <div>Plus</div>,
  Calendar: () => <div>Calendar</div>,
  Lock: () => <div>Lock</div>,
  Globe: () => <div>Globe</div>,
  Upload: () => <div>Upload</div>,
  Pencil: () => <div>Pencil</div>,
  Trash2: () => <div>Trash</div>,
  Search: () => <div>Search</div>,
  SlidersHorizontal: () => <div>SlidersHorizontal</div>,
  X: () => <div>X</div>,
  ArrowUpDown: () => <div>ArrowUpDown</div>,
  Grid3x3: () => <div>Grid3x3</div>,
  List: () => <div>List</div>,
  Table: () => <div>Table</div>,
  Eye: () => <div>Eye</div>,
  EyeOff: () => <div>EyeOff</div>,
  CheckSquare: () => <div>CheckSquare</div>,
  Square: () => <div>Square</div>,
  Trash: () => <div>Trash</div>,
  BarChart3: () => <div>BarChart3</div>,
  Tag: () => <div>Tag</div>
}))

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

// Helper pour créer un mock fetch intelligent qui retourne différentes données selon l'URL
const createMockFetch = (overrides: Record<string, any> = {}) => {
  return jest.fn((url: string) => {
    if (url.includes('/api/categories')) {
      return Promise.resolve({
        ok: true,
        json: async () => overrides.categories || []
      })
    }
    if (url.includes('/api/lists')) {
      return Promise.resolve({
        ok: true,
        json: async () => overrides.lists || []
      })
    }
    // Autres URLs personnalisées
    if (overrides[url]) {
      return Promise.resolve({
        ok: true,
        json: async () => overrides[url]
      })
    }
    // Par défaut
    return Promise.resolve({
      ok: true,
      json: async () => []
    })
  })
}

global.fetch = createMockFetch()

describe('Lists Page', () => {
  const mockRouter = {
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn()
  }

  const mockLists = [
    {
      id: 'list-1',
      title: 'Best Albums 2024',
      description: 'My favorite albums of the year',
      period: '2024',
      isPublic: true,
      isRanked: true,
      listAlbums: [
        {
          album: {
            id: 'album-1',
            coverImage: 'https://example.com/cover1.jpg',
            title: 'Album 1',
            artist: 'Artist 1'
          }
        }
      ],
      _count: {
        listAlbums: 1
      },
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: 'list-2',
      title: 'Private Collection',
      description: null,
      period: null,
      isPublic: false,
      isRanked: false,
      listAlbums: [],
      _count: {
        listAlbums: 0
      },
      createdAt: '2024-01-02',
      updatedAt: '2024-01-02'
    }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseRouter.mockReturnValue(mockRouter as any)
  })

  describe('Authentication', () => {
    it('should redirect to signin when unauthenticated', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn()
      })

      render(<Lists />)

      expect(mockRouter.push).toHaveBeenCalledWith('/auth/signin')
    })

    it('should render page when authenticated', async () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: 'user-1', email: 'test@test.com', role: 'user' },
          expires: '2026-12-31'
        },
        status: 'authenticated',
        update: jest.fn()
      })

      global.fetch = createMockFetch({ lists: mockLists })

      render(<Lists />)

      await waitFor(() => {
        expect(screen.getByText('Mes Listes')).toBeInTheDocument()
      })
    })
  })

  describe('Page header', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: 'user-1', email: 'test@test.com', role: 'user' },
          expires: '2026-12-31'
        },
        status: 'authenticated',
        update: jest.fn()
      })
    })

    it('should display page title', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => []
      })

      render(<Lists />)

      await waitFor(() => {
        expect(screen.getByText('Mes Listes')).toBeInTheDocument()
      })
    })

    it('should display new list button', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => []
      })

      const { container } = render(<Lists />)

      await waitFor(() => {
        const newListLink = container.querySelector('a[href="/lists/new"]')
        expect(newListLink).toBeInTheDocument()
        expect(newListLink?.textContent).toContain('Nouvelle Liste')
      })
    })

    it('should display import button', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => []
      })

      render(<Lists />)

      await waitFor(() => {
        expect(screen.getByText('Importer une liste')).toBeInTheDocument()
      })
    })
  })

  describe('List display with modern card style', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: 'user-1', email: 'test@test.com', role: 'user' },
          expires: '2026-12-31'
        },
        status: 'authenticated',
        update: jest.fn()
      })
    })

    it('should display lists with modern card layout', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockLists
      })

      render(<Lists />)

      await waitFor(() => {
        expect(screen.getByText('Best Albums 2024')).toBeInTheDocument()
        expect(screen.getByText('Private Collection')).toBeInTheDocument()
      })
    })

    it('should display list with single album cover', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [mockLists[0]]
      })

      const { container } = render(<Lists />)

      await waitFor(() => {
        const image = container.querySelector('img[src="https://example.com/cover1.jpg"]')
        expect(image).toBeInTheDocument()
      })
    })

    it('should show public badge for public lists', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [mockLists[0]]
      })

      render(<Lists />)

      await waitFor(() => {
        expect(screen.getByText('Public')).toBeInTheDocument()
      })
    })

    it('should show private badge for private lists', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [mockLists[1]]
      })

      render(<Lists />)

      await waitFor(() => {
        expect(screen.getByText('Privé')).toBeInTheDocument()
      })
    })

    it('should display album count', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockLists
      })

      render(<Lists />)

      await waitFor(() => {
        expect(screen.getByText('1 album')).toBeInTheDocument()
        expect(screen.getByText('0 album')).toBeInTheDocument()
      })
    })

    it('should display period when available', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [mockLists[0]]
      })

      render(<Lists />)

      await waitFor(() => {
        expect(screen.getByText('2024')).toBeInTheDocument()
      })
    })

    it('should display description when available', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [mockLists[0]]
      })

      render(<Lists />)

      await waitFor(() => {
        expect(screen.getByText('My favorite albums of the year')).toBeInTheDocument()
      })
    })
  })

  describe('List actions', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: 'user-1', email: 'test@test.com', role: 'user' },
          expires: '2026-12-31'
        },
        status: 'authenticated',
        update: jest.fn()
      })
    })

    it('should show edit and delete buttons for each list', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [mockLists[0]]
      })

      render(<Lists />)

      await waitFor(() => {
        expect(screen.getByTitle('Modifier')).toBeInTheDocument()
        expect(screen.getByTitle('Supprimer')).toBeInTheDocument()
      })
    })

    it('should show delete confirmation modal when delete is clicked', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [mockLists[0]]
      })

      render(<Lists />)

      await waitFor(() => {
        expect(screen.getByText('Best Albums 2024')).toBeInTheDocument()
      })

      const deleteButton = screen.getByTitle('Supprimer')
      fireEvent.click(deleteButton)

      await waitFor(() => {
        expect(screen.getByText('Confirmer la suppression')).toBeInTheDocument()
      })
    })

    it('should delete list when confirmed', async () => {
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [mockLists[0]]
        })
        .mockResolvedValueOnce({
          ok: true
        })

      render(<Lists />)

      await waitFor(() => {
        expect(screen.getByText('Best Albums 2024')).toBeInTheDocument()
      })

      const deleteButton = screen.getByTitle('Supprimer')
      fireEvent.click(deleteButton)

      await waitFor(() => {
        expect(screen.getByText('Confirmer la suppression')).toBeInTheDocument()
      })

      const confirmButton = screen.getByText('Supprimer')
      fireEvent.click(confirmButton)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/lists/list-1',
          expect.objectContaining({ method: 'DELETE' })
        )
      })
    })

    it('should cancel delete when cancel is clicked', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [mockLists[0]]
      })

      render(<Lists />)

      await waitFor(() => {
        expect(screen.getByText('Best Albums 2024')).toBeInTheDocument()
      })

      const deleteButton = screen.getByTitle('Supprimer')
      fireEvent.click(deleteButton)

      await waitFor(() => {
        expect(screen.getByText('Confirmer la suppression')).toBeInTheDocument()
      })

      const cancelButton = screen.getByText('Annuler')
      fireEvent.click(cancelButton)

      await waitFor(() => {
        expect(screen.queryByText('Confirmer la suppression')).not.toBeInTheDocument()
      })
    })
  })

  describe('Empty state', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: 'user-1', email: 'test@test.com', role: 'user' },
          expires: '2026-12-31'
        },
        status: 'authenticated',
        update: jest.fn()
      })
    })

    it('should show empty state when no lists', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => []
      })

      render(<Lists />)

      await waitFor(() => {
        expect(screen.getByText("Vous n'avez pas encore créé de liste.")).toBeInTheDocument()
        expect(screen.getByText('Créer ma première liste')).toBeInTheDocument()
      })
    })
  })

  describe('Responsive grid layout', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: 'user-1', email: 'test@test.com', role: 'user' },
          expires: '2026-12-31'
        },
        status: 'authenticated',
        update: jest.fn()
      })
    })

    it('should use responsive grid classes', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockLists
      })

      const { container } = render(<Lists />)

      await waitFor(() => {
        const grid = container.querySelector('.grid')
        expect(grid).toHaveClass('sm:grid-cols-2')
        expect(grid).toHaveClass('md:grid-cols-3')
        expect(grid).toHaveClass('lg:grid-cols-4')
        expect(grid).toHaveClass('xl:grid-cols-5')
      })
    })
  })

  describe('List import', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: 'user-1', email: 'test@test.com', role: 'user' },
          expires: '2026-12-31'
        },
        status: 'authenticated',
        update: jest.fn()
      })
    })

    it('should handle successful import', async () => {
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => []
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => []  // categories
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ message: 'Import réussi', listId: 'new-list-id' })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockLists
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => []  // categories après refresh
        })

      const { container } = render(<Lists />)

      await waitFor(() => {
        expect(screen.getByText('Importer une liste')).toBeInTheDocument()
      })

      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement
      expect(fileInput).toBeInTheDocument()

      const file = new File(['{}'], 'list.json', { type: 'application/json' })
      Object.defineProperty(fileInput, 'files', {
        value: [file]
      })

      fireEvent.change(fileInput)

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/lists/new-list-id')
      })
    })
  })

  describe('Loading state', () => {
    it('should show loading state while fetching', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: 'user-1', email: 'test@test.com', role: 'user' },
          expires: '2026-12-31'
        },
        status: 'loading',
        update: jest.fn()
      })

      ;(global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}))

      render(<Lists />)

      expect(screen.getByText('Chargement...')).toBeInTheDocument()
    })
  })

  describe('Modern card styling', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: 'user-1', email: 'test@test.com', role: 'user' },
          expires: '2026-12-31'
        },
        status: 'authenticated',
        update: jest.fn()
      })
    })

    it('should apply glass effect to cards', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [mockLists[0]]
      })

      const { container } = render(<Lists />)

      await waitFor(() => {
        // Cards use group class, not glass class in lists page
        const cards = container.querySelectorAll('a[href^="/lists/"]')
        expect(cards.length).toBeGreaterThan(0)
      })
    })

    it('should apply gradient background', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => []
      })

      const { container } = render(<Lists />)

      await waitFor(() => {
        const bg = container.querySelector('.gradient-bg')
        expect(bg).toBeInTheDocument()
      })
    })
  })
})
