'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Navbar } from '@/components/navbar'
import { Calendar, Globe, User as UserIcon, Search, X, ArrowUpDown, SlidersHorizontal } from 'lucide-react'

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
  
  // États pour la recherche et le tri
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'updated' | 'title' | 'albums' | 'period'>('updated')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [filterPeriod, setFilterPeriod] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)

  // Charger les listes au montage et quand les filtres changent
  useEffect(() => {
    fetchLists()
  }, [searchQuery, filterPeriod, sortBy, sortOrder])

  const fetchLists = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        limit: '50',
        ...(searchQuery && { search: searchQuery }),
        ...(filterPeriod && { period: filterPeriod }),
        sortBy,
        sortOrder
      })
      
      const response = await fetch(`/api/public/lists?${params}`)
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

  // Extraction des périodes uniques depuis l'API
  useEffect(() => {
    const fetchPeriods = async () => {
      try {
        const response = await fetch('/api/public/lists?limit=1000')
        if (response.ok) {
          const data = await response.json()
          const periods = data.lists
            .map((list: any) => list.period)
            .filter((period: string) => !!period)
          const unique = Array.from(new Set(periods)).sort()
          // Stocker dans un state si nécessaire
        }
      } catch (error) {
        console.error('Erreur lors du chargement des périodes:', error)
      }
    }
    fetchPeriods()
  }, [])

  // Extraction des périodes uniques
  const uniquePeriods = useMemo(() => {
    const periods = lists
      .map(list => list.period)
      .filter((period): period is string => !!period)
    return Array.from(new Set(periods)).sort()
  }, [lists])

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
  }

  const clearFilters = () => {
    setSearchQuery('')
    setFilterPeriod('')
    setSortBy('updated')
    setSortOrder('desc')
  }

  const hasActiveFilters = searchQuery || filterPeriod || sortBy !== 'updated' || sortOrder !== 'desc'

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

        {/* Barre de recherche et filtres */}
        {lists.length > 0 && (
          <div className="mb-6 space-y-4">
            {/* Barre de recherche */}
            <div className="flex gap-3 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par titre, description, auteur ou période..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 glass rounded-xl border-2 border-transparent focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-all text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  </button>
                )}
              </div>
              
              {/* Bouton filtres */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`relative px-4 py-3 glass rounded-xl border-2 transition-all flex items-center gap-2 ${
                  showFilters 
                    ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-950' 
                    : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <SlidersHorizontal className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filtres</span>
                {hasActiveFilters && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"></span>
                )}
              </button>
            </div>

            {/* Panneau de filtres */}
            {showFilters && (
              <div className="glass rounded-xl p-4 space-y-3 border-2 border-blue-200 dark:border-blue-800">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Tri par */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Trier par
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="w-full px-3 py-2 glass rounded-lg border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm focus:border-blue-500 dark:focus:border-blue-400 outline-none"
                    >
                      <option value="updated">Plus récentes</option>
                      <option value="title">Titre (A-Z)</option>
                      <option value="albums">Nombre d'albums</option>
                      <option value="period">Période/Année</option>
                    </select>
                  </div>

                  {/* Ordre */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Ordre
                    </label>
                    <button
                      onClick={toggleSortOrder}
                      className="w-full px-3 py-2 glass rounded-lg border border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 transition-colors flex items-center justify-center gap-2 text-sm text-gray-900 dark:text-white"
                    >
                      <ArrowUpDown className="h-4 w-4" />
                      {sortOrder === 'asc' ? 'Croissant' : 'Décroissant'}
                    </button>
                  </div>

                  {/* Filtre par période */}
                  <div>
                    <label htmlFor="filter-period" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Période/Année
                    </label>
                    <select
                      id="filter-period"
                      value={filterPeriod}
                      onChange={(e) => setFilterPeriod(e.target.value)}
                      className="w-full px-3 py-2 glass rounded-lg border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm focus:border-blue-500 dark:focus:border-blue-400 outline-none"
                    >
                      <option value="">Toutes les périodes</option>
                      {uniquePeriods.map(period => (
                        <option key={period} value={period}>
                          {period}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Réinitialiser */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Actions
                    </label>
                    <button
                      onClick={clearFilters}
                      disabled={!hasActiveFilters}
                      className="w-full px-3 py-2 glass rounded-lg border border-gray-300 dark:border-gray-600 hover:border-red-500 dark:hover:border-red-400 transition-colors text-sm text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-300 dark:disabled:hover:border-gray-600"
                    >
                      Réinitialiser
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Compteur de résultats */}
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>
                {lists.length === lists.length
                  ? `${lists.length} liste${lists.length > 1 ? 's' : ''}`
                  : `${lists.length} liste${lists.length > 1 ? 's' : ''} sur ${lists.length}`
                }
              </span>
              {hasActiveFilters && (
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-medium">
                  Filtres actifs
                </span>
              )}
            </div>
          </div>
        )}

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
        ) : lists.length === 0 ? (
          <div className="text-center py-16 glass rounded-3xl">
            <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">
              Aucune liste ne correspond à vos critères de recherche.
            </p>
            <button
              onClick={clearFilters}
              className="bg-blue-600 text-white hover:bg-blue-700 px-8 py-3 rounded-xl font-medium inline-block transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              Réinitialiser les filtres
            </button>
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
