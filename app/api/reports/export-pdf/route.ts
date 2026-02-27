import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Cette route génère un PDF en utilisant l'API du navigateur côté client
// Pour une vraie implémentation serveur, il faudrait installer 'jspdf' ou 'pdfkit'
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const { listIds } = await req.json()

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
      },
      orderBy: {
        title: 'asc'
      }
    })

    if (lists.length !== listIds.length) {
      return NextResponse.json(
        { error: 'Certaines listes sont introuvables ou ne vous appartiennent pas' },
        { status: 403 }
      )
    }

    // Retourner les données pour génération PDF côté client
    // (Le PDF sera généré dans le navigateur avec window.print ou une lib client)
    const reportData = {
      generatedAt: new Date().toISOString(),
      userName: session.user.name,
      lists: lists.map(list => ({
        id: list.id,
        title: list.title,
        description: list.description,
        period: list.period,
        isRanked: list.isRanked,
        categories: list.categories.map(lc => lc.category.name),
        albums: list.listAlbums.map((la, index) => ({
          position: list.isRanked ? la.position : index + 1,
          artist: la.album.artist,
          title: la.album.title,
          year: la.album.year
        }))
      })),
      totalAlbums: lists.reduce((sum, list) => sum + list.listAlbums.length, 0)
    }

    return NextResponse.json(reportData)

  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error)
    return NextResponse.json(
      { error: 'Erreur serveur lors de la génération du PDF' },
      { status: 500 }
    )
  }
}
