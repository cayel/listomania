import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const listSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  period: z.string().optional(),
  sourceUrl: z.string().url().optional().or(z.literal('')),
  isPublic: z.boolean().default(false),
  isRanked: z.boolean().default(true)
})

// GET - Récupérer une liste spécifique
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id: listId } = await params
    
    // Récupérer le token de partage depuis l'URL
    const { searchParams } = new URL(request.url)
    const shareToken = searchParams.get('token')

    const list = await prisma.list.findUnique({
      where: { id: listId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
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
    // 1. Si la liste est publique, tout le monde peut y accéder
    // 2. Si l'utilisateur est propriétaire, il peut y accéder
    // 3. Si un token valide est fourni, l'accès est autorisé
    const isOwner = list.userId === session?.user?.id
    const hasValidToken = shareToken && list.shareToken === shareToken
    
    if (!list.isPublic && !isOwner && !hasValidToken) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    return NextResponse.json(list)
  } catch (error) {
    console.error('Erreur lors de la récupération de la liste:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}

// PATCH - Mettre à jour une liste
export async function PATCH(
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
    const data = listSchema.partial().parse(body)

    // Vérifier que l'utilisateur est propriétaire
    const existingList = await prisma.list.findUnique({
      where: { id: listId }
    })

    if (!existingList) {
      return NextResponse.json(
        { error: 'Liste non trouvée' },
        { status: 404 }
      )
    }

    if (existingList.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const list = await prisma.list.update({
      where: { id: listId },
      data,
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

    return NextResponse.json(list)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Erreur lors de la mise à jour de la liste:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer une liste
export async function DELETE(
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

    // Vérifier que l'utilisateur est propriétaire
    const existingList = await prisma.list.findUnique({
      where: { id: listId }
    })

    if (!existingList) {
      return NextResponse.json(
        { error: 'Liste non trouvée' },
        { status: 404 }
      )
    }

    if (existingList.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    await prisma.list.delete({
      where: { id: listId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur lors de la suppression de la liste:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}
