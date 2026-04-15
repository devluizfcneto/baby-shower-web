import axios, { type AxiosError, AxiosHeaders, type AxiosRequestConfig } from 'axios'
import { appEnv } from '@/config/env'

const ensureLeadingSlash = (value: string): string => (value.startsWith('/') ? value : `/${value}`)

type AccessTokenResolver = () => string | null | undefined

export class ApiError extends Error {
  status?: number
  code?: string
  details?: unknown
}

const joinUrl = (base: string, path: string): string => `${base}${ensureLeadingSlash(path)}`

function getApiBaseUrl (): string {
  if (appEnv.apiBaseUrl) {
    return `${appEnv.apiBaseUrl}${appEnv.apiPrefix}`
  }

  return appEnv.apiPrefix
}

const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10_000,
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
})

let accessTokenResolver: AccessTokenResolver | undefined

export function setApiAccessTokenResolver (resolver?: AccessTokenResolver): void {
  accessTokenResolver = resolver
}

apiClient.interceptors.request.use(config => {
  const token = accessTokenResolver?.()

  if (token) {
    const headers = AxiosHeaders.from(config.headers)

    if (!headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`)
    }

    config.headers = headers
  }

  return config
})

function toApiError (error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string }>
    const apiError = new ApiError(
      axiosError.response?.data?.message || axiosError.message || 'API request failed',
    )

    apiError.name = 'ApiError'
    apiError.status = axiosError.response?.status
    apiError.code = axiosError.code
    apiError.details = axiosError.response?.data

    return apiError
  }

  const fallbackError = new ApiError('Unexpected API error')
  fallbackError.name = 'ApiError'
  fallbackError.details = error

  return fallbackError
}

export async function apiRequest<T> (config: AxiosRequestConfig): Promise<T> {
  try {
    const response = await apiClient.request<T>(config)
    return response.data
  } catch (error) {
    throw toApiError(error)
  }
}

export function buildApiUrl (path: string): string {
  const normalizedPath = ensureLeadingSlash(path)

  if (appEnv.apiBaseUrl) {
    return joinUrl(`${appEnv.apiBaseUrl}${appEnv.apiPrefix}`, normalizedPath)
  }

  // Fallback to relative path for same-origin deployments.
  return joinUrl(appEnv.apiPrefix, normalizedPath)
}

export async function apiFetch<T> (path: string, config?: AxiosRequestConfig): Promise<T> {
  return apiRequest<T>({
    url: ensureLeadingSlash(path),
    ...config,
  })
}

export { apiClient }
