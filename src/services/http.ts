import { appEnv } from '@/config/env'

const ensureLeadingSlash = (value: string): string => (value.startsWith('/') ? value : `/${value}`)

const joinUrl = (base: string, path: string): string => `${base}${ensureLeadingSlash(path)}`

export function buildApiUrl (path: string): string {
  const normalizedPath = ensureLeadingSlash(path)

  if (appEnv.apiBaseUrl) {
    return joinUrl(`${appEnv.apiBaseUrl}${appEnv.apiPrefix}`, normalizedPath)
  }

  // Fallback to relative path for same-origin deployments.
  return joinUrl(appEnv.apiPrefix, normalizedPath)
}

export async function apiFetch<T> (path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers)

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(buildApiUrl(path), {
    ...init,
    headers,
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`API request failed (${response.status}): ${errorBody || response.statusText}`)
  }

  return response.json() as Promise<T>
}
