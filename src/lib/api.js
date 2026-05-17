import { getCredentials } from './store'

function baseUrl() {
  return getCredentials()?.apiUrl || ''
}

function apiKey() {
  return getCredentials()?.apiKey || ''
}

export async function apiFetch(path, options = {}) {
  const url = `${baseUrl()}${path}`
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${apiKey()}`,
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
