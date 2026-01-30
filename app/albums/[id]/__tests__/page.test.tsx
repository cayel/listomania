import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import AlbumListsPage from '../page'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'

// Mock des hooks Next.js
jest.mock('next-auth/react')
jest.mock('next/navigation')

// Mock global fetch
global.fetch = jest.fn()

const mockUseSession = useSession as jest.Mock
const mockUseRouter = useRouter as jest.Mock
const mockUseParams = useParams as jest.Mock
const mockFetch = global.fetch as jest.Mock

describe('AlbumListsPage', () => {
  const mockAlbumData = {
    album: {
      id: 'album-1',
      discogsId: '123',
      artist: 'Pink Floyd',
      title: 'The Dark Side of the Moon',
      year: 1973,
      coverImage: 'https://example.com/cover.jpg'
    },
    lists: [
      {
        listId: 'list-1',
        listTitle: 'Best Albums of the 70s',
        listDescription: 'The greatest albums from the 70s',
        listPeriod: '1970s',
        isPublic: true,
        position: 1,
        totalAlbums: 10,
        updatedAt: '2026-01-30T00:00:00.000Z',
        createdAt: '2026-01-20T00:00:00.000Z',
        owner: {
          id: 'user-1',
          name: 'John Doe',
          image: 'https://example.com/avatar.jpg'
        },
        isOwner: true
      },
      {
        listId: 'list-2',
        listTitle: 'My Private Collection',
        listDescription: 'Personal favorites',
        listPeriod: '1980s',
        isPublic: false,
        position: 5,
        totalAlbums: 20,
        updatedAt: '2026-01-25T00:00:00.000Z',
        createdAt: '2026-01-15T00:00:00.000Z',
        owner: {
          id: 'user-2',
          name: 'Jane Smith',
          image: null
        },
        isOwner: false
      }
    ],
    totalLists: 2
  }

  const mockPush = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseRouter.mockReturnValue({ push: mockPush, back: jest.fn() })
    mockUseParams.mockReturnValue({ id: 'album-1' })
    mockUseSession.mockReturnValue({
      data: { user: { id: 'user-1', email: 'test@example.com' } },
      status: 'authenticated'
    })
  })

  it('affiche le titre de l\'album', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockAlbumData
    })

    render(<AlbumListsPage />)

    await waitFor(() => {
      expect(screen.getByText('The Dark Side of the Moon')).toBeInTheDocument()
      expect(screen.getByText('Pink Floyd')).toBeInTheDocument()
      expect(screen.getByText('1973')).toBeInTheDocument()
    })
  })

  it('affiche la liste des listes contenant l\'album', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockAlbumData
    })

    render(<AlbumListsPage />)

    await waitFor(() => {
      expect(screen.getByText('Best Albums of the 70s')).toBeInTheDocument()
      expect(screen.getByText('My Private Collection')).toBeInTheDocument()
    })
  })

  it('affiche les informations de chaque liste', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockAlbumData
    })

    render(<AlbumListsPage />)

    await waitFor(() => {
      expect(screen.getByText('The greatest albums from the 70s')).toBeInTheDocument()
      expect(screen.getByText('Position #1 sur 10')).toBeInTheDocument()
      expect(screen.getByText('Position #5 sur 20')).toBeInTheDocument()
    })
  })

  it('affiche le badge de propriétaire', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockAlbumData
    })

    render(<AlbumListsPage />)

    await waitFor(() => {
      // Le premier est la liste de l'utilisateur, donc affiche "Votre liste"
      expect(screen.getByText('Votre liste')).toBeInTheDocument()
      // Le second n'est pas le sien, donc affiche le nom du propriétaire
      expect(screen.getByText('Par Jane Smith')).toBeInTheDocument()
    })
  })

  it('affiche les icônes de visibilité', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockAlbumData
    })

    render(<AlbumListsPage />)

    await waitFor(() => {
      // Vérifie la présence des icônes avec les titles
      const publicIcon = document.querySelector('[title="Liste publique"]')
      const privateIcon = document.querySelector('[title="Liste privée"]')
      expect(publicIcon).toBeInTheDocument()
      expect(privateIcon).toBeInTheDocument()
    })
  })

  it('permet de naviguer vers une liste en cliquant dessus', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockAlbumData
    })

    render(<AlbumListsPage />)

    await waitFor(() => {
      const listCard = screen.getByText('Best Albums of the 70s').closest('div.cursor-pointer')
      expect(listCard).toBeInTheDocument()
      listCard?.click()
      expect(mockPush).toHaveBeenCalledWith('/lists/list-1')
    })
  })

  it('affiche un message si aucune liste ne contient l\'album', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ...mockAlbumData,
        lists: [],
        totalLists: 0
      })
    })

    render(<AlbumListsPage />)

    await waitFor(() => {
      expect(screen.getByText(/Cet album n'est dans aucune liste accessible/i)).toBeInTheDocument()
    })
  })

  it('affiche un message pour inviter à se connecter si non authentifié', async () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated'
    })

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ...mockAlbumData,
        lists: [],
        totalLists: 0
      })
    })

    render(<AlbumListsPage />)

    await waitFor(() => {
      expect(screen.getByText(/Connectez-vous pour voir vos listes privées/i)).toBeInTheDocument()
    })
  })

  it('gère les erreurs de chargement', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Erreur réseau'))

    render(<AlbumListsPage />)

    await waitFor(() => {
      expect(screen.getByText('Erreur réseau')).toBeInTheDocument()
    })
  })

  it('affiche "1 liste" au singulier', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ...mockAlbumData,
        lists: [mockAlbumData.lists[0]],
        totalLists: 1
      })
    })

    render(<AlbumListsPage />)

    await waitFor(() => {
      expect(screen.getByText('1 liste')).toBeInTheDocument()
    })
  })

  it('affiche "X listes" au pluriel', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockAlbumData
    })

    render(<AlbumListsPage />)

    await waitFor(() => {
      expect(screen.getByText('2 listes')).toBeInTheDocument()
    })
  })

  it('affiche le bouton retour', async () => {
    const mockBack = jest.fn()
    mockUseRouter.mockReturnValue({ push: mockPush, back: mockBack })
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockAlbumData
    })

    render(<AlbumListsPage />)

    await waitFor(() => {
      const backButton = screen.getByText('Retour').closest('button')
      expect(backButton).toBeInTheDocument()
      backButton?.click()
      expect(mockBack).toHaveBeenCalled()
    })
  })

  it('affiche le spinner pendant le chargement', () => {
    mockFetch.mockImplementation(() => new Promise(() => {}))

    render(<AlbumListsPage />)

    // Le spinner est dans un div avec la classe animate-spin
    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('gère correctement une réponse 404', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ error: 'Album not found' })
    })

    render(<AlbumListsPage />)

    await waitFor(() => {
      expect(screen.getByText('Impossible de charger les données')).toBeInTheDocument()
    })
  })
})
