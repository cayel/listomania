/**
 * @jest-environment node
 */

import { 
  searchDiscogsAlbums, 
  searchDiscogsAlbumsByArtistAndTitle,
  getDiscogsAlbumDetails,
  getDiscogsMasterDetails,
  getDiscogsDetails
} from '../discogs'

// Mock fetch globally
global.fetch = jest.fn()

// Mock discogs-cache pour éviter les appels Prisma pendant les tests
jest.mock('../discogs-cache', () => ({
  getCachedTracklist: jest.fn().mockResolvedValue(null),
  setCachedTracklist: jest.fn().mockResolvedValue(undefined),
  clearCachedTracklist: jest.fn().mockResolvedValue(undefined)
}))

describe('Discogs API Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Set environment variable for tests
    process.env.DISCOGS_TOKEN = 'test-token'
  })

  describe('searchDiscogsAlbums', () => {
    it('should search for albums and return formatted results', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          results: [
            {
              id: 12345,
              title: 'Pink Floyd - The Dark Side of the Moon',
              year: '1973',
              thumb: 'https://example.com/thumb.jpg',
              cover_image: 'https://example.com/cover.jpg',
              type: 'master'
            }
          ]
        })
      }

      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      const results = await searchDiscogsAlbums('pink floyd')

      expect(results).toHaveLength(1)
      expect(results[0]).toMatchObject({
        id: '12345',
        title: 'The Dark Side of the Moon',
        artist: 'Pink Floyd',
        year: 1973,
        coverImage: 'https://example.com/cover.jpg'
      })
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('q=pink%20floyd'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Discogs token=test-token'
          })
        })
      )
    })

    it('should deduplicate masters and releases, keeping masters', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          results: [
            {
              id: 12345,
              title: 'Pink Floyd - The Dark Side of the Moon',
              year: '1973',
              thumb: 'https://example.com/thumb1.jpg',
              cover_image: 'https://example.com/cover1.jpg',
              type: 'master'
            },
            {
              id: 67890,
              title: 'Pink Floyd - The Dark Side Of The Moon',
              year: '1973',
              thumb: 'https://example.com/thumb2.jpg',
              cover_image: 'https://example.com/cover2.jpg',
              type: 'release'
            },
            {
              id: 11111,
              title: 'The Beatles - Abbey Road',
              year: '1969',
              thumb: 'https://example.com/thumb3.jpg',
              cover_image: 'https://example.com/cover3.jpg',
              type: 'release'
            }
          ]
        })
      }

      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      const results = await searchDiscogsAlbums('classic rock')

      // Devrait avoir seulement 2 résultats (le master Pink Floyd et la release Beatles)
      expect(results).toHaveLength(2)
      
      // Le premier devrait être le master de Pink Floyd (pas la release)
      expect(results[0]).toMatchObject({
        id: '12345',
        title: 'The Dark Side of the Moon',
        artist: 'Pink Floyd'
      })
      
      // Le second devrait être la release Beatles
      expect(results[1]).toMatchObject({
        id: '11111',
        title: 'Abbey Road',
        artist: 'The Beatles'
      })
    })

    it('should filter out non-album types (artist, label, etc.)', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          results: [
            {
              id: 12345,
              title: 'Pink Floyd - The Dark Side of the Moon',
              year: '1973',
              type: 'master'
            },
            {
              id: 999,
              title: 'Pink Floyd',
              type: 'artist'
            },
            {
              id: 888,
              title: 'Capitol Records',
              type: 'label'
            },
            {
              id: 67890,
              title: 'The Beatles - Abbey Road',
              year: '1969',
              type: 'release'
            }
          ]
        })
      }

      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      const results = await searchDiscogsAlbums('music')

      // Devrait avoir seulement 2 résultats (les types master et release)
      expect(results).toHaveLength(2)
      expect(results.every(r => r.id === '12345' || r.id === '67890')).toBe(true)
    })

    it('should throw error when DISCOGS_TOKEN is not defined', async () => {
      delete process.env.DISCOGS_TOKEN

      await expect(searchDiscogsAlbums('test')).rejects.toThrow(
        'DISCOGS_TOKEN n\'est pas défini dans les variables d\'environnement'
      )
    })

    it('should throw error on API failure', async () => {
      const mockResponse = {
        ok: false,
        status: 500
      }

      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      await expect(searchDiscogsAlbums('test')).rejects.toThrow('Erreur Discogs API: 500')
    })
  })

  describe('searchDiscogsAlbumsByArtistAndTitle', () => {
    it('should search masters first and return results', async () => {
      const mockMasterResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          results: [
            {
              id: 12345,
              title: 'Pink Floyd - The Dark Side of the Moon',
              year: '1973',
              thumb: 'https://example.com/thumb.jpg',
              cover_image: 'https://example.com/cover.jpg',
              type: 'master'
            }
          ]
        })
      }

      ;(global.fetch as jest.Mock).mockResolvedValue(mockMasterResponse)

      const results = await searchDiscogsAlbumsByArtistAndTitle('Pink Floyd', 'The Dark Side of the Moon')

      expect(results).toHaveLength(1)
      expect(results[0]).toMatchObject({
        id: '12345',
        title: 'The Dark Side of the Moon',
        artist: 'Pink Floyd',
        year: 1973,
        type: 'master'
      })
    })

    it('should fallback to releases if no masters found', async () => {
      const mockEmptyMasterResponse = {
        ok: true,
        status: 200,
        json: async () => ({ results: [] })
      }

      const mockReleaseResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          results: [
            {
              id: 67890,
              title: 'The Beatles - Abbey Road',
              year: '1969',
              thumb: 'https://example.com/thumb2.jpg',
              cover_image: 'https://example.com/cover2.jpg',
              type: 'release'
            }
          ]
        })
      }

      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce(mockEmptyMasterResponse)
        .mockResolvedValueOnce(mockReleaseResponse)

      const results = await searchDiscogsAlbumsByArtistAndTitle('The Beatles', 'Abbey Road')

      expect(results).toHaveLength(1)
      expect(results[0].type).toBe('release')
      expect(global.fetch).toHaveBeenCalledTimes(2)
    })
  })

  describe('getDiscogsAlbumDetails', () => {
    it('should fetch release details', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          id: 12345,
          title: 'The Dark Side of the Moon',
          artists: [
            { id: 45, name: 'Pink Floyd' }
          ],
          year: 1973,
          images: [
            { uri: 'https://example.com/cover.jpg' }
          ]
        })
      }

      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      const result = await getDiscogsAlbumDetails('12345')

      expect(result).toMatchObject({
        id: '12345',
        title: 'The Dark Side of the Moon',
        artist: 'Pink Floyd',
        discogsArtistId: '45',
        year: 1973,
        coverImage: 'https://example.com/cover.jpg'
      })
    })

    it('should clean artist name with numbers', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          id: 12345,
          title: 'Album Title',
          artists: [
            { id: 99, name: 'Mike Davis (2)' }
          ],
          year: 2020
        })
      }

      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      const result = await getDiscogsAlbumDetails('12345')

      expect(result.artist).toBe('Mike Davis')
    })
  })

  describe('getDiscogsMasterDetails', () => {
    it('should fetch master details', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          id: 67890,
          title: 'Abbey Road',
          artists: [
            { id: 82730, name: 'The Beatles' }
          ],
          year: 1969,
          images: [
            { uri: 'https://example.com/cover.jpg' }
          ]
        })
      }

      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      const result = await getDiscogsMasterDetails('67890')

      expect(result).toMatchObject({
        id: '67890',
        title: 'Abbey Road',
        artist: 'The Beatles',
        discogsArtistId: '82730',
        year: 1969,
        coverImage: 'https://example.com/cover.jpg'
      })
    })
  })

  describe('getDiscogsDetails', () => {
    it('should fetch master when type is specified', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          id: 12345,
          title: 'Test Album',
          artists: [{ id: 1, name: 'Test Artist' }],
          year: 2020,
          images: []
        })
      }

      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      const result = await getDiscogsDetails('12345', 'master')

      expect(result).toBeTruthy()
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.discogs.com/masters/12345',
        expect.any(Object)
      )
    })

    it('should fetch release when type is specified', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          id: 12345,
          title: 'Test Album',
          artists: [{ id: 1, name: 'Test Artist' }],
          year: 2020,
          images: []
        })
      }

      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      const result = await getDiscogsDetails('12345', 'release')

      expect(result).toBeTruthy()
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.discogs.com/releases/12345',
        expect.any(Object)
      )
    })

    it('should try master first then fallback to release if no type specified', async () => {
      const mockErrorResponse = {
        ok: false,
        status: 404
      }

      const mockSuccessResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          id: 12345,
          title: 'Test Album',
          artists: [{ id: 1, name: 'Test Artist' }],
          year: 2020,
          images: []
        })
      }

      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce(mockErrorResponse)
        .mockResolvedValueOnce(mockSuccessResponse)

      const result = await getDiscogsDetails('12345')

      expect(result).toBeTruthy()
      expect(global.fetch).toHaveBeenCalledTimes(2)
    })
  })
})
