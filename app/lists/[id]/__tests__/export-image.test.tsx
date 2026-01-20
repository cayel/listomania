import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import ListDetail from '../page'

// Mock des dépendances
jest.mock('next-auth/react')
jest.mock('next/navigation')
jest.mock('html2canvas', () => ({
  __esModule: true,
  default: jest.fn(() => Promise.resolve({
    toDataURL: jest.fn(() => 'data:image/png;base64,mock'),
  })),
}))

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockUseParams = useParams as jest.MockedFunction<typeof useParams>

describe('Export Image Feature', () => {
  const mockPush = jest.fn()
  const mockSession = {
    user: { id: 'user1', email: 'test@test.com', name: 'Test User' },
    expires: '2024-12-31',
  }

  const mockList = {
    id: 'list1',
    title: 'Ma Liste de Test',
    description: 'Description de test',
    isPublic: true,
    isRanked: true,
    userId: 'user1',
    listAlbums: [
      {
        id: 'la1',
        position: 0,
        album: {
          id: 'album1',
          discogsId: '12345',
          title: 'Album 1',
          artist: 'Artiste 1',
          year: 2020,
          coverImage: 'https://example.com/cover1.jpg',
        },
      },
      {
        id: 'la2',
        position: 1,
        album: {
          id: 'album2',
          discogsId: '12346',
          title: 'Album 2',
          artist: 'Artiste 2',
          year: 2021,
          coverImage: 'https://example.com/cover2.jpg',
        },
      },
    ],
  }

  beforeEach(() => {
    mockUseSession.mockReturnValue({
      data: mockSession,
      status: 'authenticated',
      update: jest.fn(),
    })
    mockUseRouter.mockReturnValue({
      push: mockPush,
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    } as any)
    mockUseParams.mockReturnValue({ id: 'list1' })

    global.fetch = jest.fn((url: string) => {
      if (url.includes('/api/lists/list1')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockList,
        } as Response)
      }
      if (url.includes('/api/proxy-image')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ dataUrl: 'data:image/png;base64,mock' }),
        } as Response)
      }
      return Promise.reject(new Error('Unknown URL'))
    }) as jest.Mock
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('affiche le bouton d\'export d\'image dans le menu', async () => {
    render(<ListDetail />)

    await waitFor(() => {
      expect(screen.getByText('Ma Liste de Test')).toBeInTheDocument()
    })

    // Ouvrir le menu d'export
    const exportButton = screen.getByTitle('Exporter')
    fireEvent.click(exportButton)

    // Vérifier que le bouton Image PNG est présent
    await waitFor(() => {
      expect(screen.getByText('Image PNG')).toBeInTheDocument()
    })
  })

  it('ouvre la modal d\'export d\'image au clic', async () => {
    render(<ListDetail />)

    await waitFor(() => {
      expect(screen.getByText('Ma Liste de Test')).toBeInTheDocument()
    })

    // Ouvrir le menu d'export
    const exportButton = screen.getByTitle('Exporter')
    fireEvent.click(exportButton)

    // Cliquer sur le bouton Image PNG
    const imagePngButton = await screen.findByText('Image PNG')
    fireEvent.click(imagePngButton)

    // Vérifier que la modal s'ouvre
    await waitFor(() => {
      expect(screen.getByText('Exporter en image')).toBeInTheDocument()
    })
  })

  it('affiche toutes les options dans la modal', async () => {
    render(<ListDetail />)

    await waitFor(() => {
      expect(screen.getByText('Ma Liste de Test')).toBeInTheDocument()
    })

    // Ouvrir le menu et la modal
    const exportButton = screen.getByTitle('Exporter')
    fireEvent.click(exportButton)
    const imagePngButton = await screen.findByText('Image PNG')
    fireEvent.click(imagePngButton)

    // Vérifier les options
    await waitFor(() => {
      expect(screen.getByText('Inclure les informations textuelles')).toBeInTheDocument()
      expect(screen.getByText('Style de fond')).toBeInTheDocument()
      expect(screen.getByText('🖼️ Cadre doré de galerie')).toBeInTheDocument()
      expect(screen.getByText('☁️ Fond clair minimal')).toBeInTheDocument()
      expect(screen.getByText('🌙 Fond noir élégant')).toBeInTheDocument()
    })
  })

  it('permet de basculer l\'option texte', async () => {
    render(<ListDetail />)

    await waitFor(() => {
      expect(screen.getByText('Ma Liste de Test')).toBeInTheDocument()
    })

    // Ouvrir la modal
    const exportButton = screen.getByTitle('Exporter')
    fireEvent.click(exportButton)
    const imagePngButton = await screen.findByText('Image PNG')
    fireEvent.click(imagePngButton)

    // Trouver la checkbox
    await waitFor(() => {
      const checkbox = screen.getByRole('checkbox', {
        name: /Inclure les informations textuelles/i,
      })
      expect(checkbox).toBeChecked() // Par défaut cochée

      // Décocher
      fireEvent.click(checkbox)
      expect(checkbox).not.toBeChecked()

      // Recocher
      fireEvent.click(checkbox)
      expect(checkbox).toBeChecked()
    })
  })

  it('permet de sélectionner différents styles de fond', async () => {
    render(<ListDetail />)

    await waitFor(() => {
      expect(screen.getByText('Ma Liste de Test')).toBeInTheDocument()
    })

    // Ouvrir la modal
    const exportButton = screen.getByTitle('Exporter')
    fireEvent.click(exportButton)
    const imagePngButton = await screen.findByText('Image PNG')
    fireEvent.click(imagePngButton)

    await waitFor(() => {
      // Cadre doré sélectionné par défaut
      const goldenRadio = screen.getByRole('radio', { name: /Cadre doré de galerie/i })
      expect(goldenRadio).toBeChecked()

      // Sélectionner fond clair
      const lightRadio = screen.getByRole('radio', { name: /Fond clair minimal/i })
      fireEvent.click(lightRadio)
      expect(lightRadio).toBeChecked()
      expect(goldenRadio).not.toBeChecked()

      // Sélectionner fond noir
      const darkRadio = screen.getByRole('radio', { name: /Fond noir élégant/i })
      fireEvent.click(darkRadio)
      expect(darkRadio).toBeChecked()
      expect(lightRadio).not.toBeChecked()
    })
  })

  it('ferme la modal au clic sur Annuler', async () => {
    render(<ListDetail />)

    await waitFor(() => {
      expect(screen.getByText('Ma Liste de Test')).toBeInTheDocument()
    })

    // Ouvrir la modal
    const exportButton = screen.getByTitle('Exporter')
    fireEvent.click(exportButton)
    const imagePngButton = await screen.findByText('Image PNG')
    fireEvent.click(imagePngButton)

    await waitFor(() => {
      expect(screen.getByText('Exporter en image')).toBeInTheDocument()
    })

    // Cliquer sur Annuler
    const cancelButton = screen.getByText('Annuler')
    fireEvent.click(cancelButton)

    // Vérifier que la modal est fermée
    await waitFor(() => {
      expect(screen.queryByText('Exporter en image')).not.toBeInTheDocument()
    })
  })

  it('ferme la modal au clic sur le bouton X', async () => {
    render(<ListDetail />)

    await waitFor(() => {
      expect(screen.getByText('Ma Liste de Test')).toBeInTheDocument()
    })

    // Ouvrir la modal
    const exportButton = screen.getByTitle('Exporter')
    fireEvent.click(exportButton)
    const imagePngButton = await screen.findByText('Image PNG')
    fireEvent.click(imagePngButton)

    await waitFor(() => {
      expect(screen.getByText('Exporter en image')).toBeInTheDocument()
    })

    // Trouver et cliquer sur le bouton avec l'icône X (dans la modal)
    const modalContainer = screen.getByText('Exporter en image').closest('.bg-white')
    expect(modalContainer).toBeTruthy()
    
    if (modalContainer) {
      const xButton = modalContainer.querySelector('button:has(svg.lucide-x)')
      expect(xButton).toBeTruthy()
      if (xButton) {
        fireEvent.click(xButton as Element)
      }
    }

    // Vérifier que la modal est fermée
    await waitFor(() => {
      expect(screen.queryByText('Exporter en image')).not.toBeInTheDocument()
    })
  })

  it('affiche le bouton Image PNG dans le menu d\'export', async () => {
    render(<ListDetail />)

    await waitFor(() => {
      expect(screen.getByText('Ma Liste de Test')).toBeInTheDocument()
    })

    // Ouvrir le menu d'export
    const exportButton = screen.getByTitle('Exporter')
    fireEvent.click(exportButton)

    // Le bouton Image PNG devrait être présent
    await waitFor(() => {
      expect(screen.getByText('Image PNG')).toBeInTheDocument()
      expect(screen.getByText('Mosaïque de pochettes')).toBeInTheDocument()
    })
  })

  it('lance l\'export avec les paramètres corrects', async () => {
    render(<ListDetail />)

    await waitFor(() => {
      expect(screen.getByText('Ma Liste de Test')).toBeInTheDocument()
    })

    // Ouvrir la modal
    const exportButton = screen.getByTitle('Exporter')
    fireEvent.click(exportButton)
    const imagePngButton = await screen.findByText('Image PNG')
    fireEvent.click(imagePngButton)

    await waitFor(() => {
      expect(screen.getByText('Exporter en image')).toBeInTheDocument()
    })

    // Modifier les options
    const checkbox = screen.getByRole('checkbox', {
      name: /Inclure les informations textuelles/i,
    })
    fireEvent.click(checkbox) // Décocher le texte

    const darkRadio = screen.getByRole('radio', { name: /Fond noir élégant/i })
    fireEvent.click(darkRadio) // Sélectionner fond noir

    // Cliquer sur Exporter
    const exportButtonModal = screen.getAllByText('Exporter').find(
      (btn) => btn.tagName === 'BUTTON'
    )
    expect(exportButtonModal).toBeTruthy()
    if (exportButtonModal) {
      fireEvent.click(exportButtonModal)
    }

    // Vérifier que la modal se ferme
    await waitFor(() => {
      expect(screen.queryByText('Exporter en image')).not.toBeInTheDocument()
    })
  })

  it('affiche la modal d\'export correctement', async () => {
    render(<ListDetail />)

    await waitFor(() => {
      expect(screen.getByText('Ma Liste de Test')).toBeInTheDocument()
    })

    // Ouvrir la modal et vérifier qu'elle s'affiche
    const exportButton = screen.getByTitle('Exporter')
    fireEvent.click(exportButton)
    const imagePngButton = await screen.findByText('Image PNG')
    fireEvent.click(imagePngButton)

    // Vérifier que la modal est bien affichée avec toutes ses options
    await waitFor(() => {
      expect(screen.getByText('Exporter en image')).toBeInTheDocument()
      expect(screen.getByText('Inclure les informations textuelles')).toBeInTheDocument()
      expect(screen.getByText('🖼️ Cadre doré de galerie')).toBeInTheDocument()
    })
  })
})
