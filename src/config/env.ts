const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, '')
const ensureLeadingSlash = (value: string): string => (value.startsWith('/') ? value : `/${value}`)

const rawBasePath = import.meta.env.VITE_APP_BASE_PATH || '/'
const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL || ''
const rawApiPrefix = import.meta.env.VITE_API_PREFIX || '/api'

export const appEnv = {
  appBasePath: rawBasePath,
  apiBaseUrl: trimTrailingSlash(rawApiBaseUrl),
  apiPrefix: ensureLeadingSlash(rawApiPrefix),
  apiProxyTarget: import.meta.env.VITE_API_PROXY_TARGET,
} as const
