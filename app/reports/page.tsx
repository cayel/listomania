'use client'

import { useEffect, useState, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { FileText, Download, CheckSquare, Square, Loader2, FileSpreadsheet, FileType, SlidersHorizontal, X, ArrowUpDown } from 'lucide-react'

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
  categories?: ListCategory[]
  _count: {
    listAlbums: number
  }
  createdAt: string
  updatedAt: string
}

export default function ReportsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [allLists, setAllLists] = useState<List[]>([])
  const [selectedLists, setSelectedLists] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [reportData, setReportData] = useState<any>(null)
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  
  // États pour les filtres
  const [showFilters, setShowFilters] = useState(false)
  const [filterVisibility, setFilterVisibility] = useState<'all' | 'public' | 'private'>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterPeriod, setFilterPeriod] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'title' | 'updated' | 'albums' | 'period'>('title')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  
  // Extraire les catégories et périodes uniques
  const categories = useMemo(() => {
    const cats = new Set<string>()
    allLists.forEach(list => {
      list.categories?.forEach(lc => cats.add(lc.category.name))
    })
    return Array.from(cats).sort()
  }, [allLists])
  
  const periods = useMemo(() => {
    const pers = new Set<string>()
    allLists.forEach(list => {
      if (list.period) pers.add(list.period)
    })
    return Array.from(pers).sort()
  }, [allLists])
  
  // Listes filtrées et triées
  const lists = useMemo(() => {
    let filtered = [...allLists]
    
    // Filtre visibilité
    if (filterVisibility === 'public') {
      filtered = filtered.filter(l => l.isPublic)
    } else if (filterVisibility === 'private') {
      filtered = filtered.filter(l => !l.isPublic)
    }
    
    // Filtre catégorie
    if (filterCategory !== 'all') {
      filtered = filtered.filter(l => 
        l.categories?.some(lc => lc.category.name === filterCategory)
      )
    }
    
    // Filtre période
    if (filterPeriod !== 'all') {
      filtered = filtered.filter(l => l.period === filterPeriod)
    }
    
    // Tri
    filtered.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title)
          break
        case 'updated':
          comparison = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          break
        case 'albums':
          comparison = a._count.listAlbums - b._count.listAlbums
          break
        case 'period':
          comparison = (a.period || '').localeCompare(b.period || '')
          break
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })
    
    return filtered
  }, [allLists, filterVisibility, filterCategory, filterPeriod, sortBy, sortOrder])

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
      const res = await fetch('/api/lists')
      if (res.ok) {
        const data = await res.json()
        setAllLists(data)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des listes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleListSelection = (listId: string) => {
    const newSelected = new Set(selectedLists)
    if (newSelected.has(listId)) {
      newSelected.delete(listId)
    } else {
      newSelected.add(listId)
    }
    setSelectedLists(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedLists.size === lists.length) {
      setSelectedLists(new Set())
    } else {
      setSelectedLists(new Set(lists.map(l => l.id)))
    }
  }
  
  const resetFilters = () => {
    setFilterVisibility('all')
    setFilterCategory('all')
    setFilterPeriod('all')
    setSortBy('title')
    setSortOrder('asc')
  }
  
  const hasActiveFilters = () => {
    return filterVisibility !== 'all' || filterCategory !== 'all' || filterPeriod !== 'all'
  }

  const generateReport = async () => {
    if (selectedLists.size === 0) {
      showNotification('error', 'Veuillez sélectionner au moins une liste')
      return
    }

    setIsGenerating(true)
    try {
      const res = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listIds: Array.from(selectedLists),
          sortBy,
          sortOrder
        })
      })

      if (res.ok) {
        const data = await res.json()
        setReportData(data)
        showNotification('success', 'Rapport généré avec succès')
      } else {
        throw new Error('Erreur lors de la génération du rapport')
      }
    } catch (error) {
      showNotification('error', 'Erreur lors de la génération du rapport')
      console.error(error)
    } finally {
      setIsGenerating(false)
    }
  }

  const exportToCSV = () => {
    if (!reportData) return

    let csv = 'Liste,Artiste,Titre,Année\n'
    
    reportData.lists.forEach((list: any) => {
      list.albums.forEach((album: any) => {
        const listTitle = `"${list.title.replace(/"/g, '""')}"`
        const artist = `"${album.artist.replace(/"/g, '""')}"`
        const title = `"${album.title.replace(/"/g, '""')}"`
        const year = album.year || ''
        csv += `${listTitle},${artist},${title},${year}\n`
      })
    })

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `rapport-ranklist-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    showNotification('success', 'Rapport CSV téléchargé')
  }

  const exportToText = () => {
    if (!reportData) return

    let text = '═══════════════════════════════════════════════════════\n'
    text += '            RAPPORT DE LISTES RANKLIST\n'
    text += '═══════════════════════════════════════════════════════\n\n'
    text += `Généré le ${new Date().toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    })}\n`
    text += `Nombre de listes: ${reportData.lists.length}\n`
    text += `Total d'albums: ${reportData.totalAlbums}\n\n`

    reportData.lists.forEach((list: any, index: number) => {
      text += `\n${'─'.repeat(55)}\n`
      text += `${index + 1}. ${list.title.toUpperCase()}\n`
      text += `${'─'.repeat(55)}\n`
      if (list.description) {
        text += `Description: ${list.description}\n`
      }
      if (list.period) {
        text += `Période: ${list.period}\n`
      }
      text += `Nombre d'albums: ${list.albums.length}\n\n`

      list.albums.forEach((album: any, albumIndex: number) => {
        text += `   ${(albumIndex + 1).toString().padStart(3, ' ')}. ${album.artist} - ${album.title}`
        if (album.year) {
          text += ` (${album.year})`
        }
        text += '\n'
      })
      text += '\n'
    })

    text += '\n═══════════════════════════════════════════════════════\n'
    text += '                   FIN DU RAPPORT\n'
    text += '═══════════════════════════════════════════════════════\n'

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `rapport-ranklist-${new Date().toISOString().split('T')[0]}.txt`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    showNotification('success', 'Rapport texte téléchargé')
  }

  const exportToHTML = () => {
    if (!reportData) return

    let html = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rapport RankList</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', monospace;
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
            background: #1a1a1a;
            color: #e0e0e0;
            line-height: 1.4;
        }
        .header {
            background: #2a2a2a;
            border: 1px solid #404040;
            padding: 20px;
            margin-bottom: 20px;
        }
        .header::before {
            content: '$ ranklist report --generate';
            display: block;
            color: #808080;
            font-size: 0.85em;
            margin-bottom: 8px;
        }
        .header h1 {
            color: #ffffff;
            font-size: 1.5em;
            font-weight: normal;
            margin-bottom: 10px;
        }
        .header .meta {
            color: #808080;
            font-size: 0.85em;
            line-height: 1.6;
        }
        .list-section {
            background: #2a2a2a;
            border: 1px solid #404040;
            padding: 15px;
            margin-bottom: 15px;
        }
        .list-section h2 {
            color: #ffffff;
            font-size: 1.2em;
            font-weight: normal;
            margin-bottom: 8px;
            padding: 5px 0;
            border-bottom: 1px solid #404040;
        }
        .list-meta {
            color: #808080;
            margin: 5px 0 10px 0;
            font-size: 0.85em;
        }
        .albums-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
            gap: 10px;
            margin-top: 15px;
        }
        .covers-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 8px;
          margin-top: 12px;
        }
        .album-card {
            background: #1f1f1f;
            border: 1px solid #333333;
            overflow: hidden;
            transition: border-color 0.2s ease;
            aspect-ratio: 1;
        }
        .album-card:hover {
            border-color: #555555;
        }
        .album-cover {
            width: 100%;
            height: 100%;
            background: #2a2a2a;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #666666;
            font-size: 2em;
            position: relative;
        }
        .album-cover img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            filter: grayscale(20%) contrast(0.95);
        }
        .album-cover::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(180deg, transparent 50%, rgba(26, 26, 26, 0.3) 100%);
            pointer-events: none;
        }
        .album-position {
            position: absolute;
            top: 6px;
            left: 6px;
            background: rgba(26, 26, 26, 0.85);
            color: #ffffff;
            padding: 3px 8px;
            font-size: 0.7em;
            font-family: monospace;
            z-index: 10;
            border: 1px solid #404040;
        }
        .album-position::before {
            content: '#';
        }
        .album-info {
            padding: 8px;
        }

        .album-details {
          margin-top: 10px;
          padding: 8px 6px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          border-top: 1px solid #333333;
          background: transparent;
        }
        .album-detail-row {
          display: flex;
          gap: 8px;
          align-items: baseline;
          font-size: 0.85em;
          color: #e0e0e0;
          overflow: hidden;
          white-space: nowrap;
        }
        .album-detail-pos {
          color: #808080;
          width: 28px;
          font-family: monospace;
          flex: 0 0 28px;
        }
        .album-detail-title {
          font-weight: normal;
          color: #ffffff;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .album-detail-sep {
          color: #666666;
          margin: 0 6px;
        }
        .album-detail-artist {
          color: #b0b0b0;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .album-detail-year {
          color: #808080;
          margin-left: 6px;
          flex: 0 0 auto;
        }
        .album-title {
            font-weight: normal;
            font-size: 0.85em;
            margin: 4px 0;
            color: #ffffff;
            line-height: 1.2;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
        }
        .album-artist {
            color: #b0b0b0;
            font-size: 0.75em;
            margin: 3px 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .album-year {
            color: #808080;
            font-size: 0.7em;
            margin-top: 3px;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            padding: 15px;
            border-top: 1px solid #404040;
            color: #808080;
            font-size: 0.8em;
        }
        .footer::before {
            content: '// ';
        }
        @media print {
            body {
                background: white;
                color: black;
            }
            .header {
                background: white;
                border: 1px solid #ccc;
            }
            .header::before {
                color: #666;
            }
            .header h1 {
                color: black;
            }
            .header .meta {
                color: #666;
            }
            .list-section {
                background: white;
                border: 1px solid #ccc;
                page-break-inside: avoid;
            }
            .list-section h2 {
                color: black;
                border-bottom-color: #ccc;
            }
            .list-meta {
                color: #666;
            }
            .albums-grid {
                grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
                gap: 8px;
            }
            .album-card {
                border: 1px solid #ccc;
                break-inside: avoid;
            }
            .album-card:hover {
                border-color: #ccc;
            }
            .album-cover {
                height: 120px;
                border-bottom-color: #ccc;
                background: #f5f5f5;
            }
            .album-cover img {
                filter: none;
            }
            .album-cover::after {
                display: none;
            }
            .album-position {
                background: rgba(255, 255, 255, 0.9);
                color: #000;
                border-color: #ccc;
            }
            .album-title {
                color: black;
            }
            .album-artist {
                color: #333;
            }
            .album-year {
                color: #666;
            }
            .footer {
                border-top-color: #ccc;
                color: #666;
            }
        }
        @media (max-width: 1200px) {
            .covers-grid {
                grid-template-columns: repeat(5, 1fr);
            }
        }
        @media (max-width: 768px) {
            .covers-grid {
                grid-template-columns: repeat(4, 1fr);
                gap: 6px;
            }
            .albums-grid {
                grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
                gap: 8px;
            }
        }
        @media (max-width: 480px) {
            .covers-grid {
                grid-template-columns: repeat(3, 1fr);
                gap: 4px;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>RankList Report</h1>
        <div class="meta">
            Generated: ${new Date().toLocaleDateString('fr-FR', { 
              day: '2-digit', 
              month: '2-digit', 
              year: 'numeric'
            })} ${new Date().toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit'
            })}<br>
            Lists: ${reportData.lists.length} | Albums: ${reportData.totalAlbums}
        </div>
    </div>
`

    reportData.lists.forEach((list: any, index: number) => {
      html += `
    <div class="list-section">
        <h2>${index + 1}. ${list.title}</h2>
        ${list.description ? `<div class="list-meta">${list.description}</div>` : ''}
        ${list.period ? `<div class="list-meta">📅 Période: ${list.period}</div>` : ''}
        <div class="list-meta">🎵 ${list.albums.length} album(s)</div>
        <div class="covers-grid">
`;

      // Affiche d'abord toutes les pochettes en compact
      list.albums.forEach((album: any, albumIndex: number) => {
        const coverUrl = album.coverImage || ''
        html += `
          <div class="album-card">
            <div class="album-cover">
              <span class="album-position">${albumIndex + 1}</span>
              ${coverUrl ? `<img src="${coverUrl}" alt="${album.title}" onerror="this.parentElement.innerHTML='🎵'" loading="lazy">` : '🎵'}
            </div>
          </div>
`;
      })

      // fermer la grille de pochettes
      html += `
        </div>
`;

      // puis afficher les détails (titre - artiste - année) sous forme compacte
      html += `
        <div class="album-details">
`;
      list.albums.forEach((album: any, albumIndex: number) => {
        html += `
          <div class="album-detail-row">
            <span class="album-detail-pos">${(albumIndex + 1).toString().padStart(2, ' ')}.</span>
            <span class="album-detail-artist">${album.artist}</span>
            <span class="album-detail-sep"> - </span>
            <span class="album-detail-title">${album.title}</span>
            ${album.year ? `<span class="album-detail-year"> (${album.year})</span>` : ''}
          </div>
`;
      })

      html += `
        </div>
      </div>
`;
    })

    html += `
    <div class="footer">
        Rapport généré par RankList • ${new Date().getFullYear()}
    </div>
</body>
</html>`

    const blob = new Blob([html], { type: 'text/html;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `rapport-ranklist-${new Date().toISOString().split('T')[0]}.html`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    showNotification('success', 'Rapport HTML téléchargé')
  }

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 3000)
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <Navbar />
      
      {notification && (
        <div className={`fixed top-20 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
          notification.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          {notification.message}
        </div>
      )}

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            📊 Génération de Rapports
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Sélectionnez vos listes et générez un rapport détaillé de vos albums
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panneau de sélection des listes */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                    Mes Listes ({lists.length}{allLists.length !== lists.length && ` sur ${allLists.length}`})
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        showFilters || hasActiveFilters()
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700'
                      }`}
                    >
                      <SlidersHorizontal className="h-4 w-4" />
                      Filtres
                      {hasActiveFilters() && (
                        <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                          {[filterVisibility !== 'all', filterCategory !== 'all', filterPeriod !== 'all'].filter(Boolean).length}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={toggleSelectAll}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {selectedLists.size === lists.length ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                      {selectedLists.size === lists.length ? 'Tout désélectionner' : 'Tout sélectionner'}
                    </button>
                  </div>
                </div>

                {/* Panneau de filtres */}
                {showFilters && (
                  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Filtre Visibilité */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Visibilité
                        </label>
                        <select
                          value={filterVisibility}
                          onChange={(e) => setFilterVisibility(e.target.value as any)}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="all">Toutes</option>
                          <option value="public">Publiques</option>
                          <option value="private">Privées</option>
                        </select>
                      </div>

                      {/* Filtre Catégorie */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Catégorie
                        </label>
                        <select
                          value={filterCategory}
                          onChange={(e) => setFilterCategory(e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="all">Toutes</option>
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>

                      {/* Filtre Période */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Période
                        </label>
                        <select
                          value={filterPeriod}
                          onChange={(e) => setFilterPeriod(e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="all">Toutes</option>
                          {periods.map(period => (
                            <option key={period} value={period}>{period}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Tri par */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Trier par
                        </label>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as any)}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="title">Titre</option>
                          <option value="updated">Dernière modification</option>
                          <option value="albums">Nombre d'albums</option>
                          <option value="period">Période</option>
                        </select>
                      </div>

                      {/* Ordre de tri */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Ordre
                        </label>
                        <button
                          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                          <ArrowUpDown className="h-4 w-4" />
                          {sortOrder === 'asc' ? 'Croissant (A→Z)' : 'Décroissant (Z→A)'}
                        </button>
                      </div>
                    </div>

                    {/* Bouton réinitialiser */}
                    {hasActiveFilters() && (
                      <div className="flex justify-end">
                        <button
                          onClick={resetFilters}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                        >
                          <X className="h-4 w-4" />
                          Réinitialiser les filtres
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="divide-y divide-slate-200 dark:divide-slate-700 max-h-[600px] overflow-y-auto">
                {lists.length === 0 ? (
                  <div className="p-12 text-center">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                    <p className="text-slate-600 dark:text-slate-400">Aucune liste disponible</p>
                  </div>
                ) : (
                  lists.map(list => (
                    <div
                      key={list.id}
                      onClick={() => toggleListSelection(list.id)}
                      className={`p-4 cursor-pointer transition-colors ${
                        selectedLists.has(list.id)
                          ? 'bg-blue-50 dark:bg-blue-900/20'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {selectedLists.has(list.id) ? (
                            <CheckSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          ) : (
                            <Square className="h-5 w-5 text-slate-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                            {list.title}
                          </h3>
                          {list.description && (
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                              {list.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-500">
                            {list.period && (
                              <span className="flex items-center gap-1">
                                📅 {list.period}
                              </span>
                            )}
                            <span>🎵 {list._count.listAlbums} albums</span>
                            {list.categories && list.categories.length > 0 && (
                              <span className="flex items-center gap-1">
                                🏷️ {list.categories.map(lc => lc.category.name).join(', ')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Panneau d'action */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 sticky top-4">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                Actions
              </h2>

              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    <span className="font-semibold text-lg text-blue-600 dark:text-blue-400">
                      {selectedLists.size}
                    </span>
                    {' '}liste(s) sélectionnée(s)
                  </p>
                </div>

                <button
                  onClick={generateReport}
                  disabled={selectedLists.size === 0 || isGenerating}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Génération...
                    </>
                  ) : (
                    <>
                      <FileText className="h-5 w-5" />
                      Générer le rapport
                    </>
                  )}
                </button>

                {reportData && (
                  <>
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                      <h3 className="font-medium text-slate-900 dark:text-white mb-3">
                        Exporter le rapport
                      </h3>
                      <div className="space-y-2">
                        <button
                          onClick={exportToHTML}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                        >
                          <FileType className="h-4 w-4" />
                          HTML (Impression)
                        </button>
                        <button
                          onClick={exportToCSV}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                        >
                          <FileSpreadsheet className="h-4 w-4" />
                          CSV (Excel)
                        </button>
                        <button
                          onClick={exportToText}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium"
                        >
                          <Download className="h-4 w-4" />
                          Texte (.txt)
                        </button>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                      <h3 className="font-medium text-slate-900 dark:text-white mb-2">
                        Statistiques du rapport
                      </h3>
                      <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                        <div className="flex justify-between">
                          <span>Total d'albums:</span>
                          <span className="font-semibold">{reportData.totalAlbums}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Listes incluses:</span>
                          <span className="font-semibold">{reportData.lists.length}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
