import type { EventPublic } from '@/types/event'
import { defineStore } from 'pinia'
import { getEventByCode } from '@/api/eventApi'

interface EventState {
  current: EventPublic | null
  isLoading: boolean
  errorMessage: string | null
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

      try {
        this.current = await getEventByCode(eventCode)
      } catch (error) {
        this.errorMessage = error instanceof Error ? error.message : 'Falha ao carregar evento'
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
