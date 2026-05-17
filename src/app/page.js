'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCredentials } from '@/lib/store'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    router.replace(getCredentials() ? '/dashboard' : '/login')
  }, [router])

  return null
}
