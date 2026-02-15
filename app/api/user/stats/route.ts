import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Optimisation: Utiliser des requêtes agrégées au lieu de charger toutes les données
    // Statistiques de base - Paralléliser les requêtes
    const [
      totalLists,
      publicLists,
      listsByPeriodRaw,
      listsWithAlbumCount,
      albumYearsRaw,
      topArtistsRaw,
      topAlbumsRaw,
      uniqueAlbumsCount,
      oldestListData,
      newestListData
    ] = await Promise.all([
      // Nombre total de listes
      prisma.list.count({ where: { userId } }),
      
      // Nombre de listes publiques
      prisma.list.count({ where: { userId, isPublic: true } }),
      
      // Listes groupées par période
      prisma.list.groupBy({
        by: ['period'],
        where: { userId, period: { not: null } },
        _count: { period: true }
      }),
      
      // Liste avec le plus d'albums
      prisma.list.findMany({
        where: { userId },
        select: {
          title: true,
          _count: { select: { listAlbums: true } }
        },
        orderBy: { listAlbums: { _count: 'desc' } },
        take: 1
      }),
      
      // Années des albums pour statistiques
      prisma.album.findMany({
        where: {
          listAlbums: {
            some: { list: { userId } }
          },
          year: { not: null }
        },
        select: { year: true }
      }),
      
      // Top 10 artistes
      prisma.album.groupBy({
        by: ['artist'],
        where: {
          listAlbums: {
            some: { list: { userId } }
          }
        },
        _count: { artist: true },
        orderBy: { _count: { artist: 'desc' } },
        take: 10
      }),
      
      // Top 10 albums
      prisma.album.findMany({
        where: {
          listAlbums: {
            some: { list: { userId } }
          }
        },
        select: {
          discogsId: true,
          title: true,
          artist: true,
          _count: {
            select: { listAlbums: true }
          }
        },
        orderBy: {
          listAlbums: { _count: 'desc' }
        },
        take: 10
      }),
      
      // Nombre d'albums uniques
      prisma.album.count({
        where: {
          listAlbums: {
            some: { list: { userId } }
          }
        }
      }),
      
      // Première liste créée
      prisma.list.findFirst({
        where: { userId },
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' }
      }),
      
      // Dernière liste mise à jour
      prisma.list.findFirst({
        where: { userId },
        select: { updatedAt: true },
        orderBy: { updatedAt: 'desc' }
      })
    ])

    // Traitement des listes par période
    const listsByPeriod: Record<string, number> = {}
    listsByPeriodRaw.forEach(item => {
      if (item.period) {
        listsByPeriod[item.period] = item._count.period
      }
    })

    // Traitement des années d'albums
    const albumsByDecade: Record<string, number> = {}
    const albumsByYear: Record<string, number> = {}
    albumYearsRaw.forEach(album => {
      if (album.year) {
        const decade = `${Math.floor(album.year / 10) * 10}s`
        albumsByDecade[decade] = (albumsByDecade[decade] || 0) + 1
        albumsByYear[album.year.toString()] = (albumsByYear[album.year.toString()] || 0) + 1
      }
    })

    // Top artistes
    const topArtists = topArtistsRaw.map(item => ({
      artist: item.artist,
      count: item._count.artist
    }))

    // Top albums
    const topAlbums = topAlbumsRaw.map(album => ({
      title: album.title,
      artist: album.artist,
      count: album._count.listAlbums
    }))

    // Calcul des statistiques finales
    const privateLists = totalLists - publicLists
    
    // Nombre total d'albums (avec doublons entre listes)
    const totalAlbumsCount = await prisma.listAlbum.count({
      where: { list: { userId } }
    })
    
    const avgAlbumsPerList = totalLists > 0 ? Math.round(totalAlbumsCount / totalLists) : 0

    const longestList = listsWithAlbumCount[0] 
      ? { title: listsWithAlbumCount[0].title, length: listsWithAlbumCount[0]._count.listAlbums }
      : { title: '', length: 0 }

    const allYears = albumYearsRaw.map(a => a.year).filter((y): y is number => y !== null)
    const oldestYear = allYears.length > 0 ? Math.min(...allYears) : null
    const newestYear = allYears.length > 0 ? Math.max(...allYears) : null

    const oldestListDate = oldestListData?.createdAt || null
    const newestListDate = newestListData?.updatedAt || null

    return NextResponse.json({
      overview: {
        totalLists,
        totalAlbums: totalAlbumsCount,
        uniqueAlbums: uniqueAlbumsCount,
        publicLists,
        privateLists,
        avgAlbumsPerList,
        longestList,
        oldestYear,
        newestYear,
        oldestListDate,
        newestListDate
      },
      listsByPeriod,
      albumsByDecade,
      albumsByYear,
      topArtists,
      topAlbums
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
