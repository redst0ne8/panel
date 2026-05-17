import { getCredentials, getSessionToken, getApiUrl } from './store'

function baseUrl() {
  return getApiUrl() || getCredentials()?.apiUrl || ''
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
