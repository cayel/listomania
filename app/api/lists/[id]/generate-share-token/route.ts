import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'

// POST - Générer un token de partage pour une liste
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

    // Vérifier que l'utilisateur est propriétaire de la liste
    const list = await prisma.list.findUnique({
      where: { id: listId },
      select: { userId: true, shareToken: true }
    })

    if (!list) {
      return NextResponse.json(
        { error: 'Liste non trouvée' },
        { status: 404 }
      )
    }

    if (list.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      )
    }

    // Si un token existe déjà, le retourner
    if (list.shareToken) {
      return NextResponse.json({ shareToken: list.shareToken })
    }

    // Générer un nouveau token unique
    const shareToken = randomBytes(16).toString('hex')

    // Mettre à jour la liste avec le token
    await prisma.list.update({
      where: { id: listId },
      data: { shareToken }
    })

    return NextResponse.json({ shareToken })
  } catch (error) {
    console.error('Erreur lors de la génération du token:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}
