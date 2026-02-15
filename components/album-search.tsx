'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X } from 'lucide-react'

interface Album {
  id: string
  title: string
  artist: string
  year?: number
  coverImage?: string
  thumb?: string
  type?: 'master' | 'release'
}

interface AlbumSearchProps {
  onSelectAlbum: (album: Album) => void
}

export function AlbumSearch({ onSelectAlbum }: AlbumSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Album[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Fermer les résultats en cliquant en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([])
      setIsOpen(false)
      return
    }

    setIsLoading(true)
    setIsOpen(true)

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
      if (response.ok) {
        const data = await response.json()
        setResults(data)
      }
    } catch (error) {
      console.error('Erreur lors de la recherche:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Debounce de 300ms pour éviter trop d'appels API
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    if (query.length >= 2) {
      debounceTimerRef.current = setTimeout(() => {
        performSearch(query)
      }, 300)
    } else {
      setResults([])
      setIsOpen(false)
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [query, performSearch])

  const handleSelectAlbum = (album: Album) => {
    onSelectAlbum(album)
    setQuery('')
    setResults([])
    setIsOpen(false)
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un album ou un artiste..."
          className="w-full pl-4 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
          {isLoading ? (
            <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          ) : (
            <Search className="h-5 w-5 text-gray-400" />
          )}
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2 flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {isLoading ? 'Recherche en cours...' : `${results.length} résultat${results.length > 1 ? 's' : ''}`}
            </span>
            <button
              onClick={handleClose}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Fermer"
            >
              <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
          
          {isLoading ? (
            <div className="p-4 text-center text-gray-600 dark:text-gray-400">
              Chargement...
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-gray-600 dark:text-gray-400">
              Aucun résultat trouvé
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {results.map((album) => (
                <button
                  key={album.id}
                  onClick={() => handleSelectAlbum(album)}
                  className="w-full p-3 flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                >
                  <div className="flex-shrink-0 w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded overflow-hidden">
                    {album.coverImage || album.thumb ? (
                      <img
                        src={album.coverImage || album.thumb}
                        alt={album.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        ?
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {album.artist}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {album.title}
                    </p>
                    {album.year && (
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {album.year}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
