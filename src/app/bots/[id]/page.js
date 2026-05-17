'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { bots } from '@/lib/api'
import { getCredentials } from '@/lib/store'
import BotStatusBadge from '@/components/BotStatusBadge'
import ControlPanel from '@/components/ControlPanel'
import LogViewer from '@/components/LogViewer'

function fmtUptime(ts) {
  if (!ts) return 'N/A'
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60) return `${s}s`
  if (s < 3600) return `${Math.floor(s / 60)}m ${s % 60}s`
  if (s < 86400) return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`
  return `${Math.floor(s / 86400)}d ${Math.floor((s % 86400) / 3600)}h`
}

function fmtBytes(b) {
  if (!b) return 'N/A'
  if (b < 1024) return `${b} B`
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`
  return `${(b / 1048576).toFixed(1)} MB`
}

export default function BotDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [bot, setBot] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [logKey, setLogKey] = useState(0)

  const fetchBot = useCallback(async () => {
    try {
      const data = await bots.get(id)
      setBot(data.bot)
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchBot()
    const interval = setInterval(fetchBot, 10000)
    return () => clearInterval(interval)
  }, [fetchBot])

  const creds = getCredentials()

  function handleAction() {
    fetchBot()
    setLogKey((k) => k + 1)
  }

  if (loading) return <p className="text-slate-400">Loading...</p>
  if (error) return <p className="text-red-400">{error}</p>
  if (!bot) return <p className="text-red-400">Bot not found</p>

  return (
    <div className="flex-1 flex flex-col gap-6 p-10 overflow-hidden">
      <div className="flex items-center justify-between shrink-0">
        <button onClick={() => router.push('/dashboard')} className="text-slate-400 hover:text-slate-200 text-sm transition-colors">
          &larr; Back to Dashboard
        </button>
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-slate-100">{bot.id}</h2>
          <BotStatusBadge status={bot.status} />
          <span className="text-sm text-slate-400 capitalize">{bot.status}</span>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-6 overflow-hidden">
        <div className="lg:w-[200px] w-full shrink-0 overflow-y-auto space-y-4">
          <InfoBox label="PID" value={bot.pid || 'N/A'} />
          <InfoBox label="PM2 ID" value={bot.pm_id} />
          <InfoBox label="Mode" value={bot.exec_mode} />
          <InfoBox label="Instances" value={bot.instances} />
          {bot.exec_path && (
            <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
              <p className="text-xs text-slate-400 mb-1">Path</p>
              <p className="text-xs text-slate-300 break-all">{bot.exec_path}</p>
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          <LogViewer
            key={logKey}
            botId={bot.id}
            apiUrl={creds?.apiUrl}
            apiKey={creds?.apiKey}
          />
        </div>

        <div className="lg:w-[220px] w-full shrink-0 flex flex-col">
          <ControlPanel vertical botId={bot.id} status={bot.status} onAction={handleAction} />
        </div>
      </div>

      <div className="shrink-0 grid grid-cols-2 sm:grid-cols-4 gap-6">
        <StatCard label="Uptime" value={fmtUptime(bot.uptime)} />
        <StatCard label="Restarts" value={bot.restarts} />
        <StatCard label="CPU" value={`${bot.cpu}%`} />
        <StatCard label="Memory" value={fmtBytes(bot.memory)} />
      </div>
    </div>
  )
}

function InfoBox({ label, value }) {
  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-sm font-semibold text-slate-100">{value}</p>
    </div>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className="text-lg font-semibold text-slate-100">{value}</p>
    </div>
  )
}
