import { NextResponse } from 'next/server'
import { getDiscogsAlbumFullDetails } from '@/lib/discogs'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: albumId } = await params

    // Récupérer l'album depuis la base de données
    const album = await prisma.album.findUnique({
      where: { id: albumId }
    })

    if (!album) {
      console.error(`Album non trouvé: ${albumId}`)
      return NextResponse.json(
        { error: 'Album non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier que l'album a un ID Discogs valide
    if (!album.discogsId || album.discogsId.startsWith('unknown-')) {
      console.error(`Album sans ID Discogs valide: ${albumId}, discogsId: ${album.discogsId}`)
      return NextResponse.json(
        { error: 'Cet album n\'a pas d\'ID Discogs valide' },
        { status: 400 }
      )
    }

    console.log(`Récupération des détails pour album ${albumId}, discogsId: ${album.discogsId}, type: ${album.discogsType}`)

    // Déterminer le type (master ou release) depuis discogsId
    // Si discogsType est stocké en base, l'utiliser, sinon essayer master puis release
    let details

    if (album.discogsType) {
      const type = album.discogsType as 'master' | 'release'
      console.log(`Utilisation du type stocké: ${type}`)
      try {
        details = await getDiscogsAlbumFullDetails(album.discogsId, type)
      } catch (error) {
        console.error(`Erreur avec type ${type}, tentative avec l'autre type:`, error)
        // Si échoue, essayer l'autre type
        const alternateType = type === 'master' ? 'release' : 'master'
        details = await getDiscogsAlbumFullDetails(album.discogsId, alternateType)
      }
    } else {
      // Essayer d'abord comme master
      console.log('Type non défini, essai master puis release')
      try {
        details = await getDiscogsAlbumFullDetails(album.discogsId, 'master')
        console.log('Succès avec type master')
      } catch (masterError) {
        console.log('Échec master, essai release:', masterError)
        // Si échoue, essayer comme release
        try {
          details = await getDiscogsAlbumFullDetails(album.discogsId, 'release')
          console.log('Succès avec type release')
        } catch (releaseError) {
          console.error('Échec avec les deux types:', { masterError, releaseError })
          throw releaseError
        }
      }
    }

    return NextResponse.json(details)
  } catch (error: any) {
    console.error('Erreur lors de la récupération des détails Discogs:', error)
    return NextResponse.json(
      { error: error?.message || 'Erreur lors de la récupération des détails' },
      { status: 500 }
    )
  }
}
