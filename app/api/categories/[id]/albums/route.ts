import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Récupérer tous les albums d'une catégorie
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const categoryId = params.id

    // Vérifier que la catégorie appartient bien à l'utilisateur
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        userId: session.user.id
      }
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Catégorie non trouvée' },
        { status: 404 }
      )
    }

    // Récupérer toutes les listes de cette catégorie avec leurs albums
    const listsWithAlbums = await prisma.list.findMany({
      where: {
        userId: session.user.id,
        categories: {
          some: {
            categoryId: categoryId
          }
        }
      },
      include: {
        listAlbums: {
          include: {
            album: true
          },
          orderBy: {
            position: 'asc'
          }
        }
      }
    })

    // Extraire tous les albums uniques
    const albumsMap = new Map()
    const albumStats = new Map<string, { count: number, lists: string[] }>()

    listsWithAlbums.forEach(list => {
      list.listAlbums.forEach(listAlbum => {
        const album = listAlbum.album
        
        // Ajouter l'album unique
        if (!albumsMap.has(album.id)) {
          albumsMap.set(album.id, {
            ...album,
            appearances: 0,
            lists: []
          })
        }

        // Compter les apparitions
        const stats = albumStats.get(album.id) || { count: 0, lists: [] }
        stats.count++
        stats.lists.push(list.title)
        albumStats.set(album.id, stats)
      })
    })

    // Fusionner les stats avec les albums
    const albums = Array.from(albumsMap.values()).map(album => {
      const stats = albumStats.get(album.id)
      return {
        ...album,
        appearances: stats?.count || 0,
        lists: stats?.lists || []
      }
    })

    // Trier par nombre d'apparitions (décroissant)
    albums.sort((a, b) => b.appearances - a.appearances)

    return NextResponse.json({
      category,
      albums,
      totalAlbums: albums.length,
      totalLists: listsWithAlbums.length
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des albums:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}
