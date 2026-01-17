'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { Shield, Users, Calendar, ListChecks, AlertCircle } from 'lucide-react'

interface AdminUser {
  id: string
  name: string
  email: string
  role: string
  image?: string | null
  createdAt: string
  _count: {
    lists: number
  }
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/lists')
    }
  }, [status, session, router])

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'admin') {
      fetchUsers()
    }
  }, [status, session])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      } else {
        const error = await response.json()
        setNotification({ type: 'error', message: error.error || 'Erreur lors du chargement' })
        setTimeout(() => setNotification(null), 3000)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error)
      setNotification({ type: 'error', message: 'Erreur lors du chargement' })
      setTimeout(() => setNotification(null), 3000)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, role: newRole })
      })

      if (response.ok) {
        const updatedUser = await response.json()
        setUsers(users.map(u => u.id === userId ? updatedUser : u))
        setNotification({ type: 'success', message: 'Rôle mis à jour avec succès' })
        setTimeout(() => setNotification(null), 3000)
      } else {
        const error = await response.json()
        setNotification({ type: 'error', message: error.error || 'Erreur lors de la mise à jour' })
        setTimeout(() => setNotification(null), 3000)
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du rôle:', error)
      setNotification({ type: 'error', message: 'Erreur lors de la mise à jour' })
      setTimeout(() => setNotification(null), 3000)
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

  if (session?.user?.role !== 'admin') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 gradient-bg">
      <Navbar />
      
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
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-purple-600 rounded-xl">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Administration
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gestion des utilisateurs
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="glass rounded-xl p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total utilisateurs</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{users.length}</p>
              </div>
            </div>
          </div>
          
          <div className="glass rounded-xl p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Administrateurs</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {users.filter(u => u.role === 'admin').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="glass rounded-xl p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <ListChecks className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total listes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {users.reduce((acc, u) => acc + u._count.lists, 0)}
                </p>
              </div>
            </div>
          </div>

          <Link href="/admin/albums" className="glass rounded-xl p-6 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <AlertCircle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Albums problématiques</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">Gérer →</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Users Table */}
        <div className="glass rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Rôle
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Listes
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Inscription
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {user.image ? (
                          <img
                            src={user.image}
                            alt={user.name}
                            className="h-10 w-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                            onError={(e) => {
                              // En cas d'erreur de chargement, afficher l'initiale
                              e.currentTarget.style.display = 'none'
                              e.currentTarget.nextElementSibling?.classList.remove('hidden')
                            }}
                          />
                        ) : null}
                        <div className={`h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold border-2 border-gray-200 dark:border-gray-700 ${user.image ? 'hidden' : ''}`}>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {user.name}
                          {user.id === session?.user?.id && (
                            <span className="ml-2 text-xs text-gray-500">(vous)</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        disabled={user.id === session?.user?.id}
                        className={`text-sm px-3 py-1 rounded-lg border ${
                          user.role === 'admin'
                            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-700'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border-gray-300 dark:border-gray-600'
                        } ${user.id === session?.user?.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'}`}
                      >
                        <option value="user">Utilisateur</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <ListChecks className="h-4 w-4" />
                        {user._count.lists}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="h-4 w-4" />
                        {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
