import type { AdminLoginPayload, AdminSignupPayload } from '@/types/admin'
import { defineStore } from 'pinia'
import { adminLogin, adminLogout, adminRefreshToken, adminSignup, listAdminEvents } from '@/api/adminApi'
import {
  clearAdminTokens,
  getStoredRefreshToken,
  hasStoredAccessToken,
  initializeAdminTokenResolver,
  isStoredAccessTokenExpired,
  storeAdminTokens,
  updateAccessToken,
} from '@/services/adminTokens'
import { ApiError } from '@/services/http'

interface AdminAuthState {
  isAuthenticated: boolean
  isLoading: boolean
  userEmail: string
}

const ADMIN_AUTH_STORAGE_KEY = 'admin-auth'

initializeAdminTokenResolver()

function readStoredSession (): Pick<AdminAuthState, 'isAuthenticated' | 'userEmail'> {
  const raw = localStorage.getItem(ADMIN_AUTH_STORAGE_KEY)

  if (!raw) {
    return {
      isAuthenticated: false,
      userEmail: '',
    }
  }

  try {
    const parsed = JSON.parse(raw) as {
      isAuthenticated?: boolean
      userEmail?: string
    }

    const hasToken = hasStoredAccessToken()

    return {
      isAuthenticated: Boolean(parsed.isAuthenticated) && hasToken,
      userEmail: typeof parsed.userEmail === 'string' ? parsed.userEmail : '',
    }
  } catch {
    localStorage.removeItem(ADMIN_AUTH_STORAGE_KEY)

    return {
      isAuthenticated: false,
      userEmail: '',
    }
  }
}

function persistSession (state: Pick<AdminAuthState, 'isAuthenticated' | 'userEmail'>) {
  localStorage.setItem(ADMIN_AUTH_STORAGE_KEY, JSON.stringify(state))
}

async function refreshAccessTokenIfPossible (): Promise<boolean> {
  const refreshToken = getStoredRefreshToken()

  if (!refreshToken) {
    return false
  }

  const refreshed = await adminRefreshToken(refreshToken)

  if (!refreshed.accessToken) {
    return false
  }

  updateAccessToken({
    accessToken: refreshed.accessToken,
    refreshToken: refreshed.refreshToken,
    expiresIn: refreshed.expiresIn,
  })

  return true
}

export const useAdminAuthStore = defineStore('admin-auth', {
  state: (): AdminAuthState => ({
    ...readStoredSession(),
    isLoading: false,
  }),
  actions: {
    async login (payload: AdminLoginPayload) {
      this.isLoading = true

      try {
        const loginResponse = await adminLogin(payload)

        if (!loginResponse.accessToken) {
          throw new ApiError('Login response is missing access token')
        }

        storeAdminTokens({
          accessToken: loginResponse.accessToken,
          refreshToken: loginResponse.refreshToken,
          expiresIn: loginResponse.expiresIn,
        })

        this.isAuthenticated = true
        this.userEmail = payload.email.trim()
        persistSession({
          isAuthenticated: true,
          userEmail: this.userEmail,
        })
      } finally {
        this.isLoading = false
      }
    },
    async signup (payload: AdminSignupPayload) {
      this.isLoading = true

      try {
        await adminSignup(payload)
        // After successful signup, the user needs to login manually
        // The component will redirect to login page
      } finally {
        this.isLoading = false
      }
    },
    async logout () {
      try {
        await adminLogout()
      } finally {
        this.isAuthenticated = false
        this.userEmail = ''
        localStorage.removeItem(ADMIN_AUTH_STORAGE_KEY)
        clearAdminTokens()
      }
    },
    async ensureSession (): Promise<boolean> {
      if (!this.isAuthenticated || !hasStoredAccessToken()) {
        return false
      }

      try {
        if (isStoredAccessTokenExpired()) {
          const refreshed = await refreshAccessTokenIfPossible()

          if (!refreshed) {
            this.isAuthenticated = false
            this.userEmail = ''
            localStorage.removeItem(ADMIN_AUTH_STORAGE_KEY)
            clearAdminTokens()
            return false
          }
        }

        await listAdminEvents({ page: 1, perPage: 1 })
        return true
      } catch (error) {
        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          try {
            const refreshed = await refreshAccessTokenIfPossible()

            if (refreshed) {
              await listAdminEvents({ page: 1, perPage: 1 })
              return true
            }
          } catch {
            // If refresh fails, clear auth state below.
          }

          this.isAuthenticated = false
          this.userEmail = ''
          localStorage.removeItem(ADMIN_AUTH_STORAGE_KEY)
          clearAdminTokens()
          return false
        }

        return this.isAuthenticated
      }
    },
  },
})
