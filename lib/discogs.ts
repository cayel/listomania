export interface DiscogsAlbum {
  id: string
  title: string
  artist: string
  discogsArtistId?: string
  year?: number
  coverImage?: string
  thumb?: string
}

export interface DiscogsSearchResult {
  id: number
  title: string
  year?: string
  thumb?: string
  cover_image?: string
  resource_url: string
  type: string
}

// Rate limiting: délai entre les requêtes (en millisecondes)
const RATE_LIMIT_DELAY = 1100 // 1.1 seconde entre chaque requête (pour rester sous 60/minute)
let lastRequestTime = 0

// Fonction pour respecter le rate limit
async function waitForRateLimit() {
  const now = Date.now()
  const timeSinceLastRequest = now - lastRequestTime
  
  if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
    const delay = RATE_LIMIT_DELAY - timeSinceLastRequest
    await new Promise(resolve => setTimeout(resolve, delay))
  }
  
  lastRequestTime = Date.now()
}

// Fonction pour faire une requête avec retry en cas de 429
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3): Promise<Response> {
  let retries = 0
  
  while (retries <= maxRetries) {
    await waitForRateLimit()
    
    const response = await fetch(url, options)
    
    if (response.status === 429) {
      retries++
      if (retries > maxRetries) {
        throw new Error(`Rate limit dépassé après ${maxRetries} tentatives`)
      }
      
      // Attendre de plus en plus longtemps (exponential backoff)
      const waitTime = Math.min(5000 * Math.pow(2, retries - 1), 30000)
      console.log(`Rate limit atteint, attente de ${waitTime}ms avant retry ${retries}/${maxRetries}...`)
      await new Promise(resolve => setTimeout(resolve, waitTime))
      continue
    }
    
    return response
  }
  
  throw new Error('Échec de la requête après plusieurs tentatives')
}

export async function searchDiscogsAlbums(query: string): Promise<DiscogsAlbum[]> {
  const DISCOGS_TOKEN = process.env.DISCOGS_TOKEN
  
  if (!DISCOGS_TOKEN) {
    throw new Error('DISCOGS_TOKEN n\'est pas défini dans les variables d\'environnement')
  }

  try {
    const response = await fetchWithRetry(
      `https://api.discogs.com/database/search?q=${encodeURIComponent(query)}&type=master&per_page=20`,
      {
        headers: {
          'Authorization': `Discogs token=${DISCOGS_TOKEN}`,
          'User-Agent': 'ListOmania/1.0'
        },
        next: { revalidate: 3600 } // Cache pour 1 heure
      }
    )

    if (!response.ok) {
      throw new Error(`Erreur Discogs API: ${response.status}`)
    }

    const data = await response.json()
    
    return data.results.map((result: DiscogsSearchResult) => ({
      id: result.id.toString(),
      title: extractAlbumTitle(result.title),
      artist: extractArtistFromTitle(result.title),
      year: result.year ? parseInt(result.year) : undefined,
      coverImage: result.cover_image || result.thumb,
      thumb: result.thumb
    }))
  } catch (error) {
    console.error('Erreur lors de la recherche Discogs:', error)
    throw error
  }
}

