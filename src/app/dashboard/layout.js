'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCredentials, getSessionToken, getUser, setUser, getApiUrl } from '@/lib/store'

export default function DashboardLayout({ children }) {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const creds = getCredentials()
    const token = getSessionToken()

    if (creds) {
      setReady(true)
      return
    }

    if (token) {
      const existingUser = getUser()
      if (existingUser) {
        setReady(true)
        return
      }

      const apiUrl = getApiUrl()
      if (apiUrl) {
        fetch(apiUrl + '/api/auth/me', {
          headers: { Authorization: 'Bearer ' + token },
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.user) {
              setUser(data.user)
              setReady(true)
            } else {
              router.replace('/login')
            }
          })
          .catch(() => router.replace('/login'))
      } else {
        router.replace('/login')
      }
      return
    }

    router.replace('/login')
  }, [router])

  if (!ready) return null

  return (
    <main className="flex-1 min-h-0 p-10 overflow-hidden">
      {children}
    </main>
  )
}
