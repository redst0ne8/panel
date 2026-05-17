'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { setCredentials } from '@/lib/store'

export default function LoginPage() {
  const router = useRouter()
  const [apiUrl, setApiUrl] = useState(
    typeof window !== 'undefined'
      ? process.env.NEXT_PUBLIC_DEFAULT_API_URL || ''
      : ''
  )
  const [apiKey, setApiKey] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const base = apiUrl.replace(/\/+$/, '')
      const res = await fetch(`${base}/api/health`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      })
      if (!res.ok) throw new Error('Connection failed')
      setCredentials(base, apiKey)
      router.push('/dashboard')
    } catch {
      setError('Could not connect. Check the URL and API key.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center p-10">
      <form onSubmit={handleSubmit} className="bg-stone-800 p-8 rounded-xl shadow-lg w-full max-w-md border border-stone-700">
        <h1 className="text-2xl font-bold text-stone-100 mb-2">Connect to Server</h1>
        <p className="text-sm text-stone-400 mb-6">Enter your bot server API URL and key</p>

        <div className="mb-4">
          <label className="block text-stone-300 text-sm mb-1">Server URL</label>
          <input
            type="text"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            placeholder="http://192.168.0.24:4000"
            className="w-full bg-stone-700 text-stone-100 px-3 py-2 rounded border border-stone-600 focus:border-primary-500 outline-none placeholder-stone-500"
          />
        </div>

        <div className="mb-6">
          <label className="block text-stone-300 text-sm mb-1">API Key</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your API key"
            className="w-full bg-stone-700 text-stone-100 px-3 py-2 rounded border border-stone-600 focus:border-primary-500 outline-none placeholder-stone-500"
          />
        </div>

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 rounded font-medium disabled:opacity-50 transition-colors"
        >
          {loading ? 'Connecting...' : 'Connect'}
        </button>
      </form>
    </div>
  )
}
