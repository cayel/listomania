import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { AlbumDetailsModal } from '../album-details-modal'

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  X: ({ className }: { className?: string }) => (
    <svg data-testid="x-icon" className={className}>X</svg>
  ),
  ExternalLink: ({ className }: { className?: string }) => (
    <svg data-testid="external-link-icon" className={className}>ExternalLink</svg>
  ),
  Calendar: ({ className }: { className?: string }) => (
    <svg data-testid="calendar-icon" className={className}>Calendar</svg>
  ),
  Globe: ({ className }: { className?: string }) => (
    <svg data-testid="globe-icon" className={className}>Globe</svg>
  ),
  Disc: ({ className }: { className?: string }) => (
    <svg data-testid="disc-icon" className={className}>Disc</svg>
  ),
  Tag: ({ className }: { className?: string }) => (
    <svg data-testid="tag-icon" className={className}>Tag</svg>
  )
}))

// Mock global fetch
global.fetch = jest.fn()

describe('AlbumDetailsModal', () => {
  const mockOnClose = jest.fn()
  const mockAlbumDetails = {
    id: '12345',
    title: 'The Dark Side of the Moon',
    artist: 'Pink Floyd',
    year: 1973,
    coverImage: 'https://example.com/cover.jpg',
    type: 'master' as const,
    labels: ['Harvest', 'Capitol Records'],
    genres: ['Rock', 'Progressive Rock'],
    styles: ['Psychedelic Rock', 'Art Rock'],
    country: 'UK',
    discogsUrl: 'https://www.discogs.com/master/12345'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockAlbumDetails
    })
  })

  it('affiche le titre du modal', () => {
    render(<AlbumDetailsModal albumId="test-id" onClose={mockOnClose} />)
    
    expect(screen.getByText('Informations Discogs')).toBeInTheDocument()
  })

  it('affiche un loader pendant le chargement', () => {
    render(<AlbumDetailsModal albumId="test-id" onClose={mockOnClose} />)
    
    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('appelle l\'API avec le bon albumId', async () => {
    render(<AlbumDetailsModal albumId="album-123" onClose={mockOnClose} />)
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/albums/album-123/discogs-details')
    })
  })

  it('affiche les détails de l\'album après le chargement', async () => {
    render(<AlbumDetailsModal albumId="test-id" onClose={mockOnClose} />)
    
    await waitFor(() => {
      expect(screen.getByText('The Dark Side of the Moon')).toBeInTheDocument()
      expect(screen.getByText('Pink Floyd')).toBeInTheDocument()
    })
  })

  it('affiche l\'image de couverture', async () => {
    render(<AlbumDetailsModal albumId="test-id" onClose={mockOnClose} />)
    
    await waitFor(() => {
      const img = screen.getByAltText('The Dark Side of the Moon')
      expect(img).toHaveAttribute('src', 'https://example.com/cover.jpg')
    })
  })

  it('affiche le type Master avec le bon style', async () => {
    render(<AlbumDetailsModal albumId="test-id" onClose={mockOnClose} />)
    
    await waitFor(() => {
      expect(screen.getByText('Master')).toBeInTheDocument()
    })
  })

  it('affiche le type Release avec le bon style', async () => {
    const releaseDetails = { ...mockAlbumDetails, type: 'release' as const }
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => releaseDetails
    })
    
    render(<AlbumDetailsModal albumId="test-id" onClose={mockOnClose} />)
    
    await waitFor(() => {
      expect(screen.getByText('Release')).toBeInTheDocument()
    })
  })

  it('affiche l\'année', async () => {
    render(<AlbumDetailsModal albumId="test-id" onClose={mockOnClose} />)
    
    await waitFor(() => {
      expect(screen.getByText('1973')).toBeInTheDocument()
      expect(screen.getByTestId('calendar-icon')).toBeInTheDocument()
    })
  })

  it('affiche le pays', async () => {
    render(<AlbumDetailsModal albumId="test-id" onClose={mockOnClose} />)
    
    await waitFor(() => {
      expect(screen.getByText('UK')).toBeInTheDocument()
      expect(screen.getByTestId('globe-icon')).toBeInTheDocument()
    })
  })

  it('affiche les genres', async () => {
    render(<AlbumDetailsModal albumId="test-id" onClose={mockOnClose} />)
    
    await waitFor(() => {
      expect(screen.getByText('GENRES')).toBeInTheDocument()
      expect(screen.getByText('Rock')).toBeInTheDocument()
      expect(screen.getByText('Progressive Rock')).toBeInTheDocument()
    })
  })

  it('affiche les styles', async () => {
    render(<AlbumDetailsModal albumId="test-id" onClose={mockOnClose} />)
    
    await waitFor(() => {
      expect(screen.getByText('STYLES')).toBeInTheDocument()
      expect(screen.getByText('Psychedelic Rock')).toBeInTheDocument()
      expect(screen.getByText('Art Rock')).toBeInTheDocument()
    })
  })

  it('affiche les labels', async () => {
    render(<AlbumDetailsModal albumId="test-id" onClose={mockOnClose} />)
    
    await waitFor(() => {
      expect(screen.getByText('LABELS')).toBeInTheDocument()
      expect(screen.getByText('Harvest')).toBeInTheDocument()
      expect(screen.getByText('Capitol Records')).toBeInTheDocument()
    })
  })

  it('affiche le lien vers Discogs', async () => {
    render(<AlbumDetailsModal albumId="test-id" onClose={mockOnClose} />)
    
    await waitFor(() => {
      const link = screen.getByText('Voir sur Discogs').closest('a')
      expect(link).toHaveAttribute('href', 'https://www.discogs.com/master/12345')
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })
  })

  it('masque les sections vides (pas de genres)', async () => {
    const detailsWithoutGenres = { ...mockAlbumDetails, genres: [] }
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => detailsWithoutGenres
    })
    
    render(<AlbumDetailsModal albumId="test-id" onClose={mockOnClose} />)
    
    await waitFor(() => {
      expect(screen.queryByText('GENRES')).not.toBeInTheDocument()
    })
  })

  it('masque les sections vides (pas de styles)', async () => {
    const detailsWithoutStyles = { ...mockAlbumDetails, styles: [] }
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => detailsWithoutStyles
    })
    
    render(<AlbumDetailsModal albumId="test-id" onClose={mockOnClose} />)
    
    await waitFor(() => {
      expect(screen.queryByText('STYLES')).not.toBeInTheDocument()
    })
  })

  it('masque les sections vides (pas de labels)', async () => {
    const detailsWithoutLabels = { ...mockAlbumDetails, labels: [] }
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => detailsWithoutLabels
    })
    
    render(<AlbumDetailsModal albumId="test-id" onClose={mockOnClose} />)
    
    await waitFor(() => {
      expect(screen.queryByText('LABELS')).not.toBeInTheDocument()
    })
  })

  it('affiche un message d\'erreur en cas d\'échec de l\'API', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Album non trouvé' })
    })
    
    render(<AlbumDetailsModal albumId="test-id" onClose={mockOnClose} />)
    
    await waitFor(() => {
      expect(screen.getByText('Album non trouvé')).toBeInTheDocument()
    })
  })

  it('affiche un message d\'erreur générique si pas de détails dans la réponse', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))
    
    render(<AlbumDetailsModal albumId="test-id" onClose={mockOnClose} />)
    
    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument()
    })
  })

  it('ferme le modal au clic sur le bouton X', () => {
    render(<AlbumDetailsModal albumId="test-id" onClose={mockOnClose} />)
    
    const closeButton = screen.getAllByRole('button')[0] // Premier bouton (X)
    closeButton.click()
    
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('ferme le modal au clic sur le backdrop', () => {
    const { container } = render(<AlbumDetailsModal albumId="test-id" onClose={mockOnClose} />)
    
    const backdrop = container.querySelector('.fixed.inset-0')
    backdrop?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('ne ferme pas le modal au clic sur le contenu', () => {
    render(<AlbumDetailsModal albumId="test-id" onClose={mockOnClose} />)
    
    const modalContent = screen.getByText('Informations Discogs').parentElement?.parentElement
    modalContent?.click()
    
    expect(mockOnClose).not.toHaveBeenCalled()
  })

  it('affiche les détails sans année si non fournie', async () => {
    const detailsWithoutYear = { ...mockAlbumDetails, year: undefined }
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => detailsWithoutYear
    })
    
    render(<AlbumDetailsModal albumId="test-id" onClose={mockOnClose} />)
    
    await waitFor(() => {
      expect(screen.getByText('Pink Floyd')).toBeInTheDocument()
      expect(screen.queryByTestId('calendar-icon')).not.toBeInTheDocument()
    })
  })

  it('affiche les détails sans pays si non fourni', async () => {
    const detailsWithoutCountry = { ...mockAlbumDetails, country: undefined }
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => detailsWithoutCountry
    })
    
    render(<AlbumDetailsModal albumId="test-id" onClose={mockOnClose} />)
    
    await waitFor(() => {
      expect(screen.getByText('Pink Floyd')).toBeInTheDocument()
      expect(screen.queryByText('UK')).not.toBeInTheDocument()
    })
  })
})
