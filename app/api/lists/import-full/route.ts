import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getDiscogsAlbumDetails, getDiscogsMasterDetails } from '@/lib/discogs'

export async function POST(
  request: NextRequest
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 })
    }

    const text = await file.text()
    let data

    try {
      data = JSON.parse(text)
    } catch (error) {
      return NextResponse.json({ error: 'Fichier JSON invalide' }, { status: 400 })
    }

    // Validation du format
    if (!data.list || !data.albums || !Array.isArray(data.albums)) {
      return NextResponse.json({ 
        error: 'Format de fichier invalide. Le fichier doit contenir "list" et "albums"' 
      }, { status: 400 })
    }

    const { list: listData, albums: albumsData } = data

    // Créer la nouvelle liste
    const newList = await prisma.list.create({
      data: {
        title: listData.title || 'Liste importée',
        description: listData.description || null,
        period: listData.period || null,
        sourceUrl: listData.sourceUrl || null,
        isPublic: listData.isPublic || false,
        userId: session.user.id
      }
    })

    const imported = []
    const errors = []

    // Importer les albums
    for (const albumData of albumsData) {
      const { rank, artist, title, year, discogsId, discogsArtistId, coverImage } = albumData

      if (!artist || !title) {
        errors.push(`Album invalide: données manquantes`)
        continue
      }

      try {
        let album

        // Si DiscogsId est fourni, vérifier s'il existe déjà
        if (discogsId && !discogsId.startsWith('unknown-')) {
          album = await prisma.album.findUnique({
            where: { discogsId }
          })

          if (!album) {
            // Essayer de récupérer les infos à jour depuis Discogs
            try {
              const discogsDetails = await getDiscogsMasterDetails(discogsId)
              album = await prisma.album.create({
                data: {
                  discogsId,
                  discogsType: 'master',
                  discogsArtistId: discogsDetails.discogsArtistId || discogsArtistId,
                  title: discogsDetails.title || title,
                  artist: discogsDetails.artist || artist,
                  year: discogsDetails.year || year,
                  coverImage: discogsDetails.coverImage || coverImage
                }
              })
            } catch (discogsError) {
              // Si Discogs échoue, utiliser les données du fichier
              console.error(`Erreur Discogs pour ID ${discogsId}:`, discogsError)
              album = await prisma.album.create({
                data: {
                  discogsId,
                  discogsType: 'master',
                  discogsArtistId: discogsArtistId || null,
                  title,
                  artist,
                  year: year || null,
                  coverImage: coverImage || null
                }
              })
            }
          }
        } else {
          // Pas de DiscogsId valide, créer avec ID fictif
          album = await prisma.album.create({
            data: {
              discogsId: discogsId || `unknown-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              discogsType: null,
              discogsArtistId: discogsArtistId || null,
              title,
              artist,
              year: year || null,
              coverImage: coverImage || null
            }
          })
        }

        // Ajouter à la liste
        await prisma.listAlbum.create({
          data: {
            listId: newList.id,
            albumId: album.id,
            position: rank || imported.length
          }
        })

        imported.push(`${artist} - ${title}`)
      } catch (error) {
        console.error(`Erreur pour ${artist} - ${title}:`, error)
        errors.push(`Erreur: ${artist} - ${title}`)
      }
    }

    return NextResponse.json({
      success: true,
      listId: newList.id,
      listTitle: newList.title,
      imported: imported.length,
      errors,
      message: `Liste "${newList.title}" créée avec ${imported.length} albums${errors.length > 0 ? `, ${errors.length} erreurs` : ''}`
    })
  } catch (error) {
    console.error('Erreur lors de l\'import complet:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'import' },
      { status: 500 }
    )
  }
}
