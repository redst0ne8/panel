'use client'

import { useState } from 'react'
import { bots } from '@/lib/api'

const actions = ['restart', 'stop', 'start']

const btnStyles = {
  restart: 'bg-amber-600 hover:bg-amber-700',
  stop: 'bg-red-600 hover:bg-red-700',
  start: 'bg-emerald-600 hover:bg-emerald-700',
}

export default function ControlPanel({ botId, status, onAction, vertical }) {
  const [loading, setLoading] = useState(null)
  const [msg, setMsg] = useState(null)
  const [msgType, setMsgType] = useState('info')

  async function handleAction(action) {
    setLoading(action)
    setMsg(null)
    try {
      await bots[action](botId)
      setMsg(`${botId} ${action}ed successfully`)
      setMsgType('success')
      if (onAction) onAction()
    } catch (err) {
      setMsg(err.message)
      setMsgType('error')
    } finally {
      setLoading(null)
    }
  }

  const available = {
    start: status === 'stopped' || status === 'errored',
    stop: status === 'online',
    restart: status === 'online',
  }

  return (
    <div className="bg-stone-800 rounded-lg border border-stone-700 p-5 flex flex-col">
      <p className="text-xs text-stone-400 mb-4 font-medium uppercase tracking-wider">Actions</p>
      <div className={`flex ${vertical ? 'flex-col' : 'flex-row'} gap-2`}>
        {actions.map((action) => (
          <button
            key={action}
            onClick={() => handleAction(action)}
            disabled={!available[action] || loading === action}
            className={`${vertical ? 'flex-1 py-4' : 'px-5 py-2.5'} rounded text-sm font-medium capitalize text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors ${btnStyles[action]}`}
          >
            {loading === action ? '...' : action}
          </button>
        ))}
      </div>
      {msg && (
        <p className={`text-xs mt-2 ${msgType === 'error' ? 'text-red-400' : 'text-emerald-400'}`}>
          {msg}
        </p>
      )}
    </div>
  )
}
