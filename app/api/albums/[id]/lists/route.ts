import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    // Récupérer l'album pour vérifier qu'il existe
    const album = await prisma.album.findUnique({
      where: { id }
    })

    if (!album) {
      return NextResponse.json(
        { error: 'Album non trouvé' },
        { status: 404 }
      )
    }

    // Récupérer toutes les listes contenant cet album
    const listAlbums = await prisma.listAlbum.findMany({
      where: { albumId: id },
      include: {
        list: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true
              }
            },
            _count: {
              select: {
                listAlbums: true
              }
            }
          }
        }
      },
      orderBy: {
        list: {
          updatedAt: 'desc'
        }
      }
    })

    // Filtrer les listes selon les permissions
    const accessibleLists = listAlbums
      .filter(la => {
        const list = la.list
        // Liste publique : accessible à tous
        if (list.isPublic) return true
        // Liste privée : seulement accessible au propriétaire
        if (session && list.userId === session.user.id) return true
        return false
      })
      .map(la => ({
        listId: la.list.id,
        listTitle: la.list.title,
        listDescription: la.list.description,
        listPeriod: la.list.period,
        isPublic: la.list.isPublic,
        position: la.position,
        totalAlbums: la.list._count.listAlbums,
        owner: {
          id: la.list.user.id,
          name: la.list.user.name,
          image: la.list.user.image
        },
        isOwner: session ? la.list.userId === session.user.id : false,
        updatedAt: la.list.updatedAt,
        createdAt: la.list.createdAt
      }))

    return NextResponse.json({
      album: {
        id: album.id,
        artist: album.artist,
        title: album.title,
        year: album.year,
        coverImage: album.coverImage,
        discogsId: album.discogsId
      },
      lists: accessibleLists,
      totalLists: accessibleLists.length
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des listes de l\'album:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
