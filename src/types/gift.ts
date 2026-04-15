export interface Gift {
  id: string
  eventId?: string
  name: string
  description?: string | null
  imageUrl?: string | null
  marketplace: 'amazon' | 'mercadolivre' | 'shopee'
  marketplaceUrl: string
  maxQuantity: number
  confirmedQuantity: number
  isBlocked: boolean
  sortOrder: number
}

export interface GiftPurchaseConfirmationPayload {
  guestName: string
  guestEmail: string
  quantity?: number
  notes?: string
}
