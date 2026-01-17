'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { AlertCircle, Check, Search, X, Eye } from 'lucide-react'

interface Album {
  id: string
  discogsId: string
  discogsType: string | null
  artist: string
  title: string
  year: number | null
  coverImage: string | null
  listAlbums: Array<{
    list: {
      id: string
      title: string
    }
  }>
}

interface PreviewAlbum {
  discogsId: string
  discogsType: string
  title: string
  artist: string
  year: number | null
  coverImage: string | null
  discogsArtistId?: string
}

export default function AdminAlbums() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [albums, setAlbums] = useState<Album[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingAlbumId, setEditingAlbumId] = useState<string | null>(null)
  const [discogsId, setDiscogsId] = useState('')
  const [discogsType, setDiscogsType] = useState<'master' | 'release'>('master')
  const [previewAlbum, setPreviewAlbum] = useState<PreviewAlbum | null>(null)
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session || session.user.role !== 'admin') {
      router.push('/')
      return
    }

    fetchAlbums()
  }, [session, status, router])

  const fetchAlbums = async () => {
    try {
      const response = await fetch('/api/admin/albums/problematic')
      if (response.ok) {
        const data = await response.json()
        setAlbums(data.albums)
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des albums:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (album: Album) => {
    setEditingAlbumId(album.id)
    setDiscogsId(album.discogsId.startsWith('unknown-') ? '' : album.discogsId)
    setDiscogsType(album.discogsType as 'master' | 'release' || 'master')
    setPreviewAlbum(null)
  }

  const handleCancel = () => {
    setEditingAlbumId(null)
    setDiscogsId('')
    setDiscogsType('master')
    setPreviewAlbum(null)
  }

  const handlePreview = async () => {
    if (!discogsId) {
      setNotification({ type: 'error', message: 'Veuillez saisir un ID Discogs' })
      setTimeout(() => setNotification(null), 3000)
      return
    }

    setIsPreviewLoading(true)

    try {
      const response = await fetch('/api/admin/albums/preview-discogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          discogsId,
          discogsType
        })
      })

      const data = await response.json()

      if (response.ok) {
        setPreviewAlbum(data.album)
      } else {
        setNotification({ type: 'error', message: data.error })
        setTimeout(() => setNotification(null), 5000)
      }
    } catch (error) {
      console.error('Erreur lors de la prévisualisation:', error)
      setNotification({ type: 'error', message: 'Erreur lors de la prévisualisation' })
      setTimeout(() => setNotification(null), 3000)
    } finally {
      setIsPreviewLoading(false)
    }
  }

  const handleUpdate = async (albumId: string) => {
    if (!discogsId) {
      setNotification({ type: 'error', message: 'Veuillez saisir un ID Discogs' })
      setTimeout(() => setNotification(null), 3000)
      return
    }

    setIsUpdating(true)

    try {
      const response = await fetch(`/api/admin/albums/${albumId}/update-discogs`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          discogsId,
          discogsType
        })
      })

      const data = await response.json()

      if (response.ok) {
        setNotification({ type: 'success', message: data.message })
        setEditingAlbumId(null)
        setDiscogsId('')
        await fetchAlbums()
      } else {
        setNotification({ type: 'error', message: data.error })
      }
      
      setTimeout(() => setNotification(null), 5000)
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
      setNotification({ type: 'error', message: 'Erreur lors de la mise à jour' })
      setTimeout(() => setNotification(null), 3000)
    } finally {
      setIsUpdating(false)
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      {/* Notification */}
      {notification && (
        <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-top-5 duration-300">
          <div className={`rounded-lg shadow-lg p-4 ${
            notification.type === 'success' 
              ? 'bg-green-600 text-white' 
              : 'bg-red-600 text-white'
          }`}>
            <p className="font-medium">{notification.message}</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Albums problématiques
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {albums.length} album(s) nécessitant une attention
          </p>
        </div>

        {albums.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
            <Check className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Tous les albums ont un ID Discogs valide !
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Album
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      ID Discogs
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Listes
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {albums.map((album) => (
                    <>
                    <tr key={album.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">
                        <div className="flex items-start space-x-3">
                          {album.coverImage ? (
                            <img
                              src={album.coverImage}
                              alt={album.title}
                              className="w-16 h-16 rounded object-cover"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                              <AlertCircle className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {album.title}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {album.artist}
                              {album.year && ` (${album.year})`}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {editingAlbumId === album.id ? (
                          <input
                            type="text"
                            value={discogsId}
                            onChange={(e) => setDiscogsId(e.target.value)}
                            placeholder="Ex: 123456"
                            disabled={!!previewAlbum}
                            className="w-32 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm disabled:opacity-50"
                          />
                        ) : (
                          <span className={`text-sm ${
                            album.discogsId.startsWith('unknown-')
                              ? 'text-red-600 dark:text-red-400 font-mono'
                              : 'text-gray-900 dark:text-white'
                          }`}>
                            {album.discogsId.startsWith('unknown-') ? 'Non trouvé' : album.discogsId}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editingAlbumId === album.id ? (
                          <select
                            value={discogsType}
                            onChange={(e) => setDiscogsType(e.target.value as 'master' | 'release')}
                            disabled={!!previewAlbum}
                            className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm disabled:opacity-50"
                          >
                            <option value="master">Master</option>
                            <option value="release">Release</option>
                          </select>
                        ) : (
                          <span className="text-sm text-gray-900 dark:text-white">
                            {album.discogsType || 'N/A'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {album.listAlbums.length} liste(s)
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {editingAlbumId === album.id ? (
                          <div className="flex justify-end space-x-2">
                            {!previewAlbum ? (
                              <>
                                <button
                                  onClick={handlePreview}
                                  disabled={isPreviewLoading}
                                  className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 text-sm flex items-center gap-1"
                                >
                                  <Eye className="h-3 w-3" />
                                  {isPreviewLoading ? 'Chargement...' : 'Prévisualiser'}
                                </button>
                                <button
                                  onClick={handleCancel}
                                  disabled={isPreviewLoading}
                                  className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 text-sm"
                                >
                                  Annuler
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleUpdate(album.id)}
                                  disabled={isUpdating}
                                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 text-sm"
                                >
                                  {isUpdating ? 'Mise à jour...' : 'Confirmer'}
                                </button>
                                <button
                                  onClick={handleCancel}
                                  disabled={isUpdating}
                                  className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 text-sm"
                                >
                                  Annuler
                                </button>
                              </>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEdit(album)}
                            className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
                          >
                            Modifier
                          </button>
                        )}
                      </td>
                    </tr>
                    {/* Preview Row */}
                    {editingAlbumId === album.id && previewAlbum && (
                      <tr className="bg-blue-50 dark:bg-blue-900/20">
                        <td colSpan={5} className="px-6 py-4">
                          <div className="border-l-4 border-blue-500 pl-4">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                              Prévisualisation de l'album trouvé :
                            </h4>
                            <div className="flex items-start gap-4">
                              {previewAlbum.coverImage ? (
                                <img
                                  src={previewAlbum.coverImage}
                                  alt={previewAlbum.title}
                                  className="w-32 h-32 rounded object-cover shadow-lg"
                                />
                              ) : (
                                <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                                  <AlertCircle className="h-12 w-12 text-gray-400" />
                                </div>
                              )}
                              <div className="flex-1">
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Titre</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{previewAlbum.title}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Artiste</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{previewAlbum.artist}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Année</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{previewAlbum.year || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">ID Discogs</p>
                                    <p className="font-medium text-gray-900 dark:text-white font-mono">{previewAlbum.discogsId}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Type</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{previewAlbum.discogsType}</p>
                                  </div>
                                </div>
                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-3">
                                  ✓ Cet album sera associé à l'entrée ci-dessus. Cliquez sur "Confirmer" pour valider.
                                </p>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
