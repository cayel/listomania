'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { Plus, Calendar, Lock, Globe, Upload } from 'lucide-react'

interface List {
  id: string
  title: string
  description?: string
  period?: string
  isPublic: boolean
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

  const fetchLists = async () => {
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
  }

  const handleDeleteClick = (id: string, title: string) => {
    setDeleteConfirm({ id, title })
  }

  const confirmDelete = async () => {
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
  }

  const handleImportFull = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
  }

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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600 dark:text-blue-400">
            Mes Listes
          </h1>
          <div className="flex items-center space-x-4">
            <label className={`bg-green-600 text-white hover:bg-green-700 px-6 py-3 rounded-xl font-medium inline-flex items-center space-x-2 transition-all shadow-lg hover:shadow-xl ${isImporting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}`}>
              <Upload className="h-5 w-5" />
              <span>Importer une liste</span>
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
              className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-3 rounded-xl font-medium inline-flex items-center space-x-2 transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              <Plus className="h-5 w-5" />
              <span>Nouvelle Liste</span>
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {lists.map((list) => (
              <div
                key={list.id}
                className="group glass rounded-xl overflow-hidden hover:shadow-xl transition-all hover:scale-[1.02]"
              >
                <Link href={`/lists/${list.id}`}>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h2 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                        {list.title}
                      </h2>
                      {list.isPublic ? (
                        <div className="p-1.5 bg-green-600 rounded-lg flex-shrink-0">
                          <Globe className="h-3.5 w-3.5 text-white" />
                        </div>
                      ) : (
                        <div className="p-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0">
                          <Lock className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                        </div>
                      )}
                    </div>

                    {list.description && (
                      <p className="text-gray-600 dark:text-gray-400 text-xs mb-2 line-clamp-1">
                        {list.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                      {list.period && (
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {list.period}
                        </div>
                      )}
                      <span>
                        {list._count.listAlbums} album{list._count.listAlbums > 1 ? 's' : ''}
                      </span>
                    </div>

                    {list.listAlbums.length > 0 && (
                      <div className="flex -space-x-1.5">
                        {list.listAlbums.slice(0, 5).map((listAlbum, idx) => (
                          <div
                            key={idx}
                            className="h-10 w-10 rounded border-2 border-white dark:border-gray-800 overflow-hidden bg-gray-200 dark:bg-gray-700"
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
                      </div>
                    )}
                  </div>
                </Link>

                <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2.5 flex justify-between bg-gray-50/50 dark:bg-gray-800/50">
                  <Link
                    href={`/lists/${list.id}/edit`}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-xs font-medium transition-colors"
                  >
                    Modifier
                  </Link>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      handleDeleteClick(list.id, list.title)
                    }}
                    className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-xs font-medium transition-colors"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
