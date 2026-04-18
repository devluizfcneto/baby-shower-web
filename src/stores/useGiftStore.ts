import type { Gift } from '@/types/gift'
import { defineStore } from 'pinia'
import type { ListPublicGiftsParams, PublicGiftSortBy } from '@/api/giftApi'
import { listPublicGifts } from '@/api/giftApi'
import { ApiError } from '@/services/http'

interface GiftState {
  items: Gift[]
  isLoading: boolean
  errorMessage: string | null
}

function compareBySortField (a: Gift, b: Gift, sortBy: PublicGiftSortBy, multiplier: 1 | -1): number {
  if (sortBy === 'name') {
    return multiplier * a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' })
  }

  if (sortBy === 'confirmedQuantity') {
    return multiplier * (a.confirmedQuantity - b.confirmedQuantity)
  }

  return multiplier * (a.sortOrder - b.sortOrder)
}

function sortPublicGiftsWithPriority (items: Gift[], options?: ListPublicGiftsParams): Gift[] {
  const sortBy = options?.sortBy ?? 'sortOrder'
  const multiplier: 1 | -1 = options?.sortDir === 'desc' ? -1 : 1

  return [...items].sort((a, b) => {
    const blockedDiff = Number(a.isBlocked) - Number(b.isBlocked)
    if (blockedDiff !== 0) {
      return blockedDiff
    }

    const sortDiff = compareBySortField(a, b, sortBy, multiplier)
    if (sortDiff !== 0) {
      return sortDiff
    }

    const fallbackNameDiff = a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' })
    if (fallbackNameDiff !== 0) {
      return fallbackNameDiff
    }

    return a.id.localeCompare(b.id, 'pt-BR', { sensitivity: 'base' })
  })
}

export const useGiftStore = defineStore('gift', {
  state: (): GiftState => ({
    items: [],
    isLoading: false,
    errorMessage: null,
  }),
  actions: {
    async fetchPublicGifts (eventCode: string, options?: ListPublicGiftsParams) {
      this.isLoading = true
      this.errorMessage = null

      try {
        const gifts = await listPublicGifts(eventCode, options)
        this.items = sortPublicGiftsWithPriority(gifts, options)
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
