'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { User, Mail, Calendar } from 'lucide-react'

export default function Profile() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user?.name) {
      setName(session.user.name)
    }
  }, [session])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!name.trim()) {
      setError('Le nom d\'utilisateur est obligatoire')
      return
    }

    if (name.trim().length < 3) {
      setError('Le nom d\'utilisateur doit contenir au moins 3 caractères')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: name.trim() })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Une erreur est survenue')
        return
      }

      setSuccess('Profil mis à jour avec succès')
      // Mettre à jour la session
      await update({ name: name.trim() })
    } catch (err) {
      setError('Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 gradient-bg">
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
      
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-8">
          Mon Profil
        </h1>

        <div className="glass rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Informations du compte
          </h2>

          <div className="space-y-4 mb-6">
            <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Email</div>
                <div className="font-medium">{session?.user?.email}</div>
              </div>
            </div>

            {session?.user?.createdAt && (
              <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Membre depuis</div>
                  <div className="font-medium">
                    {new Date(session.user.createdAt).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Nom d'utilisateur</span>
                </div>
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700/50 dark:text-white transition-all"
                placeholder="Votre nom d'utilisateur"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Minimum 3 caractères, sera visible publiquement
              </p>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-200 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="p-4 rounded-xl bg-green-100 dark:bg-green-900/50 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-200 text-sm">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl font-medium"
            >
              {isLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
