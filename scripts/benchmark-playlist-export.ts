/**
 * Script de benchmark pour tester les performances d'export de playlists
 * 
 * Usage: tsx scripts/benchmark-playlist-export.ts <listId>
 * 
 * Ce script mesure :
 * - Temps total d'export
 * - Temps par album
 * - Nombre d'appels cache hit/miss
 * - Performance avec et sans cache
 */

import { prisma } from '../lib/prisma'
import { getDiscogsAlbumWithTracks } from '../lib/discogs'

const PARALLEL_BATCH_SIZE = 5

interface BenchmarkResult {
  listId: string
  albumCount: number
  totalTime: number
  avgTimePerAlbum: number
  cacheHits: number
  cacheMisses: number
  failedAlbums: number
}

async function benchmarkPlaylistExport(listId: string): Promise<BenchmarkResult> {
  console.log(`\n🚀 Benchmark export playlist pour liste: ${listId}`)
  console.log('─'.repeat(60))

  const startTime = Date.now()

  // Récupérer la liste
  const list = await prisma.list.findUnique({
    where: { id: listId },
    include: {
      listAlbums: {
        include: { album: true },
        orderBy: { position: 'asc' }
      }
    }
  })

  if (!list) {
    throw new Error('Liste non trouvée')
  }

  // Filtrer albums valides
  const validAlbums = list.listAlbums.filter(la => 
    la.album.discogsId && !la.album.discogsId.startsWith('unknown-')
  )

  console.log(`📊 Albums valides: ${validAlbums.length}/${list.listAlbums.length}`)

  let cacheHits = 0
  let cacheMisses = 0
  let failedAlbums = 0

  // Traiter par batch
  for (let i = 0; i < validAlbums.length; i += PARALLEL_BATCH_SIZE) {
    const batch = validAlbums.slice(i, i + PARALLEL_BATCH_SIZE)
    const batchNum = Math.floor(i / PARALLEL_BATCH_SIZE) + 1
    const totalBatches = Math.ceil(validAlbums.length / PARALLEL_BATCH_SIZE)

    console.log(`\n⏱️  Batch ${batchNum}/${totalBatches} (${batch.length} albums)`)

    const batchStart = Date.now()

    const results = await Promise.allSettled(
      batch.map(async (listAlbum) => {
        const album = listAlbum.album
        const type = ((album as any).discogsType as 'master' | 'release') || 'master'

        const albumStart = Date.now()
        
        try {
          await getDiscogsAlbumWithTracks(album.discogsId, type)
          const albumTime = Date.now() - albumStart
          
          // Détecter cache hit (< 100ms = probablement du cache)
          if (albumTime < 100) {
            cacheHits++
            console.log(`   ✓ ${album.artist} - ${album.title} (${albumTime}ms) [CACHE]`)
          } else {
            cacheMisses++
            console.log(`   ✓ ${album.artist} - ${album.title} (${albumTime}ms) [API]`)
          }
          
        } catch (error) {
          failedAlbums++
          console.log(`   ✗ ${album.artist} - ${album.title} [ERREUR]`)
        }
      })
    )

    const batchTime = Date.now() - batchStart
    console.log(`   Batch temps: ${batchTime}ms (${Math.round(batchTime / batch.length)}ms/album)`)
  }

  const totalTime = Date.now() - startTime

  const result: BenchmarkResult = {
    listId,
    albumCount: validAlbums.length,
    totalTime,
    avgTimePerAlbum: Math.round(totalTime / validAlbums.length),
    cacheHits,
    cacheMisses,
    failedAlbums
  }

  console.log('\n')
  console.log('═'.repeat(60))
  console.log('📈 RÉSULTATS DU BENCHMARK')
  console.log('═'.repeat(60))
  console.log(`Liste ID:              ${result.listId}`)
  console.log(`Albums traités:        ${result.albumCount}`)
  console.log(`Temps total:           ${(result.totalTime / 1000).toFixed(2)}s`)
  console.log(`Temps moyen/album:     ${result.avgTimePerAlbum}ms`)
  console.log(`Cache hits:            ${result.cacheHits} (${Math.round(result.cacheHits / result.albumCount * 100)}%)`)
  console.log(`Cache misses:          ${result.cacheMisses} (${Math.round(result.cacheMisses / result.albumCount * 100)}%)`)
  console.log(`Échecs:                ${result.failedAlbums}`)
  console.log('═'.repeat(60))

  return result
}

// Exécution du script
const listId = process.argv[2]

if (!listId) {
  console.error('❌ Usage: tsx scripts/benchmark-playlist-export.ts <listId>')
  process.exit(1)
}

benchmarkPlaylistExport(listId)
  .then(() => {
    console.log('\n✅ Benchmark terminé\n')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Erreur:', error)
    process.exit(1)
  })
