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

    // Récupérer toutes les listes de l'utilisateur avec albums
    const lists = await prisma.list.findMany({
      where: { userId },
      include: {
        listAlbums: {
          include: {
            album: true
          }
        }
      }
    })

    // Statistiques de base
    const totalLists = lists.length
    const totalAlbums = lists.reduce((sum, list) => sum + list.listAlbums.length, 0)
    const publicLists = lists.filter(l => l.isPublic).length
    const privateLists = totalLists - publicLists

    // Listes par période
    const listsByPeriod: Record<string, number> = {}
    lists.forEach(list => {
      if (list.period) {
        listsByPeriod[list.period] = (listsByPeriod[list.period] || 0) + 1
      }
    })

    // Albums par décennie
    const albumsByDecade: Record<string, number> = {}
    const albumsByYear: Record<string, number> = {}
    lists.forEach(list => {
      list.listAlbums.forEach(la => {
        if (la.album.year) {
          const decade = `${Math.floor(la.album.year / 10) * 10}s`
          albumsByDecade[decade] = (albumsByDecade[decade] || 0) + 1
          albumsByYear[la.album.year.toString()] = (albumsByYear[la.album.year.toString()] || 0) + 1
        }
      })
    })

    // Artistes les plus présents (top 10)
    const artistCounts: Record<string, number> = {}
    lists.forEach(list => {
      list.listAlbums.forEach(la => {
        artistCounts[la.album.artist] = (artistCounts[la.album.artist] || 0) + 1
      })
    })
    const topArtists = Object.entries(artistCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([artist, count]) => ({ artist, count }))

    // Albums les plus présents dans différentes listes
    const albumCounts: Record<string, { title: string, artist: string, count: number }> = {}
    lists.forEach(list => {
      list.listAlbums.forEach(la => {
        const key = la.album.discogsId
        if (!albumCounts[key]) {
          albumCounts[key] = {
            title: la.album.title,
            artist: la.album.artist,
            count: 0
          }
        }
        albumCounts[key].count++
      })
    })
    const topAlbums = Object.values(albumCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Liste la plus longue
    const longestList = lists.reduce((max, list) => 
      list.listAlbums.length > max.length 
        ? { title: list.title, length: list.listAlbums.length }
        : max
    , { title: '', length: 0 })

    // Moyenne d'albums par liste
    const avgAlbumsPerList = totalLists > 0 ? Math.round(totalAlbums / totalLists) : 0

    // Albums uniques (sans doublons entre listes)
    const uniqueAlbumIds = new Set(lists.flatMap(l => l.listAlbums.map(la => la.album.discogsId)))
    const uniqueAlbums = uniqueAlbumIds.size

    // Albums les plus anciens et les plus récents
    const allYears = lists.flatMap(l => 
      l.listAlbums.map(la => la.album.year).filter((y): y is number => y !== null)
    )
    const oldestYear = allYears.length > 0 ? Math.min(...allYears) : null
    const newestYear = allYears.length > 0 ? Math.max(...allYears) : null

    // Date de création de la première liste
    const oldestListDate = lists.length > 0 
      ? lists.reduce((oldest, list) => 
          list.createdAt < oldest ? list.createdAt : oldest
        , lists[0].createdAt)
      : null

    // Date de la dernière mise à jour
    const newestListDate = lists.length > 0
      ? lists.reduce((newest, list) =>
          list.updatedAt > newest ? list.updatedAt : newest
        , lists[0].updatedAt)
      : null

    return NextResponse.json({
      overview: {
        totalLists,
        totalAlbums,
        uniqueAlbums,
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
