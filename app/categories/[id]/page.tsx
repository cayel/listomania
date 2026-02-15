'use client'

import { useEffect, useState, use } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { ArrowLeft, Music, BarChart3, LayoutGrid, Image as ImageIcon } from 'lucide-react'

interface Album {
  id: string
  title: string
  artist: string
  year?: number
  coverImage?: string
  appearances: number
  lists: string[]
}

interface Category {
  id: string
  name: string
  color?: string
}

interface CategoryData {
  category: Category
  albums: Album[]
  totalAlbums: number
  totalLists: number
}

export default function CategoryAlbumsPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { id } = use(params)
  const [data, setData] = useState<CategoryData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'detailed' | 'compact'>('detailed')
  const [columnsPerRow, setColumnsPerRow] = useState(5)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchCategoryAlbums()
    }
  }, [status, id])

  const fetchCategoryAlbums = async () => {
    try {
      const response = await fetch(`/api/categories/${id}/albums`)
      if (response.ok) {
        const categoryData = await response.json()
        setData(categoryData)
      } else if (response.status === 404) {
        router.push('/lists')
      }
    } catch (error) {
      console.error('Erreur lors du chargement des albums:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* En-tête */}
        <div className="mb-8">
          <Link
            href="/lists"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux listes
          </Link>

          <div className="glass rounded-3xl p-8">
            <div className="flex items-center gap-4 mb-4">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg"
                style={{ backgroundColor: data.category.color || '#6B7280' }}
              >
                {data.category.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {data.category.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Tous les albums de cette catégorie
                </p>
              </div>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Music className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {data.totalAlbums}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Albums uniques
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {data.totalLists}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Listes
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Music className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {data.albums.length > 0 ? Math.round(data.albums.reduce((acc, a) => acc + a.appearances, 0) / data.albums.length * 10) / 10 : 0}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Moy. apparitions
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contrôles d'affichage */}
        <div className="glass rounded-2xl p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Mode d'affichage */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Affichage :
              </span>
              <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
                <button
                  onClick={() => setViewMode('detailed')}
                  className={`px-3 py-2 flex items-center gap-2 text-sm transition-colors ${
                    viewMode === 'detailed'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <LayoutGrid className="h-4 w-4" />
                  Détaillé
                </button>
                <button
                  onClick={() => setViewMode('compact')}
                  className={`px-3 py-2 flex items-center gap-2 text-sm transition-colors border-l border-gray-300 dark:border-gray-600 ${
                    viewMode === 'compact'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <ImageIcon className="h-4 w-4" />
                  Pochettes
                </button>
              </div>
            </div>

            {/* Nombre de colonnes */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Colonnes :
              </span>
              <select
                value={columnsPerRow}
                onChange={(e) => setColumnsPerRow(Number(e.target.value))}
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={3}>3</option>
                <option value={4}>4</option>
                <option value={5}>5</option>
                <option value={6}>6</option>
                <option value={7}>7</option>
                <option value={8}>8</option>
                <option value={10}>10</option>
              </select>
            </div>
          </div>
        </div>

        {/* Grille des albums */}
        {data.albums.length === 0 ? (
          <div className="glass rounded-3xl p-12 text-center">
            <Music className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Aucun album dans cette catégorie pour le moment.
            </p>
          </div>
        ) : (
          <div 
            className="grid gap-4"
            style={{
              gridTemplateColumns: `repeat(${columnsPerRow}, minmax(0, 1fr))`
            }}
          >
            {data.albums.map((album) => (
              <div
                key={album.id}
                className={`glass overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group ${
                  viewMode === 'compact' ? 'rounded-lg' : 'rounded-2xl'
                }`}
              >
                {/* Cover */}
                <div className="relative aspect-square bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 group">
                  {album.coverImage ? (
                    <Image
                      src={album.coverImage}
                      alt={album.title}
                      fill
                      className="object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Music className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Badge apparitions */}
                  {album.appearances > 1 && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-blue-600 backdrop-blur-sm rounded-lg flex items-center gap-1 shadow-lg">
                      <BarChart3 className="h-3 w-3 text-white" />
                      <span className="text-xs text-white font-medium">
                        {album.appearances}x
                      </span>
                    </div>
                  )}

                  {/* Info au survol en mode compact */}
                  {viewMode === 'compact' && (
                    <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                      <h3 className="font-semibold text-white text-sm line-clamp-2 mb-1">
                        {album.title}
                      </h3>
                      <p className="text-xs text-gray-300 line-clamp-1">
                        {album.artist}
                      </p>
                      {album.year && (
                        <p className="text-xs text-gray-400 mt-1">
                          {album.year}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Info en mode détaillé */}
                {viewMode === 'detailed' && (
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1 mb-1">
                      {album.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1 mb-2">
                      {album.artist}
                    </p>
                    {album.year && (
                      <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">
                        {album.year}
                      </p>
                    )}
                    
                    {/* Listes */}
                    {album.lists.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">
                          Dans les listes :
                        </p>
                        <div className="space-y-1">
                          {album.lists.slice(0, 2).map((listName, idx) => (
                            <p key={idx} className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
                              • {listName}
                            </p>
                          ))}
                          {album.lists.length > 2 && (
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                              +{album.lists.length - 2} autre{album.lists.length - 2 > 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
