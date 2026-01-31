'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Navbar } from '@/components/navbar'
import { AlbumSearch } from '@/components/album-search'
import { SortableAlbumItem } from '@/components/sortable-album-item'
import { AlbumGridItem } from '@/components/album-grid-item'
import { AlbumDetailsModal } from '@/components/album-details-modal'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy
} from '@dnd-kit/sortable'
import { Calendar, Globe, Lock, ArrowLeft, Grid3x3, List as ListIcon, Eye, EyeOff, Download, Upload, Share2, Mail, X, MoreVertical, Edit, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'
import html2canvas from 'html2canvas'

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
  userId?: string
}

export default function ListDetail() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [list, setList] = useState<List | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isOwner, setIsOwner] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showArtist, setShowArtist] = useState(true)
  const [showTitle, setShowTitle] = useState(true)
  const [showYear, setShowYear] = useState(true)
  const [showRank, setShowRank] = useState(true)
  const [gridCols, setGridCols] = useState(typeof window !== 'undefined' && window.innerWidth >= 768 ? 5 : 3)
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string, details?: string[] } | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [importProgress, setImportProgress] = useState<string>('')
  const [importCurrent, setImportCurrent] = useState(0)
  const [importTotal, setImportTotal] = useState(0)
  const [deleteConfirm, setDeleteConfirm] = useState<{ listAlbumId: string, albumTitle: string, artist: string } | null>(null)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showActionsMenu, setShowActionsMenu] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [showExportImageModal, setShowExportImageModal] = useState(false)
  const [exportImageIncludeText, setExportImageIncludeText] = useState(true)
  const [exportImageStyle, setExportImageStyle] = useState<'golden' | 'light' | 'dark'>('golden')
  const [isExportingImage, setIsExportingImage] = useState(false)
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  useEffect(() => {
    // Définir le nombre de colonnes en fonction de la taille d'écran
    const handleResize = () => {
      const isMobile = window.innerWidth < 768
      setGridCols(prev => {
        // Si l'utilisateur n'a pas modifié manuellement, ajuster selon l'écran
        if (isMobile && prev > 4) return 3
        if (!isMobile && prev < 5) return 5
        return prev
      })
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    // Fermer le menu d'export quand on clique ailleurs
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('[data-export-menu]')) {
        setShowExportMenu(false)
      }
    }

    if (showExportMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showExportMenu])

  useEffect(() => {
    // Charger la liste dès que le composant est monté, avec ou sans session
    fetchList()
  }, [params.id])

  useEffect(() => {
    // Recalculer isOwner si la session change
    if (list && session !== undefined) {
      const owner = session?.user?.id === list.userId
      setIsOwner(owner)
    }
  }, [session, list])

  const fetchList = async () => {
    try {
      const response = await fetch(`/api/lists/${params.id}`)
      
      if (response.ok) {
        const data = await response.json()
        setList(data)
        
        // Vérifier si l'utilisateur est propriétaire (uniquement si connecté)
        const owner = session?.user?.id === data.userId
        setIsOwner(owner)
      } else {
        const errorData = await response.json()
        console.error('Erreur API:', response.status, errorData)
        
        if (response.status === 403) {
          // Liste privée - rediriger vers la page de connexion si non authentifié
          if (!session?.user) {
            router.push(`/auth/signin?callbackUrl=/lists/${params.id}`)
          } else {
            alert(`Erreur: ${errorData.error || 'Accès non autorisé'}`)
            router.push('/lists')
          }
        } else if (response.status === 404) {
          alert(`Erreur: ${errorData.error || 'Liste non trouvée'}`)
          router.push('/lists')
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la liste:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddAlbum = async (album: any) => {
    try {
      // D'abord, récupérer les détails complets de l'album depuis le backend
      // qui inclura le discogsArtistId
      const response = await fetch(`/api/lists/${params.id}/albums`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          discogsId: album.id,
          discogsType: album.type,
          artist: album.artist,
          title: album.title,
          year: album.year,
          coverImage: album.coverImage || album.thumb
        })
      })

      if (response.ok) {
        fetchList()
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'album:', error)
    }
  }

  const handleRemoveAlbum = async (listAlbumId: string, albumTitle?: string, artist?: string) => {
    setDeleteConfirm({ listAlbumId, albumTitle: albumTitle || 'cet album', artist: artist || '' })
  }

  const confirmDelete = async () => {
    if (!deleteConfirm) return

    try {
      const response = await fetch(`/api/lists/${params.id}/albums/${deleteConfirm.listAlbumId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setNotification({ type: 'success', message: 'Album retiré de la liste' })
        setTimeout(() => setNotification(null), 3000)
        fetchList()
      } else {
        setNotification({ type: 'error', message: 'Erreur lors de la suppression' })
        setTimeout(() => setNotification(null), 3000)
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'album:', error)
      setNotification({ type: 'error', message: 'Erreur lors de la suppression' })
      setTimeout(() => setNotification(null), 3000)
    } finally {
      setDeleteConfirm(null)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id || !list) {
      return
    }

    const oldIndex = list.listAlbums.findIndex((item) => item.id === active.id)
    const newIndex = list.listAlbums.findIndex((item) => item.id === over.id)

    const newListAlbums = arrayMove(list.listAlbums, oldIndex, newIndex)

    // Mise à jour optimiste de l'interface
    setList({
      ...list,
      listAlbums: newListAlbums.map((item, index) => ({
        ...item,
        position: index
      }))
    })

    // Envoi de la mise à jour au serveur
    try {
      await fetch(`/api/lists/${params.id}/reorder`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          positions: newListAlbums.map((item, index) => ({
            listAlbumId: item.id,
            position: index
          }))
        })
      })
    } catch (error) {
      console.error('Erreur lors de la réorganisation:', error)
      // Recharger en cas d'erreur
      fetchList()
    }
  }

  const handleCopyLink = async () => {
    try {
      // Générer ou récupérer le token de partage
      const response = await fetch(`/api/lists/${params.id}/generate-share-token`, {
        method: 'POST'
      })
      
      if (response.ok) {
        const { shareToken } = await response.json()
        const shareUrl = `${window.location.origin}/lists/${params.id}/share?token=${shareToken}`
        
        await navigator.clipboard.writeText(shareUrl)
        setNotification({ type: 'success', message: 'Lien copié dans le presse-papiers' })
        setTimeout(() => setNotification(null), 3000)
        setShowShareModal(false)
      } else {
        setNotification({ type: 'error', message: 'Erreur lors de la génération du lien' })
        setTimeout(() => setNotification(null), 3000)
      }
    } catch (error) {
      console.error('Erreur:', error)
      setNotification({ type: 'error', message: 'Erreur lors de la génération du lien' })
      setTimeout(() => setNotification(null), 3000)
    }
  }

  const handleExportCSV = async () => {
    try {
      const response = await fetch(`/api/lists/${params.id}/export`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${list?.title || 'liste'}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        setShowExportMenu(false)
        setNotification({ type: 'success', message: 'Export CSV réussi' })
        setTimeout(() => setNotification(null), 3000)
      } else {
        setNotification({ type: 'error', message: 'Erreur lors de l\'export CSV' })
        setTimeout(() => setNotification(null), 3000)
      }
    } catch (error) {
      console.error('Erreur:', error)
      setNotification({ type: 'error', message: 'Erreur lors de l\'export CSV' })
      setTimeout(() => setNotification(null), 3000)
    }
  }

  const handleExportPlaylist = async (format: 'm3u8' | 'csv') => {
    try {
      setShowExportMenu(false)
      setNotification({ type: 'success', message: 'Génération de la playlist en cours...' })
      
      const response = await fetch(`/api/lists/${params.id}/export-playlist?format=${format}`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        const extension = format === 'm3u8' ? 'm3u8' : 'csv'
        a.download = `${list?.title || 'playlist'}_playlist.${extension}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        
        setNotification({ 
          type: 'success', 
          message: `Playlist ${format.toUpperCase()} exportée avec succès` 
        })
        setTimeout(() => setNotification(null), 3000)
      } else {
        const errorData = await response.json()
        setNotification({ 
          type: 'error', 
          message: errorData.error || 'Erreur lors de l\'export de la playlist' 
        })
        setTimeout(() => setNotification(null), 5000)
      }
    } catch (error) {
      console.error('Erreur:', error)
      setNotification({ type: 'error', message: 'Erreur lors de l\'export de la playlist' })
      setTimeout(() => setNotification(null), 3000)
    }
  }

  const handleExportFull = async () => {
    try {
      const response = await fetch(`/api/lists/${params.id}/export-full`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${list?.title || 'liste'}_complete.json`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        setNotification({ type: 'success', message: 'Liste complète exportée avec succès !' })
        setTimeout(() => setNotification(null), 3000)
      }
    } catch (error) {
      console.error('Erreur lors de l\'export complet:', error)
      setNotification({ type: 'error', message: 'Erreur lors de l\'export' })
      setTimeout(() => setNotification(null), 3000)
    }
  }

  const handleExportImage = async (includeText: boolean = true, style: 'golden' | 'light' | 'dark' = 'golden') => {
    if (!list) return
    
    setIsExportingImage(true)
    setNotification({ type: 'success', message: 'Génération de l\'image en cours...' })

    try {
      // Fonction pour convertir une image externe en base64 via notre proxy
      const imageToDataUrl = async (url: string): Promise<string> => {
        try {
          const response = await fetch(`/api/proxy-image?url=${encodeURIComponent(url)}`)
          if (!response.ok) throw new Error('Échec du proxy')
          const data = await response.json()
          return data.dataUrl
        } catch (error) {
          console.error('Erreur conversion image:', error)
          return url // Fallback vers l'URL originale
        }
      }

      // Créer un conteneur temporaire pour l'export avec ligne par ligne
      const exportContainer = document.createElement('div')
      
      if (style === 'golden') {
        // Style avec cadre doré de galerie
        exportContainer.style.cssText = `
          position: fixed; 
          left: -9999px; 
          top: 0; 
          background: #ffffff; 
          padding: 60px;
          font-family: system-ui, -apple-system, sans-serif;
          border: 20px solid #8B7355;
          border-image: linear-gradient(135deg, #D4AF37 0%, #8B7355 25%, #6B5444 50%, #8B7355 75%, #D4AF37 100%) 1;
          box-shadow: 
            inset 0 0 0 2px #D4AF37,
            inset 0 0 0 4px #8B7355,
            inset 0 0 0 6px #D4AF37,
            0 10px 40px rgba(0,0,0,0.3),
            0 5px 15px rgba(0,0,0,0.2);
        `
      } else if (style === 'light') {
        // Style minimal avec fond clair
        exportContainer.style.cssText = `
          position: fixed; 
          left: -9999px; 
          top: 0; 
          background: #FAFAFA; 
          padding: 40px;
          font-family: system-ui, -apple-system, sans-serif;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        `
      } else {
        // Style avec fond noir et texte blanc
        exportContainer.style.cssText = `
          position: fixed; 
          left: -9999px; 
          top: 0; 
          background: #1a1a1a; 
          padding: 40px;
          font-family: system-ui, -apple-system, sans-serif;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.4);
        `
      }
      
      document.body.appendChild(exportContainer)

      // Grouper les albums par ligne
      const albumsPerRow = gridCols
      const rows: ListAlbum[][] = []
      for (let i = 0; i < list.listAlbums.length; i += albumsPerRow) {
        rows.push(list.listAlbums.slice(i, i + albumsPerRow))
      }

      // Créer chaque ligne avec les pochettes et les infos
      for (const row of rows) {
        const rowContainer = document.createElement('div')
        rowContainer.style.cssText = 'margin-bottom: 30px; display: flex; gap: 20px; align-items: flex-start;'
        
        // Conteneur pour les pochettes
        const coversContainer = document.createElement('div')
        coversContainer.style.cssText = `display: flex; gap: 10px; flex-shrink: 0;`
        
        // Ajouter chaque pochette (convertir en base64 via proxy)
        for (const listAlbum of row) {
          const coverDiv = document.createElement('div')
          coverDiv.style.cssText = 'width: 150px; height: 150px; flex-shrink: 0; background: #f3f4f6; border-radius: 4px; overflow: hidden;'
          
          if (listAlbum.album.coverImage) {
            const img = document.createElement('img')
            // Convertir l'image via notre proxy
            img.src = await imageToDataUrl(listAlbum.album.coverImage)
            img.style.cssText = 'width: 100%; height: 100%; object-fit: cover; display: block;'
            coverDiv.appendChild(img)
          }
          
          coversContainer.appendChild(coverDiv)
        }
        
        // Conteneur pour les infos textuelles (seulement si includeText est true)
        const infoContainer = document.createElement('div')
        infoContainer.style.cssText = includeText ? 'flex: 1; display: flex; flex-direction: column; gap: 8px; padding-top: 5px;' : 'display: none;'
        
        for (let i = 0; i < row.length; i++) {
          const listAlbum = row[i]
          const infoDiv = document.createElement('div')
          infoDiv.style.cssText = 'font-size: 14px; line-height: 1.4;'
          
          const rankSpan = document.createElement('span')
          rankSpan.style.cssText = style === 'dark' ? 'font-weight: 700; color: #f3f4f6; margin-right: 8px;' : 'font-weight: 700; color: #1f2937; margin-right: 8px;'
          rankSpan.textContent = `#${listAlbum.position + 1}`
          
          const artistSpan = document.createElement('span')
          artistSpan.style.cssText = style === 'dark' ? 'font-weight: 600; color: #e5e7eb;' : 'font-weight: 600; color: #374151;'
          artistSpan.textContent = listAlbum.album.artist
          
          const separator = document.createElement('span')
          separator.style.cssText = style === 'dark' ? 'color: #6b7280; margin: 0 6px;' : 'color: #9ca3af; margin: 0 6px;'
          separator.textContent = '—'
          
          const titleSpan = document.createElement('span')
          titleSpan.style.cssText = style === 'dark' ? 'color: #9ca3af;' : 'color: #6b7280;'
          titleSpan.textContent = listAlbum.album.title
          
          infoDiv.appendChild(rankSpan)
          infoDiv.appendChild(artistSpan)
          infoDiv.appendChild(separator)
          infoDiv.appendChild(titleSpan)
          
          infoContainer.appendChild(infoDiv)
        }
        
        rowContainer.appendChild(coversContainer)
        rowContainer.appendChild(infoContainer)
        exportContainer.appendChild(rowContainer)
      }

      // Attendre que toutes les images soient chargées
      const images = exportContainer.querySelectorAll('img')
      await Promise.all(
        Array.from(images).map(img => {
          if (img.complete && img.naturalHeight !== 0) return Promise.resolve()
          return new Promise((resolve) => {
            img.onload = () => resolve(true)
            img.onerror = () => resolve(false)
            setTimeout(() => resolve(false), 3000)
          })
        })
      )

      // Petit délai supplémentaire pour s'assurer que tout est rendu
      await new Promise(resolve => setTimeout(resolve, 300))

      // Capturer avec html2canvas (maintenant toutes les images sont en base64)
      const canvas = await html2canvas(exportContainer, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: false,
        allowTaint: false,
        imageTimeout: 0
      })

      // Nettoyer le conteneur temporaire
      document.body.removeChild(exportContainer)

      // Maintenant on peut utiliser toDataURL sans problème
      const dataUrl = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.href = dataUrl
      link.download = `${list.title.replace(/[^a-z0-9]/gi, '_')}_mosaique.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      setNotification({ type: 'success', message: 'Image exportée avec succès !' })
      setTimeout(() => setNotification(null), 3000)
    } catch (error) {
      console.error('Erreur lors de l\'export d\'image:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
      setNotification({ 
        type: 'error', 
        message: 'Erreur lors de l\'export de l\'image',
        details: [errorMessage, 'Vérifiez la console pour plus de détails']
      })
      setTimeout(() => setNotification(null), 5000)
    } finally {
      setIsExportingImage(false)
    }
  }

  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    setImportProgress('Préparation du fichier...')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`/api/lists/${params.id}/import`, {
        method: 'POST',
        body: formData
      })

      if (!response.body) {
        throw new Error('Pas de stream de réponse')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let finalResult: any = null

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n').filter(line => line.trim())

        for (const line of lines) {
          try {
            const data = JSON.parse(line)
            
            // Vérifier si c'est une erreur
            if (data.error) {
              setIsImporting(false)
              setImportProgress('')
              setNotification({ type: 'error', message: data.error })
              setTimeout(() => setNotification(null), 5000)
              event.target.value = ''
              return
            }
            
            // Vérifier si c'est une mise à jour de progression
            if (data.current !== undefined && data.total !== undefined) {
              setImportProgress(`${data.message} ${data.current}/${data.total}`)
              setImportCurrent(data.current)
              setImportTotal(data.total)
            }
            
            // Vérifier si c'est le résultat final
            if (data.success !== undefined) {
              finalResult = data
            }
          } catch (e) {
            console.error('Erreur de parsing JSON:', e, line)
          }
        }
      }

      if (finalResult) {
        const hasErrors = finalResult.errors && finalResult.errors.length > 0
        
        setImportProgress('Mise à jour de la liste...')
        await fetchList()
        
        setIsImporting(false)
        setImportProgress('')
        setImportCurrent(0)
        setImportTotal(0)
        
        setNotification({ 
          type: hasErrors ? 'error' : 'success', 
          message: finalResult.message,
          details: hasErrors ? finalResult.errors : undefined
        })
        setTimeout(() => setNotification(null), hasErrors ? 10000 : 5000)
      } else {
        setIsImporting(false)
        setImportProgress('')
        setImportCurrent(0)
        setImportTotal(0)
        setNotification({ type: 'error', message: 'Erreur lors de l\'import' })
        setTimeout(() => setNotification(null), 5000)
      }
    } catch (error) {
      console.error('Erreur lors de l\'import:', error)
      setIsImporting(false)
      setImportProgress('')
      setImportCurrent(0)
      setImportTotal(0)
      setNotification({ type: 'error', message: 'Erreur lors de l\'import du CSV' })
      setTimeout(() => setNotification(null), 5000)
    }
    
    // Reset input
    event.target.value = ''
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

  if (!list) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-gray-600 dark:text-gray-400">Liste non trouvée</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 gradient-bg">
      <Navbar />
      
      {/* Import Progress Modal */}
      {isImporting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Import en cours...
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {importProgress}
              </p>
              <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-blue-600 rounded-full transition-all duration-300" 
                  style={{ width: importTotal > 0 ? `${(importCurrent / importTotal) * 100}%` : '0%' }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Partager la liste
              </h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Lien de partage
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={`${window.location.origin}/lists/${params.id}/share`}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white text-sm"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  Copier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Confirmer la suppression
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Êtes-vous sûr de vouloir retirer <span className="font-semibold text-gray-900 dark:text-white">{deleteConfirm.artist} - {deleteConfirm.albumTitle}</span> de cette liste ?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Supprimer
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Album Details Modal */}
      {selectedAlbumId && (
        <AlbumDetailsModal
          albumId={selectedAlbumId}
          onClose={() => setSelectedAlbumId(null)}
        />
      )}
      
      {/* Notification */}
      {notification && (
        <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-top-5 duration-300 max-w-md">
          <div className={`rounded-lg shadow-lg p-4 ${
            notification.type === 'success' 
              ? 'bg-green-600 text-white' 
              : 'bg-red-600 text-white'
          }`}>
            <div className="flex items-start">
              <div className="flex-1">
                <p className="font-medium mb-1">{notification.message}</p>
                {notification.details && notification.details.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-white/20">
                    <p className="text-sm font-semibold mb-1">Détails des erreurs :</p>
                    <div className="text-sm space-y-1 max-h-60 overflow-y-auto">
                      {notification.details.map((error, index) => (
                        <div key={index} className="text-white/90">
                          • {error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => setNotification(null)}
                className="ml-4 text-white hover:text-gray-200 transition-colors flex-shrink-0"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href={session?.user ? "/lists" : "/explore"}
          className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-6 font-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {session?.user ? "Retour aux listes" : "Retour à l'exploration"}
        </Link>

        {/* Header compact avec actions sticky */}
        <div className="glass rounded-xl p-5 mb-6 sticky top-16 z-30 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Titre et metadata */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white truncate">
                  {list.title}
                </h1>
                <div className="flex items-center gap-2 flex-wrap">
                  {list.isPublic ? (
                    <div className="inline-flex items-center px-2 py-0.5 bg-green-100 dark:bg-green-900/30 rounded text-xs font-medium text-green-700 dark:text-green-400">
                      <Globe className="h-3 w-3 mr-1" />
                      Public
                    </div>
                  ) : (
                    <div className="inline-flex items-center px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs font-medium text-gray-600 dark:text-gray-400">
                      <Lock className="h-3 w-3 mr-1" />
                      Privé
                    </div>
                  )}
                  {list.period && (
                    <div className="inline-flex items-center px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs text-gray-600 dark:text-gray-400">
                      <Calendar className="h-3 w-3 mr-1" />
                      {list.period}
                    </div>
                  )}
                  {list.isRanked !== false && (
                    <div className="inline-flex items-center px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 rounded text-xs font-medium text-purple-700 dark:text-purple-400">
                      Classée
                    </div>
                  )}
                  <span className="inline-flex items-center px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 rounded text-xs font-medium text-blue-700 dark:text-blue-400">
                    {list.listAlbums.length} albums
                  </span>
                </div>
              </div>
              {list.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                  {list.description}
                </p>
              )}
            </div>

            {/* Actions compactes */}
            {isOwner && (
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => setShowShareModal(true)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-700 dark:text-gray-300"
                  title="Partager"
                >
                  <Share2 className="h-4 w-4" />
                </button>
                
                <div className="relative" data-export-menu>
                  <button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-700 dark:text-gray-300 disabled:opacity-50"
                    title="Exporter"
                    disabled={isImporting}
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  {showExportMenu && (
                    <div className="absolute right-0 mt-1 w-52 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 border border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => {
                        handleExportCSV()
                        setShowExportMenu(false)
                      }}
                      disabled={isImporting}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-t-lg flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      <div>
                        <div className="font-medium text-xs">CSV</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Albums uniquement</div>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        handleExportFull()
                        setShowExportMenu(false)
                      }}
                      disabled={isImporting}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      <div>
                        <div className="font-medium text-xs">JSON</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Liste complète</div>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setShowExportImageModal(true)
                        setShowExportMenu(false)
                      }}
                      disabled={isImporting || isExportingImage || viewMode !== 'grid'}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      <ImageIcon className="h-4 w-4" />
                      <div>
                        <div className="font-medium text-xs">Image PNG</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Mosaïque de pochettes</div>
                      </div>
                    </button>
                    <button
                      onClick={() => handleExportPlaylist('m3u8')}
                      disabled={isImporting}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      <Download className="h-4 w-4" />
                      <div>
                        <div className="font-medium text-xs">Playlist M3U8</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Format universel</div>
                      </div>
                    </button>
                    <button
                      onClick={() => handleExportPlaylist('csv')}
                      disabled={isImporting}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-b-lg flex items-center gap-2 disabled:opacity-50"
                    >
                      <Download className="h-4 w-4" />
                      <div>
                        <div className="font-medium text-xs">Playlist CSV</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Avec tracklist complète</div>
                      </div>
                    </button>
                    </div>
                  )}
                </div>

                <label className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-700 dark:text-gray-300 ${isImporting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  title="Importer CSV"
                >
                  <Upload className="h-4 w-4" />
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleImportCSV}
                    disabled={isImporting}
                    className="hidden"
                  />
                </label>

                <div className="h-5 w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>

                <Link
                  href={`/lists/${list.id}/edit`}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-700 dark:text-gray-300"
                  title="Modifier"
                >
                  <Edit className="h-4 w-4" />
                </Link>

                <div className="relative">
                  <button
                    onClick={() => setShowActionsMenu(!showActionsMenu)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-700 dark:text-gray-300"
                    title="Plus d'options"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                  {showActionsMenu && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowActionsMenu(false)}></div>
                      <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 border border-gray-200 dark:border-gray-700 py-1">
                        {list.sourceUrl && (
                          <a
                            href={list.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 text-gray-700 dark:text-gray-300"
                          >
                            <Globe className="h-4 w-4" />
                            Source originale
                          </a>
                        )}
                        {list.isPublic && (
                          <Link
                            href={`/lists/${list.id}/share`}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 text-gray-700 dark:text-gray-300"
                          >
                            <Eye className="h-4 w-4" />
                            Vue partage
                          </Link>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {isOwner && (
          <div className="glass rounded-2xl p-6 mb-6 relative z-20">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Ajouter un album
            </h2>
            <AlbumSearch onSelectAlbum={handleAddAlbum} />
          </div>
        )}

        {/* View Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
              aria-label="Vue mosaïque"
            >
              <Grid3x3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
              aria-label="Vue liste"
            >
              <ListIcon className="h-4 w-4" />
            </button>
          </div>
          
          {viewMode === 'grid' && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-gray-600 dark:text-gray-400 mr-1">Colonnes:</span>
              {/* Options mobiles (2-4) */}
              <div className="flex items-center gap-0.5 sm:hidden">
                {[2, 3, 4].map((cols) => (
                  <button
                    key={cols}
                    onClick={() => setGridCols(cols)}
                    className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                      gridCols === cols
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {cols}
                  </button>
                ))}
              </div>
              {/* Options tablette (2-6) */}
              <div className="hidden sm:flex md:hidden items-center gap-0.5">
                {[2, 3, 4, 5, 6].map((cols) => (
                  <button
                    key={cols}
                    onClick={() => setGridCols(cols)}
                    className={`px-2.5 py-1 rounded text-xs transition-all ${
                      gridCols === cols
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {cols}
                  </button>
                ))}
              </div>
              {/* Options desktop (2-8) */}
              <div className="hidden md:flex items-center gap-0.5">
                {[2, 3, 4, 5, 6, 7, 8].map((cols) => (
                  <button
                    key={cols}
                    onClick={() => setGridCols(cols)}
                    className={`px-2.5 py-1 rounded text-xs transition-all ${
                      gridCols === cols
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {cols}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>


        <div className={viewMode === 'grid' ? '' : 'space-y-4'}>
          {list.listAlbums.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                {isOwner
                  ? 'Commencez à ajouter des albums à votre liste !'
                  : 'Cette liste ne contient pas encore d\'albums.'}
              </p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={list.listAlbums.map((item) => item.id)}
                strategy={viewMode === 'grid' ? rectSortingStrategy : verticalListSortingStrategy}
                disabled={!isOwner}
              >
                {viewMode === 'grid' ? (
                  <div 
                    data-export-grid
                    className="grid gap-4"
                    style={{
                      gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`
                    }}
                  >
                    {list.listAlbums.map((listAlbum, index) => (
                      <AlbumGridItem
                        key={listAlbum.id}
                        listAlbumId={listAlbum.id}
                        album={listAlbum.album}
                        position={index}
                        onRemove={handleRemoveAlbum}
                        onShowDetails={setSelectedAlbumId}
                        showRank={list.isRanked !== false}
                        isOwner={isOwner}
                      />
                    ))}
                  </div>
                ) : (
                  <>
                    {list.listAlbums.map((listAlbum, index) => (
                      <SortableAlbumItem
                        key={listAlbum.id}
                        listAlbumId={listAlbum.id}
                        album={listAlbum.album}
                        position={index}
                        onRemove={isOwner ? handleRemoveAlbum : () => {}}
                        showRank={list.isRanked !== false}
                      />
                    ))}
                  </>
                )}
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>

      {/* Modal d'export d'image */}
      {showExportImageModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Exporter en image
              </h3>
              <button
                onClick={() => setShowExportImageModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Option texte */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={exportImageIncludeText}
                    onChange={(e) => setExportImageIncludeText(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      Inclure les informations textuelles
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Afficher le rang, l'artiste et le titre
                    </div>
                  </div>
                </label>
              </div>

              {/* Option style */}
              <div>
                <div className="font-medium text-gray-900 dark:text-white mb-3">
                  Style de fond
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50 group"
                    style={{
                      borderColor: exportImageStyle === 'golden' ? '#3b82f6' : 'transparent',
                      backgroundColor: exportImageStyle === 'golden' ? 'rgba(59, 130, 246, 0.05)' : 'transparent'
                    }}
                  >
                    <input
                      type="radio"
                      name="frameStyle"
                      checked={exportImageStyle === 'golden'}
                      onChange={() => setExportImageStyle('golden')}
                      className="w-5 h-5 text-blue-600 cursor-pointer"
                    />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        🖼️ Cadre doré de galerie
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Style luxueux avec bordure dorée
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50 group"
                    style={{
                      borderColor: exportImageStyle === 'light' ? '#3b82f6' : 'transparent',
                      backgroundColor: exportImageStyle === 'light' ? 'rgba(59, 130, 246, 0.05)' : 'transparent'
                    }}
                  >
                    <input
                      type="radio"
                      name="frameStyle"
                      checked={exportImageStyle === 'light'}
                      onChange={() => setExportImageStyle('light')}
                      className="w-5 h-5 text-blue-600 cursor-pointer"
                    />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        ☁️ Fond clair minimal
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Style moderne et épuré
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50 group"
                    style={{
                      borderColor: exportImageStyle === 'dark' ? '#3b82f6' : 'transparent',
                      backgroundColor: exportImageStyle === 'dark' ? 'rgba(59, 130, 246, 0.05)' : 'transparent'
                    }}
                  >
                    <input
                      type="radio"
                      name="frameStyle"
                      checked={exportImageStyle === 'dark'}
                      onChange={() => setExportImageStyle('dark')}
                      className="w-5 h-5 text-blue-600 cursor-pointer"
                    />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        🌙 Fond noir élégant
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Texte blanc sur fond sombre
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowExportImageModal(false)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  handleExportImage(exportImageIncludeText, exportImageStyle)
                  setShowExportImageModal(false)
                }}
                disabled={isExportingImage}
                className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isExportingImage ? 'Export en cours...' : 'Exporter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
