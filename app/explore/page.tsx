'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { Calendar, User as UserIcon } from 'lucide-react'

interface List {
  id: string
  title: string
  description?: string
  period?: string
  user: {
    id: string
    name?: string
  }
  listAlbums: Array<{
    album: {
      id: string
      coverImage?: string
      title: string
      artist: string
    }
  }>
  _count: {
    listAlbums: number
  }
}

export default function Explore() {
  const [lists, setLists] = useState<List[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasMore, setHasMore] = useState(false)

  useEffect(() => {
    fetchLists()
  }, [])

  const fetchLists = async () => {
    try {
      const response = await fetch('/api/public/lists?limit=12')
      if (response.ok) {
        const data = await response.json()
        setLists(data.lists)
        setHasMore(data.hasMore)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des listes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-gray-600 dark:text-gray-400">Chargement...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Explorer les listes publiques
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Découvrez les listes d'albums créées par la communauté
          </p>
        </div>

        {lists.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Aucune liste publique pour le moment.
            </p>
            <Link
              href="/auth/signup"
              className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-2 rounded-md font-medium inline-block transition-colors"
            >
              Créer la première liste publique
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {lists.map((list) => (
              <Link
                key={list.id}
                href={`/lists/${list.id}`}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {list.title}
                  </h2>

                  {list.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                      {list.description}
                    </p>
                  )}

                  <div className="space-y-2 mb-4">
                    {list.period && (
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="h-4 w-4 mr-2" />
                        {list.period}
                      </div>
                    )}
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <UserIcon className="h-4 w-4 mr-2" />
                      {list.user.name || 'Utilisateur'}
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {list._count.listAlbums} album{list._count.listAlbums > 1 ? 's' : ''}
                  </div>

                  {list.listAlbums.length > 0 && (
                    <div className="flex -space-x-2">
                      {list.listAlbums.slice(0, 4).map((listAlbum, idx) => (
                        <div
                          key={idx}
                          className="h-12 w-12 rounded border-2 border-white dark:border-gray-800 overflow-hidden bg-gray-200 dark:bg-gray-700"
                        >
                          {listAlbum.album.coverImage ? (
                            <img
                              src={listAlbum.album.coverImage}
                              alt={listAlbum.album.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-xs text-gray-500">
                              ?
                            </div>
                          )}
                        </div>
                      ))}
                      {list._count.listAlbums > 4 && (
                        <div className="h-12 w-12 rounded border-2 border-white dark:border-gray-800 bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300">
                          +{list._count.listAlbums - 4}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {hasMore && (
          <div className="text-center mt-8">
            <button
              onClick={() => {
                // Implémentation du chargement de plus de listes
              }}
              className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-2 rounded-md font-medium transition-colors"
            >
              Charger plus
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
