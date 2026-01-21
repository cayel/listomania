import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AlbumSearch } from '../album-search'

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Search: ({ className }: { className?: string }) => (
    <svg data-testid="search-icon" className={className}>Search</svg>
  ),
  X: ({ className }: { className?: string }) => (
    <svg data-testid="x-icon" className={className}>X</svg>
  )
}))

// Mock global fetch
global.fetch = jest.fn()

describe('AlbumSearch', () => {
  const mockOnSelectAlbum = jest.fn()
  const mockAlbums = [
    {
      id: '1',
      title: 'The Dark Side of the Moon',
      artist: 'Pink Floyd',
      year: 1973,
      coverImage: 'https://example.com/cover1.jpg',
      thumb: 'https://example.com/thumb1.jpg'
    },
    {
      id: '2',
      title: 'Abbey Road',
      artist: 'The Beatles',
      year: 1969,
      coverImage: 'https://example.com/cover2.jpg'
    }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockAlbums
    })
  })

  it('affiche le champ de recherche et le bouton', () => {
    render(<AlbumSearch onSelectAlbum={mockOnSelectAlbum} />)
    
    expect(screen.getByPlaceholderText('Rechercher un album ou un artiste...')).toBeInTheDocument()
    expect(screen.getByTitle('Rechercher')).toBeInTheDocument()
    expect(screen.getByTestId('search-icon')).toBeInTheDocument()
  })

  it('désactive le bouton de recherche si moins de 2 caractères', () => {
    render(<AlbumSearch onSelectAlbum={mockOnSelectAlbum} />)
    
    const searchButton = screen.getByTitle('Rechercher')
    expect(searchButton).toBeDisabled()
    
    const input = screen.getByPlaceholderText('Rechercher un album ou un artiste...')
    fireEvent.change(input, { target: { value: 'a' } })
    
    expect(searchButton).toBeDisabled()
  })

  it('active le bouton de recherche avec 2 caractères ou plus', () => {
    render(<AlbumSearch onSelectAlbum={mockOnSelectAlbum} />)
    
    const input = screen.getByPlaceholderText('Rechercher un album ou un artiste...')
    fireEvent.change(input, { target: { value: 'pink' } })
    
    const searchButton = screen.getByTitle('Rechercher')
    expect(searchButton).not.toBeDisabled()
  })

  it('lance la recherche au clic sur le bouton', async () => {
    render(<AlbumSearch onSelectAlbum={mockOnSelectAlbum} />)
    
    const input = screen.getByPlaceholderText('Rechercher un album ou un artiste...')
    fireEvent.change(input, { target: { value: 'pink floyd' } })
    
    const searchButton = screen.getByTitle('Rechercher')
    fireEvent.click(searchButton)
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/search?q=pink%20floyd')
    })
  })

  it('lance la recherche avec la touche Enter', async () => {
    render(<AlbumSearch onSelectAlbum={mockOnSelectAlbum} />)
    
    const input = screen.getByPlaceholderText('Rechercher un album ou un artiste...')
    fireEvent.change(input, { target: { value: 'beatles' } })
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 })
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/search?q=beatles')
    })
  })

  it('affiche les résultats de recherche', async () => {
    render(<AlbumSearch onSelectAlbum={mockOnSelectAlbum} />)
    
    const input = screen.getByPlaceholderText('Rechercher un album ou un artiste...')
    fireEvent.change(input, { target: { value: 'pink' } })
    
    const searchButton = screen.getByTitle('Rechercher')
    fireEvent.click(searchButton)
    
    await waitFor(() => {
      expect(screen.getByText('Pink Floyd')).toBeInTheDocument()
      expect(screen.getByText('The Dark Side of the Moon')).toBeInTheDocument()
      expect(screen.getByText('The Beatles')).toBeInTheDocument()
      expect(screen.getByText('Abbey Road')).toBeInTheDocument()
    })
  })

  it('affiche le nombre de résultats', async () => {
    render(<AlbumSearch onSelectAlbum={mockOnSelectAlbum} />)
    
    const input = screen.getByPlaceholderText('Rechercher un album ou un artiste...')
    fireEvent.change(input, { target: { value: 'test' } })
    fireEvent.click(screen.getByTitle('Rechercher'))
    
    await waitFor(() => {
      expect(screen.getByText('2 résultats')).toBeInTheDocument()
    })
  })

  it('affiche "1 résultat" au singulier', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [mockAlbums[0]]
    })
    
    render(<AlbumSearch onSelectAlbum={mockOnSelectAlbum} />)
    
    const input = screen.getByPlaceholderText('Rechercher un album ou un artiste...')
    fireEvent.change(input, { target: { value: 'test' } })
    fireEvent.click(screen.getByTitle('Rechercher'))
    
    await waitFor(() => {
      expect(screen.getByText('1 résultat')).toBeInTheDocument()
    })
  })

  it('affiche le bouton de fermeture avec les résultats', async () => {
    render(<AlbumSearch onSelectAlbum={mockOnSelectAlbum} />)
    
    const input = screen.getByPlaceholderText('Rechercher un album ou un artiste...')
    fireEvent.change(input, { target: { value: 'test' } })
    fireEvent.click(screen.getByTitle('Rechercher'))
    
    await waitFor(() => {
      expect(screen.getByTitle('Fermer')).toBeInTheDocument()
      expect(screen.getByTestId('x-icon')).toBeInTheDocument()
    })
  })

  it('ferme les résultats au clic sur le bouton X', async () => {
    render(<AlbumSearch onSelectAlbum={mockOnSelectAlbum} />)
    
    const input = screen.getByPlaceholderText('Rechercher un album ou un artiste...')
    fireEvent.change(input, { target: { value: 'test' } })
    fireEvent.click(screen.getByTitle('Rechercher'))
    
    await waitFor(() => {
      expect(screen.getByText('Pink Floyd')).toBeInTheDocument()
    })
    
    const closeButton = screen.getByTitle('Fermer')
    fireEvent.click(closeButton)
    
    await waitFor(() => {
      expect(screen.queryByText('Pink Floyd')).not.toBeInTheDocument()
    })
  })

  it('ferme les résultats avec la touche Escape', async () => {
    render(<AlbumSearch onSelectAlbum={mockOnSelectAlbum} />)
    
    const input = screen.getByPlaceholderText('Rechercher un album ou un artiste...')
    fireEvent.change(input, { target: { value: 'test' } })
    fireEvent.click(screen.getByTitle('Rechercher'))
    
    await waitFor(() => {
      expect(screen.getByText('Pink Floyd')).toBeInTheDocument()
    })
    
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' })
    
    await waitFor(() => {
      expect(screen.queryByText('Pink Floyd')).not.toBeInTheDocument()
    })
  })

  it('ferme les résultats au clic en dehors', async () => {
    render(
      <div>
        <AlbumSearch onSelectAlbum={mockOnSelectAlbum} />
        <div data-testid="outside">Outside</div>
      </div>
    )
    
    const input = screen.getByPlaceholderText('Rechercher un album ou un artiste...')
    fireEvent.change(input, { target: { value: 'test' } })
    fireEvent.click(screen.getByTitle('Rechercher'))
    
    await waitFor(() => {
      expect(screen.getByText('Pink Floyd')).toBeInTheDocument()
    })
    
    const outside = screen.getByTestId('outside')
    fireEvent.mouseDown(outside)
    
    await waitFor(() => {
      expect(screen.queryByText('Pink Floyd')).not.toBeInTheDocument()
    })
  })

  it('appelle onSelectAlbum et ferme les résultats à la sélection', async () => {
    render(<AlbumSearch onSelectAlbum={mockOnSelectAlbum} />)
    
    const input = screen.getByPlaceholderText('Rechercher un album ou un artiste...')
    fireEvent.change(input, { target: { value: 'pink' } })
    fireEvent.click(screen.getByTitle('Rechercher'))
    
    await waitFor(() => {
      expect(screen.getByText('Pink Floyd')).toBeInTheDocument()
    })
    
    const albumButton = screen.getByText('Pink Floyd').closest('button')
    fireEvent.click(albumButton!)
    
    expect(mockOnSelectAlbum).toHaveBeenCalledWith(mockAlbums[0])
    expect(screen.queryByText('Pink Floyd')).not.toBeInTheDocument()
    expect(input).toHaveValue('')
  })

  it('affiche un message de chargement pendant la recherche', async () => {
    let resolvePromise: (value: any) => void
    const promise = new Promise((resolve) => {
      resolvePromise = resolve
    })
    
    ;(global.fetch as jest.Mock).mockReturnValueOnce(promise)
    
    render(<AlbumSearch onSelectAlbum={mockOnSelectAlbum} />)
    
    const input = screen.getByPlaceholderText('Rechercher un album ou un artiste...')
    fireEvent.change(input, { target: { value: 'test' } })
    fireEvent.click(screen.getByTitle('Rechercher'))
    
    await waitFor(() => {
      expect(screen.getByText('Recherche en cours...')).toBeInTheDocument()
      expect(screen.getByText('Chargement...')).toBeInTheDocument()
    })
    
    resolvePromise!({
      ok: true,
      json: async () => mockAlbums
    })
  })

  it('affiche "Aucun résultat trouvé" si pas de résultats', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => []
    })
    
    render(<AlbumSearch onSelectAlbum={mockOnSelectAlbum} />)
    
    const input = screen.getByPlaceholderText('Rechercher un album ou un artiste...')
    fireEvent.change(input, { target: { value: 'zzz' } })
    fireEvent.click(screen.getByTitle('Rechercher'))
    
    await waitFor(() => {
      expect(screen.getByText('Aucun résultat trouvé')).toBeInTheDocument()
    })
  })

  it('affiche les images de pochette si disponibles', async () => {
    render(<AlbumSearch onSelectAlbum={mockOnSelectAlbum} />)
    
    const input = screen.getByPlaceholderText('Rechercher un album ou un artiste...')
    fireEvent.change(input, { target: { value: 'test' } })
    fireEvent.click(screen.getByTitle('Rechercher'))
    
    await waitFor(() => {
      const images = screen.getAllByRole('img')
      expect(images).toHaveLength(2)
      expect(images[0]).toHaveAttribute('src', mockAlbums[0].coverImage)
      expect(images[1]).toHaveAttribute('src', mockAlbums[1].coverImage)
    })
  })

  it('gère les erreurs de fetch gracieusement', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation()
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))
    
    render(<AlbumSearch onSelectAlbum={mockOnSelectAlbum} />)
    
    const input = screen.getByPlaceholderText('Rechercher un album ou un artiste...')
    fireEvent.change(input, { target: { value: 'test' } })
    fireEvent.click(screen.getByTitle('Rechercher'))
    
    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith('Erreur lors de la recherche:', expect.any(Error))
    })
    
    consoleError.mockRestore()
  })
})
