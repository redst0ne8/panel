const CREDS_KEY = 'bd-creds'
const USER_KEY = 'bd-user'
const TOKEN_KEY = 'bd-token'
const API_URL_KEY = 'bd-api-url'

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

export function getSessionToken() {
  if (typeof window === 'undefined') return null
  return sessionStorage.getItem(TOKEN_KEY)
}

export function setSessionToken(token) {
  sessionStorage.setItem(TOKEN_KEY, token)
}

export function clearSessionToken() {
  sessionStorage.removeItem(TOKEN_KEY)
}

export function getApiUrl() {
  if (typeof window === 'undefined') return null
  return sessionStorage.getItem(API_URL_KEY) || process.env.NEXT_PUBLIC_DEFAULT_API_URL || ''
}

export function setApiUrl(url) {
  sessionStorage.setItem(API_URL_KEY, url)
}

export function getUser() {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setUser(user) {
  sessionStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearUser() {
  sessionStorage.removeItem(USER_KEY)
}

export function clearAll() {
  clearCredentials()
  clearSessionToken()
  clearUser()
  sessionStorage.removeItem(API_URL_KEY)
}
