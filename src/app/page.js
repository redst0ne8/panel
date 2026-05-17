'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getSessionToken, getCredentials } from '@/lib/store'

function AvatarIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <circle cx="12" cy="10" r="3" />
      <path d="M7 21v-2a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v2" />
    </svg>
  )
}

function CpuIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <path d="M15 2v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2M9 2v2M9 20v2" />
    </svg>
  )
}

function ActivityIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l7 4v5c0 5-3.5 9.7-7 11-3.5-1.3-7-6-7-11V6l7-4z" />
    </svg>
  )
}

function TerminalIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  )
}

function GridIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  )
}

const features = [
  {
    icon: CpuIcon,
    title: 'Real-time Monitoring',
    desc: 'Track CPU, memory, uptime, and restarts for every bot process in real time.',
  },
  {
    icon: ActivityIcon,
    title: 'Live Log Streaming',
    desc: 'Watch stdout and stderr logs stream live via WebSocket. Filter, search, and scroll with ease.',
  },
  {
    icon: ShieldIcon,
    title: 'Remote Control',
    desc: 'Start, stop, and restart your Discord bots from anywhere with a single click.',
  },
  {
    icon: TerminalIcon,
    title: 'PM2 Integration',
    desc: 'Seamlessly connects to PM2 process manager — no extra tooling needed.',
  },
  {
    icon: GridIcon,
    title: 'Multi-bot Dashboard',
    desc: 'Manage all your bots from one place with a clean, organized card layout.',
  },
]

export default function LandingPage() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const loggedIn = mounted && (!!getSessionToken() || !!getCredentials())

  return (
    <div className="flex-1 overflow-y-auto">
      <section className="relative min-h-[90vh] flex items-center justify-center px-6">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(220,38,38,0.08) 0%, transparent 60%)',
        }} />
        <div className="relative z-10 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-red-900/40 bg-red-950/30 text-red-400 text-xs font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            Built for Discord bot developers
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-stone-100 mb-6 leading-tight">
            StoneBots
            <span className="text-red-500"> Panels</span>
          </h1>
          <p className="text-lg md:text-xl text-stone-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Monitor, manage, and control your entire fleet of Discord bots from one
            clean, real-time dashboard. Powered by PM2.
          </p>
          <div className="flex items-center justify-center gap-4">
            {loggedIn ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-3.5 rounded-lg font-semibold transition-colors text-lg"
              >
                <AvatarIcon />
                Go to Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-3.5 rounded-lg font-semibold transition-colors text-lg"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
                Get Started
              </Link>
            )}
            <Link
              href={loggedIn ? '/dashboard' : '/login'}
              className="inline-flex items-center gap-2 border border-stone-700 hover:border-stone-600 text-stone-300 hover:text-stone-100 px-8 py-3.5 rounded-lg font-semibold transition-colors text-lg"
            >
              {loggedIn ? 'Dashboard' : 'Sign In'}
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-32">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-stone-100 mb-4">
            Everything you need to manage your bots
          </h2>
          <p className="text-stone-400 max-w-xl mx-auto">
            A lightweight, real-time control panel that plugs into your existing PM2 setup.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, i) => {
            const Icon = feat.icon
            return (
              <div
                key={i}
                className="group bg-stone-900/50 border border-stone-800 rounded-xl p-6 hover:border-red-900/50 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-lg bg-red-950/40 border border-red-900/30 flex items-center justify-center text-red-400 mb-4 group-hover:border-red-700/50 group-hover:bg-red-950/60 transition-colors">
                  <Icon />
                </div>
                <h3 className="text-stone-100 font-semibold text-lg mb-2">{feat.title}</h3>
                <p className="text-stone-400 text-sm leading-relaxed">{feat.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      <section className="border-t border-stone-800 py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-stone-500 text-sm">
            StoneBots Panels &mdash; Open-source bot management dashboard.
          </p>
        </div>
      </section>
    </div>
  )
}
