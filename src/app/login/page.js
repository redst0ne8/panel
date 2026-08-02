'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { setCredentials, setApiUrl } from '@/lib/store'

export default function LoginPage() {
  const router = useRouter()
  const [apiUrl, setApiUrlState] = useState('https://api.redst0ne8.site')
  const [apiKey, setApiKey] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!apiUrl.trim() || !apiKey.trim()) {
      setError('API URL and API key are required')
      setLoading(false)
      return
    }

    try {
      // Verify credentials against an authenticated endpoint
      const base = apiUrl.replace(/\/$/, '')
      const res = await fetch(`${base}/api/files?path=`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      })
      if (!res.ok) {
        throw new Error('Invalid API key or unreachable API')
      }
      setApiUrl(base)
      setCredentials(base, apiKey)
      router.push('/editor')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-stone-900 border border-stone-700 rounded-xl p-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-stone-100">Connect to Server</h1>
          <p className="text-sm text-stone-400 mt-2">
            Enter your API endpoint and key to connect to your Raspberry Pi
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-300 mb-1.5">API URL</label>
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrlState(e.target.value)}
              placeholder="https://api.example.com"
              className="w-full bg-stone-800 border border-stone-600 rounded-lg px-4 py-2.5 text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-300 mb-1.5">API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key"
              className="w-full bg-stone-800 border border-stone-600 rounded-lg px-4 py-2.5 text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-700 text-red-300 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors"
          >
            {loading ? 'Connecting...' : 'Connect'}
          </button>
        </form>
      </div>
    </div>
  )
}