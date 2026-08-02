'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSessionToken, getCredentials } from '@/lib/store'

export default function LandingPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const loggedIn = !!getSessionToken() || !!getCredentials()
    if (loggedIn) {
      router.push('/editor')
    }
  }, [router])

  if (!mounted) return null

  return (
    <div className="h-screen flex flex-col bg-stone-950">
      <nav className="bg-stone-900 border-b border-stone-700 px-6 py-3 flex items-center justify-between shrink-0">
        <span className="text-lg font-bold text-stone-100">
          StoneBots <span className="text-red-500">Editor</span>
        </span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/login')}
            className="px-4 py-1.5 text-sm text-stone-300 hover:text-stone-100 bg-stone-800 hover:bg-stone-700 rounded-lg transition-colors"
          >
            Log In
          </button>
          <button
            onClick={() => router.push('/login')}
            className="px-4 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            Get Started
          </button>
        </div>
      </nav>
      <div className="flex-1 overflow-y-auto">
        <section className="relative min-h-[90vh] flex items-center justify-center px-6">
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: "url('/bg.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.15,
          }} />
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'radial-gradient(ellipse at 50% 0%, rgba(220,38,38,0.08) 0%, transparent 60%)',
          }} />
          <div className="relative z-10 text-center max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-red-900/40 bg-red-950/30 text-red-400 text-xs font-medium mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              Remote Code Editor for Raspberry Pi
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-stone-100 mb-6 leading-tight">
              StoneBots
              <span className="text-red-500"> Editor</span>
            </h1>
            <p className="text-lg md:text-xl text-stone-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Edit files, run commands, and launch OpenCode on your Raspberry Pi from anywhere.
              Connected via api.redst0ne8.site — no port forwarding needed.
            </p>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => router.push('/login')}
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-3.5 rounded-lg font-semibold transition-colors text-lg"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
                Sign In to Editor
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}