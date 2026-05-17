'use client'

import { useState, useEffect, useCallback } from 'react'
import { bots, system } from '@/lib/api'
import BotCard from '@/components/BotCard'

export default function DashboardPage() {
  const [botList, setBotList] = useState([])
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const [botData, statusData] = await Promise.all([bots.list(), system.status()])
      setBotList(botData.bots)
      setSummary(statusData)
      setError('')
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
    return <p className="text-slate-400">Loading bots...</p>
  }

  return (
    <div className="h-full overflow-y-auto">
      {summary && (
        <div className="flex gap-5 mb-6 text-sm">
          <span className="text-slate-400">
            Total <span className="text-slate-100 font-semibold">{summary.total}</span>
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
        </div>
      )}

      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-300 text-sm rounded-lg px-4 py-3 mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {botList.map((bot) => (
          <BotCard key={bot.id} bot={bot} />
        ))}
      </div>

      {!loading && botList.length === 0 && (
        <p className="text-slate-500 text-center mt-12">No bots found via PM2</p>
      )}
    </div>
  )
}
