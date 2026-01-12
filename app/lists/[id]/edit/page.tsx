'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { PeriodSelector } from '@/components/period-selector'

export default function EditList() {
  const params = useParams()
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    period: '',
    sourceUrl: '',
    isPublic: false
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchList()
  }, [params.id])

  const fetchList = async () => {
    try {
      const response = await fetch(`/api/lists/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setFormData({
          title: data.title,
          description: data.description || '',
          period: data.period || '',
          sourceUrl: data.sourceUrl || '',
          isPublic: data.isPublic
        })
      } else {
        router.push('/lists')
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la liste:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSaving(true)

    try {
      const response = await fetch(`/api/lists/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Une erreur est survenue')
        return
      }

      router.push(`/lists/${params.id}`)
    } catch (err) {
      setError('Une erreur est survenue')
    } finally {
      setIsSaving(false)
    }
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Modifier la liste
        </h1>

        {error && (
          <div className="mb-4 p-3 rounded bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Titre *
            </label>
            <input
              id="title"
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="sourceUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              URL source (optionnel)
            </label>
            <input
              id="sourceUrl"
              type="url"
              value={formData.sourceUrl}
              onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="https://exemple.com/ma-liste"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Référence de la source si cette liste provient d'un site web
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Période
            </label>
            <PeriodSelector
              value={formData.period}
              onChange={(period) => setFormData({ ...formData, period })}
            />
          </div>

          <div className="flex items-center">
            <input
              id="isPublic"
              type="checkbox"
              checked={formData.isPublic}
              onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Rendre cette liste publique
            </label>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
