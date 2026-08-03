'use client'

import { useState, useCallback, useEffect } from 'react'
import { files } from '@/lib/api'

const FILE_COLORS = {
  js: 'text-yellow-500', ts: 'text-blue-500', jsx: 'text-yellow-500', tsx: 'text-blue-500',
  json: 'text-amber-400', html: 'text-orange-500', css: 'text-sky-500', scss: 'text-pink-500',
  py: 'text-yellow-400', rs: 'text-orange-500', go: 'text-cyan-500', md: 'text-stone-400',
  yml: 'text-red-400', yaml: 'text-red-400', toml: 'text-blue-400', sh: 'text-green-500',
  dockerfile: 'text-blue-500', tf: 'text-purple-500', vue: 'text-green-500', svelte: 'text-orange-500',
}

function FileIcon({ isDirectory, name }) {
  if (isDirectory) {
    return (
      <svg className="w-4 h-4 text-amber-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
    )
  }
  const ext = name.split('.').pop()?.toLowerCase()
  return (
    <svg className={`w-4 h-4 ${FILE_COLORS[ext] || 'text-stone-400'} shrink-0`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  )
}

function TreeNode({ item, depth, onSelect, onToggle, onOpenDir, selectedPath, expandedPaths }) {
  const indent = depth * 14
  const isDir = item.isDirectory
  const isSelected = selectedPath === item.path

  return (
    <div>
      <div
        className={`flex items-center gap-1.5 py-1 px-2 rounded-md cursor-pointer select-none group ${
          isSelected ? 'bg-red-900/40 text-stone-100' : 'hover:bg-stone-800/70 text-stone-300'
        }`}
        style={{ paddingLeft: `${8 + indent}px` }}
        onClick={() => onSelect(item)}
        onDoubleClick={() => isDir && onOpenDir(item.path)}
        title={isDir ? `${item.path} (double-click to open)` : item.path}
      >
        <button
          className={`w-3 h-3 flex items-center justify-center shrink-0 ${isDir ? 'cursor-pointer hover:text-stone-200' : 'pointer-events-none'}`}
          onClick={(e) => { e.stopPropagation(); if (isDir) onToggle(item.path) }}
          title={isDir ? 'Expand / collapse' : ''}
        >
          {isDir && (
            <svg className={`w-3 h-3 text-stone-500 transition-transform ${expandedPaths[item.path] ? 'rotate-90' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          )}
        </button>
        <FileIcon isDirectory={isDir} name={item.name} />
        <span className="truncate text-[13px] font-mono">{item.name}</span>
      </div>
      {isDir && expandedPaths[item.path] && item.children && (
        <div>
          {item.children.map((child) => (
            <TreeNode
              key={child.path}
              item={child}
              depth={depth + 1}
              onSelect={onSelect}
              onToggle={onToggle}
              onOpenDir={onOpenDir}
              selectedPath={selectedPath}
              expandedPaths={expandedPaths}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function FileExplorer({ currentPath, onFileSelect, onPathChange }) {
  const [items, setItems] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState({})
  const [selected, setSelected] = useState(null)

  const load = useCallback(async (dir) => {
    setLoading(true)
    setError('')
    try {
      const data = await files.list(dir)
      setItems(data.items)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (currentPath !== undefined) load(currentPath)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPath])

  const openDirectory = useCallback((path) => {
    setSelected(null)
    setExpanded({})
    if (onPathChange) {
      onPathChange(path)
    } else {
      load(path)
    }
  }, [onPathChange, load])

  const toggle = useCallback(async (dirPath) => {
    setExpanded(prev => {
      const next = { ...prev }
      next[dirPath] = !next[dirPath]
      return next
    })
    const isExpanding = !expanded[dirPath]
    if (isExpanding) {
      try {
        const data = await files.list(dirPath)
        setItems(prev => {
          const setChildren = (arr) => arr.map(i => {
            if (i.path === dirPath) return { ...i, children: data.items }
            if (i.children) return { ...i, children: setChildren(i.children) }
            return i
          })
          return setChildren(prev)
        })
      } catch (err) {
        setError(err.message)
      }
    }
  }, [expanded])

  const goUp = useCallback(() => {
    if (currentPath && currentPath !== '') {
      openDirectory(currentPath.split('/').slice(0, -1).join('/'))
    }
  }, [currentPath, openDirectory])

  const handleOpen = useCallback(() => {
    if (!selected) return
    if (selected.isDirectory) {
      openDirectory(selected.path)
    } else {
      onFileSelect(selected.path)
    }
  }, [selected, onFileSelect, openDirectory])

  return (
    <div className="flex flex-col h-full bg-stone-950 overflow-hidden">
      <div className="flex items-center gap-1.5 px-2 py-1.5 border-b border-stone-800 bg-stone-900 shrink-0">
        <button onClick={goUp} disabled={!currentPath || currentPath === ''} className="p-1 text-stone-400 hover:text-stone-200 hover:bg-stone-800 disabled:opacity-30 rounded transition-colors" title="Go up">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 18l-6-6 6-6" /></svg>
        </button>
        <div className="flex-1 flex items-center gap-0.5 text-[11px] text-stone-500 font-mono min-w-0 overflow-x-auto whitespace-nowrap" title={currentPath || '~'}>
          <button onClick={() => openDirectory('')} className="px-1 py-0.5 hover:bg-stone-800 rounded">~</button>
          {currentPath.split('/').filter(Boolean).map((seg, i) => (
            <span key={i} className="flex items-center gap-0.5">
              <span className="text-stone-700">/</span>
              <button onClick={() => openDirectory(currentPath.split('/').slice(0, i + 1).join('/'))} className="px-1 py-0.5 hover:bg-stone-800 rounded">{seg}</button>
            </span>
          ))}
        </div>
        <button
          onClick={handleOpen}
          disabled={!selected}
          title={selected ? (selected.isDirectory ? `Open folder ${selected.name}` : `Open ${selected.name}`) : 'Select a file or folder to open'}
          className="px-2.5 py-1 text-[11px] font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-stone-800 disabled:text-stone-500 disabled:cursor-not-allowed rounded transition-colors shrink-0"
        >
          Open
        </button>
        <button onClick={() => load(currentPath)} disabled={loading} className="p-1 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded transition-colors" title="Refresh">
          <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 4v6h-6" /><path d="M1 20v-6h6" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>
        </button>
      </div>

      {error && (
        <div className="px-3 py-1.5 text-[11px] text-red-400 bg-red-900/20 border-b border-red-900/30 shrink-0">{error}</div>
      )}

      <div className="flex-1 overflow-y-auto py-1">
        {loading && !items ? (
          <div className="flex items-center justify-center h-full">
            <svg className="w-6 h-6 animate-spin text-stone-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle className="opacity-25" cx="12" cy="12" r="10" />
              <path className="opacity-75" d="M12 2a10 10 0 0 1 10 10" />
            </svg>
          </div>
        ) : items && items.length === 0 ? (
          <p className="text-stone-600 text-xs text-center py-6">Empty directory</p>
        ) : (
          items && items.map((item) => (
            <TreeNode
              key={item.path}
              item={item}
              depth={0}
              onSelect={setSelected}
              onToggle={toggle}
              onOpenDir={openDirectory}
              selectedPath={selected?.path}
              expandedPaths={expanded}
            />
          ))
        )}
      </div>
    </div>
  )
}
