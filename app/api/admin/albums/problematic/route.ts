import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    // Vérifier que l'utilisateur est admin
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    // Récupérer les albums avec des IDs Discogs fictifs ou sans type
    const problematicAlbums = await prisma.album.findMany({
      where: {
        OR: [
          { discogsId: { startsWith: 'unknown-' } },
          { discogsType: null },
          { coverImage: null }
        ]
      },
      include: {
        listAlbums: {
          include: {
            list: {
              select: {
                id: true,
                title: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      albums: problematicAlbums,
      count: problematicAlbums.length
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des albums problématiques:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération' },
      { status: 500 }
    )
  }
}
