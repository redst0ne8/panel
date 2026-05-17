'use client'

import Link from 'next/link'
import BotStatusBadge from './BotStatusBadge'

function fmtUptime(ts, status) {
  if (status !== 'online' || !ts) return 'N/A'
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

export default function BotCard({ bot }) {
  return (
    <Link
      href={`/bots/${encodeURIComponent(bot.id)}`}
      className="block bg-stone-800 rounded-lg p-5 border border-stone-700 hover:border-primary-500 transition-colors"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-stone-100 font-semibold truncate">{bot.id}</h3>
        <BotStatusBadge status={bot.status} />
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        <span className="text-stone-500">Uptime</span>
        <span className="text-stone-300 text-right">{fmtUptime(bot.uptime, bot.status)}</span>
        <span className="text-stone-500">CPU</span>
        <span className="text-stone-300 text-right">{bot.cpu}%</span>
        <span className="text-stone-500">Memory</span>
        <span className="text-stone-300 text-right">{fmtBytes(bot.memory)}</span>
        <span className="text-stone-500">Restarts</span>
        <span className="text-stone-300 text-right">{bot.restarts}</span>
      </div>
    </Link>
  )
}
