import { NextResponse } from 'next/server'
import { searchDiscogsAlbums } from '@/lib/discogs'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query) {
      return NextResponse.json(
        { error: 'Paramètre de recherche manquant' },
        { status: 400 }
      )
    }

    const albums = await searchDiscogsAlbums(query)
    return NextResponse.json(albums)
  } catch (error) {
    console.error('Erreur lors de la recherche:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la recherche' },
      { status: 500 }
    )
  }
}
