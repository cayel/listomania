import { getDiscogsAlbumWithTracks, DiscogsAlbumWithTracks } from '../discogs'

// Mock fetch globalement
global.fetch = jest.fn()

describe('getDiscogsAlbumWithTracks', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.DISCOGS_TOKEN = 'test-token'
  })

  it('récupère les détails d\'un master avec tracklist', async () => {
    const mockResponse = {
      id: 123,
      title: 'Dark Side of the Moon',
      artists: [{ name: 'Pink Floyd', id: 45 }],
      year: 1973,
      genres: ['Rock'],
      styles: ['Progressive Rock'],
      images: [{ uri: 'https://example.com/cover.jpg' }],
      thumb: 'https://example.com/thumb.jpg',
      uri: 'https://www.discogs.com/master/123',
      resource_url: 'https://api.discogs.com/masters/123',
      tracklist: [
        { position: '1', title: 'Speak to Me', duration: '1:08' },
        { position: '2', title: 'Breathe', duration: '2:43' },
        { position: '3', title: 'On the Run', duration: '3:30' }
      ]
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    })

    const result = await getDiscogsAlbumWithTracks('123', 'master')

    expect(result).toEqual({
      id: '123',
      title: 'Dark Side of the Moon',
      artist: 'Pink Floyd',
      discogsArtistId: '45',
      year: 1973,
      coverImage: 'https://example.com/cover.jpg',
      thumb: 'https://example.com/thumb.jpg',
      type: 'master',
      labels: [],
      genres: ['Rock'],
      styles: ['Progressive Rock'],
      country: undefined,
      format: undefined,
      discogsUrl: 'https://www.discogs.com/master/123',
      resourceUrl: 'https://api.discogs.com/masters/123',
      tracklist: [
        { position: '1', title: 'Speak to Me', duration: '1:08' },
        { position: '2', title: 'Breathe', duration: '2:43' },
        { position: '3', title: 'On the Run', duration: '3:30' }
      ]
    })

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.discogs.com/masters/123',
      expect.objectContaining({
        headers: {
          'Authorization': 'Discogs token=test-token',
          'User-Agent': 'ListOmania/1.0'
        }
      })
    )
  })

  it('récupère les détails d\'une release avec tracklist et labels', async () => {
    const mockResponse = {
      id: 456,
      title: 'Abbey Road',
      artists: [{ name: 'The Beatles', id: 82730 }],
      year: 1969,
      genres: ['Rock'],
      styles: ['Pop Rock'],
      country: 'UK',
      labels: [
        { name: 'Apple Records' },
        { name: 'EMI' }
      ],
      formats: [
        { name: 'Vinyl', descriptions: ['LP', 'Album', 'Stereo'] }
      ],
      images: [{ uri: 'https://example.com/abbey.jpg' }],
      thumb: 'https://example.com/abbey-thumb.jpg',
      uri: 'https://www.discogs.com/release/456',
      resource_url: 'https://api.discogs.com/releases/456',
      tracklist: [
        { position: 'A1', title: 'Come Together', duration: '4:20' },
        { position: 'A2', title: 'Something', duration: '3:03' },
        { position: 'B1', title: 'Here Comes the Sun', duration: '3:05' }
      ]
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    })

    const result = await getDiscogsAlbumWithTracks('456', 'release')

    expect(result).toMatchObject({
      id: '456',
      title: 'Abbey Road',
      artist: 'The Beatles',
      type: 'release',
      labels: ['Apple Records', 'EMI'],
      country: 'UK',
      format: 'Vinyl (LP, Album, Stereo)',
      tracklist: [
        { position: 'A1', title: 'Come Together', duration: '4:20' },
        { position: 'A2', title: 'Something', duration: '3:03' },
        { position: 'B1', title: 'Here Comes the Sun', duration: '3:05' }
      ]
    })
  })

  it('gère les tracklists vides', async () => {
    const mockResponse = {
      id: 789,
      title: 'No Tracks',
      artists: [{ name: 'Test Artist', id: 999 }],
      year: 2000,
      genres: [],
      styles: [],
      images: [],
      uri: 'https://www.discogs.com/master/789',
      resource_url: 'https://api.discogs.com/masters/789',
      tracklist: []
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    })

    const result = await getDiscogsAlbumWithTracks('789', 'master')

    expect(result.tracklist).toEqual([])
  })

  it('gère les erreurs API', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404
    })

    await expect(getDiscogsAlbumWithTracks('999', 'master')).rejects.toThrow('Erreur Discogs API: 404')
  })

  it('respecte le rate limiting', async () => {
    const mockResponse = {
      id: 123,
      title: 'Test Album',
      artists: [{ name: 'Test', id: 1 }],
      uri: 'https://www.discogs.com/master/123',
      resource_url: 'https://api.discogs.com/masters/123',
      tracklist: []
    }

    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse
    })

    const start = Date.now()
    
    // Appeler deux fois de suite
    await getDiscogsAlbumWithTracks('123', 'master')
    await getDiscogsAlbumWithTracks('456', 'master')
    
    const duration = Date.now() - start

    // Devrait prendre au moins 1100ms (rate limit)
    expect(duration).toBeGreaterThanOrEqual(1000)
  })
})
