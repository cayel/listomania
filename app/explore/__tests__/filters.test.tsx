import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Explore from '../page'

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: { user: { id: '1', name: 'Test User' } },
    status: 'authenticated'
  }))
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn()
  }))
}))

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    return <img {...props} />
  }
}))

// Mock Navbar
jest.mock('@/components/navbar', () => ({
  Navbar: () => <div data-testid="navbar">Navbar</div>
}))

// Mock lucide-react
jest.mock('lucide-react', () => ({
  Calendar: () => <div data-testid="calendar-icon" />,
  Globe: () => <div data-testid="globe-icon" />,
  User: () => <div data-testid="user-icon" />,
  Search: () => <div data-testid="search-icon" />,
  X: () => <div data-testid="x-icon" />,
  ArrowUpDown: () => <div data-testid="arrow-up-down-icon" />,
  SlidersHorizontal: () => <div data-testid="sliders-icon" />
}))

const mockLists = [
  {
    id: '1',
    title: 'Rock Classics',
    description: 'Best rock albums',
    period: '1970s',
    user: { id: 'u1', name: 'Alice' },
    listAlbums: [
      { album: { id: 'a1', title: 'Album 1', artist: 'Artist 1', coverImage: '/cover1.jpg' } }
    ],
    _count: { listAlbums: 1 }
  },
  {
    id: '2',
    title: 'Jazz Legends',
    description: 'Classic jazz collection',
    period: '1960s',
    user: { id: 'u2', name: 'Bob' },
    listAlbums: [
      { album: { id: 'a2', title: 'Album 2', artist: 'Artist 2', coverImage: '/cover2.jpg' } },
      { album: { id: 'a3', title: 'Album 3', artist: 'Artist 3', coverImage: '/cover3.jpg' } }
    ],
    _count: { listAlbums: 2 }
  },
  {
    id: '3',
    title: 'Modern Hits',
    description: 'Contemporary music',
    period: '2020s',
    user: { id: 'u3', name: 'Charlie' },
    listAlbums: [
      { album: { id: 'a4', title: 'Album 4', artist: 'Artist 4', coverImage: '/cover4.jpg' } },
      { album: { id: 'a5', title: 'Album 5', artist: 'Artist 5', coverImage: '/cover5.jpg' } },
      { album: { id: 'a6', title: 'Album 6', artist: 'Artist 6', coverImage: '/cover6.jpg' } }
    ],
    _count: { listAlbums: 3 }
  }
]

// Helper pour créer un mock fetch intelligent
const createMockFetch = (overrides: Record<string, any> = {}) => {
  return jest.fn((url: string) => {
    if (url.includes('/api/categories')) {
      return Promise.resolve({
        ok: true,
        json: async () => overrides.categories || []
      })
    }
    if (url.includes('/api/lists/public')) {
      return Promise.resolve({
        ok: true,
        json: async () => overrides.lists || { lists: mockLists, hasMore: false }
      })
    }
    return Promise.resolve({
      ok: true,
      json: async () => ({ lists: mockLists, hasMore: false })
    })
  }) as jest.Mock
}

