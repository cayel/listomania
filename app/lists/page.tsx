'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Navbar } from '@/components/navbar'
import { CategoryManager } from '@/components/category-manager'
import { Plus, Calendar, Lock, Globe, Upload, Pencil, Trash2, Search, SlidersHorizontal, X, ArrowUpDown, Grid3x3, List as ListIcon, Table, Eye, EyeOff, CheckSquare, Square, Trash, BarChart3, Tag } from 'lucide-react'

interface Category {
  id: string
  name: string
  color?: string
}

interface ListCategory {
  category: Category
}

interface List {
  id: string
  title: string
  description?: string
  period?: string
  isPublic: boolean
  isRanked?: boolean
  categories?: ListCategory[]
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
  createdAt: string
  updatedAt: string
}

export default function Lists() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [lists, setLists] = useState<List[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isImporting, setIsImporting] = useState(false)
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string, title: string } | null>(null)
  
  // États pour la recherche et les filtres
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'title' | 'updated' | 'created' | 'albums' | 'period'>('updated')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [filterPeriod, setFilterPeriod] = useState<string>('all')
  const [filterVisibility, setFilterVisibility] = useState<'all' | 'public' | 'private'>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [showCategoryManager, setShowCategoryManager] = useState(false)
  
  // Nouveaux états pour les vues et sélections
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'table'>('grid')
  const [selectedLists, setSelectedLists] = useState<Set<string>>(new Set())
  const [showStats, setShowStats] = useState(false)
  const [isSelectMode, setIsSelectMode] = useState(false)
  const [showSavedIndicator, setShowSavedIndicator] = useState(false)
  const [isPreferencesLoaded, setIsPreferencesLoaded] = useState(false)
  const [showCategorySelector, setShowCategorySelector] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(30)

  // Charger les préférences depuis localStorage au montage
  useEffect(() => {
    const savedPreferences = localStorage.getItem('listViewPreferences')
    if (savedPreferences) {
      try {
        const prefs = JSON.parse(savedPreferences)
        if (prefs.viewMode) setViewMode(prefs.viewMode)
        if (prefs.sortBy) setSortBy(prefs.sortBy)
        if (prefs.sortOrder) setSortOrder(prefs.sortOrder)
        if (prefs.filterPeriod) setFilterPeriod(prefs.filterPeriod)
        if (prefs.filterVisibility) setFilterVisibility(prefs.filterVisibility)
        if (prefs.filterCategory) setFilterCategory(prefs.filterCategory)
        if (typeof prefs.showFilters === 'boolean') setShowFilters(prefs.showFilters)
      } catch (error) {
        console.error('Erreur lors du chargement des préférences:', error)
      }
    }
    // Marquer les préférences comme chargées après un court délai
    setTimeout(() => setIsPreferencesLoaded(true), 100)
  }, [])

  // Sauvegarder les préférences dans localStorage à chaque changement
  // (mais pas lors du chargement initial)
  useEffect(() => {
    if (!isPreferencesLoaded) return

    const preferences = {
      viewMode,
      sortBy,
      sortOrder,
      filterPeriod,
      filterVisibility,
      filterCategory,
      showFilters
    }
    localStorage.setItem('listViewPreferences', JSON.stringify(preferences))
    
    // Afficher un indicateur de sauvegarde pendant 1 seconde
    setShowSavedIndicator(true)
    const timer = setTimeout(() => setShowSavedIndicator(false), 1000)
    return () => clearTimeout(timer)
  }, [viewMode, sortBy, sortOrder, filterPeriod, filterVisibility, filterCategory, showFilters, isPreferencesLoaded])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchLists()
      fetchCategories()
    }
  }, [status])

  const fetchLists = useCallback(async () => {
    try {
      const response = await fetch('/api/lists')
      if (response.ok) {
        const data = await response.json()
        setLists(data)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des listes:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error)
    }
  }, [])

  const handleDeleteClick = useCallback((id: string, title: string) => {
    setDeleteConfirm({ id, title })
  }, [])

  const confirmDelete = useCallback(async () => {
    if (!deleteConfirm) return

    try {
      const response = await fetch(`/api/lists/${deleteConfirm.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setLists(lists.filter(list => list.id !== deleteConfirm.id))
        setNotification({ 
          type: 'success', 
          message: 'Liste supprimée avec succès' 
        })
        setTimeout(() => setNotification(null), 3000)
      } else {
        setNotification({ 
          type: 'error', 
          message: 'Erreur lors de la suppression' 
        })
        setTimeout(() => setNotification(null), 3000)
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      setNotification({ 
        type: 'error', 
        message: 'Erreur lors de la suppression' 
      })
      setTimeout(() => setNotification(null), 3000)
    } finally {
      setDeleteConfirm(null)
    }
  }, [deleteConfirm, lists])

  const handleImportFull = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/lists/import-full', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (response.ok) {
        setNotification({ 
          type: 'success', 
          message: result.message || 'Liste importée avec succès !' 
        })
        setTimeout(() => setNotification(null), 5000)
        
        // Recharger les listes et rediriger vers la nouvelle liste
        await fetchLists()
        if (result.listId) {
          router.push(`/lists/${result.listId}`)
        }
      } else {
        setNotification({ 
          type: 'error', 
          message: result.error || 'Erreur lors de l\'import' 
        })
        setTimeout(() => setNotification(null), 5000)
      }
    } catch (error) {
      console.error('Erreur lors de l\'import:', error)
      setNotification({ 
        type: 'error', 
        message: 'Erreur lors de l\'import de la liste' 
      })
      setTimeout(() => setNotification(null), 5000)
    } finally {
      setIsImporting(false)
      event.target.value = ''
    }
  }, [fetchLists, router])

  // Filtrage et tri des listes
  const filteredAndSortedLists = useMemo(() => {
    let result = [...lists]

    // Recherche par titre
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(list => 
        list.title.toLowerCase().includes(query) ||
        list.description?.toLowerCase().includes(query)
      )
    }

    // Filtre par période
    if (filterPeriod !== 'all') {
      result = result.filter(list => list.period === filterPeriod)
    }

    // Filtre par visibilité
    if (filterVisibility !== 'all') {
      result = result.filter(list => 
        filterVisibility === 'public' ? list.isPublic : !list.isPublic
      )
    }

    // Filtre par catégorie
    if (filterCategory !== 'all') {
      result = result.filter(list => 
        list.categories?.some(lc => lc.category.id === filterCategory)
      )
    }

    // Tri
    result.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title)
          break
        case 'updated':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
          break
        case 'created':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
        case 'albums':
          comparison = a._count.listAlbums - b._count.listAlbums
          break
        case 'period':
          const periodA = a.period || ''
          const periodB = b.period || ''
          comparison = periodA.localeCompare(periodB)
          break
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

    return result
  }, [lists, searchQuery, filterPeriod, filterVisibility, filterCategory, sortBy, sortOrder])

  // Extraction des périodes uniques pour le filtre
  const uniquePeriods = useMemo(() => {
    const periods = lists
      .map(list => list.period)
      .filter((period): period is string => !!period)
    return Array.from(new Set(periods)).sort()
  }, [lists])

  // Pagination des listes filtrées
  const paginatedLists = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredAndSortedLists.slice(startIndex, endIndex)
  }, [filteredAndSortedLists, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredAndSortedLists.length / itemsPerPage)

  // Réinitialiser la page quand les filtres changent
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, filterPeriod, filterVisibility, filterCategory, sortBy, sortOrder])

  const toggleSortOrder = useCallback(() => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
  }, [])

  const clearFilters = useCallback(() => {
    setSearchQuery('')
    setFilterPeriod('all')
    setFilterVisibility('all')
    setFilterCategory('all')
    setSortBy('updated')
    setSortOrder('desc')
    setViewMode('grid')
    setShowFilters(false)
  }, [])

  // Fonctions de sélection
  const toggleSelectList = useCallback((listId: string) => {
    setSelectedLists(prev => {
      const newSet = new Set(prev)
      if (newSet.has(listId)) {
        newSet.delete(listId)
      } else {
        newSet.add(listId)
      }
      return newSet
    })
  }, [])

  const selectAllVisible = useCallback(() => {
    setSelectedLists(new Set(filteredAndSortedLists.map(list => list.id)))
  }, [filteredAndSortedLists])

  const deselectAll = useCallback(() => {
    setSelectedLists(new Set())
  }, [])

  const deleteSelectedLists = useCallback(async () => {
    if (selectedLists.size === 0) return
    
    const confirmMsg = `Êtes-vous sûr de vouloir supprimer ${selectedLists.size} liste(s) ? Cette action est irréversible.`
    if (!confirm(confirmMsg)) return

    try {
      const deletePromises = Array.from(selectedLists).map(listId =>
        fetch(`/api/lists/${listId}`, { method: 'DELETE' })
      )
      
      await Promise.all(deletePromises)
      
      setLists(lists.filter(list => !selectedLists.has(list.id)))
      setSelectedLists(new Set())
      setNotification({ 
        type: 'success', 
        message: `${selectedLists.size} liste(s) supprimée(s) avec succès` 
      })
      setTimeout(() => setNotification(null), 3000)
    } catch (error) {
      console.error('Erreur lors de la suppression multiple:', error)
      setNotification({ 
        type: 'error', 
        message: 'Erreur lors de la suppression' 
      })
      setTimeout(() => setNotification(null), 3000)
    }
  }, [selectedLists, lists])

  const toggleVisibilitySelected = useCallback(async (makePublic: boolean) => {
    if (selectedLists.size === 0) return

    try {
      const updatePromises = Array.from(selectedLists).map(listId =>
        fetch(`/api/lists/${listId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isPublic: makePublic })
        })
      )
      
      await Promise.all(updatePromises)
      
      setLists(lists.map(list => 
        selectedLists.has(list.id) ? { ...list, isPublic: makePublic } : list
      ))
      
      setNotification({ 
        type: 'success', 
        message: `${selectedLists.size} liste(s) ${makePublic ? 'rendue(s) publique(s)' : 'rendue(s) privée(s)'}` 
      })
      setTimeout(() => setNotification(null), 3000)
      setSelectedLists(new Set())
    } catch (error) {
      console.error('Erreur lors de la modification de visibilité:', error)
      setNotification({ 
        type: 'error', 
        message: 'Erreur lors de la modification' 
      })
      setTimeout(() => setNotification(null), 3000)
    }
  }, [selectedLists, lists])

  const addCategoryToSelected = useCallback(async (categoryId: string) => {
    if (selectedLists.size === 0) return

    try {
      const updatePromises = Array.from(selectedLists).map(async (listId) => {
        // Récupérer les catégories actuelles de la liste
        const listToUpdate = lists.find(l => l.id === listId)
        const currentCategoryIds = listToUpdate?.categories?.map(lc => lc.category.id) || []
        
        // Ajouter la nouvelle catégorie si elle n'existe pas déjà
        if (!currentCategoryIds.includes(categoryId)) {
          const newCategoryIds = [...currentCategoryIds, categoryId]
          return fetch(`/api/lists/${listId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ categoryIds: newCategoryIds })
          })
        }
        return Promise.resolve()
      })
      
      await Promise.all(updatePromises)
      
      // Recharger les listes pour avoir les catégories à jour
      await fetchLists()
      
      const categoryName = categories.find(c => c.id === categoryId)?.name || 'catégorie'
      setNotification({ 
        type: 'success', 
        message: `${selectedLists.size} liste(s) associée(s) à "${categoryName}"` 
      })
      setTimeout(() => setNotification(null), 3000)
      setSelectedLists(new Set())
      setShowCategorySelector(false)
    } catch (error) {
      console.error('Erreur lors de l\'association:', error)
      setNotification({ 
        type: 'error', 
        message: 'Erreur lors de l\'association' 
      })
      setTimeout(() => setNotification(null), 3000)
    }
  }, [selectedLists, lists, categories])

  // Statistiques
  const stats = useMemo(() => {
    const totalAlbums = lists.reduce((acc, list) => acc + list._count.listAlbums, 0)
    const publicLists = lists.filter(list => list.isPublic).length
    const privateLists = lists.filter(list => !list.isPublic).length
    const avgAlbumsPerList = lists.length > 0 ? Math.round(totalAlbums / lists.length) : 0
    
    // Statistiques par catégorie
    const categoryStats = categories.map(category => {
      const categoryLists = lists.filter(list => 
        list.categories?.some(lc => lc.category.id === category.id)
      )
      const categoryAlbums = categoryLists.reduce((acc, list) => acc + list._count.listAlbums, 0)
      
      return {
        id: category.id,
        name: category.name,
        color: category.color,
        listsCount: categoryLists.length,
        albumsCount: categoryAlbums
      }
    }).filter(stat => stat.listsCount > 0)
    
    return {
      totalLists: lists.length,
      totalAlbums,
      publicLists,
      privateLists,
      avgAlbumsPerList,
      categoryStats
    }
  }, [lists, categories])

  if (status === 'loading' || isLoading) {
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
      
      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Confirmer la suppression
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Êtes-vous sûr de vouloir supprimer la liste <span className="font-semibold text-gray-900 dark:text-white">"{deleteConfirm.title}"</span> ? Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Supprimer
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`px-6 py-3 rounded-lg shadow-lg ${
            notification.type === 'success' 
              ? 'bg-green-600 text-white' 
              : 'bg-red-600 text-white'
          }`}>
            {notification.message}
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-blue-600 dark:text-blue-400">
              Mes Listes
            </h1>
            {lists.length > 0 && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {lists.length} liste{lists.length > 1 ? 's' : ''} • {stats.totalAlbums} album{stats.totalAlbums > 1 ? 's' : ''}
              </p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
            {lists.length > 0 && (
              <button
                onClick={() => setShowStats(!showStats)}
                className="bg-purple-600 text-white hover:bg-purple-700 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium inline-flex items-center justify-center space-x-2 transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-sm sm:text-base">Statistiques</span>
              </button>
            )}
            <button
              onClick={() => setShowCategoryManager(true)}
              className="bg-amber-600 text-white hover:bg-amber-700 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium inline-flex items-center justify-center space-x-2 transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              <Tag className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base">Catégories</span>
            </button>
            <label className={`bg-green-600 text-white hover:bg-green-700 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium inline-flex items-center justify-center space-x-2 transition-all shadow-lg hover:shadow-xl ${isImporting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}`}>
              <Upload className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base">Importer une liste</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportFull}
                disabled={isImporting}
                className="hidden"
              />
            </label>
            <Link
              href="/lists/new"
              className="bg-blue-600 text-white hover:bg-blue-700 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium inline-flex items-center justify-center space-x-2 transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base">Nouvelle Liste</span>
            </Link>
          </div>
        </div>

        {/* Panneau de statistiques */}
        {showStats && lists.length > 0 && (
          <div className="mb-6 glass rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">📊 Statistiques</h2>
              <button
                onClick={() => setShowStats(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalLists}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Liste{stats.totalLists > 1 ? 's' : ''}</div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.totalAlbums}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Album{stats.totalAlbums > 1 ? 's' : ''}</div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.publicLists}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Publique{stats.publicLists > 1 ? 's' : ''}</div>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.privateLists}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Privée{stats.privateLists > 1 ? 's' : ''}</div>
              </div>
              <div className="bg-pink-50 dark:bg-pink-900/20 rounded-xl p-4">
                <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">{stats.avgAlbumsPerList}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Moy. / liste</div>
              </div>
            </div>

            {/* Statistiques par catégorie */}
            {stats.categoryStats.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Par Catégorie
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {stats.categoryStats.map(stat => (
                    <div
                      key={stat.id}
                      className="glass rounded-xl p-4 flex items-center gap-3"
                    >
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: stat.color || '#3B82F6' }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 dark:text-white truncate">
                          {stat.name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {stat.listsCount} liste{stat.listsCount > 1 ? 's' : ''} • {stat.albumsCount} album{stat.albumsCount > 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Barre de recherche et filtres */}
        {lists.length > 0 && (
          <div className="mb-6 space-y-4">
            {/* Barre de recherche */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une liste..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 glass rounded-xl border-0 focus:ring-2 focus:ring-blue-500 dark:text-white placeholder-gray-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Bouton pour afficher/masquer les filtres */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 glass rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="text-sm font-medium">Filtres et tri</span>
                  {(filterPeriod !== 'all' || filterVisibility !== 'all' || filterCategory !== 'all' || searchQuery) && (
                    <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                      Actifs
                    </span>
                  )}
                </button>

                {/* Mode de sélection */}
                <button
                  onClick={() => {
                    setIsSelectMode(!isSelectMode)
                    if (isSelectMode) {
                      setSelectedLists(new Set())
                    }
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isSelectMode 
                      ? 'bg-blue-600 text-white' 
                      : 'glass hover:bg-white/50 dark:hover:bg-gray-800/50'
                  }`}
                >
                  <CheckSquare className="h-4 w-4" />
                  <span className="text-sm font-medium">Sélectionner</span>
                </button>

                {/* Modes de vue */}
                <div className="flex items-center gap-1 glass rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded transition-colors ${
                      viewMode === 'grid' 
                        ? 'bg-blue-600 text-white' 
                        : 'hover:bg-white/50 dark:hover:bg-gray-800/50'
                    }`}
                    title="Vue grille"
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded transition-colors ${
                      viewMode === 'list' 
                        ? 'bg-blue-600 text-white' 
                        : 'hover:bg-white/50 dark:hover:bg-gray-800/50'
                    }`}
                    title="Vue liste"
                  >
                    <ListIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`p-2 rounded transition-colors ${
                      viewMode === 'table' 
                        ? 'bg-blue-600 text-white' 
                        : 'hover:bg-white/50 dark:hover:bg-gray-800/50'
                    }`}
                    title="Vue tableau"
                  >
                    <Table className="h-4 w-4" />
                  </button>
                </div>

                {/* Indicateur de sauvegarde */}
                {showSavedIndicator && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg text-xs text-green-700 dark:text-green-400 font-medium animate-fade-in">
                    <CheckSquare className="h-3.5 w-3.5" />
                    <span>Préférences sauvegardées</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4">
                {/* Actions de sélection */}
                {isSelectMode && selectedLists.size > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedLists.size} sélectionnée{selectedLists.size > 1 ? 's' : ''}
                    </span>
                    <button
                      onClick={() => setShowCategorySelector(true)}
                      className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm flex items-center gap-1"
                    >
                      <Tag className="h-3.5 w-3.5" />
                      <span>Catégorie</span>
                    </button>
                    <button
                      onClick={() => toggleVisibilitySelected(true)}
                      className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-1"
                    >
                      <Globe className="h-3.5 w-3.5" />
                      <span>Public</span>
                    </button>
                    <button
                      onClick={() => toggleVisibilitySelected(false)}
                      className="px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm flex items-center gap-1"
                    >
                      <Lock className="h-3.5 w-3.5" />
                      <span>Privé</span>
                    </button>
                    <button
                      onClick={deleteSelectedLists}
                      className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center gap-1"
                    >
                      <Trash className="h-3.5 w-3.5" />
                      <span>Supprimer</span>
                    </button>
                    <button
                      onClick={deselectAll}
                      className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
                    >
                      Annuler
                    </button>
                  </div>
                )}

                {isSelectMode && selectedLists.size === 0 && filteredAndSortedLists.length > 0 && (
                  <button
                    onClick={selectAllVisible}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Tout sélectionner
                  </button>
                )}

                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {filteredAndSortedLists.length} {filteredAndSortedLists.length > 1 ? 'listes' : 'liste'}
                  {filteredAndSortedLists.length !== lists.length && ` sur ${lists.length}`}
                </div>
              </div>
            </div>

            {/* Panneau des filtres */}
            {showFilters && (
              <div className="glass rounded-xl p-4 space-y-4 border border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Tri */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Trier par
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                      >
                        <option value="updated">Dernière modification</option>
                        <option value="created">Date de création</option>
                        <option value="title">Titre (A-Z)</option>
                        <option value="albums">Nombre d'albums</option>
                        <option value="period">Période/Année</option>
                      </select>
                      <button
                        onClick={toggleSortOrder}
                        className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                        title={sortOrder === 'asc' ? 'Croissant' : 'Décroissant'}
                      >
                        <ArrowUpDown className={`h-4 w-4 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Filtre par période */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Période
                    </label>
                    <select
                      value={filterPeriod}
                      onChange={(e) => setFilterPeriod(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                    >
                      <option value="all">Toutes les périodes</option>
                      {uniquePeriods.map(period => (
                        <option key={period} value={period}>{period}</option>
                      ))}
                    </select>
                  </div>

                  {/* Filtre par visibilité */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Visibilité
                    </label>
                    <select
                      value={filterVisibility}
                      onChange={(e) => setFilterVisibility(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                    >
                      <option value="all">Toutes</option>
                      <option value="public">Publiques</option>
                      <option value="private">Privées</option>
                    </select>
                  </div>

                  {/* Filtre par catégorie */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Catégorie
                    </label>
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                    >
                      <option value="all">Toutes les catégories</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Réinitialiser */}
                  <div className="flex items-end">
                    <button
                      onClick={clearFilters}
                      className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                    >
                      Réinitialiser
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {lists.length === 0 ? (
          <div className="text-center py-16 glass rounded-3xl">
            <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">
              Vous n'avez pas encore créé de liste.
            </p>
            <Link
              href="/lists/new"
              className="bg-blue-600 text-white hover:bg-blue-700 px-8 py-3 rounded-xl font-medium inline-block transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              Créer ma première liste
            </Link>
          </div>
        ) : filteredAndSortedLists.length === 0 ? (
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
          <>
            {/* Vue grille */}
            {viewMode === 'grid' && (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {paginatedLists.map((list) => (
                  <div key={list.id} className="relative">
                    {isSelectMode && (
                      <div className="absolute top-2 left-2 z-10">
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            toggleSelectList(list.id)
                          }}
                          className="p-1.5 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:scale-110 transition-transform"
                        >
                          {selectedLists.has(list.id) ? (
                            <CheckSquare className="h-5 w-5 text-blue-600" />
                          ) : (
                            <Square className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    )}
                    <Link
                      href={`/lists/${list.id}`}
                      className={`group glass rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col ${
                        selectedLists.has(list.id) ? 'ring-2 ring-blue-600' : ''
                      }`}
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
                        
                        {/* Badges overlay */}
                        <div className="absolute top-2 right-2 flex gap-1.5">
                          {list.isPublic ? (
                            <div className="px-1.5 py-0.5 bg-green-600 backdrop-blur-sm rounded flex items-center gap-1 shadow-lg">
                              <Globe className="h-2.5 w-2.5 text-white" />
                              <span className="text-[10px] text-white font-medium">Public</span>
                            </div>
                          ) : (
                            <div className="px-1.5 py-0.5 bg-gray-900/70 backdrop-blur-sm rounded flex items-center gap-1 shadow-lg">
                              <Lock className="h-2.5 w-2.5 text-white" />
                              <span className="text-[10px] text-white font-medium">Privé</span>
                            </div>
                          )}
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

                        {list.period && (
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-auto">
                            <Calendar className="h-3 w-3 mr-1" />
                            {list.period}
                          </div>
                        )}

                        {/* Catégories */}
                        {list.categories && list.categories.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {list.categories.slice(0, 2).map(({ category }) => (
                              <Link
                                key={category.id}
                                href={`/categories/${category.id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium text-white hover:opacity-80 transition-opacity"
                                style={{ backgroundColor: category.color || '#3B82F6' }}
                              >
                                {category.name}
                              </Link>
                            ))}
                            {list.categories.length > 2 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                                +{list.categories.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Actions footer */}
                      <div className="border-t border-gray-200 dark:border-gray-700 px-3 py-2 bg-gray-50/50 dark:bg-gray-800/50 flex justify-end gap-3">
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            window.location.href = `/lists/${list.id}/edit`
                          }}
                          className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                          title="Modifier"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            handleDeleteClick(list.id, list.title)
                          }}
                          className="p-1.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}

            {/* Vue liste */}
            {viewMode === 'list' && (
              <div className="space-y-3">
                {paginatedLists.map((list) => (
                  <div key={list.id} className="relative">
                    <Link
                      href={`/lists/${list.id}`}
                      className={`group glass rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 flex items-center gap-4 p-4 ${
                        selectedLists.has(list.id) ? 'ring-2 ring-blue-600' : ''
                      }`}
                    >
                      {isSelectMode && (
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            toggleSelectList(list.id)
                          }}
                          className="flex-shrink-0"
                        >
                          {selectedLists.has(list.id) ? (
                            <CheckSquare className="h-5 w-5 text-blue-600" />
                          ) : (
                            <Square className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      )}

                      {/* Preview mini */}
                      <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                        {list.listAlbums[0]?.album.coverImage ? (
                          <Image
                            src={list.listAlbums[0].album.coverImage}
                            alt={list.title}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">
                            🎵
                          </div>
                        )}
                      </div>

                      {/* Infos */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                          {list.title}
                        </h3>
                        {list.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {list.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                          <span>{list._count.listAlbums} album{list._count.listAlbums > 1 ? 's' : ''}</span>
                          {list.period && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {list.period}
                              </span>
                            </>
                          )}
                        </div>
                        {/* Catégories */}
                        {list.categories && list.categories.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {list.categories.map(({ category }) => (
                              <span
                                key={category.id}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium text-white"
                                style={{ backgroundColor: category.color || '#3B82F6' }}
                              >
                                {category.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Badge visibilité */}
                      <div className="flex-shrink-0">
                        {list.isPublic ? (
                          <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center gap-1.5">
                            <Globe className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                            <span className="text-xs font-medium text-green-600 dark:text-green-400">Public</span>
                          </div>
                        ) : (
                          <div className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center gap-1.5">
                            <Lock className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Privé</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex-shrink-0 flex gap-2">
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            window.location.href = `/lists/${list.id}/edit`
                          }}
                          className="p-2 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                          title="Modifier"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            handleDeleteClick(list.id, list.title)
                          }}
                          className="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}

            {/* Vue tableau */}
            {viewMode === 'table' && (
              <div className="glass rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        {isSelectMode && (
                          <th className="px-4 py-3 text-left">
                            <button
                              onClick={() => {
                                if (selectedLists.size === filteredAndSortedLists.length) {
                                  deselectAll()
                                } else {
                                  selectAllVisible()
                                }
                              }}
                            >
                              {selectedLists.size === filteredAndSortedLists.length && filteredAndSortedLists.length > 0 ? (
                                <CheckSquare className="h-5 w-5 text-blue-600" />
                              ) : (
                                <Square className="h-5 w-5 text-gray-400" />
                              )}
                            </button>
                          </th>
                        )}
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Titre</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white hidden md:table-cell">Description</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Albums</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white hidden lg:table-cell">Période</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white hidden xl:table-cell">Catégories</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Visibilité</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {paginatedLists.map((list) => (
                        <tr
                          key={list.id}
                          className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                            selectedLists.has(list.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                          }`}
                        >
                          {isSelectMode && (
                            <td className="px-4 py-3">
                              <button
                                onClick={() => toggleSelectList(list.id)}
                              >
                                {selectedLists.has(list.id) ? (
                                  <CheckSquare className="h-5 w-5 text-blue-600" />
                                ) : (
                                  <Square className="h-5 w-5 text-gray-400" />
                                )}
                              </button>
                            </td>
                          )}
                          <td className="px-4 py-3">
                            <Link
                              href={`/lists/${list.id}`}
                              className="flex items-center gap-3 group"
                            >
                              <div className="flex-shrink-0 w-10 h-10 rounded overflow-hidden bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                                {list.listAlbums[0]?.album.coverImage ? (
                                  <Image
                                    src={list.listAlbums[0].album.coverImage}
                                    alt={list.title}
                                    width={40}
                                    height={40}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-lg">
                                    🎵
                                  </div>
                                )}
                              </div>
                              <span className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {list.title}
                              </span>
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 hidden md:table-cell max-w-xs truncate">
                            {list.description || '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium">
                            {list._count.listAlbums}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 hidden lg:table-cell">
                            {list.period || '-'}
                          </td>
                          <td className="px-4 py-3 hidden xl:table-cell">
                            {list.categories && list.categories.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {list.categories.map(({ category }) => (
                                  <span
                                    key={category.id}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white"
                                    style={{ backgroundColor: category.color || '#3B82F6' }}
                                  >
                                    {category.name}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {list.isPublic ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded text-xs font-medium text-green-600 dark:text-green-400">
                                <Globe className="h-3 w-3" />
                                Public
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-medium text-gray-600 dark:text-gray-400">
                                <Lock className="h-3 w-3" />
                                Privé
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => window.location.href = `/lists/${list.id}/edit`}
                                className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                                title="Modifier"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(list.id, list.title)}
                                className="p-1.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && filteredAndSortedLists.length > 0 && (
          <div className="flex justify-center items-center gap-2 mt-8 pb-4">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Précédent
            </button>
            
            <div className="flex gap-2">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-4 py-2 rounded-lg border transition-colors $\{
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Suivant
            </button>

            <span className="ml-4 text-sm text-gray-600 dark:text-gray-400">
              Page {currentPage} sur {totalPages}
            </span>
          </div>
        )}
      </div>

      {/* Category Manager Modal */}
      <CategoryManager
        isOpen={showCategoryManager}
        onClose={() => setShowCategoryManager(false)}
        onCategoriesChange={() => {
          fetchCategories()
          fetchLists()
        }}
      />

      {/* Modal de sélection de catégorie pour association en batch */}
      {showCategorySelector && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Associer à une catégorie
                </h2>
                <button
                  onClick={() => setShowCategorySelector(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {selectedLists.size} liste(s) sélectionnée(s)
              </p>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {categories.length === 0 ? (
                <div className="text-center py-8">
                  <Tag className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Aucune catégorie disponible.
                  </p>
                  <button
                    onClick={() => {
                      setShowCategorySelector(false)
                      setShowCategoryManager(true)
                    }}
                    className="mt-4 text-blue-600 dark:text-blue-400 hover:underline text-sm"
                  >
                    Créer une catégorie
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => addCategoryToSelected(category.id)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all group"
                    >
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold"
                        style={{ backgroundColor: category.color || '#6B7280' }}
                      >
                        {category.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400">
                          {category.name}
                        </div>
                      </div>
                      <Tag className="h-4 w-4 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowCategorySelector(false)}
                className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
