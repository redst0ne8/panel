'use client'

import { Suspense, useRef, useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { getSessionToken, getCredentials, clearAll } from '@/lib/store'

const TerminalModal = dynamic(() => import('@/components/TerminalModal'), { ssr: false })

function TerminalWindowContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const cmd = searchParams.get('cmd') || ''

  useEffect(() => { setMounted(true) }, [])

  const isLoggedIn = mounted && (!!getSessionToken() || !!getCredentials())

  useEffect(() => {
    if (mounted && !isLoggedIn) router.push('/login')
  }, [mounted, isLoggedIn, router])

  if (!mounted || !isLoggedIn) {
    return <div className="h-screen w-full flex items-center justify-center bg-stone-950"><div className="animate-spin rounded-full h-8 w-8 border-2 border-red-600 border-t-transparent" /></div>
  }

  const close = () => {
    if (window.opener) {
      window.close()
    } else {
      router.push('/editor')
    }
  }

  return (
    <div className="h-screen w-full flex flex-col bg-stone-950">
      <header className="h-11 shrink-0 flex items-center justify-between px-4 bg-stone-900 border-b border-stone-800 select-none">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-6 h-6 rounded-md bg-red-600/15 text-red-500 flex items-center justify-center shrink-0">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="4 17 10 11 4 5" />
              <line x1="12" y1="19" x2="20" y2="19" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-stone-100">Terminal</span>
          <span className="text-[11px] text-stone-500 font-mono hidden sm:inline truncate">{cmd ? `opencode — ${cmd}` : 'bash'}</span>
        </div>
        <button
          onClick={close}
          title="Close"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-lg transition-colors shrink-0"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          Close
        </button>
      </header>
      <div className="flex-1 min-h-0">
        <TerminalModal
          isOpen={true}
          onClose={close}
          initialCommand={cmd}
          showHeader={false}
        />
      </div>
    </div>
  )
}

export default function TerminalWindow() {
  return (
    <Suspense fallback={<div className="h-screen w-full flex items-center justify-center bg-stone-950"><div className="animate-spin rounded-full h-8 w-8 border-2 border-red-600 border-t-transparent" /></div>}>
      <TerminalWindowContent />
    </Suspense>
  )
}