import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { searchDiscogsAlbums, getDiscogsAlbumDetails, searchDiscogsAlbumsByArtistAndTitle, getDiscogsMasterDetails } from '@/lib/discogs'

export async function POST(
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
      where: { id }
    })

    if (!list) {
      return NextResponse.json({ error: 'Liste non trouvée' }, { status: 404 })
    }

    if (list.userId !== session.user.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 })
    }

    const text = await file.text()
    const lines = text.split('\n').filter(line => line.trim())

    // Ignorer la première ligne (header)
    const dataLines = lines.slice(1)

    const imported = []
    const errors = []

    // Détecter le séparateur (virgule ou point-virgule)
    const separator = text.includes(';') && !text.includes(',') ? ';' : ','

    for (const line of dataLines) {
      // Séparer la ligne selon le délimiteur détecté
      const parts = line.split(separator).map(p => p.trim().replace(/^"|"$/g, ''))
      
      if (parts.length < 3) {
        errors.push(`Ligne invalide: ${line}`)
        continue
      }

      const rank = parts[0]
      const artist = parts[1]
      const title = parts[2]
      const year = parts[3] || null
      const discogsId = parts[4] || null

      if (!rank || !artist || !title) {
        errors.push(`Ligne invalide (données manquantes): ${line}`)
        continue
      }

      const cleanArtist = artist.replace(/""/g, '"').trim()
      const cleanTitle = title.replace(/""/g, '"').trim()
      const cleanDiscogsId = discogsId?.trim()

      try {
        let albumData
        
        // Si DiscogsId est fourni, l'utiliser directement
        if (cleanDiscogsId) {
          // Vérifier si l'album existe déjà
          let album = await prisma.album.findUnique({
            where: { discogsId: cleanDiscogsId }
          })

          if (album) {
            // Album existe déjà, vérifier s'il est dans la liste
            const existingListAlbum = await prisma.listAlbum.findFirst({
              where: {
                listId: id,
                albumId: album.id
              }
            })

            if (!existingListAlbum) {
              await prisma.listAlbum.create({
                data: {
                  listId: id,
                  albumId: album.id,
                  position: parseInt(rank)
                }
              })
              imported.push(`${cleanArtist} - ${cleanTitle}`)
            }
            continue
          }

          // Album n'existe pas, récupérer les infos depuis Discogs
          try {
            const discogsDetails = await getDiscogsAlbumDetails(cleanDiscogsId)
            
            album = await prisma.album.create({
              data: {
                discogsId: cleanDiscogsId,
                discogsArtistId: discogsDetails.discogsArtistId,
                title: discogsDetails.title || cleanTitle,
                artist: discogsDetails.artist || cleanArtist,
                year: discogsDetails.year || (year ? parseInt(year) : null),
                coverImage: discogsDetails.coverImage || null
              }
            })

            await prisma.listAlbum.create({
              data: {
                listId: id,
                albumId: album.id,
                position: parseInt(rank)
              }
            })
            imported.push(`${cleanArtist} - ${cleanTitle}`)
          } catch (discogsError) {
            // Si l'appel Discogs échoue, créer avec les infos du CSV
            console.error(`Erreur Discogs pour ID ${cleanDiscogsId}:`, discogsError)
            album = await prisma.album.create({
              data: {
                discogsId: cleanDiscogsId,
                discogsArtistId: null,
                title: cleanTitle,
                artist: cleanArtist,
                year: year ? parseInt(year) : null,
                coverImage: null
              }
            })

            await prisma.listAlbum.create({
              data: {
                listId: id,
                albumId: album.id,
                position: parseInt(rank)
              }
            })
            imported.push(`${cleanArtist} - ${cleanTitle} (infos limitées)`)
          }
          continue
        }

        // Pas de DiscogsId fourni, rechercher sur Discogs avec artiste et titre
        const results = await searchDiscogsAlbumsByArtistAndTitle(cleanArtist, cleanTitle)

        if (results.length === 0) {
          // Album non trouvé sur Discogs, créer avec ID fictif
          const album = await prisma.album.create({
            data: {
              discogsId: `unknown-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              title: cleanTitle,
              artist: cleanArtist,
              year: year ? parseInt(year) : null,
              coverImage: null
            }
          })

          await prisma.listAlbum.create({
            data: {
              listId: id,
              albumId: album.id,
              position: parseInt(rank)
            }
          })
          imported.push(`${cleanArtist} - ${cleanTitle} (sans ID Discogs)`)
          continue
        }

        // Prendre le premier résultat et récupérer ses détails complets
        const foundDiscogsId = results[0].id
        
        console.log(`Using Discogs ID ${foundDiscogsId} for ${cleanArtist} - ${cleanTitle}`)
        
        // Créer ou récupérer l'album
        let album = await prisma.album.findUnique({
          where: { discogsId: foundDiscogsId }
        })

        if (album) {
          console.log(`Album already exists in DB: ${album.artist} - ${album.title}`)
        }

        if (!album) {
          try {
            // Récupérer les détails complets depuis Discogs (utiliser master endpoint)
            const discogsDetails = await getDiscogsMasterDetails(foundDiscogsId)
            
            album = await prisma.album.create({
              data: {
                discogsId: foundDiscogsId,
                discogsArtistId: discogsDetails.discogsArtistId,
                title: discogsDetails.title || cleanTitle,
                artist: discogsDetails.artist || cleanArtist,
                year: discogsDetails.year || (year ? parseInt(year) : null),
                coverImage: discogsDetails.coverImage || results[0].coverImage
              }
            })
          } catch (detailsError) {
            // Si l'appel aux détails échoue, utiliser les infos de recherche
            console.error(`Erreur détails Discogs pour ID ${foundDiscogsId}:`, detailsError)
            albumData = results[0]
            album = await prisma.album.create({
              data: {
                discogsId: foundDiscogsId,
                discogsArtistId: null,
                title: albumData.title || cleanTitle,
                artist: albumData.artist || cleanArtist,
                year: albumData.year || (year ? parseInt(year) : null),
                coverImage: albumData.coverImage
              }
            })
          }
        }

        // Vérifier si l'album n'est pas déjà dans la liste
        const existingListAlbum = await prisma.listAlbum.findFirst({
          where: {
            listId: id,
            albumId: album.id
          }
        })

        if (!existingListAlbum) {
          await prisma.listAlbum.create({
            data: {
              listId: id,
              albumId: album.id,
              position: parseInt(rank)
            }
          })
          imported.push(`${cleanArtist} - ${cleanTitle}`)
        }
      } catch (error) {
        console.error(`Erreur pour ${cleanArtist} - ${cleanTitle}:`, error)
        errors.push(`Erreur: ${cleanArtist} - ${cleanTitle}`)
      }
    }

    return NextResponse.json({
      success: true,
      imported: imported.length,
      errors,
      message: `${imported.length} albums importés${errors.length > 0 ? `, ${errors.length} erreurs` : ''}`
    })
  } catch (error) {
    console.error('Erreur lors de l\'import CSV:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'import' },
      { status: 500 }
    )
  }
}
