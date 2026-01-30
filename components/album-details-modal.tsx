'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, ExternalLink, Calendar, Globe, Disc, Tag, List } from 'lucide-react'

interface DiscogsAlbumDetails {
  id: string
  title: string
  artist: string
  year?: number
  coverImage?: string
  type: 'master' | 'release'
  labels?: string[]
  genres?: string[]
  styles?: string[]
  country?: string
  discogsUrl: string
}

interface AlbumDetailsModalProps {
  albumId: string
  onClose: () => void
}

export function AlbumDetailsModal({ albumId, onClose }: AlbumDetailsModalProps) {
  const router = useRouter()
  const [details, setDetails] = useState<DiscogsAlbumDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch(`/api/albums/${albumId}/discogs-details`)
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }))
          throw new Error(errorData.error || 'Erreur lors de la récupération des détails')
        }
        
        const data = await response.json()
        setDetails(data)
      } catch (err: any) {
        console.error('Erreur lors de la récupération des détails:', err)
        setError(err?.message || 'Impossible de charger les détails')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDetails()
  }, [albumId])

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Informations Discogs
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          ) : details ? (
            <div className="space-y-5">
              {/* Image et infos principales */}
              <div className="flex gap-5">
                {details.coverImage && (
                  <div className="flex-shrink-0">
                    <img
                      src={details.coverImage}
                      alt={details.title}
                      className="w-32 h-32 object-cover rounded-lg shadow-lg"
                    />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 truncate">
                    {details.title}
                  </h3>
                  <p className="text-base text-gray-600 dark:text-gray-400 mb-2 truncate">
                    {details.artist}
                  </p>

                  {/* Métadonnées compactes */}
                  <div className="flex flex-wrap gap-2 text-sm">
                    <span className="inline-flex items-center px-2 py-1 rounded-md font-medium"
                      style={{
                        backgroundColor: details.type === 'master' ? '#dbeafe' : '#fef3c7',
                        color: details.type === 'master' ? '#1e40af' : '#92400e'
                      }}
                    >
                      {details.type === 'master' ? 'Master' : 'Release'}
                    </span>
                    {details.year && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-700 dark:text-gray-300">
                        <Calendar className="h-3 w-3" />
                        {details.year}
                      </span>
                    )}
                    {details.country && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-700 dark:text-gray-300">
                        <Globe className="h-3 w-3" />
                        {details.country}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Genres et Styles en ligne compacte */}
              <div className="grid grid-cols-2 gap-4">
                {details.genres && details.genres.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">GENRES</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {details.genres.map((genre, index) => (
                        <span
                          key={index}
                          className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 rounded text-xs text-blue-700 dark:text-blue-400 font-medium"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {details.styles && details.styles.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">STYLES</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {details.styles.map((style, index) => (
                        <span
                          key={index}
                          className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 rounded text-xs text-purple-700 dark:text-purple-400"
                        >
                          {style}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Labels */}
              {details.labels && details.labels.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">LABELS</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {details.labels.map((label, index) => (
                      <span
                        key={index}
                        className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    router.push(`/albums/${albumId}`)
                    onClose()
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors text-sm"
                >
                  <List className="h-4 w-4" />
                  Voir les listes
                </button>
                <a
                  href={details.discogsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm"
                >
                  <ExternalLink className="h-4 w-4" />
                  Voir sur Discogs
                </a>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
