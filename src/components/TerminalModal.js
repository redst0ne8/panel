'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { WebLinksAddon } from 'xterm-addon-web-links'
import 'xterm/css/xterm.css'
import { getWsBaseUrl } from '@/lib/api'

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
        fontSize: 14,
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
        theme: {
          background: '#1c1c1c',
          foreground: '#d4d4d4',
          cursor: '#ffffff',
          selectionBackground: '#264f78',
          black: '#1e1e1e',
          red: '#f44747',
          green: '#6a9955',
          yellow: '#dcdcaa',
          blue: '#569cd6',
          magenta: '#c586c0',
          cyan: '#9cdcfe',
          white: '#d4d4d4',
          brightBlack: '#858585',
          brightRed: '#f44747',
          brightGreen: '#6a9955',
          brightYellow: '#dcdcaa',
          brightBlue: '#569cd6',
          brightMagenta: '#c586c0',
          brightCyan: '#9cdcfe',
          brightWhite: '#ffffff',
        },
        convertEol: true,
        scrollback: 10000,
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
            xterm.write(`\r\n[Process exited with code ${msg.code}]\r\n`)
            setConnected(false)
          }
        } catch {}
      }

      ws.onclose = () => {
        setConnected(false)
        setConnecting(false)
        if (xterm) {
          xterm.write('\r\n[Connection closed]\r\n')
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
    <div className={showHeader ? "fixed inset-0 z-50 flex items-center justify-center" : "h-full w-full flex flex-col"} onClick={showHeader ? onClose : undefined}>
      {showHeader && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />}
      <div className={`relative z-10 flex flex-col bg-stone-950 border border-stone-700 rounded-xl shadow-2xl overflow-hidden ${showHeader ? 'w-full max-w-5xl h-[85vh] max-h-[85vh]' : 'w-full h-full border-0 rounded-none'}`}>
        {showHeader && (
          <div className="flex items-center justify-between px-4 py-3 border-b border-stone-700 bg-stone-900">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-stone-100">Terminal</h2>
              <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500' : connecting ? 'bg-amber-500 animate-pulse' : 'bg-stone-600'}`} />
              {error && <span className="text-xs text-red-400">{error}</span>}
            </div>
            <div className="flex items-center gap-2">
              {connected && (
                <button onClick={() => { disconnect(); connect() }} className="px-3 py-1.5 text-xs bg-stone-800 hover:bg-stone-700 text-stone-300 rounded transition-colors">
                  Reconnect
                </button>
              )}
              <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-lg transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-hidden" ref={containerRef} style={{ minHeight: 0 }} />

        <div className="px-4 py-2 border-t border-stone-700 bg-stone-900 text-xs text-stone-500 flex items-center justify-between">
          <span>
            <kbd className="px-1.5 py-0.5 bg-stone-800 rounded">Ctrl+C</kbd> Interrupt
            <span className="mx-2">|</span>
            <kbd className="px-1.5 py-0.5 bg-stone-800 rounded">Ctrl+D</kbd> Exit
            <span className="mx-2">|</span>
            <kbd className="px-1.5 py-0.5 bg-stone-800 rounded">Ctrl+L</kbd> Clear
          </span>
          {connected && <span className="text-emerald-400">● Connected</span>}
        </div>
      </div>
    </div>
  )
}