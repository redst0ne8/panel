'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { WebLinksAddon } from 'xterm-addon-web-links'
import 'xterm/css/xterm.css'
import { getWsBaseUrl } from '@/lib/api'

function TerminalGlyph({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  )
}

function KeyHint({ keys, action }) {
  return (
    <span className="flex items-center gap-1.5 whitespace-nowrap">
      <kbd className="px-1.5 py-0.5 rounded bg-stone-800/80 border border-stone-700 font-mono text-[10px] text-stone-300">{keys}</kbd>
      <span>{action}</span>
    </span>
  )
}

export default function TerminalModal({ isOpen, onClose, initialCommand, showHeader = true }) {
  const containerRef = useRef(null)
  const terminalRef = useRef(null)
  const fitAddonRef = useRef(null)
  const wsRef = useRef(null)
  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState('')

  const connect = useCallback(async () => {
    if (terminalRef.current || connecting) return

    setConnecting(true)
    setError('')

    try {
      const xterm = new Terminal({
        cursorBlink: true,
        cursorStyle: 'block',
        cursorWidth: 2,
        fontSize: 14,
        lineHeight: 1.15,
        letterSpacing: 0,
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace",
        theme: {
          background: '#16161e',
          foreground: '#d4d4d8',
          cursor: '#f4f4f5',
          cursorAccent: '#16161e',
          selectionBackground: 'rgba(56, 189, 248, 0.25)',
          black: '#3b3b46',
          red: '#ff6b6b',
          green: '#69db7c',
          yellow: '#ffd43b',
          blue: '#4dabf7',
          magenta: '#da77f2',
          cyan: '#3bc9db',
          white: '#e9ecef',
          brightBlack: '#7d8590',
          brightRed: '#ff8a8a',
          brightGreen: '#8ce99a',
          brightYellow: '#ffe066',
          brightBlue: '#74c0fc',
          brightMagenta: '#e599f7',
          brightCyan: '#66d9e8',
          brightWhite: '#ffffff',
        },
        convertEol: true,
        scrollback: 10000,
        allowTransparency: false,
      })

      const fitAddon = new FitAddon()
      const webLinksAddon = new WebLinksAddon()

      xterm.loadAddon(fitAddon)
      xterm.loadAddon(webLinksAddon)

      xterm.open(containerRef.current)
      fitAddon.fit()

      terminalRef.current = xterm
      fitAddonRef.current = fitAddon

      const wsUrl = `${getWsBaseUrl()}/api/terminal/ws?cols=${xterm.cols}&rows=${xterm.rows}`
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        setConnected(true)
        setConnecting(false)
        if (initialCommand) {
          ws.send(JSON.stringify({ type: 'input', data: initialCommand + '\r' }))
        }
      }

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data)
          if (msg.type === 'data') {
            xterm.write(msg.data)
          } else if (msg.type === 'exit') {
            xterm.write(`\r\n\x1b[90m[Process exited with code ${msg.code}]\x1b[0m\r\n`)
            setConnected(false)
          }
        } catch {}
      }

      ws.onclose = () => {
        setConnected(false)
        setConnecting(false)
        if (xterm) {
          xterm.write('\r\n\x1b[90m[Connection closed]\x1b[0m\r\n')
        }
      }

      ws.onerror = () => {
        setError('WebSocket connection failed')
        setConnecting(false)
      }

      xterm.onResize(({ cols, rows }) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'resize', cols, rows }))
        }
        fitAddon.fit()
      })

      xterm.onData((data) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'input', data }))
        }
      })

      window.addEventListener('resize', () => fitAddon.fit())

    } catch (err) {
      setError(err.message)
      setConnecting(false)
    }
  }, [initialCommand])

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    if (terminalRef.current) {
      terminalRef.current.dispose()
      terminalRef.current = null
    }
    setConnected(false)
  }, [])

  useEffect(() => {
    if (isOpen) {
      connect()
    } else {
      disconnect()
    }
    return () => disconnect()
  }, [isOpen, connect, disconnect])

  useEffect(() => {
    if (terminalRef.current && fitAddonRef.current) {
      fitAddonRef.current.fit()
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className={showHeader ? "fixed inset-0 z-50 flex items-center justify-center p-4" : "h-full w-full flex flex-col"}>
      {showHeader && <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />}
      <div className={`relative z-10 flex flex-col bg-stone-950 border border-stone-700/80 shadow-2xl shadow-black/60 overflow-hidden ${showHeader ? 'w-full max-w-4xl h-[80vh] max-h-[80vh] rounded-xl ring-1 ring-black/40' : 'w-full h-full border-0 rounded-none'}`}>
        {showHeader && (
          <div className="flex items-center justify-between px-4 py-3 border-b border-stone-800 bg-gradient-to-r from-stone-900 to-stone-950 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-red-600/15 text-red-500 flex items-center justify-center shrink-0">
                <TerminalGlyph className="w-5 h-5" />
              </div>
              <div className="leading-tight min-w-0">
                <h2 className="text-sm font-semibold text-stone-100">Terminal</h2>
                <p className="text-[11px] text-stone-500 font-mono truncate">bash — interactive</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium flex items-center gap-1.5 transition-colors ${
                connected
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : connecting
                    ? 'bg-amber-500/10 text-amber-400'
                    : 'bg-stone-800 text-stone-400'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-400 shadow-[0_0_6px_1px_rgba(52,211,153,0.6)]' : connecting ? 'bg-amber-400 animate-pulse' : 'bg-stone-500'}`} />
                {connected ? 'Connected' : connecting ? 'Connecting…' : 'Offline'}
              </span>
              {connected && (
                <button
                  onClick={() => { disconnect(); connect() }}
                  title="Reconnect"
                  className="p-2 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 4v6h-6" />
                    <path d="M1 20v-6h6" />
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                  </svg>
                </button>
              )}
              <button
                onClick={onClose}
                title="Close"
                className="p-2 text-stone-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-hidden bg-[#16161e]" ref={containerRef} style={{ minHeight: 0 }} />

        <div className="px-4 py-2 border-t border-stone-800 bg-stone-900/80 text-[11px] text-stone-500 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0 overflow-x-auto">
            <KeyHint keys="Ctrl+C" action="Interrupt" />
            <span className="text-stone-800 shrink-0">|</span>
            <KeyHint keys="Ctrl+D" action="Exit" />
            <span className="text-stone-800 shrink-0">|</span>
            <KeyHint keys="Ctrl+L" action="Clear" />
          </div>
          <span className="flex items-center gap-1.5 shrink-0">
            {error ? (
              <span className="text-red-400">{error}</span>
            ) : connected ? (
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Connected
              </span>
            ) : connecting ? (
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                Connecting…
              </span>
            ) : (
              <span className="text-stone-600">Disconnected</span>
            )}
          </span>
        </div>
      </div>
    </div>
  )
}
