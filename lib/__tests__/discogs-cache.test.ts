import { getCachedTracklist, setCachedTracklist, clearCachedTracklist } from '../discogs-cache'
import { prisma } from '../prisma'

// Mock Prisma
jest.mock('../prisma', () => ({
  prisma: {
    albumTracklist: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
      delete: jest.fn()
    }
  }
}))

describe('Discogs Cache', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getCachedTracklist', () => {
    it('retourne null si pas de cache', async () => {
      (prisma.albumTracklist.findUnique as jest.Mock).mockResolvedValue(null)

      const result = await getCachedTracklist('123', 'master')
      
      expect(result).toBeNull()
      expect(prisma.albumTracklist.findUnique).toHaveBeenCalledWith({
        where: {
          discogsId_discogsType: {
            discogsId: '123',
            discogsType: 'master'
          }
        }
      })
    })

    it('retourne la tracklist depuis le cache', async () => {
      const mockTracklist = [
        { position: '1', title: 'Track 1', duration: '3:45' },
        { position: '2', title: 'Track 2', duration: '4:20' }
      ];
      
      (prisma.albumTracklist.findUnique as jest.Mock).mockResolvedValue({
        id: 'cache-1',
        discogsId: '123',
        discogsType: 'master',
        tracklist: mockTracklist,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      const result = await getCachedTracklist('123', 'master')
      
      expect(result).toEqual(mockTracklist)
    })

    it('supprime le cache expiré (> 30 jours)', async () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 31); // 31 jours dans le passé
      
      (prisma.albumTracklist.findUnique as jest.Mock).mockResolvedValue({
        id: 'cache-1',
        discogsId: '123',
        discogsType: 'master',
        tracklist: [],
        createdAt: oldDate,
        updatedAt: oldDate
      })

      const result = await getCachedTracklist('123', 'master')
      
      expect(result).toBeNull()
      expect(prisma.albumTracklist.delete).toHaveBeenCalledWith({
        where: { id: 'cache-1' }
      })
    })

    it('retourne le cache valide (< 30 jours)', async () => {
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 15); // 15 jours dans le passé
      
      const mockTracklist = [
        { position: '1', title: 'Recent Track', duration: '3:00' }
      ];
      
      (prisma.albumTracklist.findUnique as jest.Mock).mockResolvedValue({
        id: 'cache-2',
        discogsId: '456',
        discogsType: 'release',
        tracklist: mockTracklist,
        createdAt: recentDate,
        updatedAt: recentDate
      })

      const result = await getCachedTracklist('456', 'release')
      
      expect(result).toEqual(mockTracklist)
      expect(prisma.albumTracklist.delete).not.toHaveBeenCalled()
    })

    it('gère les erreurs gracieusement', async () => {
      (prisma.albumTracklist.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'))

      const result = await getCachedTracklist('123', 'master')
      
      expect(result).toBeNull()
    })
  })

  describe('setCachedTracklist', () => {
    it('sauvegarde la tracklist dans le cache', async () => {
      const tracklist = [
        { position: '1', title: 'Track 1', duration: '3:45' },
        { position: '2', title: 'Track 2', duration: '4:20' }
      ]

      await setCachedTracklist('123', 'master', tracklist)
      
      expect(prisma.albumTracklist.upsert).toHaveBeenCalledWith({
        where: {
          discogsId_discogsType: {
            discogsId: '123',
            discogsType: 'master'
          }
        },
        update: {
          tracklist,
          updatedAt: expect.any(Date)
        },
        create: {
          discogsId: '123',
          discogsType: 'master',
          tracklist
        }
      })
    })

    it('sauvegarde une tracklist vide', async () => {
      const tracklist: any[] = []

      await setCachedTracklist('789', 'release', tracklist)
      
      expect(prisma.albumTracklist.upsert).toHaveBeenCalledWith({
        where: {
          discogsId_discogsType: {
            discogsId: '789',
            discogsType: 'release'
          }
        },
        update: {
          tracklist: [],
          updatedAt: expect.any(Date)
        },
        create: {
          discogsId: '789',
          discogsType: 'release',
          tracklist: []
        }
      })
    })

    it('ne propage pas les erreurs', async () => {
      (prisma.albumTracklist.upsert as jest.Mock).mockRejectedValue(new Error('Database error'))

      const tracklist = [{ position: '1', title: 'Track', duration: '3:00' }]
      
      // Ne devrait pas lancer d'erreur
      await expect(setCachedTracklist('123', 'master', tracklist)).resolves.not.toThrow()
    })
  })

  describe('clearCachedTracklist', () => {
    it('supprime le cache pour un album', async () => {
      await clearCachedTracklist('123', 'master')
      
      expect(prisma.albumTracklist.delete).toHaveBeenCalledWith({
        where: {
          discogsId_discogsType: {
            discogsId: '123',
            discogsType: 'master'
          }
        }
      })
    })

    it('ignore les erreurs si le cache n\'existe pas', async () => {
      (prisma.albumTracklist.delete as jest.Mock).mockRejectedValue(new Error('Not found'))

      // Ne devrait pas lancer d'erreur
      await expect(clearCachedTracklist('999', 'release')).resolves.not.toThrow()
    })
  })
})
