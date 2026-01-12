import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { Music, List, Share2, TrendingUp, Sparkles } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center py-20 relative">
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-blue-500/20 to-purple-500/20 dark:from-blue-500/10 dark:to-purple-500/10 rounded-full blur-3xl"></div>
          </div>
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
            <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Créez vos listes musicales</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent mb-6">
            Vos albums,
            <br />
            votre classement
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Organisez, classez et partagez vos albums préférés avec une interface moderne et intuitive.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/auth/signup"
              className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl text-lg font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all"
            >
              <span className="relative z-10">Commencer gratuitement</span>
            </Link>
            <Link
              href="/explore"
              className="px-8 py-4 glass hover:bg-white/90 dark:hover:bg-white/10 rounded-xl text-lg font-semibold text-gray-900 dark:text-white transition-all"
            >
              Explorer les listes
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 py-16">
          <div className="group p-6 glass rounded-2xl hover:shadow-xl transition-all">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mb-4 group-hover:scale-110 transition-transform">
              <Music className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Base Discogs
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              Accédez à la vaste base de données Discogs pour trouver tous vos albums.
            </p>
          </div>

          <div className="group p-6 glass rounded-2xl hover:shadow-xl transition-all">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl mb-4 group-hover:scale-110 transition-transform">
              <List className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Drag & Drop
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              Organisez facilement vos albums par glisser-déposer pour créer votre classement parfait.
            </p>
          </div>

          <div className="group p-6 glass rounded-2xl hover:shadow-xl transition-all">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl mb-4 group-hover:scale-110 transition-transform">
              <Share2 className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Partage social
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              Rendez vos listes publiques et partagez vos découvertes musicales avec la communauté.
            </p>
          </div>

          <div className="group p-6 glass rounded-2xl hover:shadow-xl transition-all">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl mb-4 group-hover:scale-110 transition-transform">
              <TrendingUp className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Vue mosaïque
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              Affichez vos albums en grille personnalisable avec pochettes haute résolution.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="relative mt-20 p-12 rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-blue-600"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
          
          <div className="relative z-10 text-center">
            <h2 className="text-4xl font-bold text-white mb-4">
              Prêt à commencer ?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Créez votre première liste en quelques secondes et partagez votre passion pour la musique.
            </p>
            <Link
              href="/auth/signup"
              className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg text-lg font-medium transition-colors inline-block"
            >
              S'inscrire maintenant
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
