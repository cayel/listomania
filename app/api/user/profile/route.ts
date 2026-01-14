import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateProfileSchema = z.object({
  name: z.string().min(3, 'Le nom d\'utilisateur doit contenir au moins 3 caractères'),
  image: z.string().optional()
    .refine((val) => {
      if (!val || val === '') return true
      // Accepter les URLs complètes OU les chemins relatifs commençant par /avatars/
      return val.startsWith('http://') || val.startsWith('https://') || val.startsWith('/avatars/')
    }, 'L\'image doit être une URL valide ou un chemin d\'avatar')
})

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, image } = updateProfileSchema.parse(body)

    // Vérifier si le nom d'utilisateur est déjà utilisé par un autre utilisateur
    const existingUser = await prisma.user.findFirst({
      where: { 
        name: name.trim(),
        NOT: {
          id: session.user.id
        }
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Ce nom d\'utilisateur est déjà utilisé' },
        { status: 400 }
      )
    }

    // Mettre à jour le profil
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: { 
        name: name.trim(),
        image: image && image.trim() !== '' ? image.trim() : null
      }
    })

    return NextResponse.json({
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erreur lors de la mise à jour du profil:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}
