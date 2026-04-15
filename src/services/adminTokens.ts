import type { AdminTokenPayload } from '@/types/admin'
import { setApiAccessTokenResolver } from '@/services/http'

interface StoredAdminTokens {
  accessToken: string
  refreshToken?: string
  accessTokenExpiresAt?: number
}

const ADMIN_TOKENS_STORAGE_KEY = 'admin-auth-tokens'

let memoryAccessToken = ''

function toRecord (value: unknown): Record<string, unknown> {
  if (typeof value === 'object' && value !== null) {
    return value as Record<string, unknown>
  }

  return {}
}

function readStoredTokens (): StoredAdminTokens | null {
  const raw = localStorage.getItem(ADMIN_TOKENS_STORAGE_KEY)

  if (!raw) {
    return null
  }

  try {
    const parsed = toRecord(JSON.parse(raw))
    const accessToken = typeof parsed.accessToken === 'string' ? parsed.accessToken : ''

    if (!accessToken) {
      localStorage.removeItem(ADMIN_TOKENS_STORAGE_KEY)
      return null
    }

    const refreshToken = typeof parsed.refreshToken === 'string' ? parsed.refreshToken : undefined
    const accessTokenExpiresAt = typeof parsed.accessTokenExpiresAt === 'number'
      ? parsed.accessTokenExpiresAt
      : undefined

    return {
      accessToken,
      refreshToken,
      accessTokenExpiresAt,
    }
  } catch {
    localStorage.removeItem(ADMIN_TOKENS_STORAGE_KEY)
    return null
  }
}

function persistTokens (tokens: StoredAdminTokens): void {
  localStorage.setItem(ADMIN_TOKENS_STORAGE_KEY, JSON.stringify(tokens))
}

function computeExpiresAt (expiresIn?: number): number | undefined {
  if (!expiresIn || expiresIn <= 0) {
    return undefined
  }

  return Date.now() + expiresIn * 1000
}

export function initializeAdminTokenResolver (): void {
  const stored = readStoredTokens()
  memoryAccessToken = stored?.accessToken ?? ''

  setApiAccessTokenResolver(() => memoryAccessToken || readStoredTokens()?.accessToken || '')
}

export function storeAdminTokens (payload: AdminTokenPayload): void {
  const nextTokens: StoredAdminTokens = {
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken,
    accessTokenExpiresAt: computeExpiresAt(payload.expiresIn),
  }

  memoryAccessToken = nextTokens.accessToken
  persistTokens(nextTokens)
}

export function updateAccessToken (payload: AdminTokenPayload): void {
  const current = readStoredTokens()

  const nextTokens: StoredAdminTokens = {
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken ?? current?.refreshToken,
    accessTokenExpiresAt: computeExpiresAt(payload.expiresIn),
  }

  memoryAccessToken = nextTokens.accessToken
  persistTokens(nextTokens)
}

export function getStoredRefreshToken (): string {
  return readStoredTokens()?.refreshToken ?? ''
}

export function hasStoredAccessToken (): boolean {
  return Boolean(memoryAccessToken || readStoredTokens()?.accessToken)
}

export function isStoredAccessTokenExpired (): boolean {
  const expiresAt = readStoredTokens()?.accessTokenExpiresAt

  if (!expiresAt) {
    return false
  }

  return Date.now() >= expiresAt
}

export function clearAdminTokens (): void {
  memoryAccessToken = ''
  localStorage.removeItem(ADMIN_TOKENS_STORAGE_KEY)
}
