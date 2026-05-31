'use client'

import { useState, useEffect, useCallback } from 'react'
import { bots } from '@/lib/api'

export default function EnvEditor({ botId }) {
  const [env, setEnv] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ text: '', ok: false })

  const fetchEnv = useCallback(async () => {
    try {
      const data = await bots.getEnv(botId)
      setEnv(data.env || {})
    } catch (err) {
      setMessage({ text: err.message, ok: false })
    } finally {
      setLoading(false)
    }
  }, [botId])

  useEffect(() => {
    fetchEnv()
  }, [fetchEnv])

  function handleChange(key, value) {
    setEnv((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setMessage({ text: '', ok: false })
    try {
      await bots.updateEnv(botId, env)
      setMessage({ text: 'Saved! Bot may need a restart to apply changes.', ok: true })
    } catch (err) {
      setMessage({ text: err.message, ok: false })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-stone-800 rounded-lg p-4 border border-stone-700">
        <p className="text-xs text-stone-400">Loading env vars...</p>
      </div>
    )
  }

  const keys = Object.keys(env)

  return (
    <div className="bg-stone-800 rounded-lg p-4 border border-stone-700">
      <p className="text-xs text-stone-400 mb-3 font-semibold uppercase tracking-wider">
        Environment Variables
      </p>
      {keys.length === 0 ? (
        <p className="text-xs text-stone-500">No .env file found for this bot.</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          {keys.map((key) => (
            <div key={key}>
              <label className="text-xs text-stone-400 block mb-1">{key}</label>
              <input
                type="text"
                value={env[key] || ''}
                onChange={(e) => handleChange(key, e.target.value)}
                className="w-full bg-stone-900 text-stone-100 text-xs rounded px-2 py-1.5 border border-stone-600 focus:outline-none focus:border-red-500"
              />
            </div>
          ))}
          <div className="flex items-center justify-between pt-1">
            <button
              type="submit"
              disabled={saving}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs px-3 py-1.5 rounded transition-colors"
            >
              {saving ? 'Saving...' : 'Save All'}
            </button>
            {message.text && (
              <span className={`text-xs ${message.ok ? 'text-green-400' : 'text-red-400'}`}>
                {message.text}
              </span>
            )}
          </div>
        </form>
      )}
    </div>
  )
}