export async function searchDiscogsAlbumsByArtistAndTitle(artist: string, title: string): Promise<DiscogsAlbum[]> {
  const DISCOGS_TOKEN = process.env.DISCOGS_TOKEN
  
  if (!DISCOGS_TOKEN) {
    throw new Error('DISCOGS_TOKEN n\'est pas défini dans les variables d\'environnement')
  }

  console.log(`\n=== Searching Discogs for: "${artist}" - "${title}" ===`)

  try {
    // 1. D'abord chercher dans les masters
    console.log(`Step 1: Searching masters...`)
    const masterResponse = await fetchWithRetry(
      `https://api.discogs.com/database/search?artist=${encodeURIComponent(artist)}&release_title=${encodeURIComponent(title)}&type=master&per_page=20`,
      {
        headers: {
          'Authorization': `Discogs token=${DISCOGS_TOKEN}`,
          'User-Agent': 'ListOmania/1.0'
        },
        next: { revalidate: 3600 }
      }
    )

    if (!masterResponse.ok) {
      throw new Error(`Erreur Discogs API: ${masterResponse.status}`)
    }

    const masterData = await masterResponse.json()
    console.log(`Found ${masterData.results?.length || 0} masters`)
    
    if (masterData.results && masterData.results.length > 0) {
      console.log(`First 3 masters:`, masterData.results.slice(0, 3).map((r: any) => ({ 
        id: r.id, 
        title: r.title 
      })))
      
      const masters = masterData.results.map((result: DiscogsSearchResult) => ({
        id: result.id.toString(),
        title: extractAlbumTitle(result.title),
        artist: extractArtistFromTitle(result.title),
        year: result.year ? parseInt(result.year) : undefined,
        coverImage: result.cover_image || result.thumb,
        thumb: result.thumb,
        type: 'master'
      }))
      
      // Retourner TOUS les masters trouvés, le premier étant souvent le bon
      console.log(`✓ Returning ${masters.length} masters (best match first)`)
      return masters
    }
    
    // 2. Si aucun master, chercher dans les releases
    console.log(`Step 2: No masters found, searching releases...`)
    const releaseResponse = await fetchWithRetry(
      `https://api.discogs.com/database/search?artist=${encodeURIComponent(artist)}&release_title=${encodeURIComponent(title)}&type=release&per_page=20`,
      {
        headers: {
          'Authorization': `Discogs token=${DISCOGS_TOKEN}`,
          'User-Agent': 'ListOmania/1.0'
        },
        next: { revalidate: 3600 }
      }
    )

    if (!releaseResponse.ok) {
      throw new Error(`Erreur Discogs API: ${releaseResponse.status}`)
    }

    const releaseData = await releaseResponse.json()
    console.log(`Found ${releaseData.results?.length || 0} releases`)
    
    if (releaseData.results && releaseData.results.length > 0) {
      console.log(`First 3 releases:`, releaseData.results.slice(0, 3).map((r: any) => ({ 
        id: r.id, 
        title: r.title 
      })))
      
      const releases = releaseData.results.map((result: DiscogsSearchResult) => ({
        id: result.id.toString(),
        title: extractAlbumTitle(result.title),
        artist: extractArtistFromTitle(result.title),
        year: result.year ? parseInt(result.year) : undefined,
        coverImage: result.cover_image || result.thumb,
        thumb: result.thumb,
        type: 'release'
      }))
      
      console.log(`✓ Returning ${releases.length} releases (best match first)`)
      return releases
    }

    // 3. Si toujours rien, essayer une recherche générale
    console.log(`Step 3: No results found, trying general search...`)
    return searchDiscogsAlbums(`${artist} ${title}`)
  } catch (error) {
    console.error('Erreur lors de la recherche Discogs:', error)
    throw error
  }
}

