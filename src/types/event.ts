export interface EventPublic {
  id: string
  eventCode: string
  name: string
  date: string
  venueAddress: string
  deliveryAddress?: string
  mapsLink?: string
  coverImageUrl?: string
  pixKeyDad?: string
  pixKeyMom?: string
  pixQrcodeDad?: string
  pixQrcodeMom?: string
  isArchived: boolean
}

export interface EventSummary {
  id: string
  eventCode: string
  name: string
  date: string
  isArchived: boolean
  guestsCount: number
  giftsCount: number
  donationsCount: number
}

export interface EventListResponse {
  data: EventSummary[]
  page: number
  perPage: number
  total: number
}

export interface EventDashboard {
  guestsCount: number
  giftsCount: number
  purchasesCount: number
  donationsCount: number
}
