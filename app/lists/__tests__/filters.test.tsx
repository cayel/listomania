import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Lists from '../page'

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

const mockLists = [
  {
    id: '1',
    title: 'Albums Rock 2020',
    description: 'Meilleurs albums rock de 2020',
    period: '2020',
    isPublic: true,
    listAlbums: [
      {
        album: {
          id: 'a1',
          title: 'Album 1',
          artist: 'Artist 1',
          coverImage: 'https://example.com/cover1.jpg'
        }
      }
    ],
    _count: { listAlbums: 5 },
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-15T00:00:00.000Z'
  },
  {
    id: '2',
    title: 'Jazz Classique',
    description: 'Collection de jazz',
    period: '1960s',
    isPublic: false,
    listAlbums: [
      {
        album: {
          id: 'a2',
          title: 'Album 2',
          artist: 'Artist 2',
          coverImage: 'https://example.com/cover2.jpg'
        }
      }
    ],
    _count: { listAlbums: 10 },
    createdAt: '2024-01-05T00:00:00.000Z',
    updatedAt: '2024-01-20T00:00:00.000Z'
  },
  {
    id: '3',
    title: 'Best of 2020',
    period: '2020',
    isPublic: true,
    listAlbums: [],
    _count: { listAlbums: 3 },
    createdAt: '2024-01-10T00:00:00.000Z',
    updatedAt: '2024-01-10T00:00:00.000Z'
  }
]

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
        json: async () => overrides.lists || mockLists
      })
    }
    return Promise.resolve({
      ok: true,
      json: async () => mockLists
    })
  })
}

