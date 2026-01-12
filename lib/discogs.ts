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

export async function searchDiscogsAlbums(query: string): Promise<DiscogsAlbum[]> {
  const DISCOGS_TOKEN = process.env.DISCOGS_TOKEN
  
  if (!DISCOGS_TOKEN) {
    throw new Error('DISCOGS_TOKEN n\'est pas défini dans les variables d\'environnement')
  }

  try {
    const response = await fetch(
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

  try {
    // Recherche avec artiste et titre séparés pour plus de précision
    const response = await fetch(
      `https://api.discogs.com/database/search?artist=${encodeURIComponent(artist)}&release_title=${encodeURIComponent(title)}&type=master&per_page=20`,
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
    
    console.log(`Discogs search for artist="${artist}" title="${title}":`, data.results.slice(0, 3).map((r: any) => ({ id: r.id, title: r.title })))
    
    const results = data.results.map((result: DiscogsSearchResult) => ({
      id: result.id.toString(),
      title: extractAlbumTitle(result.title),
      artist: extractArtistFromTitle(result.title),
      year: result.year ? parseInt(result.year) : undefined,
      coverImage: result.cover_image || result.thumb,
      thumb: result.thumb
    }))

    // Filtrer et scorer les résultats par pertinence
    const scoredResults = results.map((result: DiscogsAlbum) => {
      let score = 0
      const resultArtist = result.artist.toLowerCase()
      const resultTitle = result.title.toLowerCase()
      const searchArtist = artist.toLowerCase()
      const searchTitle = title.toLowerCase()
      
      // Extraire le titre de l'album du format "Artiste - Album"
      const albumTitle = resultTitle.includes(' - ') 
        ? resultTitle.split(' - ').slice(1).join(' - ').trim()
        : resultTitle
      
      // Score basé sur la correspondance exacte de l'artiste
      if (resultArtist === searchArtist) {
        score += 100
      } else if (resultArtist.includes(searchArtist) || searchArtist.includes(resultArtist)) {
        score += 50
      }
      
      // Score basé sur la correspondance du titre
      if (albumTitle === searchTitle) {
        score += 100
      } else if (albumTitle.includes(searchTitle) || searchTitle.includes(albumTitle)) {
        score += 50
      }
      
      return { ...result, score }
    })

    console.log(`Scored results:`, scoredResults.slice(0, 3).map((r: any) => ({ artist: r.artist, title: r.title, score: r.score })))

    // Trier par score décroissant et ne garder que ceux avec un score > 0
    const filteredResults = scoredResults
      .filter((r: any) => r.score > 0)
      .sort((a: any, b: any) => b.score - a.score)
      .map(({ score, ...result }: any) => result)

    // Si aucun résultat pertinent avec la recherche précise, faire une recherche générale
    if (filteredResults.length === 0) {
      return searchDiscogsAlbums(`${artist} ${title}`)
    }

    return filteredResults
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
    const response = await fetch(
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
    const response = await fetch(
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

// Fonction utilitaire pour extraire l'artiste du titre formaté "Artiste - Album"
function extractArtistFromTitle(title: string): string {
  const parts = title.split(' - ')
  return parts.length > 1 ? parts[0] : 'Unknown Artist'
}

// Fonction utilitaire pour extraire le titre de l'album du format "Artiste - Album"
function extractAlbumTitle(title: string): string {
  const parts = title.split(' - ')
  return parts.length > 1 ? parts.slice(1).join(' - ') : title
}

// Fonction utilitaire pour nettoyer le nom d'artiste (retirer le numéro entre parenthèses)
function cleanArtistName(artist: string): string {
  // Retire le numéro entre parenthèses à la fin (ex: "Mike Davis (2)" -> "Mike Davis")
  return artist.replace(/\s*\(\d+\)\s*$/, '').trim()
}

export { cleanArtistName }
