import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import Explore from '../page'

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>
  }
})

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...props} />
  }
}))

// Mock Navbar
jest.mock('@/components/navbar', () => ({
  Navbar: () => <div data-testid="navbar">Navbar</div>
}))

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Calendar: () => <div>Calendar Icon</div>,
  Globe: () => <div>Globe Icon</div>,
  User: () => <div>User Icon</div>,
  Search: () => <div>Search Icon</div>,
  X: () => <div>X Icon</div>,
  ArrowUpDown: () => <div>ArrowUpDown Icon</div>,
  SlidersHorizontal: () => <div>SlidersHorizontal Icon</div>
}))

global.fetch = jest.fn()

describe('Explore Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should show loading state initially', () => {
    ;(global.fetch as jest.Mock).mockImplementation(() => 
      new Promise(() => {}) // Never resolves
    )

    render(<Explore />)
    
    expect(screen.getByText('Chargement...')).toBeInTheDocument()
  })

  it('should render page title and description', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ lists: [], hasMore: false })
    })

    render(<Explore />)
    
    await waitFor(() => {
      expect(screen.getByText('Explorer les listes publiques')).toBeInTheDocument()
      expect(screen.getByText("Découvrez les listes d'albums créées par la communauté")).toBeInTheDocument()
    })
  })

  it('should display empty state when no lists', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ lists: [], hasMore: false })
    })

    render(<Explore />)
    
    await waitFor(() => {
      expect(screen.getByText('Aucune liste publique pour le moment.')).toBeInTheDocument()
      expect(screen.getByText('Créer la première liste publique')).toBeInTheDocument()
    })
  })

  it('should display public lists with modern card style', async () => {
    const mockLists = [
      {
        id: '1',
        title: 'Best Albums 2024',
        description: 'My favorite albums',
        period: '2024',
        user: {
          id: 'user1',
          name: 'John Doe'
        },
        listAlbums: [
          {
            album: {
              id: 'album1',
              coverImage: 'https://example.com/cover1.jpg',
              title: 'Album 1',
              artist: 'Artist 1'
            }
          },
          {
            album: {
              id: 'album2',
              coverImage: 'https://example.com/cover2.jpg',
              title: 'Album 2',
              artist: 'Artist 2'
            }
          }
        ],
        _count: {
          listAlbums: 2
        }
      }
    ]

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ lists: mockLists, hasMore: false })
    })

    render(<Explore />)
    
    await waitFor(() => {
      expect(screen.getByText('Best Albums 2024')).toBeInTheDocument()
      expect(screen.getByText('My favorite albums')).toBeInTheDocument()
      expect(screen.getByText('2024')).toBeInTheDocument()
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('2 albums')).toBeInTheDocument()
    })
  })

  it('should display list with single album in centered layout', async () => {
    const mockLists = [
      {
        id: '1',
        title: 'Single Album List',
        user: {
          id: 'user1',
          name: 'Jane Smith'
        },
        listAlbums: [
          {
            album: {
              id: 'album1',
              coverImage: 'https://example.com/cover.jpg',
              title: 'Solo Album',
              artist: 'Solo Artist'
            }
          }
        ],
        _count: {
          listAlbums: 1
        }
      }
    ]

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ lists: mockLists, hasMore: false })
    })

    const { container } = render(<Explore />)
    
    await waitFor(() => {
      expect(screen.getByText('Single Album List')).toBeInTheDocument()
      expect(screen.getByText('1 album')).toBeInTheDocument()
      
      // Check for album cover image
      const images = container.querySelectorAll('img[src="https://example.com/cover.jpg"]')
      expect(images.length).toBeGreaterThan(0)
    })
  })

  it('should display list with multiple albums in mosaic layout', async () => {
    const mockLists = [
      {
        id: '1',
        title: 'Multi Album List',
        user: {
          id: 'user1',
          name: 'Bob Wilson'
        },
        listAlbums: [
          {
            album: {
              id: 'album1',
              coverImage: 'https://example.com/cover1.jpg',
              title: 'Album 1',
              artist: 'Artist 1'
            }
          },
          {
            album: {
              id: 'album2',
              coverImage: 'https://example.com/cover2.jpg',
              title: 'Album 2',
              artist: 'Artist 2'
            }
          },
          {
            album: {
              id: 'album3',
              coverImage: 'https://example.com/cover3.jpg',
              title: 'Album 3',
              artist: 'Artist 3'
            }
          }
        ],
        _count: {
          listAlbums: 3
        }
      }
    ]

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ lists: mockLists, hasMore: false })
    })

    const { container } = render(<Explore />)
    
    await waitFor(() => {
      expect(screen.getByText('Multi Album List')).toBeInTheDocument()
      expect(screen.getByText('3 albums')).toBeInTheDocument()
      
      // Check for multiple album covers
      const img1 = container.querySelector('img[src="https://example.com/cover1.jpg"]')
      const img2 = container.querySelector('img[src="https://example.com/cover2.jpg"]')
      
      expect(img1).toBeInTheDocument()
      expect(img2).toBeInTheDocument()
    })
  })

  it('should display Public badge for all lists', async () => {
    const mockLists = [
      {
        id: '1',
        title: 'Public List',
        user: {
          id: 'user1',
          name: 'Test User'
        },
        listAlbums: [],
        _count: {
          listAlbums: 0
        }
      }
    ]

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ lists: mockLists, hasMore: false })
    })

    render(<Explore />)
    
    await waitFor(() => {
      expect(screen.getByText('Public')).toBeInTheDocument()
    })
  })

  it('should handle lists without description', async () => {
    const mockLists = [
      {
        id: '1',
        title: 'List Without Description',
        user: {
          id: 'user1',
          name: 'Test User'
        },
        listAlbums: [],
        _count: {
          listAlbums: 0
        }
      }
    ]

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ lists: mockLists, hasMore: false })
    })

    render(<Explore />)
    
    await waitFor(() => {
      expect(screen.getByText('List Without Description')).toBeInTheDocument()
      // Description should not be rendered if not provided
    })
  })

  it('should handle lists without period', async () => {
    const mockLists = [
      {
        id: '1',
        title: 'List Without Period',
        user: {
          id: 'user1',
          name: 'Test User'
        },
        listAlbums: [],
        _count: {
          listAlbums: 0
        }
      }
    ]

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ lists: mockLists, hasMore: false })
    })

    render(<Explore />)
    
    await waitFor(() => {
      expect(screen.getByText('List Without Period')).toBeInTheDocument()
      // Period should not be shown if not provided
    })
  })

  it('should render correct links to list details', async () => {
    const mockLists = [
      {
        id: 'list-123',
        title: 'Test List',
        user: {
          id: 'user1',
          name: 'Test User'
        },
        listAlbums: [],
        _count: {
          listAlbums: 0
        }
      }
    ]

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ lists: mockLists, hasMore: false })
    })

    const { container } = render(<Explore />)
    
    await waitFor(() => {
      const link = container.querySelector('a[href="/lists/list-123"]')
      expect(link).toBeInTheDocument()
    })
  })

  it('should handle fetch error gracefully', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    render(<Explore />)
    
    await waitFor(() => {
      // Should show empty state or error handling
      expect(screen.queryByText('Chargement...')).not.toBeInTheDocument()
    })
  })

  it('should use glass effect and gradient background', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ lists: [], hasMore: false })
    })

    const { container } = render(<Explore />)
    
    await waitFor(() => {
      const mainDiv = container.querySelector('.gradient-bg')
      expect(mainDiv).toBeInTheDocument()
    })
  })

  it('should display username fallback when name is not provided', async () => {
    const mockLists = [
      {
        id: '1',
        title: 'Test List',
        user: {
          id: 'user1',
          name: null
        },
        listAlbums: [],
        _count: {
          listAlbums: 0
        }
      }
    ]

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ lists: mockLists, hasMore: false })
    })

    render(<Explore />)
    
    await waitFor(() => {
      expect(screen.getByText('Utilisateur')).toBeInTheDocument()
    })
  })
})
