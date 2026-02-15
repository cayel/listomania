'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, Plus, Edit2, Trash2, Tag, Eye } from 'lucide-react'

interface Category {
  id: string
  name: string
  color?: string
  _count?: {
    lists: number
  }
}

interface CategoryManagerProps {
  isOpen: boolean
  onClose: () => void
  onCategoriesChange?: () => void
}

const DEFAULT_COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#F97316', // orange
]

export function CategoryManager({ isOpen, onClose, onCategoriesChange }: CategoryManagerProps) {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryColor, setNewCategoryColor] = useState(DEFAULT_COLORS[0])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('')
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  useEffect(() => {
    if (isOpen) {
      fetchCategories()
    }
  }, [isOpen])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error)
    }
  }

  const handleCreate = async () => {
    if (!newCategoryName.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCategoryName.trim(),
          color: newCategoryColor
        })
      })

      if (response.ok) {
        const newCategory = await response.json()
        setCategories([...categories, newCategory])
        setNewCategoryName('')
        setNewCategoryColor(DEFAULT_COLORS[0])
        setNotification({ type: 'success', message: 'Catégorie créée !' })
        setTimeout(() => setNotification(null), 3000)
        onCategoriesChange?.()
      } else {
        const error = await response.json()
        setNotification({ type: 'error', message: error.error || 'Erreur lors de la création' })
        setTimeout(() => setNotification(null), 3000)
      }
    } catch (error) {
      console.error('Erreur:', error)
      setNotification({ type: 'error', message: 'Erreur lors de la création' })
      setTimeout(() => setNotification(null), 3000)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName.trim(),
          color: editColor
        })
      })

      if (response.ok) {
        const updatedCategory = await response.json()
        setCategories(categories.map(c => c.id === id ? updatedCategory : c))
        setEditingId(null)
        setNotification({ type: 'success', message: 'Catégorie mise à jour !' })
        setTimeout(() => setNotification(null), 3000)
        onCategoriesChange?.()
      } else {
        const error = await response.json()
        setNotification({ type: 'error', message: error.error || 'Erreur lors de la mise à jour' })
        setTimeout(() => setNotification(null), 3000)
      }
    } catch (error) {
      console.error('Erreur:', error)
      setNotification({ type: 'error', message: 'Erreur lors de la mise à jour' })
      setTimeout(() => setNotification(null), 3000)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Supprimer la catégorie "${name}" ? Les listes associées ne seront pas supprimées.`)) {
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setCategories(categories.filter(c => c.id !== id))
        setNotification({ type: 'success', message: 'Catégorie supprimée !' })
        setTimeout(() => setNotification(null), 3000)
        onCategoriesChange?.()
      } else {
        setNotification({ type: 'error', message: 'Erreur lors de la suppression' })
        setTimeout(() => setNotification(null), 3000)
      }
    } catch (error) {
      console.error('Erreur:', error)
      setNotification({ type: 'error', message: 'Erreur lors de la suppression' })
      setTimeout(() => setNotification(null), 3000)
    } finally {
      setIsLoading(false)
    }
  }

  const startEdit = (category: Category) => {
    setEditingId(category.id)
    setEditName(category.name)
    setEditColor(category.color || DEFAULT_COLORS[0])
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Tag className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Mes Catégories
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Organisez vos listes par thèmes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Notification */}
        {notification && (
          <div className={`mx-6 mt-4 px-4 py-3 rounded-lg ${
            notification.type === 'success' 
              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' 
              : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
          }`}>
            {notification.message}
          </div>
        )}

        {/* Create new category */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Nouvelle catégorie
          </h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="Nom de la catégorie"
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              maxLength={50}
            />
            <div className="flex gap-1">
              {DEFAULT_COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => setNewCategoryColor(color)}
                  className={`w-8 h-8 rounded-lg transition-all ${
                    newCategoryColor === color 
                      ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-gray-500 scale-110' 
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
            <button
              onClick={handleCreate}
              disabled={isLoading || !newCategoryName.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span>Créer</span>
            </button>
          </div>
        </div>

        {/* Categories list */}
        <div className="flex-1 overflow-y-auto p-6">
          {categories.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Tag className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Aucune catégorie créée</p>
              <p className="text-sm mt-1">Créez votre première catégorie ci-dessus</p>
            </div>
          ) : (
            <div className="space-y-2">
              {categories.map(category => (
                <div
                  key={category.id}
                  className="flex items-center gap-3 p-3 glass rounded-lg hover:bg-white/50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  {editingId === category.id ? (
                    <>
                      <div className="flex gap-1">
                        {DEFAULT_COLORS.map(color => (
                          <button
                            key={color}
                            onClick={() => setEditColor(color)}
                            className={`w-6 h-6 rounded transition-all ${
                              editColor === color 
                                ? 'ring-2 ring-offset-1 ring-gray-400 scale-110' 
                                : 'hover:scale-105'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleUpdate(category.id)}
                        className="flex-1 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm"
                        maxLength={50}
                      />
                      <button
                        onClick={() => handleUpdate(category.id)}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        Sauver
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm hover:bg-gray-300 dark:hover:bg-gray-600"
                      >
                        Annuler
                      </button>
                    </>
                  ) : (
                    <>
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: category.color || DEFAULT_COLORS[0] }}
                      />
                      <span className="flex-1 font-medium text-gray-900 dark:text-white">
                        {category.name}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {category._count?.lists || 0} liste{(category._count?.lists || 0) > 1 ? 's' : ''}
                      </span>
                      <button
                        onClick={() => {
                          router.push(`/categories/${category.id}`)
                          onClose()
                        }}
                        className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded transition-colors"
                        title="Voir tous les albums"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => startEdit(category)}
                        className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded transition-colors"
                        title="Modifier"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id, category.name)}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
