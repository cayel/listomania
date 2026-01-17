'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Calendar, Globe, Music } from 'lucide-react'
import Link from 'next/link'

interface Album {
  id: string
  discogsId: string
  title: string
  artist: string
  year?: number
  coverImage?: string
}

interface ListAlbum {
  id: string
  position: number
  album: Album
}

interface List {
  id: string
  title: string
  description?: string
  period?: string
  sourceUrl?: string
  isPublic: boolean
  isRanked?: boolean
  listAlbums: ListAlbum[]
  user: {
    name: string
  }
}

export default function ShareList() {
  const params = useParams()
  const [list, setList] = useState<List | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPrivate, setIsPrivate] = useState(false)

  useEffect(() => {
    fetchList()
  }, [params.id])

  const fetchList = async () => {
    try {
      // Récupérer le token depuis l'URL si présent
      const urlParams = new URLSearchParams(window.location.search)
      const token = urlParams.get('token')
      
      const url = token 
        ? `/api/lists/${params.id}?token=${token}`
        : `/api/lists/${params.id}`
      
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setList(data)
      } else if (response.status === 403) {
        setIsPrivate(true)
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la liste:', error)
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

  if (isPrivate) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center max-w-md mx-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 mb-6">
              <Globe className="h-8 w-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Liste privée
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Cette liste est privée. Vous devez être authentifié et avoir les permissions nécessaires pour y accéder.
            </p>
            <Link 
              href="/auth/signin" 
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!list) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Liste non trouvée</h2>
            <Link href="/explore" className="text-blue-600 hover:underline">
              Découvrir d'autres listes
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* En-tête élégant */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 mb-6 shadow-lg">
            <Music className="h-8 w-8 text-white" />
          </div>
          
          <h1 className="text-5xl font-bold text-blue-600 dark:text-blue-400 mb-4">
            {list.title}
          </h1>
          
          {list.description && (
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-6">
              {list.description}
            </p>
          )}

          <div className="flex items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <span className="font-medium">Par {list.user.name}</span>
            </div>
            {list.period && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {list.period}
              </div>
            )}
            <div className="flex items-center gap-2">
              <span>{list.listAlbums.length} albums</span>
            </div>
          </div>

          {list.sourceUrl && (
            <div className="mt-4">
              <a
                href={list.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                <Globe className="h-4 w-4 mr-1" />
                Source originale
              </a>
            </div>
          )}
        </div>

        {/* Grille de pochettes */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 mb-12">
          {list.listAlbums.map((item, index) => (
            <div
              key={item.id}
              className="group relative aspect-square rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              {/* Badge de rang */}
              {list.isRanked !== false && (
                <div className="absolute top-2 left-2 z-10 bg-black/60 text-white text-xs font-medium px-2 py-0.5 rounded backdrop-blur-sm">
                  #{index + 1}
                </div>
              )}
              
              {/* Image */}
              {item.album.coverImage ? (
                <img
                  src={item.album.coverImage}
                  alt={`${item.album.artist} - ${item.album.title}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <Music className="h-12 w-12 text-gray-400 dark:text-gray-600" />
                </div>
              )}

              {/* Overlay avec infos au hover */}
              <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <p className="text-white font-bold text-sm mb-1 line-clamp-2">
                  {item.album.title}
                </p>
                <p className="text-gray-300 text-xs line-clamp-1">
                  {item.album.artist}
                </p>
                {item.album.year && (
                  <p className="text-gray-400 text-xs mt-1">
                    {item.album.year}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Call to action */}
        <div className="text-center bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Vous aimez cette liste ?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Créez votre propre liste et partagez vos albums préférés avec le monde !
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all"
            >
              Créer un compte
            </Link>
            <Link
              href="/explore"
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
            >
              Découvrir plus de listes
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
