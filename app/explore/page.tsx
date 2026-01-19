'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Navbar } from '@/components/navbar'
import { Calendar, Globe, User as UserIcon } from 'lucide-react'

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 gradient-bg">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
            Explorer les listes publiques
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Découvrez les listes d'albums créées par la communauté
          </p>
        </div>

        {lists.length === 0 ? (
          <div className="text-center py-16 glass rounded-3xl">
            <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">
              Aucune liste publique pour le moment.
            </p>
            <Link
              href="/auth/signup"
              className="bg-blue-600 text-white hover:bg-blue-700 px-8 py-3 rounded-xl font-medium inline-block transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              Créer la première liste publique
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {lists.map((list) => (
              <Link
                key={list.id}
                href={`/lists/${list.id}`}
                className="group glass rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
              >
                {/* Preview des pochettes - Hero section */}
                <div className="relative h-36 bg-gradient-to-br from-blue-500/20 to-purple-500/20 dark:from-blue-600/30 dark:to-purple-600/30 overflow-hidden">
                  {list.listAlbums.length > 0 ? (
                    <>
                      {list.listAlbums.length === 1 ? (
                        /* 1 seul album - centré */
                        <div className="absolute inset-0 p-2 flex items-center justify-center">
                          <div className="h-full aspect-square rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 shadow-lg transform transition-all group-hover:scale-105">
                            {list.listAlbums[0].album.coverImage ? (
                              <Image
                                src={list.listAlbums[0].album.coverImage}
                                alt={list.listAlbums[0].album.title}
                                width={130}
                                height={130}
                                className="h-full w-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-4xl text-gray-400">
                                🎵
                              </div>
                            )}
                          </div>
                        </div>
                      ) : list.listAlbums.length === 2 ? (
                        /* 2 albums - côte à côte */
                        <div className="absolute inset-0 p-2 flex gap-1.5">
                          {list.listAlbums.slice(0, 2).map((listAlbum, idx) => (
                            <div
                              key={idx}
                              className="flex-1 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 shadow-lg transform transition-all group-hover:scale-105"
                            >
                              {listAlbum.album.coverImage ? (
                                <Image
                                  src={listAlbum.album.coverImage}
                                  alt={listAlbum.album.title}
                                  width={130}
                                  height={130}
                                  className="h-full w-full object-cover"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-3xl text-gray-400">
                                  🎵
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        /* 3+ albums - mosaïque */
                        <div className="absolute inset-0 p-2 flex gap-1.5">
                          {/* Premier album - grand format à gauche */}
                          <div className="w-2/5 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 shadow-lg transform transition-all group-hover:scale-105">
                            {list.listAlbums[0].album.coverImage ? (
                              <Image
                                src={list.listAlbums[0].album.coverImage}
                                alt={list.listAlbums[0].album.title}
                                width={130}
                                height={130}
                                className="h-full w-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-3xl text-gray-400">
                                🎵
                              </div>
                            )}
                          </div>
                          
                          {/* Albums 2 et 3 - format moyen empilés à droite */}
                          <div className="flex-1 flex flex-col gap-1.5">
                            {[1, 2].map((idx) => (
                              <div
                                key={idx}
                                className="flex-1 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 shadow-lg transform transition-all group-hover:scale-105"
                              >
                                {list.listAlbums[idx]?.album.coverImage ? (
                                  <Image
                                    src={list.listAlbums[idx].album.coverImage}
                                    alt={list.listAlbums[idx]?.album.title}
                                    width={80}
                                    height={60}
                                    className="h-full w-full object-cover"
                                    loading="lazy"
                                  />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center text-xl text-gray-400">
                                    🎵
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-4xl mb-1 opacity-30">🎵</div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Liste vide</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Badge Public */}
                  <div className="absolute top-2 right-2 flex gap-1.5">
                    <div className="px-1.5 py-0.5 bg-green-600 backdrop-blur-sm rounded flex items-center gap-1 shadow-lg">
                      <Globe className="h-2.5 w-2.5 text-white" />
                      <span className="text-[10px] text-white font-medium">Public</span>
                    </div>
                  </div>
                  
                  {/* Compteur d'albums */}
                  <div className="absolute bottom-2 left-2">
                    <div className="px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded">
                      <span className="text-white text-xs font-bold">
                        {list._count.listAlbums} album{list._count.listAlbums > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contenu */}
                <div className="p-3 flex-1 flex flex-col">
                  <h2 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1 line-clamp-1">
                    {list.title}
                  </h2>

                  {list.description && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-1 flex-1">
                      {list.description}
                    </p>
                  )}

                  <div className="space-y-1 mt-auto">
                    {list.period && (
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <Calendar className="h-3 w-3 mr-1" />
                        {list.period}
                      </div>
                    )}
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <UserIcon className="h-3 w-3 mr-1" />
                      {list.user.name || 'Utilisateur'}
                    </div>
                  </div>
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