export async function getDiscogsAlbumDetails(discogsId: string): Promise<DiscogsAlbum> {
  const DISCOGS_TOKEN = process.env.DISCOGS_TOKEN
  
  if (!DISCOGS_TOKEN) {
    throw new Error('DISCOGS_TOKEN n\'est pas défini dans les variables d\'environnement')
  }

  try {
    const response = await fetchWithRetry(
      `https://api.discogs.com/releases/${discogsId}`,
      {
        headers: {
          'Authorization': `Discogs token=${DISCOGS_TOKEN}`,
          'User-Agent': 'ListOmania/1.0'
        },
        next: { revalidate: 86400 } // Cache pour 24 heures
      }
    )

    if (!response.ok) {
      throw new Error(`Erreur Discogs API: ${response.status}`)
    }

    const data = await response.json()
    
    const artistName = data.artists?.[0]?.name || extractArtistFromTitle(data.title)
    
    return {
      id: data.id.toString(),
      title: data.title,
      artist: cleanArtistName(artistName),
      discogsArtistId: data.artists?.[0]?.id?.toString(),
      year: data.year,
      coverImage: data.images?.[0]?.uri || data.thumb
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des détails Discogs:', error)
    throw error
  }
}

export async function getDiscogsMasterDetails(masterId: string): Promise<DiscogsAlbum> {
  const DISCOGS_TOKEN = process.env.DISCOGS_TOKEN
  
  if (!DISCOGS_TOKEN) {
    throw new Error('DISCOGS_TOKEN n\'est pas défini dans les variables d\'environnement')
  }

  try {
    const response = await fetchWithRetry(
      `https://api.discogs.com/masters/${masterId}`,
      {
        headers: {
          'Authorization': `Discogs token=${DISCOGS_TOKEN}`,
          'User-Agent': 'ListOmania/1.0'
        },
        next: { revalidate: 86400 } // Cache pour 24 heures
      }
    )

    if (!response.ok) {
      throw new Error(`Erreur Discogs API: ${response.status}`)
    }

    const data = await response.json()
    
    console.log(`Master ${masterId} details:`, { id: data.id, title: data.title, artist: data.artists?.[0]?.name, artistId: data.artists?.[0]?.id })
    
    const artistName = data.artists?.[0]?.name || extractArtistFromTitle(data.title)
    
    return {
      id: data.id.toString(),
      title: data.title,
      artist: cleanArtistName(artistName),
      discogsArtistId: data.artists?.[0]?.id?.toString(),
      year: data.year,
      coverImage: data.images?.[0]?.uri || data.images?.[0]?.resource_url
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des détails master Discogs:', error)
    throw error
  }
}

// Fonction universelle qui détecte automatiquement si c'est un master ou un release
export async function getDiscogsDetails(discogsId: string, type?: 'master' | 'release'): Promise<DiscogsAlbum> {
  const DISCOGS_TOKEN = process.env.DISCOGS_TOKEN
  
  if (!DISCOGS_TOKEN) {
    throw new Error('DISCOGS_TOKEN n\'est pas défini dans les variables d\'environnement')
  }

  // Si le type est fourni, utiliser directement le bon endpoint
  if (type === 'master') {
    return getDiscogsMasterDetails(discogsId)
  } else if (type === 'release') {
    return getDiscogsAlbumDetails(discogsId)
  }

  // Sinon, essayer d'abord master puis release
  try {
    return await getDiscogsMasterDetails(discogsId)
  } catch (error) {
    console.log(`Failed to get master ${discogsId}, trying as release...`)
    return await getDiscogsAlbumDetails(discogsId)
  }
}

// Fonction helper pour récupérer les détails depuis la base de données OU Discogs
export async function getAlbumDetails(albumId: string, prisma: any): Promise<DiscogsAlbum> {
  const album = await prisma.album.findUnique({
    where: { id: albumId }
  })

  if (!album) {
    throw new Error('Album non trouvé')
  }

  // Si on a déjà toutes les infos en base, les retourner
  if (album.coverImage && album.discogsArtistId) {
    return {
      id: album.discogsId,
      title: album.title,
      artist: album.artist,
      discogsArtistId: album.discogsArtistId,
      year: album.year,
      coverImage: album.coverImage
    }
  }

  // Sinon, récupérer depuis Discogs avec le bon type
  const type = album.discogsType as 'master' | 'release' | null
  return getDiscogsDetails(album.discogsId, type || undefined)
}

// Fonction utilitaire pour extraire l'artiste du titre formaté "Artiste - Album"
export function extractArtistFromTitle(title: string): string {
  const parts = title.split(' - ')
  return parts.length > 1 ? parts[0] : 'Unknown Artist'
}

// Fonction utilitaire pour extraire le titre de l'album du format "Artiste - Album"
export function extractAlbumTitle(title: string): string {
  const parts = title.split(' - ')
  return parts.length > 1 ? parts.slice(1).join(' - ') : title
}

// Fonction utilitaire pour nettoyer le nom d'artiste (retirer le numéro entre parenthèses)
export function cleanArtistName(artist: string): string {
  // Retire le numéro entre parenthèses à la fin (ex: "Mike Davis (2)" -> "Mike Davis")
  return artist.replace(/\s*\(\d+\)\s*$/, '').trim()
}
