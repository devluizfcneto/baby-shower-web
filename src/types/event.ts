export interface EventPublic {
  id: number
  eventCode?: string
  name: string
  eventDetail?: string | null
  date: string
  venueAddress: string
  deliveryAddress: string | null
  deliveryAddress2: string | null
  deliveryAddress3: string | null
  mapsLink: string | null
  coverImageUrl: string | null
  pix: {
    dadKey: string | null
    momKey: string | null
  }
  isArchived?: boolean
}

export interface ApiEnvelope<T> {
  data: T
  meta?: Record<string, unknown>
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
