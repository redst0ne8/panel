'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { files } from '@/lib/api'
import { getSessionToken, getCredentials, clearAll } from '@/lib/store'
import dynamic from 'next/dynamic'

const CodeEditor = dynamic(() => import('@/components/CodeEditor'), { ssr: false })
const Sidebar = dynamic(() => import('@/components/Sidebar'), { ssr: false })
const FileExplorer = dynamic(() => import('@/components/FileExplorer'), { ssr: false })

export default function EditorPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [openTabs, setOpenTabs] = useState([])
  const [activeTabId, setActiveTabId] = useState(null)
  const [workspace, setWorkspace] = useState('')
  const tabCounterRef = useRef(0)

  useEffect(() => { setMounted(true) }, [])

  const isLoggedIn = mounted && (!!getSessionToken() || !!getCredentials())

  useEffect(() => {
    if (!isLoggedIn) router.push('/login')
  }, [isLoggedIn, router])

  const openFile = useCallback(async (path) => {
    try {
      const existingTab = openTabs.find(t => t.path === path)
      if (existingTab) {
        setActiveTabId(existingTab.id)
        return
      }
      const data = await files.read(path)
      const newTab = {
        id: `tab-${++tabCounterRef.current}`,
        path,
        name: path.split('/').pop() || path,
        content: data.content,
        dirty: false,
      }
      setOpenTabs(prev => [...prev, newTab])
      setActiveTabId(newTab.id)
    } catch (err) {
      alert(`Failed to open file: ${err.message}`)
    }
  }, [openTabs])

  const handleSave = useCallback(async (path, content) => {
    try {
      await files.write(path, content)
      setOpenTabs(prev => prev.map(t => t.path === path ? { ...t, content, dirty: false } : t))
    } catch (err) {
      alert(`Failed to save: ${err.message}`)
      throw err
    }
  }, [])

  const handleCloseTab = useCallback((id) => {
    setOpenTabs(prev => {
      const tab = prev.find(t => t.id === id)
      if (tab?.dirty && !confirm(`${tab.name} has unsaved changes. Close anyway?`)) {
        return prev
      }
      const next = prev.filter(t => t.id !== id)
      if (activeTabId === id) {
        setActiveTabId(next.length > 0 ? next[next.length - 1].id : null)
      }
      return next
    })
  }, [activeTabId])

  const handleTabChange = useCallback((id) => {
    setActiveTabId(id)
  }, [])

  if (!mounted || !isLoggedIn) {
    return <div className="h-full w-full flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-2 border-red-600 border-t-transparent" /></div>
  }

  const activeTab = openTabs.find(t => t.id === activeTabId)

  const handleLogout = () => {
    clearAll()
    router.push('/')
  }

  return (
    <div className="h-screen w-full flex flex-col bg-stone-950">
      <nav className="bg-stone-900 border-b border-stone-700 px-4 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <span className="text-xl font-bold text-stone-100">Code Editor</span>
          <div className="flex items-center gap-1 bg-stone-800 rounded-lg p-1 overflow-x-auto max-w-[60vw]">
            {openTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded transition-colors shrink-0 ${
                  activeTabId === tab.id
                    ? 'bg-stone-700 text-stone-100'
                    : 'text-stone-300 hover:text-stone-100 hover:bg-stone-700'
                }`}
              >
                <span className="truncate max-w-[150px] font-mono">{tab.name}</span>
                {tab.dirty && <span className="text-amber-400">●</span>}
                <button
                  onClick={(e) => { e.stopPropagation(); handleCloseTab(tab.id) }}
                  className="ml-1 p-0.5 text-stone-500 hover:text-stone-200 hover:bg-stone-600 rounded transition-colors"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </button>
            ))}
            {openTabs.length === 0 && (
              <span className="px-3 py-1.5 text-sm text-stone-500">No files open</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <span className="text-xs text-stone-500 hidden md:inline">api.redst0ne8.site</span>
          <button onClick={handleLogout} className="px-3 py-1.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors">
            Log Out
          </button>
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          onFileOpen={openFile}
          workspace={workspace}
          onWorkspaceChange={setWorkspace}
        />

        {workspace && (
          <div className="w-64 border-r border-stone-800 shrink-0">
            <FileExplorer
              currentPath={workspace}
              onFileSelect={openFile}
            />
          </div>
        )}

        <div className="flex-1 flex flex-col min-w-0">
          {activeTab ? (
            <CodeEditor
              filePath={activeTab.path}
              content={activeTab.content}
              onSave={handleSave}
              onClose={() => handleCloseTab(activeTab.id)}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-stone-950">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto text-stone-700 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                <h3 className="text-xl text-stone-400 mb-2">No file open</h3>
                <p className="text-stone-500">Open a file or folder from the explorer</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="h-6 bg-stone-900 border-t border-stone-800 flex items-center px-4 text-xs text-stone-500 shrink-0">
        <span>LF</span>
        <span className="mx-2">|</span>
        <span>UTF-8</span>
        <span className="mx-2">|</span>
        <span>{activeTab?.path.split('.').pop()?.toUpperCase() || 'PLAINTEXT'}</span>
        <span className="ml-auto truncate">{workspace ? `~/` + workspace : 'No workspace'}</span>
      </div>
    </div>
  )
}