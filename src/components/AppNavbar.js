'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { getCredentials, clearCredentials } from '@/lib/store'

export default function AppNavbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isLoggedIn = mounted && getCredentials()

  function handleLogout() {
    clearCredentials()
    router.push('/login')
  }

  return (
    <nav className="bg-slate-900 border-b border-slate-700 px-8 py-3 flex items-center justify-between shrink-0">
      <a
        href={isLoggedIn ? '/dashboard' : '/login'}
        className="text-xl font-bold text-slate-100 hover:text-blue-400 transition-colors"
      >
        Bot Dashboard
      </a>
      {isLoggedIn && pathname !== '/login' && (
        <button onClick={handleLogout} className="text-sm text-slate-400 hover:text-red-400 transition-colors">
          Logout
        </button>
      )}
    </nav>
  )
}
