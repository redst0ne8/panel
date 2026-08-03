'use client'

import { useState, useEffect, useCallback } from 'react'
import { files } from '@/lib/api'

export default function OpenFolderModal({ isOpen, onClose, onSelect }) {
  const [path, setPath] = useState('')
  const [items, setItems] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setPath('')
      setItems([])
      setSelected(null)
      setError('')
    }
  }, [isOpen])

  const load = useCallback(async (dir) => {
    setLoading(true)
    setError('')
    try {
      const data = await files.list(dir)
      setPath(data.path)
      setItems(data.items)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen) load('')
  }, [isOpen, load])

  const goUp = useCallback(() => {
    if (path === '') return
    const parent = path.split('/').slice(0, -1).join('/')
    load(parent)
  }, [path, load])

  const handleClick = useCallback(async (item) => {
    if (item.isDirectory) {
      load(item.path)
    } else {
      setSelected(item.path)
    }
  }, [load])

  const crumbs = path.split('/').filter(Boolean)

  const handleConfirm = useCallback(() => {
    if (!selected) return
    const item = items.find(i => i.path === selected)
    onSelect({ type: item?.isDirectory ? 'folder' : 'file', path: selected })
    onClose()
  }, [selected, items, onSelect, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl h-[70vh] max-h-[70vh] bg-stone-950 border border-stone-700 rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-4 py-3 border-b border-stone-700 bg-stone-900">
          <h2 className="text-lg font-semibold text-stone-100">Open Folder or File</h2>
          <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-lg transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-stone-900 border-b border-stone-800">
          <button onClick={goUp} disabled={path === ''} className="p-1.5 text-stone-400 hover:text-stone-200 hover:bg-stone-800 disabled:opacity-40 rounded transition-colors" title="Go up">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 18l-6-6 6-6" /></svg>
          </button>
          <div className="flex-1 flex items-center gap-1 text-sm text-stone-400 overflow-x-auto whitespace-nowrap font-mono">
            <button onClick={() => load('')} className="px-1 py-0.5 hover:bg-stone-800 rounded">~</button>
            {crumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1">
                <span className="text-stone-600">/</span>
                <button
                  onClick={() => load(crumbs.slice(0, i + 1).join('/'))}
                  className="px-1 py-0.5 hover:bg-stone-800 rounded"
                >
                  {crumb}
                </button>
              </span>
            ))}
          </div>
        </div>

        {error && (
          <div className="px-4 py-2 text-xs text-red-400 bg-red-900/20 border-b border-red-900/30">{error}</div>
        )}

        <div className="flex-1 overflow-y-auto px-2 py-2">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <svg className="w-8 h-8 animate-spin text-stone-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle className="opacity-25" cx="12" cy="12" r="10" />
                <path className="opacity-75" d="M12 2a10 10 0 0 1 10 10" />
              </svg>
            </div>
          ) : items.length === 0 ? (
            <p className="text-stone-500 text-sm text-center py-8">Empty directory</p>
          ) : (
            items.map((item) => (
              <button
                key={item.path}
                onClick={() => handleClick(item)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${
                  selected === item.path ? 'bg-red-900/30 text-stone-100' : 'text-stone-300 hover:bg-stone-800'
                }`}
              >
                {item.isDirectory ? (
                  <svg className="w-5 h-5 text-amber-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-stone-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                )}
                <span className="truncate font-mono text-sm">{item.name}</span>
                {!item.isDirectory && (
                  <span className="ml-auto text-xs text-stone-600 shrink-0">{formatSize(item.size)}</span>
                )}
              </button>
            ))
          )}
        </div>

        <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-stone-700 bg-stone-900">
          <span className="text-xs text-stone-500 truncate">
            {selected ? `Selected: ${selected}` : 'Select a file or folder'}
          </span>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-stone-300 hover:text-stone-100 bg-stone-800 hover:bg-stone-700 rounded-lg transition-colors">
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selected || loading}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              Open
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}