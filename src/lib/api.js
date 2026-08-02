import { getCredentials, getSessionToken, getApiUrl } from './store'

function baseUrl() {
  return getApiUrl() || getCredentials()?.apiUrl || ''
}

export function getWsBaseUrl() {
  const api = baseUrl()
  if (!api) return window.location.host
  const u = new URL(api)
  const proto = u.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${proto}//${u.host}`
}

function authHeader() {
  const token = getSessionToken()
  if (token) return 'Bearer ' + token
  const creds = getCredentials()
  if (creds?.apiKey) return 'Bearer ' + creds.apiKey
  return ''
}

export async function apiFetch(path, options = {}) {
  const url = `${baseUrl()}${path}`
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: authHeader(),
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`)
  return data
}

export const bots = {
  list: () => apiFetch('/api/bots'),
  get: (id) => apiFetch(`/api/bots/${encodeURIComponent(id)}`),
  restart: (id) => apiFetch(`/api/bots/${encodeURIComponent(id)}/restart`, { method: 'POST' }),
  stop: (id) => apiFetch(`/api/bots/${encodeURIComponent(id)}/stop`, { method: 'POST' }),
  start: (id) => apiFetch(`/api/bots/${encodeURIComponent(id)}/start`, { method: 'POST' }),
  getEnv: (id) => apiFetch(`/api/bots/${encodeURIComponent(id)}/env`),
  updateEnv: (id, env) =>
    apiFetch(`/api/bots/${encodeURIComponent(id)}/env`, {
      method: 'POST',
      body: JSON.stringify({ env }),
    }),
  logs: (id, { tail = 100, type } = {}) => {
    const p = new URLSearchParams({ tail })
    if (type) p.set('type', type)
    return apiFetch(`/api/bots/${encodeURIComponent(id)}/logs?${p}`)
  },
}

export const system = {
  health: () => apiFetch('/api/health'),
  status: () => apiFetch('/api/status'),
}

export const files = {
  list: (path = '') => apiFetch(`/api/files?path=${encodeURIComponent(path)}`),
  read: (path) => apiFetch(`/api/files/read?path=${encodeURIComponent(path)}`),
  write: (path, content) => apiFetch('/api/files/write', {
    method: 'POST',
    body: JSON.stringify({ path, content }),
  }),
  create: (path, type) => apiFetch('/api/files/create', {
    method: 'POST',
    body: JSON.stringify({ path, type }),
  }),
  remove: (path) => apiFetch(`/api/files?path=${encodeURIComponent(path)}`, { method: 'DELETE' }),
  rename: (path, newName) => apiFetch('/api/files/rename', {
    method: 'POST',
    body: JSON.stringify({ path, newName }),
  }),
  stat: (path) => apiFetch(`/api/files/stat?path=${encodeURIComponent(path)}`),
}

export const terminal = {
  exec: (command, cwd, timeout) => apiFetch('/api/terminal/exec', {
    method: 'POST',
    body: JSON.stringify({ command, cwd, timeout }),
  }),
  createSession: (cols, rows) => apiFetch('/api/terminal/session', {
    method: 'POST',
    body: JSON.stringify({ cols, rows }),
  }),
  write: (sessionId, data) => apiFetch(`/api/terminal/session/${sessionId}/write`, {
    method: 'POST',
    body: JSON.stringify({ data }),
  }),
  read: (sessionId) => apiFetch(`/api/terminal/session/${sessionId}/read`),
  resize: (sessionId, cols, rows) => apiFetch(`/api/terminal/session/${sessionId}/resize`, {
    method: 'POST',
    body: JSON.stringify({ cols, rows }),
  }),
  close: (sessionId) => apiFetch(`/api/terminal/session/${sessionId}`, { method: 'DELETE' }),
}