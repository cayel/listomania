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
      findMany: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
      findFirst: jest.fn()
    },
    album: {
      findMany: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn()
    },
    listAlbum: {
      count: jest.fn()
    }
  }
}))

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>

// Helper pour configurer les mocks Prisma
function setupPrismaMocks(options: {
  totalLists?: number
  publicLists?: number
  listsByPeriod?: Array<{ period: string; _count: { period: number } }>
  listsWithAlbumCount?: Array<{ title: string; _count: { listAlbums: number } }>
  albumYears?: Array<{ year: number | null }>
  topArtists?: Array<{ artist: string; _count: { artist: number } }>
  topAlbums?: Array<{ discogsId: string; title: string; artist: string; _count: { listAlbums: number } }>
  uniqueAlbumsCount?: number
  totalAlbumsCount?: number
  oldestListData?: { createdAt: Date } | null
  newestListData?: { updatedAt: Date } | null
} = {}) {
  const {
    totalLists = 0,
    publicLists = 0,
    listsByPeriod = [],
    listsWithAlbumCount = [],
    albumYears = [],
    topArtists = [],
    topAlbums = [],
    uniqueAlbumsCount = 0,
    totalAlbumsCount = 0,
    oldestListData = null,
    newestListData = null
  } = options

  // Les 10 requêtes du Promise.all dans l'ordre :
  // 1. list.count (total)
  // 2. list.count (public)
  ;(prisma.list.count as jest.Mock)
    .mockResolvedValueOnce(totalLists)
    .mockResolvedValueOnce(publicLists)
  
  // 3. list.groupBy (période)
  ;(prisma.list.groupBy as jest.Mock).mockResolvedValueOnce(listsByPeriod)
  
  // 4. list.findMany (liste la plus longue)
  ;(prisma.list.findMany as jest.Mock).mockResolvedValueOnce(listsWithAlbumCount)
  
  // 5. album.findMany (années)
  // 6. album.groupBy (top artistes) - Mais attention groupBy est appelé une seule fois !
  // 7. album.findMany (top albums)
  ;(prisma.album.findMany as jest.Mock)
    .mockResolvedValueOnce(albumYears)
    .mockResolvedValueOnce(topAlbums)
  
  ;(prisma.album.groupBy as jest.Mock).mockResolvedValueOnce(topArtists)
  
  // 8. album.count (albums uniques)
  ;(prisma.album.count as jest.Mock).mockResolvedValueOnce(uniqueAlbumsCount)
  
  // 9. list.findFirst (première liste)
  // 10. list.findFirst (dernière liste)
  ;(prisma.list.findFirst as jest.Mock)
    .mockResolvedValueOnce(oldestListData)
    .mockResolvedValueOnce(newestListData)
  
  // Après le Promise.all : listAlbum.count (total avec doublons)
  ;(prisma.listAlbum.count as jest.Mock).mockResolvedValue(totalAlbumsCount)
}

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

    setupPrismaMocks({
      totalLists: 2,
      publicLists: 1,
      listsByPeriod: [
        { period: '2020', _count: { period: 1 } },
        { period: '1980s', _count: { period: 1 } }
      ],
      listsWithAlbumCount: [{ title: 'Ma Liste 1', _count: { listAlbums: 2 } }],
      albumYears: [
        { year: 1979 },
        { year: 1969 },
        { year: 1973 }
      ],
      topArtists: [
        { artist: 'Pink Floyd', _count: { artist: 2 } },
        { artist: 'The Beatles', _count: { artist: 1 } }
      ],
      topAlbums: [
        { discogsId: '12345', title: 'The Wall', artist: 'Pink Floyd', _count: { listAlbums: 1 } },
        { discogsId: '67890', title: 'Abbey Road', artist: 'The Beatles', _count: { listAlbums: 1 } }
      ],
      uniqueAlbumsCount: 3,
      totalAlbumsCount: 3,
      oldestListData: { createdAt: new Date('2024-01-01') },
      newestListData: { updatedAt: new Date('2024-02-10') }
    })

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

    setupPrismaMocks({
      totalLists: 2,
      publicLists: 1,
      listsByPeriod: [],
      listsWithAlbumCount: [
        { title: 'Liste 1', _count: { listAlbums: 2 } },
        { title: 'Liste 2', _count: { listAlbums: 1 } }
      ],
      albumYears: [],
      topArtists: [],
      topAlbums: [],
      uniqueAlbumsCount: 2,
      totalAlbumsCount: 3,
      oldestListData: { createdAt: new Date('2024-01-01') },
      newestListData: { updatedAt: new Date('2024-01-01') }
    })

    const response = await GET()
    const data = await response.json()

    expect(data.overview.totalAlbums).toBe(3) // Total avec doublons
    expect(data.overview.uniqueAlbums).toBe(2) // Uniques sans doublons
  })

  it('calcule correctement les albums par décennie', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: 'user123', email: 'test@example.com' }
    } as any)

    setupPrismaMocks({
      totalLists: 1,
      publicLists: 1,
      listsByPeriod: [],
      listsWithAlbumCount: [{ title: 'Liste', _count: { listAlbums: 4 } }],
      albumYears: [
        { year: 1965 },
        { year: 1975 },
        { year: 1979 },
        { year: null }
      ],
      topArtists: [],
      topAlbums: [],
      uniqueAlbumsCount: 4,
      totalAlbumsCount: 4,
      oldestListData: { createdAt: new Date('2024-01-01') },
      newestListData: { updatedAt: new Date('2024-01-01') }
    })

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

    setupPrismaMocks({
      totalLists: 1,
      publicLists: 1,
      listsByPeriod: [],
      listsWithAlbumCount: [{ title: 'Liste', _count: { listAlbums: 3 } }],
      albumYears: [
        { year: 1970 },
        { year: 1973 },
        { year: 1969 }
      ],
      topArtists: [
        { artist: 'Pink Floyd', _count: { artist: 2 } },
        { artist: 'The Beatles', _count: { artist: 1 } }
      ],
      topAlbums: [],
      uniqueAlbumsCount: 3,
      totalAlbumsCount: 3,
      oldestListData: { createdAt: new Date('2024-01-01') },
      newestListData: { updatedAt: new Date('2024-01-01') }
    })

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

    setupPrismaMocks({
      totalLists: 2,
      publicLists: 1,
      listsByPeriod: [],
      listsWithAlbumCount: [
        { title: 'Liste 1', _count: { listAlbums: 1 } },
        { title: 'Liste 2', _count: { listAlbums: 1 } }
      ],
      albumYears: [{ year: 2000 }],
      topArtists: [{ artist: 'Artist A', _count: { artist: 2 } }],
      topAlbums: [
        { discogsId: '12345', title: 'Popular Album', artist: 'Artist A', _count: { listAlbums: 2 } }
      ],
      uniqueAlbumsCount: 1,
      totalAlbumsCount: 2,
      oldestListData: { createdAt: new Date('2024-01-01') },
      newestListData: { updatedAt: new Date('2024-01-01') }
    })

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

    setupPrismaMocks({
      totalLists: 2,
      publicLists: 1,
      listsByPeriod: [],
      listsWithAlbumCount: [
        { title: 'Liste 1', _count: { listAlbums: 10 } },
        { title: 'Liste 2', _count: { listAlbums: 20 } }
      ],
      albumYears: [],
      topArtists: [],
      topAlbums: [],
      uniqueAlbumsCount: 30,
      totalAlbumsCount: 30,
      oldestListData: { createdAt: new Date('2024-01-01') },
      newestListData: { updatedAt: new Date('2024-01-01') }
    })

    const response = await GET()
    const data = await response.json()

    expect(data.overview.avgAlbumsPerList).toBe(15) // (10 + 20) / 2 = 15
  })

  it('identifie la liste la plus longue', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: 'user123', email: 'test@example.com' }
    } as any)

    setupPrismaMocks({
      totalLists: 2,
      publicLists: 1,
      listsByPeriod: [],
      listsWithAlbumCount: [
        { title: 'Grande Liste', _count: { listAlbums: 50 } },
        { title: 'Petite Liste', _count: { listAlbums: 1 } }
      ],
      albumYears: [],
      topArtists: [],
      topAlbums: [],
      uniqueAlbumsCount: 51,
      totalAlbumsCount: 51,
      oldestListData: { createdAt: new Date('2024-01-01') },
      newestListData: { updatedAt: new Date('2024-01-01') }
    })

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

    setupPrismaMocks({
      totalLists: 0,
      publicLists: 0,
      listsByPeriod: [],
      listsWithAlbumCount: [],
      albumYears: [],
      topArtists: [],
      topAlbums: [],
      uniqueAlbumsCount: 0,
      totalAlbumsCount: 0,
      oldestListData: null,
      newestListData: null
    })

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

    setupPrismaMocks({
      totalLists: 1,
      publicLists: 1,
      listsByPeriod: [],
      listsWithAlbumCount: [{ title: 'Liste', _count: { listAlbums: 15 } }],
      albumYears: Array(15).fill(null).map(() => ({ year: 2000 })),
      topArtists: Array(10).fill(null).map((_, i) => ({ artist: `Artist ${i}`, _count: { artist: 1 } })),
      topAlbums: [],
      uniqueAlbumsCount: 15,
      totalAlbumsCount: 15,
      oldestListData: { createdAt: new Date('2024-01-01') },
      newestListData: { updatedAt: new Date('2024-01-01') }
    })

    const response = await GET()
    const data = await response.json()

    expect(data.topArtists.length).toBeLessThanOrEqual(10)
  })

  it('gère les erreurs serveur', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: 'user123', email: 'test@example.com' }
    } as any)

    // Pour simuler une erreur, faisons échouer le premier appel count
    ;(prisma.list.count as jest.Mock).mockRejectedValue(new Error('Database error'))

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Erreur serveur')
  })

  it('regroupe correctement les listes par période', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: 'user123', email: 'test@example.com' }
    } as any)

    setupPrismaMocks({
      totalLists: 3,
      publicLists: 3,
      listsByPeriod: [
        { period: '2020', _count: { period: 2 } },
        { period: '1990s', _count: { period: 1 } }
      ],
      listsWithAlbumCount: [
        { title: 'Liste 1', _count: { listAlbums: 0 } },
        { title: 'Liste 2', _count: { listAlbums: 0 } },
        { title: 'Liste 3', _count: { listAlbums: 0 } }
      ],
      albumYears: [],
      topArtists: [],
      topAlbums: [],
      uniqueAlbumsCount: 0,
      totalAlbumsCount: 0,
      oldestListData: { createdAt: new Date('2024-01-01') },
      newestListData: { updatedAt: new Date('2024-01-01') }
    })

    const response = await GET()
    const data = await response.json()

    expect(data.listsByPeriod).toEqual({
      '2020': 2,
      '1990s': 1
    })
  })
})