describe('Explore - Filtres et recherche', () => {
  beforeEach(() => {
    global.fetch = createMockFetch()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('affiche la barre de recherche', async () => {
    render(<Explore />)
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Rechercher par titre, description, auteur ou période/i)).toBeInTheDocument()
    })
  })

  test.skip('filtre les listes par recherche textuelle', async () => {
    const user = userEvent.setup()
    render(<Explore />)

    await waitFor(() => {
      expect(screen.getByText('Rock Classics')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText(/Rechercher par titre, description, auteur ou période/i)
    await user.type(searchInput, 'Jazz')

    await waitFor(() => {
      expect(screen.getByText('Jazz Legends')).toBeInTheDocument()
      expect(screen.queryByText('Rock Classics')).not.toBeInTheDocument()
      expect(screen.queryByText('Modern Hits')).not.toBeInTheDocument()
    })
  })

  test('affiche le bouton pour effacer la recherche', async () => {
    const user = userEvent.setup()
    render(<Explore />)

    await waitFor(() => {
      expect(screen.getByText('Rock Classics')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText(/Rechercher par titre, description, auteur ou période/i)
    await user.type(searchInput, 'Rock')

    await waitFor(() => {
      const clearButtons = screen.getAllByTestId('x-icon')
      expect(clearButtons.length).toBeGreaterThan(0)
    })
  })

  test.skip('efface la recherche avec le bouton X', async () => {
    const user = userEvent.setup()
    render(<Explore />)

    await waitFor(() => {
      expect(screen.getByText('Rock Classics')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText(/Rechercher par titre, description, auteur ou période/i)
    await user.type(searchInput, 'Jazz')

    await waitFor(() => {
      expect(screen.queryByText('Rock Classics')).not.toBeInTheDocument()
    })

    const searchContainer = searchInput.closest('.relative')
    const clearButton = searchContainer?.querySelector('button')
    if (clearButton) {
      await user.click(clearButton)
    }

    await waitFor(() => {
      expect(screen.getByText('Rock Classics')).toBeInTheDocument()
      expect(screen.getByText('Jazz Legends')).toBeInTheDocument()
      expect(screen.getByText('Modern Hits')).toBeInTheDocument()
    })
  })

  test('affiche le compteur de résultats', async () => {
    render(<Explore />)

    await waitFor(() => {
      expect(screen.getByText(/3 listes/i)).toBeInTheDocument()
    })
  })

  test('ouvre et ferme le panneau de filtres', async () => {
    const user = userEvent.setup()
    render(<Explore />)

    await waitFor(() => {
      expect(screen.getByText('Rock Classics')).toBeInTheDocument()
    })

    const filterButton = screen.getByText('Filtres').closest('button')
    expect(filterButton).toBeInTheDocument()

    // Ouvrir
    if (filterButton) {
      await user.click(filterButton)
    }

    await waitFor(() => {
      expect(screen.getByText('Trier par')).toBeInTheDocument()
      expect(screen.getByLabelText('Période/Année')).toBeInTheDocument()
    })

    // Fermer
    if (filterButton) {
      await user.click(filterButton)
    }

    await waitFor(() => {
      expect(screen.queryByText('Trier par')).not.toBeInTheDocument()
    })
  })

  test.skip('filtre les listes par période', async () => {
    const user = userEvent.setup()
    render(<Explore />)

    await waitFor(() => {
      expect(screen.getByText('Rock Classics')).toBeInTheDocument()
    })

    const filterButton = screen.getByText('Filtres').closest('button')
    if (filterButton) {
      await user.click(filterButton)
    }

    await waitFor(() => {
      expect(screen.getByLabelText('Période/Année')).toBeInTheDocument()
    })

    const periodSelect = screen.getByLabelText('Période/Année') as HTMLSelectElement

    expect(periodSelect).toBeInTheDocument()

    await user.selectOptions(periodSelect, '1970s')

    await waitFor(() => {
      expect(screen.getByText('Rock Classics')).toBeInTheDocument()
      expect(screen.queryByText('Jazz Legends')).not.toBeInTheDocument()
      expect(screen.queryByText('Modern Hits')).not.toBeInTheDocument()
    })
  })

  test.skip('trie les listes par titre alphabétiquement', async () => {
    const user = userEvent.setup()
    render(<Explore />)

    await waitFor(() => {
      expect(screen.getByText('Rock Classics')).toBeInTheDocument()
    })

    const filterButton = screen.getByText('Filtres').closest('button')
    if (filterButton) {
      await user.click(filterButton)
    }

    await waitFor(() => {
      expect(screen.getByText('Trier par')).toBeInTheDocument()
    })

    const sortSelects = screen.getAllByRole('combobox')
    const sortSelect = sortSelects.find(select => 
      within(select as HTMLElement).queryByText('Plus récentes')
    ) as HTMLSelectElement

    expect(sortSelect).toBeInTheDocument()

    await user.selectOptions(sortSelect, 'title')

    await waitFor(() => {
      const listTitles = screen.getAllByRole('heading', { level: 2 })
        .map(h => h.textContent)
        .filter(text => ['Rock Classics', 'Jazz Legends', 'Modern Hits'].includes(text || ''))
      
      // Par défaut en ordre décroissant (Z-A)
      expect(listTitles[0]).toBe('Rock Classics')
      expect(listTitles[1]).toBe('Modern Hits')
      expect(listTitles[2]).toBe('Jazz Legends')
    })
  })

  test.skip('inverse l\'ordre de tri', async () => {
    const user = userEvent.setup()
    render(<Explore />)

    await waitFor(() => {
      expect(screen.getByText('Rock Classics')).toBeInTheDocument()
    })

    const filterButton = screen.getByText('Filtres').closest('button')
    if (filterButton) {
      await user.click(filterButton)
    }

    await waitFor(() => {
      expect(screen.getByText('Trier par')).toBeInTheDocument()
    })

    const sortSelects = screen.getAllByRole('combobox')
    const sortSelect = sortSelects.find(select => 
      within(select as HTMLElement).queryByText('Plus récentes')
    ) as HTMLSelectElement

    await user.selectOptions(sortSelect, 'title')

    await waitFor(() => {
      expect(screen.getByText('Décroissant')).toBeInTheDocument()
    })

    const orderButton = screen.getByText('Décroissant').closest('button')
    if (orderButton) {
      await user.click(orderButton)
    }

    await waitFor(() => {
      expect(screen.getByText('Croissant')).toBeInTheDocument()
      
      const listTitles = screen.getAllByRole('heading', { level: 2 })
        .map(h => h.textContent)
        .filter(text => ['Rock Classics', 'Jazz Legends', 'Modern Hits'].includes(text || ''))
      
      // En ordre croissant (A-Z)
      expect(listTitles[0]).toBe('Jazz Legends')
      expect(listTitles[1]).toBe('Modern Hits')
      expect(listTitles[2]).toBe('Rock Classics')
    })
  })

  test.skip('trie par nombre d\'albums', async () => {
    const user = userEvent.setup()
    render(<Explore />)

    await waitFor(() => {
      expect(screen.getByText('Rock Classics')).toBeInTheDocument()
    })

    const filterButton = screen.getByText('Filtres').closest('button')
    if (filterButton) {
      await user.click(filterButton)
    }

    await waitFor(() => {
      expect(screen.getByText('Trier par')).toBeInTheDocument()
    })

    const sortSelects = screen.getAllByRole('combobox')
    const sortSelect = sortSelects.find(select => 
      within(select as HTMLElement).queryByText('Plus récentes')
    ) as HTMLSelectElement

    await user.selectOptions(sortSelect, 'albums')

    await waitFor(() => {
      const listTitles = screen.getAllByRole('heading', { level: 2 })
        .map(h => h.textContent)
        .filter(text => ['Rock Classics', 'Jazz Legends', 'Modern Hits'].includes(text || ''))
      
      // Décroissant: 3, 2, 1
      expect(listTitles[0]).toBe('Modern Hits') // 3 albums
      expect(listTitles[1]).toBe('Jazz Legends') // 2 albums
      expect(listTitles[2]).toBe('Rock Classics') // 1 album
    })
  })

  test.skip('trie par période/année', async () => {
    const user = userEvent.setup()
    render(<Explore />)

    await waitFor(() => {
      expect(screen.getByText('Rock Classics')).toBeInTheDocument()
    })

    const filterButton = screen.getByText('Filtres').closest('button')
    if (filterButton) {
      await user.click(filterButton)
    }

    await waitFor(() => {
      expect(screen.getByText('Trier par')).toBeInTheDocument()
    })

    const sortSelects = screen.getAllByRole('combobox')
    const sortSelect = sortSelects.find(select => 
      within(select as HTMLElement).queryByText('Plus récentes')
    ) as HTMLSelectElement

    await user.selectOptions(sortSelect, 'period')

    await waitFor(() => {
      const listTitles = screen.getAllByRole('heading', { level: 2 })
        .map(h => h.textContent)
        .filter(text => ['Rock Classics', 'Jazz Legends', 'Modern Hits'].includes(text || ''))
      
      // Décroissant: 2020s, 1970s, 1960s
      expect(listTitles[0]).toBe('Modern Hits')
      expect(listTitles[1]).toBe('Rock Classics')
      expect(listTitles[2]).toBe('Jazz Legends')
    })
  })

  test.skip('réinitialise tous les filtres', async () => {
    const user = userEvent.setup()
    render(<Explore />)

    await waitFor(() => {
      expect(screen.getByText('Rock Classics')).toBeInTheDocument()
    })

    // Appliquer une recherche
    const searchInput = screen.getByPlaceholderText(/Rechercher par titre, description, auteur ou période/i)
    await user.type(searchInput, 'Jazz')

    await waitFor(() => {
      expect(screen.queryByText('Rock Classics')).not.toBeInTheDocument()
    })

    // Ouvrir les filtres et réinitialiser
    const filterButton = screen.getByText('Filtres').closest('button')
    if (filterButton) {
      await user.click(filterButton)
    }

    await waitFor(() => {
      expect(screen.getByText('Réinitialiser')).toBeInTheDocument()
    })

    const resetButton = screen.getByText('Réinitialiser').closest('button')
    if (resetButton) {
      await user.click(resetButton)
    }

    await waitFor(() => {
      expect(searchInput).toHaveValue('')
      expect(screen.getByText('Rock Classics')).toBeInTheDocument()
      expect(screen.getByText('Jazz Legends')).toBeInTheDocument()
      expect(screen.getByText('Modern Hits')).toBeInTheDocument()
    })
  })

  test.skip('affiche un message quand aucun résultat', async () => {
    const user = userEvent.setup()
    render(<Explore />)

    await waitFor(() => {
      expect(screen.getByText('Rock Classics')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText(/Rechercher par titre, description, auteur ou période/i)
    await user.type(searchInput, 'xyz123nonexistent')

    await waitFor(() => {
      expect(screen.getByText(/Aucune liste ne correspond à vos critères de recherche/i)).toBeInTheDocument()
      expect(screen.queryByText('Rock Classics')).not.toBeInTheDocument()
    })
  })

  test('affiche le badge "Filtres actifs"', async () => {
    const user = userEvent.setup()
    render(<Explore />)

    await waitFor(() => {
      expect(screen.getByText('Rock Classics')).toBeInTheDocument()
    })

    // Appliquer une recherche
    const searchInput = screen.getByPlaceholderText(/Rechercher par titre, description, auteur ou période/i)
    await user.type(searchInput, 'Rock')

    await waitFor(() => {
      expect(screen.getByText('Filtres actifs')).toBeInTheDocument()
    })
  })

  test.skip('combine recherche et filtre par période', async () => {
    const user = userEvent.setup()
    render(<Explore />)

    await waitFor(() => {
      expect(screen.getByText('Rock Classics')).toBeInTheDocument()
    })

    // Recherche textuelle générique
    const searchInput = screen.getByPlaceholderText(/Rechercher par titre, description, auteur ou période/i)
    await user.type(searchInput, 'Classic')

    await waitFor(() => {
      // "Rock Classics" et "Jazz Legends" (description: "Classic jazz collection")
      const headings = screen.getAllByRole('heading', { level: 2 })
      expect(headings.length).toBeGreaterThanOrEqual(2)
    })

    // Ouvrir les filtres
    const filterButton = screen.getByText('Filtres').closest('button')
    if (filterButton) {
      await user.click(filterButton)
    }

    // Filtrer par période
    const periodSelect = screen.getByLabelText('Période/Année') as HTMLSelectElement

    await user.selectOptions(periodSelect, '1960s')

    await waitFor(() => {
      expect(screen.getByText('Jazz Legends')).toBeInTheDocument()
      expect(screen.queryByText('Rock Classics')).not.toBeInTheDocument()
      expect(screen.queryByText('Modern Hits')).not.toBeInTheDocument()
    })
  })

  test('n\'affiche pas la recherche quand il n\'y a pas de listes', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ lists: [], hasMore: false })
      })
    ) as jest.Mock

    render(<Explore />)

    await waitFor(() => {
      expect(screen.getByText(/Aucune liste publique pour le moment/i)).toBeInTheDocument()
    })

    expect(screen.queryByPlaceholderText(/Rechercher/i)).not.toBeInTheDocument()
  })
})
