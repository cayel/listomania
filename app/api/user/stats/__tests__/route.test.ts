/**
 * @jest-environment node
 */
import { GET } from '../route'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

// Mock des dépendances
jest.mock('next-auth')
jest.mock('@/lib/auth', () => ({
  authOptions: {}
}))
jest.mock('@/lib/prisma', () => ({
  prisma: {
    list: {
      findMany: jest.fn()
    }
  }
}))

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>

describe('GET /api/user/stats', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('retourne 401 si utilisateur non authentifié', async () => {
    mockGetServerSession.mockResolvedValue(null)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Non authentifié')
  })

  it('retourne les statistiques de base pour un utilisateur', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: 'user123', email: 'test@example.com' }
    } as any)

    const mockLists = [
      {
        id: 'list1',
        title: 'Ma Liste 1',
        period: '2020',
        isPublic: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15'),
        listAlbums: [
          {
            album: {
              discogsId: '12345',
              artist: 'Pink Floyd',
              title: 'The Wall',
              year: 1979
            }
          },
          {
            album: {
              discogsId: '67890',
              artist: 'The Beatles',
              title: 'Abbey Road',
              year: 1969
            }
          }
        ]
      },
      {
        id: 'list2',
        title: 'Ma Liste 2',
        period: '1980s',
        isPublic: false,
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-10'),
        listAlbums: [
          {
            album: {
              discogsId: '11111',
              artist: 'Pink Floyd',
              title: 'Dark Side of the Moon',
              year: 1973
            }
          }
        ]
      }
    ]

    ;(prisma.list.findMany as jest.Mock).mockResolvedValue(mockLists)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.overview).toBeDefined()
    expect(data.overview.totalLists).toBe(2)
    expect(data.overview.totalAlbums).toBe(3)
    expect(data.overview.publicLists).toBe(1)
    expect(data.overview.privateLists).toBe(1)
  })

  it('calcule correctement les albums uniques', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: 'user123', email: 'test@example.com' }
    } as any)

    const mockLists = [
      {
        id: 'list1',
        title: 'Liste 1',
        period: null,
        isPublic: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        listAlbums: [
          {
            album: {
              discogsId: '12345',
              artist: 'Artist A',
              title: 'Album A',
              year: 2000
            }
          },
          {
            album: {
              discogsId: '67890',
              artist: 'Artist B',
              title: 'Album B',
              year: 2010
            }
          }
        ]
      },
      {
        id: 'list2',
        title: 'Liste 2',
        period: null,
        isPublic: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        listAlbums: [
          {
            album: {
              discogsId: '12345', // Même album que dans liste1
              artist: 'Artist A',
              title: 'Album A',
              year: 2000
            }
          }
        ]
      }
    ]

    ;(prisma.list.findMany as jest.Mock).mockResolvedValue(mockLists)

    const response = await GET()
    const data = await response.json()

    expect(data.overview.totalAlbums).toBe(3) // Total avec doublons
    expect(data.overview.uniqueAlbums).toBe(2) // Uniques sans doublons
  })

  it('calcule correctement les albums par décennie', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: 'user123', email: 'test@example.com' }
    } as any)

    const mockLists = [
      {
        id: 'list1',
        title: 'Liste',
        period: null,
        isPublic: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        listAlbums: [
          {
            album: {
              discogsId: '1',
              artist: 'Artist',
              title: 'Album 1960',
              year: 1965
            }
          },
          {
            album: {
              discogsId: '2',
              artist: 'Artist',
              title: 'Album 1970',
              year: 1975
            }
          },
          {
            album: {
              discogsId: '3',
              artist: 'Artist',
              title: 'Album 1970 bis',
              year: 1979
            }
          },
          {
            album: {
              discogsId: '4',
              artist: 'Artist',
              title: 'Album sans année',
              year: null
            }
          }
        ]
      }
    ]

    ;(prisma.list.findMany as jest.Mock).mockResolvedValue(mockLists)

    const response = await GET()
    const data = await response.json()

    expect(data.albumsByDecade).toEqual({
      '1960s': 1,
      '1970s': 2
    })
  })

  it('identifie correctement le top artistes', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: 'user123', email: 'test@example.com' }
    } as any)

    const mockLists = [
      {
        id: 'list1',
        title: 'Liste',
        period: null,
        isPublic: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        listAlbums: [
          {
            album: {
              discogsId: '1',
              artist: 'Pink Floyd',
              title: 'Album 1',
              year: 1970
            }
          },
          {
            album: {
              discogsId: '2',
              artist: 'Pink Floyd',
              title: 'Album 2',
              year: 1973
            }
          },
          {
            album: {
              discogsId: '3',
              artist: 'The Beatles',
              title: 'Album 3',
              year: 1969
            }
          }
        ]
      }
    ]

    ;(prisma.list.findMany as jest.Mock).mockResolvedValue(mockLists)

    const response = await GET()
    const data = await response.json()

    expect(data.topArtists).toHaveLength(2)
    expect(data.topArtists[0]).toEqual({ artist: 'Pink Floyd', count: 2 })
    expect(data.topArtists[1]).toEqual({ artist: 'The Beatles', count: 1 })
  })

  it('identifie les albums favoris (présents dans plusieurs listes)', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: 'user123', email: 'test@example.com' }
    } as any)

    const mockLists = [
      {
        id: 'list1',
        title: 'Liste 1',
        period: null,
        isPublic: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        listAlbums: [
          {
            album: {
              discogsId: '12345',
              artist: 'Artist A',
              title: 'Popular Album',
              year: 2000
            }
          }
        ]
      },
      {
        id: 'list2',
        title: 'Liste 2',
        period: null,
        isPublic: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        listAlbums: [
          {
            album: {
              discogsId: '12345',
              artist: 'Artist A',
              title: 'Popular Album',
              year: 2000
            }
          }
        ]
      }
    ]

    ;(prisma.list.findMany as jest.Mock).mockResolvedValue(mockLists)

    const response = await GET()
    const data = await response.json()

    expect(data.topAlbums).toHaveLength(1)
    expect(data.topAlbums[0]).toEqual({
      title: 'Popular Album',
      artist: 'Artist A',
      count: 2
    })
  })

  it('calcule la moyenne d\'albums par liste', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: 'user123', email: 'test@example.com' }
    } as any)

    const mockLists = [
      {
        id: 'list1',
        title: 'Liste 1',
        period: null,
        isPublic: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        listAlbums: Array(10).fill(null).map((_, i) => ({
          album: {
            discogsId: `id${i}`,
            artist: 'Artist',
            title: `Album ${i}`,
            year: 2000
          }
        }))
      },
      {
        id: 'list2',
        title: 'Liste 2',
        period: null,
        isPublic: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        listAlbums: Array(20).fill(null).map((_, i) => ({
          album: {
            discogsId: `id${i + 10}`,
            artist: 'Artist',
            title: `Album ${i + 10}`,
            year: 2000
          }
        }))
      }
    ]

    ;(prisma.list.findMany as jest.Mock).mockResolvedValue(mockLists)

    const response = await GET()
    const data = await response.json()

    expect(data.overview.avgAlbumsPerList).toBe(15) // (10 + 20) / 2 = 15
  })

  it('identifie la liste la plus longue', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: 'user123', email: 'test@example.com' }
    } as any)

    const mockLists = [
      {
        id: 'list1',
        title: 'Petite Liste',
        period: null,
        isPublic: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        listAlbums: [
          {
            album: {
              discogsId: '1',
              artist: 'Artist',
              title: 'Album',
              year: 2000
            }
          }
        ]
      },
      {
        id: 'list2',
        title: 'Grande Liste',
        period: null,
        isPublic: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        listAlbums: Array(50).fill(null).map((_, i) => ({
          album: {
            discogsId: `id${i}`,
            artist: 'Artist',
            title: `Album ${i}`,
            year: 2000
          }
        }))
      }
    ]

    ;(prisma.list.findMany as jest.Mock).mockResolvedValue(mockLists)

    const response = await GET()
    const data = await response.json()

    expect(data.overview.longestList).toEqual({
      title: 'Grande Liste',
      length: 50
    })
  })

  it('retourne des statistiques vides pour un utilisateur sans listes', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: 'user123', email: 'test@example.com' }
    } as any)

    ;(prisma.list.findMany as jest.Mock).mockResolvedValue([])

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.overview.totalLists).toBe(0)
    expect(data.overview.totalAlbums).toBe(0)
    expect(data.overview.uniqueAlbums).toBe(0)
    expect(data.overview.avgAlbumsPerList).toBe(0)
    expect(data.topArtists).toHaveLength(0)
    expect(data.topAlbums).toHaveLength(0)
  })

  it('limite le top artistes à 10', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: 'user123', email: 'test@example.com' }
    } as any)

    const mockLists = [
      {
        id: 'list1',
        title: 'Liste',
        period: null,
        isPublic: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        listAlbums: Array(15).fill(null).map((_, i) => ({
          album: {
            discogsId: `id${i}`,
            artist: `Artist ${i}`,
            title: `Album ${i}`,
            year: 2000
          }
        }))
      }
    ]

    ;(prisma.list.findMany as jest.Mock).mockResolvedValue(mockLists)

    const response = await GET()
    const data = await response.json()

    expect(data.topArtists.length).toBeLessThanOrEqual(10)
  })

  it('gère les erreurs serveur', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: 'user123', email: 'test@example.com' }
    } as any)

    ;(prisma.list.findMany as jest.Mock).mockRejectedValue(new Error('Database error'))

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Erreur serveur')
  })

  it('regroupe correctement les listes par période', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: 'user123', email: 'test@example.com' }
    } as any)

    const mockLists = [
      {
        id: 'list1',
        title: 'Liste 1',
        period: '2020',
        isPublic: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        listAlbums: []
      },
      {
        id: 'list2',
        title: 'Liste 2',
        period: '2020',
        isPublic: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        listAlbums: []
      },
      {
        id: 'list3',
        title: 'Liste 3',
        period: '1990s',
        isPublic: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        listAlbums: []
      }
    ]

    ;(prisma.list.findMany as jest.Mock).mockResolvedValue(mockLists)

    const response = await GET()
    const data = await response.json()

    expect(data.listsByPeriod).toEqual({
      '2020': 2,
      '1990s': 1
    })
  })
})
