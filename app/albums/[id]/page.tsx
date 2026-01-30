'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Music, List as ListIcon, Calendar, Users, Lock, Globe, ArrowLeft } from 'lucide-react'

interface AlbumList {
  listId: string
  listTitle: string
  listDescription: string | null
  listPeriod: string | null
  isPublic: boolean
  position: number
  totalAlbums: number
  owner: {
    id: string
    name: string
    image: string | null
  }
  isOwner: boolean
  updatedAt: string
  createdAt: string
}

interface AlbumData {
  album: {
    id: string
    artist: string
    title: string
    year: number | null
    coverImage: string | null
    discogsId: string
  }
  lists: AlbumList[]
  totalLists: number
}

export default function AlbumListsPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [data, setData] = useState<AlbumData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      fetchAlbumLists()
    }
  }, [params.id])

  const fetchAlbumLists = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch(`/api/albums/${params.id}/lists`)
      
      if (!response.ok) {
        throw new Error('Impossible de charger les données')
      }

      const result = await response.json()
      setData(result)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">
              {error || 'Album non trouvé'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  const { album, lists, totalLists } = data

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Bouton retour */}
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>

        {/* En-tête avec informations album */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <div className="flex gap-6">
            {album.coverImage && (
              <img
                src={album.coverImage}
                alt={`${album.artist} - ${album.title}`}
                className="w-32 h-32 object-cover rounded-lg shadow-md"
              />
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {album.title}
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">
                {album.artist}
              </p>
              {album.year && (
                <p className="text-gray-500 dark:text-gray-500 mb-4">
                  {album.year}
                </p>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <ListIcon className="w-4 h-4" />
                <span>
                  {totalLists === 0 && 'Aucune liste'}
                  {totalLists === 1 && '1 liste'}
                  {totalLists > 1 && `${totalLists} listes`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des listes contenant cet album */}
        {lists.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
            <Music className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Cet album n'est dans aucune liste accessible
            </p>
            {!session && (
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Connectez-vous pour voir vos listes privées
              </p>
            )}
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Listes contenant cet album
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lists.map((list) => (
                <div
                  key={list.listId}
                  onClick={() => router.push(`/lists/${list.listId}`)}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer p-6"
                >
                  {/* En-tête avec titre et visibilité */}
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex-1 line-clamp-2">
                      {list.listTitle}
                    </h3>
                    {list.isPublic ? (
                      <span title="Liste publique">
                        <Globe className="w-5 h-5 text-green-500 flex-shrink-0 ml-2" aria-label="Liste publique" />
                      </span>
                    ) : (
                      <span title="Liste privée">
                        <Lock className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" aria-label="Liste privée" />
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  {list.listDescription && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {list.listDescription}
                    </p>
                  )}

                  {/* Métadonnées */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <ListIcon className="w-4 h-4" />
                      <span>Position #{list.position} sur {list.totalAlbums}</span>
                    </div>

                    {list.listPeriod && (
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>{list.listPeriod}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Users className="w-4 h-4" />
                      <span>
                        {list.isOwner ? 'Votre liste' : `Par ${list.owner.name}`}
                      </span>
                    </div>
                  </div>

                  {/* Badge propriétaire */}
                  {list.isOwner && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        Ma liste
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
