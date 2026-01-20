import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const imageUrl = request.nextUrl.searchParams.get('url')

  if (!imageUrl) {
    return NextResponse.json({ error: 'URL manquante' }, { status: 400 })
  }

  try {
    // Télécharger l'image depuis le serveur (pas de CORS)
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Ranklist/1.0)',
      },
    })

    if (!response.ok) {
      throw new Error(`Échec du téléchargement: ${response.status}`)
    }

    // Récupérer le blob
    const blob = await response.blob()
    const arrayBuffer = await blob.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Convertir en base64
    const base64 = buffer.toString('base64')
    const mimeType = response.headers.get('content-type') || 'image/jpeg'
    const dataUrl = `data:${mimeType};base64,${base64}`

    return NextResponse.json({ dataUrl })
  } catch (error) {
    console.error('Erreur proxy image:', error)
    return NextResponse.json(
      { error: 'Erreur lors du téléchargement de l\'image' },
      { status: 500 }
    )
  }
}
