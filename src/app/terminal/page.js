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
    if (!isLoggedIn) router.push('/login')
  }, [isLoggedIn, router])

  if (!mounted || !isLoggedIn) {
    return <div className="h-screen w-full flex items-center justify-center bg-stone-950"><div className="animate-spin rounded-full h-8 w-8 border-2 border-red-600 border-t-transparent" /></div>
  }

  return (
    <div className="h-screen w-full bg-stone-950">
      <TerminalModal
        isOpen={true}
        onClose={() => window.close()}
        initialCommand={cmd}
        showHeader={false}
      />
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