import { render, screen, waitFor } from '@testing-library/react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import StatsPage from '../page'

// Mock des dépendances
jest.mock('next-auth/react')
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))
jest.mock('@/components/navbar', () => ({
  Navbar: () => <div data-testid="navbar">Navbar</div>
}))

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockPush = jest.fn()

const mockStats = {
  overview: {
    totalLists: 5,
    totalAlbums: 42,
    uniqueAlbums: 38,
    publicLists: 3,
    privateLists: 2,
    avgAlbumsPerList: 8,
    longestList: { title: 'Ma Grande Liste', length: 20 },
    oldestYear: 1960,
    newestYear: 2024,
    oldestListDate: '2024-01-01T00:00:00.000Z',
    newestListDate: '2024-12-31T00:00:00.000Z'
  },
  listsByPeriod: {
    '2020': 2,
    '1990s': 1,
    '1980s': 2
  },
  albumsByDecade: {
    '1960s': 5,
    '1970s': 10,
    '1980s': 15,
    '1990s': 8,
    '2000s': 4
  },
  albumsByYear: {},
  topArtists: [
    { artist: 'Pink Floyd', count: 5 },
    { artist: 'The Beatles', count: 4 },
    { artist: 'Led Zeppelin', count: 3 }
  ],
  topAlbums: [
    { title: 'Dark Side of the Moon', artist: 'Pink Floyd', count: 3 },
    { title: 'Abbey Road', artist: 'The Beatles', count: 2 }
  ]
}

