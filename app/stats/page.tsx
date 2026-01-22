'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { BarChart3, TrendingUp, Calendar, Music, Users, List as ListIcon, Globe, Lock, Award } from 'lucide-react'

interface Stats {
  overview: {
    totalLists: number
    totalAlbums: number
    uniqueAlbums: number
    publicLists: number
    privateLists: number
    avgAlbumsPerList: number
    longestList: { title: string, length: number }
    oldestYear: number | null
    newestYear: number | null
    oldestListDate: string | null
    newestListDate: string | null
  }
  listsByPeriod: Record<string, number>
  albumsByDecade: Record<string, number>
  albumsByYear: Record<string, number>
  topArtists: Array<{ artist: string, count: number }>
  topAlbums: Array<{ title: string, artist: string, count: number }>
}

export default function StatsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchStats()
    }
  }, [status])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/user/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-gray-500 dark:text-gray-400">
            Aucune statistique disponible
          </p>
        </div>
      </div>
    )
  }

  const { overview, listsByPeriod, albumsByDecade, topArtists, topAlbums } = stats

  // Préparer les données pour les graphiques
  const decadeData = Object.entries(albumsByDecade)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([decade, count]) => ({ decade, count }))

  const maxDecadeCount = Math.max(...decadeData.map(d => d.count), 1)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-blue-500" />
            Mes Statistiques
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Analyse de vos listes et albums musicaux
          </p>
        </div>

        {/* Vue d'ensemble */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-500 dark:text-gray-400 text-sm">Listes</p>
              <ListIcon className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {overview.totalLists}
            </p>
            <div className="mt-2 flex gap-2 text-xs">
              <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                <Globe className="h-3 w-3" /> {overview.publicLists}
              </span>
              <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                <Lock className="h-3 w-3" /> {overview.privateLists}
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-500 dark:text-gray-400 text-sm">Albums</p>
              <Music className="h-5 w-5 text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {overview.totalAlbums}
            </p>
            <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
              {overview.uniqueAlbums} albums uniques
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-500 dark:text-gray-400 text-sm">Moyenne</p>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {overview.avgAlbumsPerList}
            </p>
            <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
              albums par liste
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-500 dark:text-gray-400 text-sm">Période</p>
              <Calendar className="h-5 w-5 text-orange-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {overview.oldestYear && overview.newestYear 
                ? `${overview.newestYear - overview.oldestYear + 1}`
                : '0'}
            </p>
            <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
              {overview.oldestYear} - {overview.newestYear}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Albums par décennie */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              Albums par décennie
            </h2>
            <div className="space-y-3">
              {decadeData.map(({ decade, count }) => (
                <div key={decade}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {decade}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {count} albums
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(count / maxDecadeCount) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
              {decadeData.length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                  Aucune donnée disponible
                </p>
              )}
            </div>
          </div>

          {/* Listes par période */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <ListIcon className="h-5 w-5 text-purple-500" />
              Listes par période
            </h2>
            <div className="space-y-3">
              {Object.entries(listsByPeriod)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([period, count]) => (
                  <div key={period} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {period}
                    </span>
                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
                      {count}
                    </span>
                  </div>
                ))}
              {Object.keys(listsByPeriod).length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                  Aucune période définie
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top artistes */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-green-500" />
              Top 10 Artistes
            </h2>
            <div className="space-y-2">
              {topArtists.map((item, index) => (
                <div
                  key={item.artist}
                  className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 text-xs font-bold text-gray-700 dark:text-gray-300">
                    {index + 1}
                  </span>
                  <span className="flex-1 text-sm text-gray-900 dark:text-white truncate">
                    {item.artist}
                  </span>
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                    {item.count}
                  </span>
                </div>
              ))}
              {topArtists.length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                  Aucun artiste trouvé
                </p>
              )}
            </div>
          </div>

          {/* Albums favoris (présents dans plusieurs listes) */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              Albums Favoris
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Albums présents dans plusieurs listes
            </p>
            <div className="space-y-3">
              {topAlbums.filter(a => a.count > 1).map((item, index) => (
                <div
                  key={`${item.artist}-${item.title}`}
                  className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-start gap-2">
                    <span className="flex items-center justify-center min-w-6 h-6 rounded-full bg-yellow-100 dark:bg-yellow-900 text-xs font-bold text-yellow-700 dark:text-yellow-300">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        {item.artist}
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded-full text-xs font-bold">
                      ×{item.count}
                    </span>
                  </div>
                </div>
              ))}
              {topAlbums.filter(a => a.count > 1).length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                  Aucun album dans plusieurs listes
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Record */}
        {overview.longestList.length > 0 && (
          <div className="mt-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <Award className="h-6 w-6" />
              <h2 className="text-xl font-semibold">Record</h2>
            </div>
            <p className="text-lg">
              Votre liste la plus longue : <span className="font-bold">{overview.longestList.title}</span>
            </p>
            <p className="text-sm opacity-90">
              {overview.longestList.length} albums
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
