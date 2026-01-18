'use client'

import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { ThemeToggle } from './theme-toggle'
import { LogOut, ListMusic, User, Shield, Menu, X } from 'lucide-react'
import { useState } from 'react'

export function Navbar() {
  const { data: session } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="border-b bg-white/80 dark:bg-gray-900/80 dark:border-gray-800 backdrop-blur-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="p-2 bg-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                <ListMusic className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                ListOmania
              </span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            {session ? (
              <>
                <Link
                  href="/lists"
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Mes Listes
                </Link>
                {session.user?.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 px-3 py-2 rounded-lg text-sm font-medium transition-colors bg-purple-50 dark:bg-purple-900/20"
                  >
                    <Shield className="h-4 w-4" />
                    Administration
                  </Link>
                )}
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    {session.user?.image ? (
                      <img 
                        src={session.user.image} 
                        alt={session.user.name || 'Avatar'}
                        className="h-6 w-6 rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                    <Link href="/profile" className="font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      {session.user?.name || session.user?.email}
                    </Link>
                  </div>
                  <button
                    onClick={() => signOut()}
                    className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    title="Se déconnecter"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Se connecter
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-md hover:shadow-lg"
                >
                  S'inscrire
                </Link>
              </>
            )}
            <ThemeToggle />
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t dark:border-gray-800 py-4 space-y-2">
            {session ? (
              <>
                <div className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  {session.user?.image ? (
                    <img 
                      src={session.user.image} 
                      alt={session.user.name || 'Avatar'}
                      className="h-6 w-6 rounded-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                  <Link 
                    href="/profile" 
                    className="font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {session.user?.name || session.user?.email}
                  </Link>
                </div>
                <Link
                  href="/lists"
                  className="block text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Mes Listes
                </Link>
                {session.user?.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 px-3 py-2 rounded-lg text-sm font-medium transition-colors bg-purple-50 dark:bg-purple-900/20"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Shield className="h-4 w-4" />
                    Administration
                  </Link>
                )}
                <button
                  onClick={() => {
                    signOut()
                    setMobileMenuOpen(false)
                  }}
                  className="w-full flex items-center gap-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Se déconnecter
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className="block text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Se connecter
                </Link>
                <Link
                  href="/auth/signup"
                  className="block text-center bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-md hover:shadow-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  S'inscrire
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
