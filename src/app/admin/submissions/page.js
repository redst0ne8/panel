'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCredentials, getApiUrl } from '@/lib/store'

function statusColor(status) {
  switch (status) {
    case 'pending': return 'bg-blue-500'
    case 'accepted': return 'bg-emerald-500'
    case 'denied': return 'bg-red-500'
    default: return 'bg-stone-500'
  }
}

export default function AdminSubmissionsPage() {
  const router = useRouter()
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)
  const [actionMsg, setActionMsg] = useState('')

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!mounted) return

    const creds = getCredentials()
    if (!creds) {
      router.replace('/login')
      return
    }

    fetchSubmissions()
  }, [mounted])

  async function fetchSubmissions() {
    const apiUrl = getApiUrl()
    const creds = getCredentials()
    if (!apiUrl || !creds) return

    try {
      const res = await fetch(apiUrl + '/api/submissions/all', {
        headers: { Authorization: 'Bearer ' + creds.apiKey },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to fetch')
      setSubmissions(data.submissions || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleAction(id, action) {
    setActionMsg('')
    const apiUrl = getApiUrl()
    const creds = getCredentials()
    if (!apiUrl || !creds) return

    try {
      const res = await fetch(apiUrl + '/api/submissions/' + id + '/' + action, {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + creds.apiKey,
          'Content-Type': 'application/json',
        },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Action failed')
      setActionMsg('Bot ' + action + 'ed successfully')
      fetchSubmissions()
    } catch (err) {
      setActionMsg('Error: ' + err.message)
    }
  }

  if (!mounted) return null

  return (
    <div className="flex-1 overflow-y-auto p-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-stone-100 mb-2">Bot Submissions</h1>
        <p className="text-stone-400 text-sm mb-6">Review and manage bot submission requests.</p>

        {actionMsg && (
          <div className="text-sm text-stone-300 bg-stone-800 border border-stone-700 rounded-lg px-4 py-3 mb-6">
            {actionMsg}
          </div>
        )}

        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-300 text-sm rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-stone-400">Loading submissions...</p>
        ) : submissions.length === 0 ? (
          <p className="text-stone-500">No submissions yet.</p>
        ) : (
          <div className="space-y-4">
            {submissions.map((s) => (
              <div key={s.id} className="bg-stone-800 border border-stone-700 rounded-lg p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-stone-100 font-semibold text-lg">{s.botName}</h3>
                      <span className={`inline-block w-2.5 h-2.5 rounded-full ${statusColor(s.status)}`} title={s.status} />
                      <span className="text-xs text-stone-500 capitalize">{s.status}</span>
                    </div>
                    <p className="text-xs text-stone-500">
                      by {s.discordUsername || 'Unknown'} ({s.discordId || 'no ID'}) &mdash; submitted {new Date(s.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {s.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleAction(s.id, 'accept')}
                          className="px-3 py-1.5 text-xs rounded bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleAction(s.id, 'deny')}
                          className="px-3 py-1.5 text-xs rounded bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
                        >
                          Deny
                        </button>
                      </>
                    )}
                    {s.status === 'accepted' && (
                      <span className="text-xs text-emerald-400">Accepted</span>
                    )}
                    {s.status === 'denied' && (
                      <span className="text-xs text-red-400">Denied</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-stone-500 mb-1">Purpose</p>
                    <p className="text-stone-300">{s.botPurpose}</p>
                  </div>
                  <div>
                    <p className="text-xs text-stone-500 mb-1">Features</p>
                    <p className="text-stone-300 whitespace-pre-wrap">{s.botFeatures}</p>
                  </div>
                </div>

                {s.zipUrl && (
                  <div className="mt-3">
                    <a
                      href={getApiUrl() + s.zipUrl}
                      download
                      className="inline-flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      Download .zip
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-sm text-stone-400 hover:text-stone-200 transition-colors"
          >
            &larr; Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
