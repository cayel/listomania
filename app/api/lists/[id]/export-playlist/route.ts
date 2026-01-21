import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getDiscogsAlbumWithTracks } from '@/lib/discogs'

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

    // Récupérer les tracklists de tous les albums
    const albumsWithTracks = []
    
    console.log(`Export playlist: ${list.listAlbums.length} albums dans la liste`)
    
    for (const listAlbum of list.listAlbums) {
      const album = listAlbum.album
      
      console.log(`Album: ${album.title} - discogsId: ${album.discogsId}, discogsType: ${(album as any).discogsType}`)
      
      // Ignorer les albums sans ID Discogs valide
      if (!album.discogsId || album.discogsId.startsWith('unknown-')) {
        console.log(`  -> Ignoré (discogsId invalide ou unknown)`)
        continue
      }
      
      try {
        const type = ((album as any).discogsType as 'master' | 'release') || 'master'
        console.log(`  -> Récupération tracklist type: ${type}`)
        const albumDetails = await getDiscogsAlbumWithTracks(album.discogsId, type)
        
        console.log(`  -> Tracklist récupérée: ${albumDetails.tracklist.length} pistes`)
        
        albumsWithTracks.push({
          position: listAlbum.position,
          album: albumDetails
        })
      } catch (error) {
        console.error(`  -> Erreur lors de la récupération de l'album ${album.title}:`, error)
        // Continuer avec les autres albums même en cas d'erreur
      }
    }
    
    console.log(`Total albums avec tracklist: ${albumsWithTracks.length}`)

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
