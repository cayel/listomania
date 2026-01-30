import { prisma } from './prisma'
import { DiscogsTrack } from './discogs'

/**
 * Récupère la tracklist depuis le cache ou null si non trouvée
 */
export async function getCachedTracklist(
  discogsId: string,
  type: 'master' | 'release'
): Promise<DiscogsTrack[] | null> {
  try {
    const cached = await prisma.albumTracklist.findUnique({
      where: {
        discogsId_discogsType: {
          discogsId,
          discogsType: type
        }
      }
    })

    if (!cached) {
      return null
    }

    // Vérifier si le cache est encore valide (30 jours)
    const cacheAge = Date.now() - cached.updatedAt.getTime()
    const maxCacheAge = 30 * 24 * 60 * 60 * 1000 // 30 jours en ms

    if (cacheAge > maxCacheAge) {
      // Cache expiré, le supprimer
      await prisma.albumTracklist.delete({
        where: { id: cached.id }
      })
      return null
    }

    return cached.tracklist as unknown as DiscogsTrack[]
  } catch (error) {
    console.error('Erreur lors de la récupération du cache:', error)
    return null
  }
}

/**
 * Sauvegarde la tracklist dans le cache
 */
export async function setCachedTracklist(
  discogsId: string,
  type: 'master' | 'release',
  tracklist: DiscogsTrack[]
): Promise<void> {
  try {
    await prisma.albumTracklist.upsert({
      where: {
        discogsId_discogsType: {
          discogsId,
          discogsType: type
        }
      },
      update: {
        tracklist: tracklist as any,
        updatedAt: new Date()
      },
      create: {
        discogsId,
        discogsType: type,
        tracklist: tracklist as any
      }
    })
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du cache:', error)
    // Ne pas propager l'erreur, le cache est optionnel
  }
}

/**
 * Vide le cache pour un album spécifique
 */
export async function clearCachedTracklist(
  discogsId: string,
  type: 'master' | 'release'
): Promise<void> {
  try {
    await prisma.albumTracklist.delete({
      where: {
        discogsId_discogsType: {
          discogsId,
          discogsType: type
        }
      }
    })
  } catch (error) {
    // Ignorer si non trouvé
  }
}
