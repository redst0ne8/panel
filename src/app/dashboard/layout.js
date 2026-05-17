'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCredentials } from '@/lib/store'

export default function DashboardLayout({ children }) {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!getCredentials()) {
      router.replace('/login')
    } else {
      setReady(true)
    }
  }, [router])

  if (!ready) return null

  return (
    <main className="flex-1 min-h-0 p-10 overflow-hidden">
      {children}
    </main>
  )
}
