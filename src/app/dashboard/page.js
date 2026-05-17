'use client'

import { useState, useEffect, useCallback } from 'react'
import { bots, system } from '@/lib/api'
import { getSessionToken, getApiUrl } from '@/lib/store'
import BotCard from '@/components/BotCard'
import SubmissionCard from '@/components/SubmissionCard'

export default function DashboardPage() {
  const [botList, setBotList] = useState([])
  const [summary, setSummary] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const [botData, statusData] = await Promise.all([bots.list(), system.status()])
      setBotList(botData.bots)
      setSummary(statusData)
      setError('')

      const token = getSessionToken()
      if (token) {
        const apiUrl = getApiUrl()
        if (apiUrl) {
          const res = await fetch(apiUrl + '/api/submissions/mine', {
            headers: { Authorization: 'Bearer ' + token },
          })
          if (res.ok) {
            const data = await res.json()
            setSubmissions(data.submissions || [])
          }
        }
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 15000)
    return () => clearInterval(interval)
  }, [fetchData])

  if (loading) {
    return <p className="text-stone-400">Loading bots...</p>
  }

  const pendingCount = submissions.filter((s) => s.status === 'pending').length
  const reviewedCount = submissions.filter((s) => s.status !== 'pending').length
  async function handleClearReviewed() {
    const token = getSessionToken()
    const apiUrl = getApiUrl()
    if (!token || !apiUrl) return
    try {
      const res = await fetch(apiUrl + '/api/submissions/clear-reviewed', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token },
      })
      if (res.ok) {
        const data = await res.json()
        setSubmissions(data.submissions || [])
      }
    } catch {}
  }

  return (
    <div className="h-full overflow-y-auto">
      {summary && (
        <div className="flex gap-5 mb-6 text-sm flex-wrap">
          <span className="text-stone-400">
            Total <span className="text-stone-100 font-semibold">{summary.total}</span>
          </span>
          <span className="text-emerald-400">
            Online <span className="font-semibold">{summary.online}</span>
          </span>
          <span className="text-amber-400">
            Stopped <span className="font-semibold">{summary.stopped}</span>
          </span>
          <span className="text-red-400">
            Errored <span className="font-semibold">{summary.errored}</span>
          </span>
          {pendingCount > 0 && (
            <span className="text-blue-400">
              Pending <span className="font-semibold">{pendingCount}</span>
            </span>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-300 text-sm rounded-lg px-4 py-3 mb-4">
          {error}
        </div>
      )}

      {submissions.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-stone-400 uppercase tracking-wider">
              Submissions
            </h3>
            {reviewedCount > 0 && (
              <button
                onClick={handleClearReviewed}
                className="text-xs text-stone-500 hover:text-stone-300 transition-colors"
              >
                Clear reviewed
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {submissions.map((s) => (
              <SubmissionCard key={s.id} submission={s} />
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-medium text-stone-400 mb-3 uppercase tracking-wider">
          Running Bots
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {botList.map((bot) => (
            <BotCard key={bot.id} bot={bot} />
          ))}
        </div>
      </div>

      {!loading && botList.length === 0 && submissions.length === 0 && (
        <p className="text-stone-500 text-center mt-12">No bots found</p>
      )}
    </div>
  )
}
