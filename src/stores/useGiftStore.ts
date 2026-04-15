import type { Gift } from '@/types/gift'
import { defineStore } from 'pinia'
import { listPublicGifts } from '@/api/giftApi'
import { ApiError } from '@/services/http'

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
        const gifts = await listPublicGifts(eventCode)

        this.items = gifts.reduce<Gift[]>((ordered, gift) => {
          const insertAt = ordered.findIndex(item => item.sortOrder > gift.sortOrder)

          if (insertAt === -1) {
            ordered.push(gift)
          } else {
            ordered.splice(insertAt, 0, gift)
          }

          return ordered
        }, [])
      } catch (error) {
        if (error instanceof ApiError) {
          if (error.status === 404) {
            this.errorMessage = 'Evento nao encontrado.'
          } else if (error.status === 410) {
            this.errorMessage = 'Este evento foi encerrado.'
          } else {
            this.errorMessage = 'Nao foi possivel carregar os presentes.'
          }
        } else {
          this.errorMessage = 'Nao foi possivel carregar os presentes.'
        }
      } finally {
        this.isLoading = false
      }
    },
    applyPurchaseConfirmation (giftId: string, quantity: number) {
      const normalizedQuantity = Math.max(1, quantity)
      const targetGift = this.items.find(gift => gift.id === giftId)

      if (!targetGift) {
        return
      }

      targetGift.confirmedQuantity = Math.min(
        targetGift.maxQuantity,
        targetGift.confirmedQuantity + normalizedQuantity,
      )
    },
    clearGifts () {
      this.items = []
      this.errorMessage = null
    },
  },
})
