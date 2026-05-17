'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getCredentials, getSessionToken, getUser, clearAll } from '@/lib/store'

function DiscordAvatar({ user, size }) {
  if (!user || !user.avatar || !user.id) {
    return (
      <div className="w-8 h-8 rounded-full bg-stone-700 flex items-center justify-center">
        <svg className="w-4 h-4 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </div>
    )
  }
  const ext = user.avatar.startsWith('a_') ? 'gif' : 'png'
  const src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${ext}?size=${size || 32}`
  return (
    <img
      src={src}
      alt={user.displayName || user.username}
      className="w-8 h-8 rounded-full"
    />
  )
}

export default function AppNavbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    setMounted(true)
    setTick((t) => t + 1)
  }, [])

  const isOAuth = mounted && !!getSessionToken()
  const isApiKey = mounted && !getSessionToken() && !!getCredentials()
  const isLoggedIn = isOAuth || isApiKey
  const discordUser = mounted ? getUser() : null

  const displayName = isOAuth
    ? discordUser?.displayName || discordUser?.username || 'User'
    : isApiKey
    ? 'root'
    : null

  const displaySubtext = isOAuth
    ? discordUser?.username || ''
    : isApiKey
    ? 'API Key'
    : null

  function handleLogout() {
    clearAll()
    setMenuOpen(false)
    router.push('/')
  }

  if (pathname === '/login' || pathname.startsWith('/auth/')) {
    return (
      <nav className="bg-stone-900 border-b border-stone-700 px-8 py-3 flex items-center justify-between shrink-0">
        <Link href="/" className="text-xl font-bold text-stone-100 hover:text-primary-400 transition-colors">
          StoneBots <span className="text-primary-500">Panels</span>
        </Link>
      </nav>
    )
  }

  return (
    <nav className="bg-stone-900 border-b border-stone-700 px-8 py-3 flex items-center justify-between shrink-0 relative">
      <Link href="/" className="text-xl font-bold text-stone-100 hover:text-primary-400 transition-colors">
        StoneBots <span className="text-primary-500">Panels</span>
      </Link>

      <div className="flex items-center gap-4">
        {mounted && (
          <>
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 text-sm text-stone-300 hover:text-stone-100 transition-colors"
                >
                  {isOAuth ? (
                    <DiscordAvatar user={discordUser} size={32} />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-stone-700 flex items-center justify-center">
                      <svg className="w-4 h-4 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                  )}
                  <span className="hidden sm:inline">{displayName}</span>
                  <svg className={`w-4 h-4 transition-transform ${menuOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-48 bg-stone-800 border border-stone-700 rounded-lg shadow-xl z-20 py-1">
                      <div className="px-4 py-2 border-b border-stone-700">
                        <p className="text-sm text-stone-100 font-medium truncate">{displayName}</p>
                        <p className="text-xs text-stone-500 truncate">{displaySubtext}</p>
                      </div>
                      <Link
                        href="/dashboard"
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-stone-300 hover:text-stone-100 hover:bg-stone-700 transition-colors"
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-stone-700 transition-colors"
                      >
                        Log Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="text-sm text-stone-300 hover:text-stone-100 transition-colors"
              >
                Log In
              </Link>
            )}
          </>
        )}
      </div>
    </nav>
  )
}
