export interface AdminLoginPayload {
  email: string
  password: string
}

export interface AdminTokenPayload {
  accessToken: string
  refreshToken?: string
  expiresIn?: number
}

export interface AdminLoginResponse {
  accessToken: string
  refreshToken?: string
  expiresIn?: number
}

export interface AdminSignupPayload {
  name: string
  email: string
  password: string
}

export interface AdminAuthUser {
  id: string
  email: string
  fullName?: string
}

export interface AdminListEventsQuery {
  status?: 'active' | 'archived'
  search?: string
  page?: number
  perPage?: number
}

export interface AdminEventSummary {
  id: string
  eventCode: string
  name: string
  date: string
  isArchived: boolean
  guestsCount: number
  giftsCount: number
  donationsCount: number
}

export interface AdminPaginatedResponse<T> {
  data: T[]
  page: number
  perPage: number
  total: number
}

export interface AdminEventDetails {
  id: string
  eventCode: string
  name: string
  date: string
  venueAddress: string
  deliveryAddress: string | null
  mapsLink: string | null
  coverImageUrl: string | null
  pixKeyDad: string | null
  pixKeyMom: string | null
  pixQrcodeDad: string | null
  pixQrcodeMom: string | null
  isArchived: boolean
  guestsCount: number
  giftsCount: number
  donationsCount: number
}

export interface AdminUpdateEventPayload {
  name?: string
  date?: string
  venueAddress?: string
  deliveryAddress?: string | null
  mapsLink?: string | null
  coverImageUrl?: string | null
  pixKeyDad?: string | null
  pixKeyMom?: string | null
  pixQrcodeDad?: string | null
  pixQrcodeMom?: string | null
}

export interface AdminGift {
  id: string
  eventId: string
  name: string
  description: string | null
  imageUrl: string | null
  marketplace: 'amazon' | 'mercadolivre' | 'shopee'
  marketplaceUrl: string
  affiliateLinkAmazon: string | null
  affiliateLinkMl: string | null
  affiliateLinkShopee: string | null
  asin: string | null
  maxQuantity: number
  confirmedQuantity: number
  isBlocked: boolean
  sortOrder: number
}

export interface AdminGiftInputPayload {
  name: string
  description?: string | null
  imageUrl?: string | null
  marketplace: 'amazon' | 'mercadolivre' | 'shopee'
  marketplaceUrl: string
  affiliateLinkAmazon?: string | null
  affiliateLinkMl?: string | null
  affiliateLinkShopee?: string | null
  asin?: string | null
  maxQuantity: number
  sortOrder?: number
}

export interface AdminCompanion {
  id: string
  fullName: string
}

export interface AdminGuest {
  id: string
  fullName: string
  email: string
  confirmedAt: string
  companions: AdminCompanion[]
  totalPeople: number
}

export interface AdminPurchase {
  id: string
  giftId: string
  giftName: string
  guestName: string
  guestEmail: string
  quantity: number
  notes: string | null
  orderNumber: string | null
  confirmedAt: string
}

export interface AdminDonation {
  id: string
  donorName: string | null
  donorEmail: string | null
  amount: number | null
  pixDestination: 'dad' | 'mom' | null
  donatedAt: string
}

export interface AdminDashboardMetrics {
  guestsCount: number
  giftsCount: number
  purchasesCount: number
  donationsCount: number
}
