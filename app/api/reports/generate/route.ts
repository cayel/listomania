import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const { listIds, sortBy = 'title', sortOrder = 'asc' } = await req.json()

    if (!Array.isArray(listIds) || listIds.length === 0) {
      return NextResponse.json(
        { error: 'Aucune liste sélectionnée' },
        { status: 400 }
      )
    }

    // Récupérer les listes avec leurs albums
    const lists = await prisma.list.findMany({
      where: {
        id: { in: listIds },
        userId: session.user.id
      },
      include: {
        listAlbums: {
          include: {
            album: true
          },
          orderBy: {
            position: 'asc'
          }
        },
        categories: {
          include: {
            category: true
          }
        }
      }
    })

    // Vérifier que toutes les listes appartiennent à l'utilisateur
    if (lists.length !== listIds.length) {
      return NextResponse.json(
        { error: 'Certaines listes sont introuvables ou ne vous appartiennent pas' },
        { status: 403 }
      )
    }

    // Trier les listes selon les critères
    lists.sort((a: any, b: any) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title)
          break
        case 'updated':
          comparison = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          break
        case 'albums':
          comparison = a.listAlbums.length - b.listAlbums.length
          break
        case 'period':
          comparison = (a.period || '').localeCompare(b.period || '')
          break
        default:
          comparison = a.title.localeCompare(b.title)
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })

    // Formater les données pour le rapport
    const reportData = {
      generatedAt: new Date().toISOString(),
      lists: lists.map((list: any) => ({
        id: list.id,
        title: list.title,
        description: list.description,
        period: list.period,
        isPublic: list.isPublic,
        isRanked: list.isRanked,
        categories: list.categories.map((lc: any) => ({
          name: lc.category.name,
          color: lc.category.color
        })),
        albums: list.listAlbums.map((la: any, index: number) => ({
          position: list.isRanked ? la.position : index + 1,
          artist: la.album.artist,
          title: la.album.title,
          year: la.album.year,
          discogsId: la.album.discogsId,
          coverImage: la.album.coverImage
        }))
      })),
      totalAlbums: lists.reduce((sum: number, list: any) => sum + list.listAlbums.length, 0),
      totalLists: lists.length
    }

    return NextResponse.json(reportData)

  } catch (error) {
    console.error('Erreur lors de la génération du rapport:', error)
    return NextResponse.json(
      { error: 'Erreur serveur lors de la génération du rapport' },
      { status: 500 }
    )
  }
}
