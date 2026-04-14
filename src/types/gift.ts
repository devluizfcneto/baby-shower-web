export interface Gift {
  id: string
  eventId: string
  name: string
  description?: string
  imageUrl?: string
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
  orderNumber?: string
  notes?: string
}
