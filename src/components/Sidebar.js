'use client'

import { useState } from 'react'
import OpenFolderModal from './OpenFolderModal'
import TerminalModal from './TerminalModal'

function ExplorerIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function TerminalIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  )
}

function OpenCodeIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
      <path d="M12 22v-6" />
    </svg>
  )
}

export default function Sidebar({ onFileOpen, onFolderOpen, workspace, onWorkspaceChange }) {
  const [modal, setModal] = useState(null)

  const handleOpenSelection = (selection) => {
    if (selection.type === 'file') {
      onFileOpen(selection.path)
    } else if (selection.type === 'folder') {
      if (onWorkspaceChange) onWorkspaceChange(selection.path)
      else if (onFolderOpen) onFolderOpen(selection.path)
    }
    setModal(null)
  }

  const launchOpenCode = () => {
    window.open('/terminal?cmd=opencode', '_blank', 'width=1100,height=750')
  }

  return (
    <>
      <div className="flex h-full w-14 bg-stone-950 border-r border-stone-800 flex-col items-center py-3 gap-2 shrink-0">
        <button
          onClick={() => setModal('explorer')}
          className={`p-3 rounded-lg transition-colors ${
            modal === 'explorer' ? 'bg-stone-800 text-stone-100' : 'text-stone-400 hover:text-stone-100 hover:bg-stone-800'
          }`}
          title="Open Folder or File"
        >
          <ExplorerIcon className="w-6 h-6" />
        </button>

        <button
          onClick={() => setModal('terminal')}
          className={`p-3 rounded-lg transition-colors ${
            modal === 'terminal' ? 'bg-stone-800 text-stone-100' : 'text-stone-400 hover:text-stone-100 hover:bg-stone-800'
          }`}
          title="Terminal (bash)"
        >
          <TerminalIcon className="w-6 h-6" />
        </button>

        <button
          onClick={launchOpenCode}
          className={`p-3 rounded-lg transition-colors ${
            modal === 'opencode' ? 'bg-purple-900/40 text-purple-300' : 'text-purple-500/70 hover:text-purple-300 hover:bg-purple-950/40'
          }`}
          title="Launch OpenCode"
        >
          <OpenCodeIcon className="w-6 h-6" />
        </button>

        <div className="mt-auto flex flex-col items-center gap-1">
          {workspace && (
            <span className="text-[9px] text-stone-600 font-mono px-1 text-center leading-tight" title={workspace}>
              {workspace.split('/').pop() || '~'}
            </span>
          )}
        </div>
      </div>

      <OpenFolderModal
        isOpen={modal === 'explorer'}
        onClose={() => setModal(null)}
        onSelect={handleOpenSelection}
      />

      <TerminalModal
        isOpen={modal === 'terminal'}
        onClose={() => setModal(null)}
        initialCommand=""
      />
    </>
  )
}