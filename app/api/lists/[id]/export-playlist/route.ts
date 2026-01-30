import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getDiscogsAlbumWithTracks } from '@/lib/discogs'

// Nombre d'albums à traiter en parallèle
const PARALLEL_BATCH_SIZE = 5

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'm3u8' // m3u8 ou csv
    const session = await getServerSession(authOptions)

    // Récupérer la liste avec ses albums
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
      return NextResponse.json(
        { error: 'Liste non trouvée' },
        { status: 404 }
      )
    }

    // Vérifier les permissions
    if (!list.isPublic && (!session || list.userId !== session.user.id)) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    // Filtrer les albums valides
    const validAlbums = list.listAlbums.filter(listAlbum => {
      const album = listAlbum.album
      return album.discogsId && !album.discogsId.startsWith('unknown-')
    })

    console.log(`Export playlist: ${validAlbums.length}/${list.listAlbums.length} albums valides`)

    if (validAlbums.length === 0) {
      return NextResponse.json(
        { error: 'Aucun album valide pour export playlist' },
        { status: 404 }
      )
    }

    // Traiter les albums par lots en parallèle
    const albumsWithTracks = []
    
    for (let i = 0; i < validAlbums.length; i += PARALLEL_BATCH_SIZE) {
      const batch = validAlbums.slice(i, i + PARALLEL_BATCH_SIZE)
      
      console.log(`Traitement batch ${Math.floor(i / PARALLEL_BATCH_SIZE) + 1}/${Math.ceil(validAlbums.length / PARALLEL_BATCH_SIZE)} (${batch.length} albums)`)
      
      // Traiter le lot en parallèle
      const batchResults = await Promise.allSettled(
        batch.map(async (listAlbum) => {
          const album = listAlbum.album
          const type = ((album as any).discogsType as 'master' | 'release') || 'master'
          
          try {
            const albumDetails = await getDiscogsAlbumWithTracks(album.discogsId, type)
            
            return {
              position: listAlbum.position,
              album: albumDetails
            }
          } catch (error) {
            console.error(`Erreur album ${album.title}:`, error)
            throw error
          }
        })
      )
      
      // Collecter les résultats réussis
      for (const result of batchResults) {
        if (result.status === 'fulfilled') {
          albumsWithTracks.push(result.value)
        }
      }
    }
    
    console.log(`Total albums avec tracklist: ${albumsWithTracks.length}/${validAlbums.length}`)

    if (albumsWithTracks.length === 0) {
      return NextResponse.json(
        { error: 'Aucun album avec tracklist disponible' },
        { status: 404 }
      )
    }

    // Générer le fichier selon le format demandé
    if (format === 'csv') {
      // Format CSV: Position,Artist,Album,Year,Track Position,Track Title,Duration
      let csv = 'Position,Artist,Album,Year,Track Position,Track Title,Duration\n'
      
      for (const item of albumsWithTracks) {
        for (const track of item.album.tracklist) {
          const escapeCsv = (str: string) => `"${str.replace(/"/g, '""')}"`
          csv += `${item.position},${escapeCsv(item.album.artist)},${escapeCsv(item.album.title)},${item.album.year || ''},${escapeCsv(track.position)},${escapeCsv(track.title)},${escapeCsv(track.duration)}\n`
        }
      }
      
      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${list.title.replace(/[^a-z0-9]/gi, '_')}_playlist.csv"`
        }
      })
    } else {
      // Format M3U8
      let m3u8 = '#EXTM3U\n'
      m3u8 += `#PLAYLIST:${list.title}\n`
      
      if (list.description) {
        m3u8 += `#DESCRIPTION:${list.description}\n`
      }
      
      m3u8 += '\n'
      
      for (const item of albumsWithTracks) {
        m3u8 += `# Album ${item.position}: ${item.album.artist} - ${item.album.title} (${item.album.year || 'N/A'})\n`
        
        for (const track of item.album.tracklist) {
          // Calculer la durée en secondes si disponible (format MM:SS)
          let duration = -1
          if (track.duration) {
            const parts = track.duration.split(':')
            if (parts.length === 2) {
              duration = parseInt(parts[0]) * 60 + parseInt(parts[1])
            }
          }
          
          m3u8 += `#EXTINF:${duration},${item.album.artist} - ${track.title}\n`
          m3u8 += `# ${track.position} - ${track.title}\n`
        }
        
        m3u8 += '\n'
      }
      
      return new Response(m3u8, {
        headers: {
          'Content-Type': 'audio/x-mpegurl; charset=utf-8',
          'Content-Disposition': `attachment; filename="${list.title.replace(/[^a-z0-9]/gi, '_')}_playlist.m3u8"`
        }
      })
    }
  } catch (error) {
    console.error('Erreur lors de l\'export de la playlist:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'export de la playlist' },
      { status: 500 }
    )
  }
}
