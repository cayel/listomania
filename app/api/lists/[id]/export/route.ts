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

    // Générer le CSV
    const csvHeader = 'Rank,Artist,Title,Year,DiscogsId\n'
    const csvRows = list.listAlbums.map((la) => {
      const rank = la.position
      const artist = `"${la.album.artist.replace(/"/g, '""')}"`
      const title = `"${la.album.title.replace(/"/g, '""')}"`
      const year = la.album.year || ''
      const discogsId = la.album.discogsId || ''
      return `${rank},${artist},${title},${year},${discogsId}`
    }).join('\n')

    const csv = csvHeader + csvRows

    // Créer un nom de fichier sûr
    const safeTitle = list.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()
    const filename = `${safeTitle}_${new Date().toISOString().split('T')[0]}.csv`

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Erreur lors de l\'export CSV:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'export' },
      { status: 500 }
    )
  }
}
