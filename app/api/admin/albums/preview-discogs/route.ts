import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDiscogsDetails } from '@/lib/discogs'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Vérifier que l'utilisateur est admin
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const body = await request.json()
    const { discogsId, discogsType } = body

    if (!discogsId) {
      return NextResponse.json({ error: 'ID Discogs requis' }, { status: 400 })
    }

    if (discogsType && !['master', 'release'].includes(discogsType)) {
      return NextResponse.json({ error: 'Type invalide (master ou release)' }, { status: 400 })
    }

    // Récupérer les détails depuis Discogs sans sauvegarder
    try {
      const discogsDetails = await getDiscogsDetails(discogsId, discogsType as 'master' | 'release' | undefined)
      
      return NextResponse.json({
        success: true,
        album: {
          discogsId,
          discogsType: discogsType || 'master',
          title: discogsDetails.title,
          artist: discogsDetails.artist,
          year: discogsDetails.year,
          coverImage: discogsDetails.coverImage,
          discogsArtistId: discogsDetails.discogsArtistId
        }
      })
    } catch (discogsError) {
      console.error('Erreur lors de la récupération des détails Discogs:', discogsError)
      return NextResponse.json(
        { error: 'ID Discogs invalide ou introuvable sur Discogs' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Erreur lors de la prévisualisation:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la prévisualisation' },
      { status: 500 }
    )
  }
}
