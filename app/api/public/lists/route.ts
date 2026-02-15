import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Récupérer les listes publiques
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'updated'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {
      isPublic: true
    }

    if (period) {
      where.period = period
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } }
      ]
    }

    // Configuration du tri
    let orderBy: any = { updatedAt: 'desc' }
    switch (sortBy) {
      case 'title':
        orderBy = { title: sortOrder }
        break
      case 'albums':
        orderBy = { listAlbums: { _count: sortOrder } }
        break
      case 'period':
        orderBy = { period: sortOrder }
        break
      case 'updated':
      default:
        orderBy = { updatedAt: sortOrder }
        break
    }

    const lists = await prisma.list.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        period: true,
        isPublic: true,
        isRanked: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true
          }
        },
        listAlbums: {
          take: 5,
          select: {
            album: {
              select: {
                id: true,
                coverImage: true,
                title: true,
                artist: true
              }
            }
          },
          orderBy: {
            position: 'asc'
          }
        },
        _count: {
          select: {
            listAlbums: true
          }
        }
      },
      orderBy,
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