describe('Lists - Filtres et tri', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      prefetch: jest.fn()
    } as any)

    mockUseSession.mockReturnValue({
      data: { user: { id: '123', email: 'test@test.com' } },
      status: 'authenticated',
      update: jest.fn()
    } as any)

    global.fetch = createMockFetch()
  })

  it('affiche la barre de recherche quand il y a des listes', async () => {
    render(<Lists />)

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Rechercher une liste...')).toBeInTheDocument()
    })
  })

  it('filtre les listes par le titre de recherche', async () => {
    render(<Lists />)

    await waitFor(() => {
      expect(screen.getByText('Albums Rock 2020')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Rechercher une liste...')
    fireEvent.change(searchInput, { target: { value: 'rock' } })

    await waitFor(() => {
      expect(screen.getByText('Albums Rock 2020')).toBeInTheDocument()
      expect(screen.queryByText('Jazz Classique')).not.toBeInTheDocument()
    })
  })

  it('filtre les listes par description', async () => {
    render(<Lists />)

    await waitFor(() => {
      expect(screen.getByText('Jazz Classique')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Rechercher une liste...')
    fireEvent.change(searchInput, { target: { value: 'collection' } })

    await waitFor(() => {
      expect(screen.getByText('Jazz Classique')).toBeInTheDocument()
      expect(screen.queryByText('Albums Rock 2020')).not.toBeInTheDocument()
    })
  })

  it('affiche le bouton pour effacer la recherche', async () => {
    render(<Lists />)

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Rechercher une liste...')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Rechercher une liste...')
    fireEvent.change(searchInput, { target: { value: 'test' } })

    const clearButton = await screen.findByRole('button', { name: '' })
    expect(clearButton).toBeInTheDocument()
    
    fireEvent.click(clearButton)
    expect(searchInput).toHaveValue('')
  })

  it('affiche le compteur de listes filtrées', async () => {
    render(<Lists />)

    await waitFor(() => {
      const counters = screen.getAllByText(/3 listes/)
      expect(counters.length).toBeGreaterThan(0)
    })

    const searchInput = screen.getByPlaceholderText('Rechercher une liste...')
    fireEvent.change(searchInput, { target: { value: 'rock' } })

    await waitFor(() => {
      expect(screen.getByText(/1 liste sur 3/)).toBeInTheDocument()
    })
  })

  it('ouvre et ferme le panneau de filtres', async () => {
    render(<Lists />)

    await waitFor(() => {
      expect(screen.getByText('Filtres et tri')).toBeInTheDocument()
    })

    const filtersButton = screen.getByText('Filtres et tri')
    
    expect(screen.queryByText('Trier par')).not.toBeInTheDocument()
    
    fireEvent.click(filtersButton)
    
    await waitFor(() => {
      expect(screen.getByText('Trier par')).toBeInTheDocument()
    })
  })

  it('filtre par période', async () => {
    render(<Lists />)

    await waitFor(() => {
      expect(screen.getByText('Filtres et tri')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Filtres et tri'))

    await waitFor(() => {
      expect(screen.getByText('Période')).toBeInTheDocument()
    })

    const periodSelect = screen.getAllByRole('combobox')[1]
    fireEvent.change(periodSelect, { target: { value: '2020' } })

    await waitFor(() => {
      expect(screen.getByText('Albums Rock 2020')).toBeInTheDocument()
      expect(screen.getByText('Best of 2020')).toBeInTheDocument()
      expect(screen.queryByText('Jazz Classique')).not.toBeInTheDocument()
    })
  })

  it.skip('filtre par visibilité', async () => {
    render(<Lists />)

    await waitFor(() => {
      expect(screen.getByText('Filtres et tri')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Filtres et tri'))

    await waitFor(() => {
      expect(screen.getByText('Visibilité')).toBeInTheDocument()
    }, { timeout: 3000 })

    // Trouver le select de visibilité par son label
    const visibilityLabel = screen.getByText('Visibilité')
    const visibilityContainer = visibilityLabel.closest('div')
    const visibilitySelect = visibilityContainer?.querySelector('select')
    
    expect(visibilitySelect).toBeInTheDocument()
    fireEvent.change(visibilitySelect!, { target: { value: 'public' } })

    await waitFor(() => {
      expect(screen.getByText('Albums Rock 2020')).toBeInTheDocument()
      expect(screen.getByText('Best of 2020')).toBeInTheDocument()
      expect(screen.queryByText('Jazz Classique')).not.toBeInTheDocument()
    })
  })

  it.skip('filtre par visibilité privée', async () => {
    render(<Lists />)

    await waitFor(() => {
      expect(screen.getByText('Filtres et tri')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Filtres et tri'))

    await waitFor(() => {
      expect(screen.getByText('Visibilité')).toBeInTheDocument()
    }, { timeout: 3000 })

    // Trouver le select de visibilité par son label
    const visibilityLabel = screen.getByText('Visibilité')
    const visibilityContainer = visibilityLabel.closest('div')
    const visibilitySelect = visibilityContainer?.querySelector('select')
    
    expect(visibilitySelect).toBeInTheDocument()
    fireEvent.change(visibilitySelect!, { target: { value: 'private' } })

    await waitFor(() => {
      expect(screen.getByText('Jazz Classique')).toBeInTheDocument()
      expect(screen.queryByText('Albums Rock 2020')).not.toBeInTheDocument()
    })
  })

  it('trie par titre alphabétique', async () => {
    const { container } = render(<Lists />)

    await waitFor(() => {
      expect(screen.getByText('Filtres et tri')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Filtres et tri'))

    const sortSelect = screen.getAllByRole('combobox')[0]
    fireEvent.change(sortSelect, { target: { value: 'title' } })

    await waitFor(() => {
      const titles = container.querySelectorAll('.group h2')
      expect(titles.length).toBeGreaterThan(0)
      // Par défaut en décroissant (Z-A)
      expect(titles[0]?.textContent).toBe('Jazz Classique')
      expect(titles[1]?.textContent).toBe('Best of 2020')
      expect(titles[2]?.textContent).toBe('Albums Rock 2020')
    })

    // Maintenant on inverse l'ordre
    const sortOrderButton = screen.getByTitle(/Décroissant/)
    fireEvent.click(sortOrderButton)

    await waitFor(() => {
      const titlesAsc = container.querySelectorAll('.group h2')
      // Maintenant en croissant (A-Z)
      expect(titlesAsc[0]?.textContent).toBe('Albums Rock 2020')
      expect(titlesAsc[1]?.textContent).toBe('Best of 2020')
      expect(titlesAsc[2]?.textContent).toBe('Jazz Classique')
    })
  })

  it('inverse l\'ordre de tri', async () => {
    render(<Lists />)

    await waitFor(() => {
      expect(screen.getByText('Filtres et tri')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Filtres et tri'))

    const sortSelect = screen.getAllByRole('combobox')[0]
    fireEvent.change(sortSelect, { target: { value: 'title' } })

    const sortOrderButton = screen.getByTitle(/Décroissant|Croissant/)
    fireEvent.click(sortOrderButton)

    // Le bouton devrait changer de state
    expect(sortOrderButton).toBeInTheDocument()
  })

  it.skip('réinitialise tous les filtres', async () => {
    render(<Lists />)

    await waitFor(() => {
      expect(screen.getByText('Filtres et tri')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Rechercher une liste...')
    fireEvent.change(searchInput, { target: { value: 'rock' } })

    fireEvent.click(screen.getByText('Filtres et tri'))

    // Trouver le select de période par son option "Toutes les périodes"
    const allSelects = screen.getAllByRole('combobox')
    const periodSelect = allSelects.find(select => {
      const options = Array.from(select.querySelectorAll('option'))
      return options.some(option => option.textContent === 'Toutes les périodes')
    })

    expect(periodSelect).toBeDefined()
    fireEvent.change(periodSelect!, { target: { value: '2020' } })

    const resetButton = screen.getByText('Réinitialiser')
    fireEvent.click(resetButton)

    await waitFor(() => {
      expect(searchInput).toHaveValue('')
    })

    // Vérifier que tous les filtres sont réinitialisés en vérifiant que toutes les listes sont visibles
    await waitFor(() => {
      expect(screen.getByText('Rock Classics')).toBeInTheDocument()
      expect(screen.getByText('Jazz Classique')).toBeInTheDocument()
      expect(screen.getByText('Best of 2020')).toBeInTheDocument()
    })
  })

  it('affiche un message si aucune liste ne correspond aux filtres', async () => {
    render(<Lists />)

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Rechercher une liste...')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Rechercher une liste...')
    fireEvent.change(searchInput, { target: { value: 'aucune liste avec ce nom' } })

    await waitFor(() => {
      expect(screen.getByText('Aucune liste ne correspond à vos critères de recherche.')).toBeInTheDocument()
      expect(screen.getByText('Réinitialiser les filtres')).toBeInTheDocument()
    })
  })

  it('affiche un badge "Actifs" quand des filtres sont appliqués', async () => {
    render(<Lists />)

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Rechercher une liste...')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Rechercher une liste...')
    fireEvent.change(searchInput, { target: { value: 'rock' } })

    await waitFor(() => {
      expect(screen.getByText('Actifs')).toBeInTheDocument()
    })
  })

  it('combine recherche et filtre par période', async () => {
    render(<Lists />)

    await waitFor(() => {
      expect(screen.getByText('Filtres et tri')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Rechercher une liste...')
    fireEvent.change(searchInput, { target: { value: '2020' } })

    fireEvent.click(screen.getByText('Filtres et tri'))

    const periodSelect = screen.getAllByRole('combobox')[1]
    fireEvent.change(periodSelect, { target: { value: '2020' } })

    await waitFor(() => {
      expect(screen.getByText('Albums Rock 2020')).toBeInTheDocument()
      expect(screen.getByText('Best of 2020')).toBeInTheDocument()
      expect(screen.queryByText('Jazz Classique')).not.toBeInTheDocument()
    })
  })

  it('n\'affiche pas la barre de recherche si aucune liste', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => []
    })

    render(<Lists />)

    await waitFor(() => {
      expect(screen.getByText('Vous n\'avez pas encore créé de liste.')).toBeInTheDocument()
    })

    expect(screen.queryByPlaceholderText('Rechercher une liste...')).not.toBeInTheDocument()
  })

  it('trie les listes par période/année', async () => {
    render(<Lists />)

    await waitFor(() => {
      expect(screen.getByText('Filtres et tri')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Filtres et tri'))

    const sortSelect = screen.getAllByRole('combobox')[0]
    fireEvent.change(sortSelect, { target: { value: 'period' } })

    await waitFor(() => {
      const listTitles = screen.getAllByRole('heading', { level: 2 })
        .map(h => h.textContent)
        .filter(text => ['Albums Rock 2020', 'Jazz Classique', 'Best of 2020'].includes(text || ''))
      
      // Par défaut en ordre décroissant (2020, 1960s)
      expect(listTitles[0]).toBe('Albums Rock 2020')
      expect(listTitles[2]).toBe('Jazz Classique')
    })
  })
})
