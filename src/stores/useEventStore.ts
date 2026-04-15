import type { EventPublic } from '@/types/event'
import { defineStore } from 'pinia'
import { getEventByCode } from '@/api/eventApi'
import { ApiError } from '@/services/http'

interface EventState {
  current: EventPublic | null
  isLoading: boolean
  errorMessage: string | null
}

function isValidEventPublicCache (value: unknown): value is EventPublic {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const event = value as Record<string, unknown>

  return (
    typeof event.name === 'string'
    && typeof event.date === 'string'
    && typeof event.venueAddress === 'string'
  )
}

function getEventCache (eventCode: string): EventPublic | null {
  const cached = localStorage.getItem(eventCode)
  if (!cached) {
    return null
  }

  try {
    const parsed: unknown = JSON.parse(cached)

    if (!isValidEventPublicCache(parsed)) {
      localStorage.removeItem(eventCode)
      return null
    }

    return parsed
  } catch {
    localStorage.removeItem(eventCode)
    return null
  }
}

function setEventCache (eventCode: string, event: EventPublic): void {
  localStorage.setItem(eventCode, JSON.stringify(event))
}

function removeEventCache (eventCode: string): void {
  localStorage.removeItem(eventCode)
}

export const useEventStore = defineStore('event', {
  state: (): EventState => ({
    current: null,
    isLoading: false,
    errorMessage: null,
  }),
  actions: {
    async fetchEventByCode (eventCode: string) {
      this.isLoading = true
      this.errorMessage = null

      const cachedEvent = getEventCache(eventCode)
      if (cachedEvent) {
        this.current = cachedEvent
        this.isLoading = false
        return
      }

      try {
        this.current = await getEventByCode(eventCode)

        if (this.current) {
          setEventCache(eventCode, this.current)
        }
      } catch (error) {
        removeEventCache(eventCode)

        if (error instanceof ApiError) {
          if (error.status === 404) {
            this.errorMessage = 'Este evento nao foi encontrado.'
          } else if (error.status === 410) {
            this.errorMessage = 'Este evento foi encerrado pelo administrador.'
          } else {
            this.errorMessage = error.message || 'Falha ao carregar evento'
          }
        } else {
          this.errorMessage = error instanceof Error ? error.message : 'Falha ao carregar evento'
        }
      } finally {
        this.isLoading = false
      }
    },
    clearEvent () {
      this.current = null
      this.errorMessage = null
    },
  },
})
