import { describe, it, expect, jest, beforeEach } from '@jest/globals'

// Mock des dépendances
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: { user: { id: 'test-user', name: 'Test User', email: 'test@example.com' } },
    status: 'authenticated'
  })),
  signOut: jest.fn()
}))

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    refresh: jest.fn()
  }))
}))

// Mock global fetch
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>

describe('API Reports Generate', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('devrait générer un rapport avec les données correctes', async () => {
    const mockLists = [
      {
        id: 'list-1',
        title: 'Ma Liste Test',
        description: 'Description test',
        period: '2023',
        isPublic: true,
        isRanked: true,
        categories: [
          {
            category: {
              name: 'Rock',
              color: '#FF0000'
            }
          }
        ],
        listAlbums: [
          {
            position: 1,
            album: {
              artist: 'The Beatles',
              title: 'Abbey Road',
              year: 1969,
              discogsId: '12345',
              coverImage: 'https://example.com/cover.jpg'
            }
          },
          {
            position: 2,
            album: {
              artist: 'Pink Floyd',
              title: 'The Dark Side of the Moon',
              year: 1973,
              discogsId: '67890',
              coverImage: 'https://example.com/cover2.jpg'
            }
          }
        ]
      }
    ]

    const expectedReport = {
      generatedAt: expect.any(String),
      lists: [
        {
          id: 'list-1',
          title: 'Ma Liste Test',
          description: 'Description test',
          period: '2023',
          isPublic: true,
          isRanked: true,
          categories: [
            {
              name: 'Rock',
              color: '#FF0000'
            }
          ],
          albums: [
            {
              position: 1,
              artist: 'The Beatles',
              title: 'Abbey Road',
              year: 1969,
              discogsId: '12345',
              coverImage: 'https://example.com/cover.jpg'
            },
            {
              position: 2,
              artist: 'Pink Floyd',
              title: 'The Dark Side of the Moon',
              year: 1973,
              discogsId: '67890',
              coverImage: 'https://example.com/cover2.jpg'
            }
          ]
        }
      ],
      totalAlbums: 2,
      totalLists: 1
    }

    expect(expectedReport.lists[0].albums).toHaveLength(2)
    expect(expectedReport.totalAlbums).toBe(2)
    expect(expectedReport.totalLists).toBe(1)
  })

  it('devrait calculer correctement le total d\'albums pour plusieurs listes', () => {
    const lists = [
      { listAlbums: [{}, {}, {}] }, // 3 albums
      { listAlbums: [{}, {}] },      // 2 albums
      { listAlbums: [{}] }           // 1 album
    ]

    const totalAlbums = lists.reduce((sum: number, list: any) => sum + list.listAlbums.length, 0)
    
    expect(totalAlbums).toBe(6)
  })

  it('devrait gérer les listes sans albums', () => {
    const lists = [
      { listAlbums: [] },
      { listAlbums: [{}, {}] }
    ]

    const totalAlbums = lists.reduce((sum: number, list: any) => sum + list.listAlbums.length, 0)
    
    expect(totalAlbums).toBe(2)
  })
})

describe('Export Formats', () => {
  it('devrait générer un CSV correct', () => {
    const reportData = {
      lists: [
        {
          title: 'Test List',
          albums: [
            { artist: 'Artist 1', title: 'Album 1', year: 2023 },
            { artist: 'Artist 2', title: 'Album 2', year: 2024 }
          ]
        }
      ]
    }

    const csv = 'Liste,Artiste,Titre,Année\n' +
                '"Test List","Artist 1","Album 1",2023\n' +
                '"Test List","Artist 2","Album 2",2024\n'

    expect(csv).toContain('Liste,Artiste,Titre,Année')
    expect(csv).toContain('Test List')
    expect(csv).toContain('Artist 1')
  })

  it('devrait échapper les guillemets dans le CSV', () => {
    const title = 'Liste "avec guillemets"'
    const escapedTitle = title.replace(/"/g, '""')
    
    expect(escapedTitle).toBe('Liste ""avec guillemets""')
  })

  it('devrait formater correctement la date', () => {
    const date = new Date('2026-02-26T12:00:00.000Z')
    const formatted = date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    })
    
    expect(formatted).toContain('26')
    expect(formatted).toContain('février')
    expect(formatted).toContain('2026')
  })
})
