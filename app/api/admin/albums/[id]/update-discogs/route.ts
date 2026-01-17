import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getDiscogsDetails } from '@/lib/discogs'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    // Vérifier que l'utilisateur est admin
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { discogsId, discogsType } = body

    if (!discogsId) {
      return NextResponse.json({ error: 'ID Discogs requis' }, { status: 400 })
    }

    if (discogsType && !['master', 'release'].includes(discogsType)) {
      return NextResponse.json({ error: 'Type invalide (master ou release)' }, { status: 400 })
    }

    // Vérifier que l'album existe
    const album = await prisma.album.findUnique({
      where: { id }
    })

    if (!album) {
      return NextResponse.json({ error: 'Album non trouvé' }, { status: 404 })
    }

    // Récupérer les détails depuis Discogs
    try {
      const discogsDetails = await getDiscogsDetails(discogsId, discogsType as 'master' | 'release' | undefined)
      
      // Mettre à jour l'album avec les nouvelles données
      const updatedAlbum = await prisma.album.update({
        where: { id },
        data: {
          discogsId,
          discogsType: discogsType || (discogsDetails as any).type || 'master',
          discogsArtistId: discogsDetails.discogsArtistId,
          title: discogsDetails.title,
          artist: discogsDetails.artist,
          year: discogsDetails.year,
          coverImage: discogsDetails.coverImage
        }
      })

      return NextResponse.json({
        success: true,
        album: updatedAlbum,
        message: 'Album mis à jour avec succès'
      })
    } catch (discogsError) {
      console.error('Erreur lors de la récupération des détails Discogs:', discogsError)
      return NextResponse.json(
        { error: 'ID Discogs invalide ou introuvable sur Discogs' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'album:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    )
  }
}
