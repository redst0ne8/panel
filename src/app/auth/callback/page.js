'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { setSessionToken, setApiUrl, setUser, getApiUrl } from '@/lib/store'

function CallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    const err = searchParams.get('error')
    const apiUrlParam = searchParams.get('apiUrl')

    if (err) {
      setError(decodeURIComponent(err))
      return
    }

    if (!token) {
      router.replace('/login')
      return
    }

    setSessionToken(token)

    const apiUrl = apiUrlParam || getApiUrl()
    if (!apiUrl) {
      router.replace('/login')
      return
    }

    setApiUrl(apiUrl)

    fetch(apiUrl + '/api/auth/me', {
      headers: { Authorization: 'Bearer ' + token },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user)
          router.replace('/dashboard')
        } else {
          router.replace('/login')
        }
      })
      .catch(() => {
        router.replace('/login')
      })
  }, [router, searchParams])

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-10">
        <div className="bg-stone-800 rounded-xl p-8 max-w-md w-full border border-stone-700 text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-medium transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="flex items-center gap-3 text-stone-400">
        <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
          <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
        Signing you in&hellip;
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center gap-3 text-stone-400">
          <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
            <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          Loading&hellip;
        </div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  )
}
