import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Récupérer les listes publiques
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {
      isPublic: true
    }

    if (period) {
      where.period = period
    }

    const lists = await prisma.list.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        },
        listAlbums: {
          include: {
            album: true
          },
          orderBy: {
            position: 'asc'
          },
          take: 5 // Seulement les 5 premiers albums pour l'aperçu
        },
        _count: {
          select: {
            listAlbums: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: limit,
      skip: offset
    })

    const total = await prisma.list.count({ where })

    return NextResponse.json({
      lists,
      total,
      hasMore: offset + limit < total
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des listes publiques:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}
