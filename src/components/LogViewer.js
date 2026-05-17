'use client'

import { useState, useEffect, useRef } from 'react'
import { bots } from '@/lib/api'

export default function LogViewer({ botId, apiUrl, apiKey }) {
  const [logs, setLogs] = useState([])
  const [autoScroll, setAutoScroll] = useState(true)
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef(null)

  useEffect(() => {
    let cancelled = false

    async function fetchLogs() {
      try {
        const data = await bots.logs(botId, { tail: 200 })
        if (cancelled) return
        const lines = []
        if (data.logs.stdout) lines.push(...data.logs.stdout.map((l) => ({ text: l, type: 'stdout' })))
        if (data.logs.stderr) lines.push(...data.logs.stderr.map((l) => ({ text: l, type: 'stderr' })))
        setLogs(lines)
      } catch {
        if (!cancelled) setLogs([{ text: '[Failed to fetch logs]', type: 'stderr' }])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchLogs()
    return () => { cancelled = true }
  }, [botId])

  useEffect(() => {
    if (!apiUrl || !apiKey) return

    const wsBase = apiUrl.replace(/^http/, 'ws')
    const url = new URL(wsBase)
    url.searchParams.set('token', apiKey)
    url.searchParams.set('bot', botId)

    let ws
    function connect() {
      ws = new WebSocket(url.toString())
      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data)
          if (data.type === 'stdout' || data.type === 'stderr') {
            setLogs((prev) => [...prev.slice(-2000), { text: data.data, type: data.type }])
          }
        } catch { /* ignore malformed messages */ }
      }
      ws.onclose = () => {
        setTimeout(connect, 3000)
      }
    }

    connect()

    return () => {
      if (ws) ws.close()
    }
  }, [botId, apiUrl, apiKey])

  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs, autoScroll])

  const filtered = filter === 'all' ? logs : logs.filter((l) => l.type === filter)

  async function handleReload() {
    setLoading(true)
    try {
      const data = await bots.logs(botId, { tail: 200 })
      const lines = []
      if (data.logs.stdout) lines.push(...data.logs.stdout.map((l) => ({ text: l, type: 'stdout' })))
      if (data.logs.stderr) lines.push(...data.logs.stderr.map((l) => ({ text: l, type: 'stderr' })))
      setLogs(lines)
    } catch {
      setLogs([{ text: '[Failed to fetch logs]', type: 'stderr' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 rounded-lg border border-slate-700 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 shrink-0 flex-wrap">
        <div className="flex gap-1">
          {['all', 'stdout', 'stderr'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2 py-0.5 text-xs rounded capitalize ${
                filter === f ? 'bg-primary-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              } transition-colors`}
            >
              {f}
            </button>
          ))}
        </div>
        <button
          onClick={() => setAutoScroll(!autoScroll)}
          className={`px-2 py-0.5 text-xs rounded transition-colors ${
            autoScroll ? 'bg-slate-700 text-slate-300' : 'bg-slate-600 text-slate-400'
          }`}
        >
          Scroll: {autoScroll ? 'ON' : 'OFF'}
        </button>
        <button
          onClick={() => setLogs([])}
          className="px-2 py-0.5 text-xs rounded bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
        >
          Clear
        </button>
        <button
          onClick={handleReload}
          className="px-2 py-0.5 text-xs rounded bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
        >
          Reload
        </button>
        <span className="text-xs text-slate-500 ml-auto">{logs.length} lines</span>
      </div>

      <div className="flex-1 min-h-0 bg-black p-4 overflow-y-auto font-mono text-xs leading-relaxed">
        {loading && <p className="text-slate-500">Loading logs...</p>}
        {filtered.map((line, i) => (
          <div key={i} className={line.type === 'stderr' ? 'text-red-400' : 'text-slate-300'}>
            {line.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
