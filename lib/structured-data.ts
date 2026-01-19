interface List {
  id: string
  title: string
  description?: string
  period?: string
  isPublic: boolean
  listAlbums: Array<{
    album: {
      title: string
      artist: string
      year?: number
      coverImage?: string
    }
  }>
  user?: {
    name?: string
  }
  createdAt?: string
  updatedAt?: string
}

export function generateListStructuredData(list: List, baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: list.title,
    description: list.description || `Liste d'albums musicaux créée sur ListOmania`,
    numberOfItems: list.listAlbums.length,
    itemListOrder: list.isPublic ? 'Ranked' : 'Unordered',
    url: `${baseUrl}/lists/${list.id}`,
    dateCreated: list.createdAt,
    dateModified: list.updatedAt,
    ...(list.user?.name && {
      creator: {
        '@type': 'Person',
        name: list.user.name
      }
    }),
    itemListElement: list.listAlbums.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'MusicAlbum',
        name: item.album.title,
        byArtist: {
          '@type': 'MusicGroup',
          name: item.album.artist
        },
        ...(item.album.coverImage && {
          image: item.album.coverImage
        }),
        ...(item.album.year && {
          datePublished: item.album.year.toString()
        })
      }
    }))
  }
}

export function generateWebsiteStructuredData(baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'ListOmania',
    url: baseUrl,
    description: 'Créez, organisez et partagez vos listes d\'albums musicaux préférés',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/explore?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  }
}

export function generateBreadcrumbStructuredData(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  }
}
