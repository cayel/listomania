import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  // Pages statiques
  const routes = [
    '',
    '/explore',
    '/auth/signin',
    '/auth/signup',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  // Récupérer les listes publiques pour les inclure dans le sitemap
  try {
    const response = await fetch(`${baseUrl}/api/public/lists?limit=100`, {
      next: { revalidate: 3600 } // Cache 1h
    })
    
    if (response.ok) {
      const data = await response.json()
      const listRoutes = data.lists.map((list: any) => ({
        url: `${baseUrl}/lists/${list.id}`,
        lastModified: new Date(list.updatedAt || list.createdAt),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }))
      
      return [...routes, ...listRoutes]
    }
  } catch (error) {
    console.error('Erreur lors de la génération du sitemap:', error)
  }

  return routes
}
