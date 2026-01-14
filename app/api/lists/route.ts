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
  isPublic: z.boolean().default(false)
})

// GET - Récupérer toutes les listes de l'utilisateur
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const lists = await prisma.list.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        listAlbums: {
          include: {
            album: true
          },
          orderBy: {
            position: 'asc'
          }
        },
        _count: {
          select: {
            listAlbums: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return NextResponse.json(lists)
  } catch (error) {
    console.error('Erreur lors de la récupération des listes:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}

// POST - Créer une nouvelle liste
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const data = listSchema.parse(body)

    const list = await prisma.list.create({
      data: {
        ...data,
        userId: session.user.id
      },
      include: {
        listAlbums: {
          include: {
            album: true
          }
        }
      }
    })

    return NextResponse.json(list, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Erreur lors de la création de la liste:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}
