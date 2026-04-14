import type { Gift } from '@/types/gift'
import { defineStore } from 'pinia'
import { listPublicGifts } from '@/api/giftApi'

interface GiftState {
  items: Gift[]
  isLoading: boolean
  errorMessage: string | null
}

export const useGiftStore = defineStore('gift', {
  state: (): GiftState => ({
    items: [],
    isLoading: false,
    errorMessage: null,
  }),
  actions: {
    async fetchPublicGifts (eventCode: string) {
      this.isLoading = true
      this.errorMessage = null

      try {
        this.items = await listPublicGifts(eventCode)
      } catch (error) {
        this.errorMessage = error instanceof Error ? error.message : 'Falha ao carregar presentes'
      } finally {
        this.isLoading = false
      }
    },
    clearGifts () {
      this.items = []
      this.errorMessage = null
    },
  },
})
