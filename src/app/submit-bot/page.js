'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSessionToken, getUser, getApiUrl } from '@/lib/store'

export default function SubmitBotPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [discordUsername, setDiscordUsername] = useState('')
  const [discordId, setDiscordId] = useState('')
  const [botName, setBotName] = useState('')
  const [botPurpose, setBotPurpose] = useState('')
  const [botFeatures, setBotFeatures] = useState('')
  const [zipFile, setZipFile] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setMounted(true)
    const user = getUser()
    if (user) {
      setDiscordUsername(user.username || '')
      setDiscordId(user.id || '')
    }
  }, [])

  if (mounted && !getSessionToken()) {
    return (
      <div className="flex-1 flex items-center justify-center p-10">
        <div className="text-center">
          <p className="text-stone-400 mb-4">You need to sign in with Discord to submit a bot.</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded font-medium transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const apiUrl = getApiUrl()
      const token = getSessionToken()
      if (!apiUrl || !token) throw new Error('Not authenticated')

      const formData = new FormData()
      formData.append('discordUsername', discordUsername)
      formData.append('discordId', discordId)
      formData.append('botName', botName)
      formData.append('botPurpose', botPurpose)
      formData.append('botFeatures', botFeatures)
      if (zipFile) formData.append('zip', zipFile)

      const res = await fetch(apiUrl + '/api/submissions', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token },
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Submission failed')

      setSuccess(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="flex-1 flex items-center justify-center p-10">
        <div className="bg-stone-800 rounded-xl p-8 max-w-md w-full border border-stone-700 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-stone-100 mb-2">Bot Submitted!</h2>
          <p className="text-sm text-stone-400 mb-6">Your bot request has been submitted for review. You can track its status on your dashboard.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded font-medium transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto p-10">
        <h1 className="text-3xl font-bold text-stone-100 mb-2">Submit a Bot</h1>
        <p className="text-stone-400 mb-8">Fill out the form below to request a new bot to be added to your namespace.</p>

        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-300 text-sm rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-stone-300 text-sm mb-1">Discord Username</label>
              <input
                type="text"
                value={discordUsername}
                onChange={(e) => setDiscordUsername(e.target.value)}
                placeholder="user#0000"
                className="w-full bg-stone-700 text-stone-100 px-3 py-2 rounded border border-stone-600 focus:border-primary-500 outline-none placeholder-stone-500"
              />
            </div>
            <div>
              <label className="block text-stone-300 text-sm mb-1">Discord ID</label>
              <input
                type="text"
                value={discordId}
                onChange={(e) => setDiscordId(e.target.value)}
                placeholder="123456789012345678"
                className="w-full bg-stone-700 text-stone-100 px-3 py-2 rounded border border-stone-600 focus:border-primary-500 outline-none placeholder-stone-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-stone-300 text-sm mb-1">
              Bot&apos;s Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={botName}
              onChange={(e) => setBotName(e.target.value)}
              required
              placeholder="My Awesome Bot"
              className="w-full bg-stone-700 text-stone-100 px-3 py-2 rounded border border-stone-600 focus:border-primary-500 outline-none placeholder-stone-500"
            />
          </div>

          <div>
            <label className="block text-stone-300 text-sm mb-1">
              Bot&apos;s Purpose <span className="text-red-400">*</span>
            </label>
            <textarea
              value={botPurpose}
              onChange={(e) => setBotPurpose(e.target.value)}
              required
              rows={3}
              placeholder="What does your bot do?"
              className="w-full bg-stone-700 text-stone-100 px-3 py-2 rounded border border-stone-600 focus:border-primary-500 outline-none placeholder-stone-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-stone-300 text-sm mb-1">
              Bot&apos;s Features <span className="text-red-400">*</span>
            </label>
            <textarea
              value={botFeatures}
              onChange={(e) => setBotFeatures(e.target.value)}
              required
              rows={4}
              placeholder="List the features your bot has (one per line)"
              className="w-full bg-stone-700 text-stone-100 px-3 py-2 rounded border border-stone-600 focus:border-primary-500 outline-none placeholder-stone-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-stone-300 text-sm mb-1">Bot Files (.zip)</label>
            <div className="border-2 border-dashed border-stone-600 rounded-lg p-6 text-center hover:border-primary-500 transition-colors cursor-pointer" onClick={() => document.getElementById('zip-input').click()}>
              <input
                id="zip-input"
                type="file"
                accept=".zip"
                className="hidden"
                onChange={(e) => setZipFile(e.target.files[0])}
              />
              {zipFile ? (
                <div>
                  <p className="text-primary-400 text-sm font-medium">{zipFile.name}</p>
                  <p className="text-stone-500 text-xs mt-1">{(zipFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              ) : (
                <div>
                  <svg className="w-8 h-8 text-stone-500 mx-auto mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <p className="text-stone-400 text-sm">Click to upload a .zip of your bot files</p>
                  <p className="text-stone-500 text-xs mt-1">Optional, max 50 MB</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded font-medium transition-colors disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Bot'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="text-stone-400 hover:text-stone-200 text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
