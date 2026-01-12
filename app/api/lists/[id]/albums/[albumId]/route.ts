import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// DELETE - Retirer un album d'une liste
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; albumId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const { id: listId, albumId } = await params

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

    // Supprimer l'album de la liste
    await prisma.listAlbum.delete({
      where: {
        id: albumId
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'album:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}
