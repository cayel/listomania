import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const reorderSchema = z.object({
  positions: z.array(z.object({
    listAlbumId: z.string(),
    position: z.number()
  }))
})

// PATCH - Réorganiser les albums dans une liste
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const { id: listId } = await params
    const body = await request.json()
    const { positions } = reorderSchema.parse(body)

    // Vérifier que l'utilisateur est propriétaire de la liste
    const list = await prisma.list.findUnique({
      where: { id: listId }
    })

    if (!list) {
      return NextResponse.json(
        { error: 'Liste non trouvée' },
        { status: 404 }
      )
    }

    if (list.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    // Mettre à jour toutes les positions en une transaction
    await prisma.$transaction(
      positions.map(({ listAlbumId, position }) =>
        prisma.listAlbum.update({
          where: { id: listAlbumId },
          data: { position }
        })
      )
    )

    // Récupérer la liste mise à jour
    const updatedList = await prisma.list.findUnique({
      where: { id: listId },
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

    return NextResponse.json(updatedList)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erreur lors de la réorganisation:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}
