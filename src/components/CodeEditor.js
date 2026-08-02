'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Editor from '@monaco-editor/react'

const LANGUAGE_MAP = {
  js: 'javascript', ts: 'typescript', jsx: 'javascript', tsx: 'typescript',
  json: 'json', html: 'html', css: 'css', scss: 'scss', less: 'less',
  py: 'python', rb: 'ruby', go: 'go', rs: 'rust', java: 'java',
  c: 'cpp', cpp: 'cpp', h: 'cpp', hpp: 'cpp', cs: 'csharp',
  php: 'php', sh: 'shell', bash: 'shell', zsh: 'shell', fish: 'shell',
  yml: 'yaml', yaml: 'yaml', toml: 'toml', ini: 'ini', cfg: 'ini',
  md: 'markdown', txt: 'plaintext', xml: 'xml', svg: 'xml',
  sql: 'sql', dockerfile: 'dockerfile', tf: 'terraform',
  vue: 'vue', svelte: 'svelte', kt: 'kotlin', swift: 'swift',
  lua: 'lua', pl: 'perl', r: 'r', dart: 'dart', ex: 'elixir', exs: 'elixir',
}

function getLanguageFromPath(filePath) {
  const ext = filePath.split('.').pop()?.toLowerCase()
  return LANGUAGE_MAP[ext] || 'plaintext'
}

export default function CodeEditor({ 
  filePath, 
  content, 
  onSave, 
  onClose,
  readOnly = false 
}) {
  const [language, setLanguage] = useState('plaintext')
  const [dirty, setDirty] = useState(false)
  const editorRef = useRef(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (filePath) setLanguage(getLanguageFromPath(filePath))
  }, [filePath])

  const handleEditorChange = useCallback((value) => {
    if (value !== content) setDirty(true)
  }, [content])

  const handleSave = useCallback(async () => {
    if (!onSave || !filePath || !dirty) return
    try {
      await onSave(filePath, editorRef.current?.getValue() || content)
      setDirty(false)
    } catch (err) {
      console.error('Save failed:', err)
    }
  }, [onSave, filePath, content, dirty])

  const handleKeyDown = useCallback((e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault()
      handleSave()
    }
  }, [handleSave])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  if (!mounted) return <div className="h-full w-full bg-stone-950" />

  return (
    <div className="h-full w-full flex flex-col bg-stone-950">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-stone-900 border-b border-stone-800 text-xs text-stone-400">
        <span className="flex-1 truncate">{filePath || 'Untitled'}</span>
        {dirty && <span className="text-amber-400">●</span>}
        <span className="px-2 py-0.5 bg-stone-800 rounded text-[10px] uppercase">{language}</span>
        <button
          onClick={handleSave}
          disabled={!dirty || readOnly}
          className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed rounded transition-colors"
        >
          Save (Ctrl+S)
        </button>
        {onClose && (
          <button onClick={onClose} className="px-2 text-stone-500 hover:text-stone-200 transition-colors">
            ✕
          </button>
        )}
      </div>
      <Editor
        ref={editorRef}
        height="100%"
        language={language}
        value={content}
        onChange={handleEditorChange}
        options={{
          theme: 'vs-dark',
          automaticLayout: true,
          minimap: { enabled: false },
          lineNumbers: 'on',
          fontSize: 14,
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
          tabSize: 2,
          insertSpaces: true,
          wordWrap: 'on',
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          renderLineHighlight: 'all',
          bracketPairColorization: { enabled: true },
          guides: { bracketPairs: true },
          readOnly,
        }}
      />
    </div>
  )
}