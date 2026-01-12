import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getDiscogsMasterDetails } from '@/lib/discogs'
import { z } from 'zod'

const addAlbumSchema = z.object({
  discogsId: z.string(),
  discogsArtistId: z.string().optional(),
  artist: z.string(),
  title: z.string(),
  year: z.number().optional(),
  coverImage: z.string().optional()
})

// POST - Ajouter un album à une liste
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const { id: listId } = await params
    const body = await request.json()
    const albumData = addAlbumSchema.parse(body)

    // Vérifier que l'utilisateur est propriétaire de la liste
    const list = await prisma.list.findUnique({
      where: { id: listId },
      include: {
        listAlbums: {
          orderBy: { position: 'desc' },
          take: 1
        }
      }
    })

    if (!list) {
      return NextResponse.json(
        { error: 'Liste non trouvée' },
        { status: 404 }
      )
    }

    if (list.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    // Créer ou récupérer l'album
    let album = await prisma.album.findUnique({
      where: { discogsId: albumData.discogsId }
    })

    if (!album) {
      // Si l'album n'existe pas, essayer de récupérer les détails complets depuis Discogs
      // incluant le discogsArtistId
      try {
        const discogsDetails = await getDiscogsMasterDetails(albumData.discogsId)
        album = await prisma.album.create({
          data: {
            discogsId: albumData.discogsId,
            discogsArtistId: discogsDetails.discogsArtistId,
            artist: discogsDetails.artist || albumData.artist,
            title: discogsDetails.title || albumData.title,
            year: discogsDetails.year || albumData.year,
            coverImage: discogsDetails.coverImage || albumData.coverImage
          }
        })
      } catch (error) {
        // Si l'appel Discogs échoue, créer avec les données fournies
        console.error('Erreur lors de la récupération des détails Discogs:', error)
        album = await prisma.album.create({
          data: albumData
        })
      }
    }

    // Calculer la nouvelle position (à la fin)
    const lastPosition = list.listAlbums[0]?.position ?? -1
    const newPosition = lastPosition + 1

    // Ajouter l'album à la liste
    const listAlbum = await prisma.listAlbum.create({
      data: {
        listId,
        albumId: album.id,
        position: newPosition
      },
      include: {
        album: true
      }
    })

    return NextResponse.json(listAlbum, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erreur lors de l\'ajout de l\'album:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}
