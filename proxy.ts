import { NextResponse, type NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function proxy(request: NextRequest) {
  const token = await getToken({ req: request as any })
  const isAuth = !!token
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth')
  
  // Routes qui nécessitent absolument une authentification
  const isProtectedRoute = 
    request.nextUrl.pathname === '/lists' ||  // Liste de MES listes
    request.nextUrl.pathname.startsWith('/lists/new') ||  // Créer une nouvelle liste
    request.nextUrl.pathname.includes('/edit') ||  // Éditer une liste
    request.nextUrl.pathname.startsWith('/profile')  // Profil utilisateur

  // Les routes API qui nécessitent une authentification
  const isProtectedApiRoute = 
    request.nextUrl.pathname === '/api/lists' && request.method === 'POST' ||  // Créer une liste
    request.nextUrl.pathname.includes('/edit') ||
    request.nextUrl.pathname.includes('/albums') && request.method !== 'GET' ||  // Modifier des albums
    request.nextUrl.pathname.includes('/import') ||
    request.nextUrl.pathname.includes('/export') ||
    request.nextUrl.pathname.includes('/reorder')

  if ((isProtectedRoute || isProtectedApiRoute) && !isAuth) {
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  if (isAuthPage && isAuth) {
    return NextResponse.redirect(new URL('/lists', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/lists/:path*',
    '/api/lists/:path*',
    '/auth/:path*'
  ]
}
