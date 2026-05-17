const CREDS_KEY = 'bd-creds'

export function getCredentials() {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(CREDS_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setCredentials(apiUrl, apiKey) {
  sessionStorage.setItem(CREDS_KEY, JSON.stringify({ apiUrl, apiKey }))
}

export function clearCredentials() {
  sessionStorage.removeItem(CREDS_KEY)
}