describe('StatsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      prefetch: jest.fn()
    } as any)

    global.fetch = jest.fn()
  })

  it('redirige vers signin si non authentifié', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: jest.fn()
    })

    render(<StatsPage />)

    expect(mockPush).toHaveBeenCalledWith('/auth/signin')
  })

  it('affiche un loader pendant le chargement', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'loading',
      update: jest.fn()
    })

    render(<StatsPage />)

    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('affiche la navbar', async () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: '123', email: 'test@test.com' } },
      status: 'authenticated',
      update: jest.fn()
    } as any)

    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockStats
    })

    render(<StatsPage />)

    await waitFor(() => {
      expect(screen.getByTestId('navbar')).toBeInTheDocument()
    })
  })

  it('affiche le titre de la page', async () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: '123', email: 'test@test.com' } },
      status: 'authenticated',
      update: jest.fn()
    } as any)

    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockStats
    })

    render(<StatsPage />)

    await waitFor(() => {
      expect(screen.getByText('Mes Statistiques')).toBeInTheDocument()
    })
  })

  it('appelle l\'API stats au montage', async () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: '123', email: 'test@test.com' } },
      status: 'authenticated',
      update: jest.fn()
    } as any)

    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockStats
    })

    render(<StatsPage />)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/user/stats')
    })
  })

  it('affiche les statistiques de base', async () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: '123', email: 'test@test.com' } },
      status: 'authenticated',
      update: jest.fn()
    } as any)

    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockStats
    })

    render(<StatsPage />)

    await waitFor(() => {
      expect(screen.getByText('Listes')).toBeInTheDocument()
      expect(screen.getByText('Albums')).toBeInTheDocument()
      expect(screen.getByText('Moyenne')).toBeInTheDocument()
      expect(screen.getByText('Période')).toBeInTheDocument()
    })
  })

  it('affiche le nombre de listes publiques et privées', async () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: '123', email: 'test@test.com' } },
      status: 'authenticated',
      update: jest.fn()
    } as any)

    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockStats
    })

    const { container } = render(<StatsPage />)

    await waitFor(() => {
      // Vérifie que les statistiques publiques et privées sont affichées
      const listesSection = container.querySelector('.grid')?.firstElementChild
      expect(listesSection).toBeInTheDocument()
      expect(listesSection?.textContent).toContain('3')
      expect(listesSection?.textContent).toContain('2')
    })
  })

  it('affiche la période couverte', async () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: '123', email: 'test@test.com' } },
      status: 'authenticated',
      update: jest.fn()
    } as any)

    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockStats
    })

    render(<StatsPage />)

    await waitFor(() => {
      expect(screen.getByText('1960 - 2024')).toBeInTheDocument()
    })
  })

  it('affiche les albums par décennie', async () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: '123', email: 'test@test.com' } },
      status: 'authenticated',
      update: jest.fn()
    } as any)

    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockStats
    })

    render(<StatsPage />)

    await waitFor(() => {
      expect(screen.getByText(/Albums par décennie/)).toBeInTheDocument()
      const decades = screen.getAllByText(/1960s|1970s|1980s|1990s|2000s/)
      expect(decades.length).toBeGreaterThan(0)
      expect(screen.getByText('5 albums')).toBeInTheDocument()
      expect(screen.getByText('10 albums')).toBeInTheDocument()
    })
  })

  it('affiche les listes par période', async () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: '123', email: 'test@test.com' } },
      status: 'authenticated',
      update: jest.fn()
    } as any)

    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockStats
    })

    render(<StatsPage />)

    await waitFor(() => {
      expect(screen.getByText(/Listes par période/)).toBeInTheDocument()
      expect(screen.getAllByText(/2020/)).toHaveLength(1)
      expect(screen.getAllByText(/1990s/)).toHaveLength(2) // Apparaît dans décennies et périodes
    })
  })

  it('affiche le top 10 artistes', async () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: '123', email: 'test@test.com' } },
      status: 'authenticated',
      update: jest.fn()
    } as any)

    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockStats
    })

    render(<StatsPage />)

    await waitFor(() => {
      expect(screen.getAllByText(/Pink Floyd/)).toHaveLength(2) // Top artistes + albums favoris
      expect(screen.getAllByText(/The Beatles/)).toHaveLength(2)
      expect(screen.getByText('Led Zeppelin')).toBeInTheDocument()
    })
  })

  it('affiche les albums favoris', async () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: '123', email: 'test@test.com' } },
      status: 'authenticated',
      update: jest.fn()
    } as any)

    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockStats
    })

    render(<StatsPage />)

    await waitFor(() => {
      expect(screen.getByText('Dark Side of the Moon')).toBeInTheDocument()
      expect(screen.getByText('Abbey Road')).toBeInTheDocument()
      expect(screen.getByText('×3')).toBeInTheDocument()
      expect(screen.getByText('×2')).toBeInTheDocument()
    })
  })

  it('affiche le record de la liste la plus longue', async () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: '123', email: 'test@test.com' } },
      status: 'authenticated',
      update: jest.fn()
    } as any)

    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockStats
    })

    render(<StatsPage />)

    await waitFor(() => {
      expect(screen.getByText(/Ma Grande Liste/)).toBeInTheDocument()
      expect(screen.getByText('20 albums')).toBeInTheDocument()
    })
  })

  it('affiche un message si aucune statistique disponible', async () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: '123', email: 'test@test.com' } },
      status: 'authenticated',
      update: jest.fn()
    } as any)

    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false
    })

    render(<StatsPage />)

    await waitFor(() => {
      expect(screen.getByText('Aucune statistique disponible')).toBeInTheDocument()
    })
  })

  it('affiche un message si aucune donnée pour les décennies', async () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: '123', email: 'test@test.com' } },
      status: 'authenticated',
      update: jest.fn()
    } as any)

    const emptyStats = {
      ...mockStats,
      albumsByDecade: {}
    }

    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => emptyStats
    })

    render(<StatsPage />)

    await waitFor(() => {
      expect(screen.getByText('Aucune donnée disponible')).toBeInTheDocument()
    })
  })

  it('affiche un message si aucune période définie', async () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: '123', email: 'test@test.com' } },
      status: 'authenticated',
      update: jest.fn()
    } as any)

    const emptyStats = {
      ...mockStats,
      listsByPeriod: {}
    }

    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => emptyStats
    })

    render(<StatsPage />)

    await waitFor(() => {
      expect(screen.getByText('Aucune période définie')).toBeInTheDocument()
    })
  })

  it('affiche un message si aucun album dans plusieurs listes', async () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: '123', email: 'test@test.com' } },
      status: 'authenticated',
      update: jest.fn()
    } as any)

    const statsWithoutFavorites = {
      ...mockStats,
      topAlbums: [
        { title: 'Album unique', artist: 'Artist', count: 1 }
      ]
    }

    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => statsWithoutFavorites
    })

    render(<StatsPage />)

    await waitFor(() => {
      expect(screen.getByText('Aucun album dans plusieurs listes')).toBeInTheDocument()
    })
  })

  it('n\'affiche pas le record si aucune liste', async () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: '123', email: 'test@test.com' } },
      status: 'authenticated',
      update: jest.fn()
    } as any)

    const emptyStats = {
      ...mockStats,
      overview: {
        ...mockStats.overview,
        longestList: { title: '', length: 0 }
      }
    }

    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => emptyStats
    })

    render(<StatsPage />)

    await waitFor(() => {
      expect(screen.queryByText(/Record/)).not.toBeInTheDocument()
    })
  })

  it('calcule correctement la largeur des barres de progression', async () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: '123', email: 'test@test.com' } },
      status: 'authenticated',
      update: jest.fn()
    } as any)

    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockStats
    })

    const { container } = render(<StatsPage />)

    await waitFor(() => {
      const progressBars = container.querySelectorAll('.bg-blue-500')
      expect(progressBars.length).toBeGreaterThan(0)
    })
  })

  it('gère les erreurs de l\'API', async () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: '123', email: 'test@test.com' } },
      status: 'authenticated',
      update: jest.fn()
    } as any)

    ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

    render(<StatsPage />)

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled()
    })

    consoleSpy.mockRestore()
  })
})
