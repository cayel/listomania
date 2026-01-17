'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Navbar } from '@/components/navbar'
import { Plus, Calendar, Lock, Globe, Upload, Pencil, Trash2 } from 'lucide-react'

interface List {
  id: string
  title: string
  description?: string
  period?: string
  isPublic: boolean
  isRanked?: boolean
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
  const [isLoading, setIsLoading] = useState(true)
  const [isImporting, setIsImporting] = useState(false)
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string, title: string } | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchLists()
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-blue-600 dark:text-blue-400">
            Mes Listes
          </h1>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
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
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
