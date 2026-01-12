import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = await params

    const list = await prisma.list.findUnique({
      where: { id },
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

    if (!list) {
      return NextResponse.json({ error: 'Liste non trouvée' }, { status: 404 })
    }

    if (list.userId !== session.user.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    // Créer un objet JSON complet avec métadonnées + albums
    const exportData = {
      version: '1.0',
      list: {
        title: list.title,
        description: list.description || '',
        period: list.period || '',
        sourceUrl: list.sourceUrl || '',
        isPublic: list.isPublic,
        exportDate: new Date().toISOString(),
        albumCount: list.listAlbums.length
      },
      albums: list.listAlbums.map((la) => ({
        rank: la.position,
        artist: la.album.artist,
        title: la.album.title,
        year: la.album.year || null,
        discogsId: la.album.discogsId,
        discogsArtistId: la.album.discogsArtistId || null,
        coverImage: la.album.coverImage || null
      }))
    }

    const json = JSON.stringify(exportData, null, 2)

    // Créer un nom de fichier sûr
    const safeTitle = list.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()
    const filename = `${safeTitle}_complete_${new Date().toISOString().split('T')[0]}.json`

    return new NextResponse(json, {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Erreur lors de l\'export complet:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'export' },
      { status: 500 }
    )
  }
}
