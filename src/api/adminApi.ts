import type {
  AdminDashboardMetrics,
  AdminDonation,
  AdminEventDetails,
  AdminEventSummary,
  AdminGift,
  AdminGiftInputPayload,
  AdminGuest,
  AdminListEventsQuery,
  AdminLoginPayload,
  AdminLoginResponse,
  AdminPaginatedResponse,
  AdminPurchase,
  AdminSignupPayload,
  AdminUpdateEventPayload,
} from '@/types/admin'
import { apiClient, apiFetch } from '@/services/http'

type UnknownRecord = Record<string, unknown>

function asRecord (value: unknown): UnknownRecord {
  if (typeof value === 'object' && value !== null) {
    return value as UnknownRecord
  }

  return {}
}

function unwrapResponse<T> (payload: unknown): T {
  const root = asRecord(payload)
  const data = root.data

  if (data !== undefined) {
    return data as T
  }

  return payload as T
}

function asNullableString (value: unknown): string | null {
  return typeof value === 'string' ? value : null
}

function asString (value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function asNumber (value: unknown, fallback = 0): number {
  if (typeof value === 'number') {
    return value
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    return Number.isNaN(parsed) ? fallback : parsed
  }

  return fallback
}

function asBoolean (value: unknown, fallback = false): boolean {
  if (typeof value === 'boolean') {
    return value
  }
  if (typeof value === 'number') {
    return value === 1
  }
  if (typeof value === 'string') {
    return value === 'true' || value === '1'
  }

  return fallback
}

function normalizeEventSummary (input: unknown): AdminEventSummary {
  const raw = asRecord(input)

  return {
    id: String(raw.id || ''),
    eventCode: asString(raw.eventCode ?? raw.event_code),
    name: asString(raw.name),
    date: asString(raw.date),
    isArchived: asBoolean(raw.isArchived ?? raw.is_archived),
    guestsCount: asNumber(raw.guestsCount ?? raw.guests_count, 0),
    giftsCount: asNumber(raw.giftsCount ?? raw.gifts_count, 0),
    donationsCount: asNumber(raw.donationsCount ?? raw.donations_count, 0),
  }
}

function normalizeEventDetails (input: unknown): AdminEventDetails {
  const raw = asRecord(input)

  return {
    id: String(raw.id || ''),
    eventCode: asString(raw.eventCode ?? raw.event_code),
    name: asString(raw.name),
    date: asString(raw.date),
    venueAddress: asString(raw.venueAddress ?? raw.venue_address),
    deliveryAddress: asNullableString(raw.deliveryAddress ?? raw.delivery_address),
    mapsLink: asNullableString(raw.mapsLink ?? raw.maps_link),
    coverImageUrl: asNullableString(raw.coverImageUrl ?? raw.cover_image_url),
    pixKeyDad: asNullableString(raw.pixKeyDad ?? raw.pix_key_dad),
    pixKeyMom: asNullableString(raw.pixKeyMom ?? raw.pix_key_mom),
    pixQrcodeDad: asNullableString(raw.pixQrcodeDad ?? raw.pix_qrcode_dad),
    pixQrcodeMom: asNullableString(raw.pixQrcodeMom ?? raw.pix_qrcode_mom),
    isArchived: asBoolean(raw.isArchived ?? raw.is_archived),
    guestsCount: asNumber(raw.guestsCount ?? raw.guests_count, 0),
    giftsCount: asNumber(raw.giftsCount ?? raw.gifts_count, 0),
    donationsCount: asNumber(raw.donationsCount ?? raw.donations_count, 0),
  }
}

function normalizeMarketplace (value: unknown): AdminGift['marketplace'] {
  if (value === 'amazon' || value === 'mercadolivre' || value === 'shopee') {
    return value
  }

  return 'amazon'
}

function normalizeGift (input: unknown): AdminGift {
  const raw = asRecord(input)

  return {
    id: String(raw.id || ''),
    eventId: asString(raw.eventId ?? raw.event_id),
    name: asString(raw.name),
    description: asNullableString(raw.description),
    imageUrl: asNullableString(raw.imageUrl ?? raw.image_url),
    marketplace: normalizeMarketplace(raw.marketplace),
    marketplaceUrl: asString(raw.marketplaceUrl ?? raw.marketplace_url),
    affiliateLinkAmazon: asNullableString(raw.affiliateLinkAmazon ?? raw.affiliate_link_amazon),
    affiliateLinkMl: asNullableString(raw.affiliateLinkMl ?? raw.affiliate_link_ml),
    affiliateLinkShopee: asNullableString(raw.affiliateLinkShopee ?? raw.affiliate_link_shopee),
    asin: asNullableString(raw.asin),
    maxQuantity: asNumber(raw.maxQuantity ?? raw.max_quantity, 1),
    confirmedQuantity: asNumber(raw.confirmedQuantity ?? raw.confirmed_quantity, 0),
    isBlocked: asBoolean(raw.isBlocked ?? raw.is_blocked),
    sortOrder: asNumber(raw.sortOrder ?? raw.sort_order, 0),
  }
}

function normalizeCompanion (input: unknown) {
  const raw = asRecord(input)

  return {
    id: String(raw.id || ''),
    fullName: asString(raw.fullName ?? raw.full_name),
  }
}

function normalizeGuest (input: unknown): AdminGuest {
  const raw = asRecord(input)
  const companionsRaw = raw.companions
  const companions = Array.isArray(companionsRaw) ? companionsRaw.map(item => normalizeCompanion(item)) : []

  return {
    id: String(raw.id || ''),
    fullName: asString(raw.fullName ?? raw.full_name),
    email: asString(raw.email),
    confirmedAt: asString(raw.confirmedAt ?? raw.confirmed_at),
    companions,
    totalPeople: asNumber(raw.totalPeople ?? raw.total_people, companions.length + 1),
  }
}

function normalizePurchase (input: unknown): AdminPurchase {
  const raw = asRecord(input)

  return {
    id: String(raw.id || ''),
    giftId: asString(raw.giftId ?? raw.gift_id),
    giftName: asString(raw.giftName ?? raw.gift_name),
    guestName: asString(raw.guestName ?? raw.guest_name),
    guestEmail: asString(raw.guestEmail ?? raw.guest_email),
    quantity: asNumber(raw.quantity, 1),
    notes: asNullableString(raw.notes),
    orderNumber: asNullableString(raw.orderNumber ?? raw.order_number),
    confirmedAt: asString(raw.confirmedAt ?? raw.confirmed_at),
  }
}

function normalizeDonation (input: unknown): AdminDonation {
  const raw = asRecord(input)
  const destination = raw.pixDestination ?? raw.pix_destination
  const pixDestination = destination === 'dad' || destination === 'mom' ? destination : null

  return {
    id: String(raw.id || ''),
    donorName: asNullableString(raw.donorName ?? raw.donor_name),
    donorEmail: asNullableString(raw.donorEmail ?? raw.donor_email),
    amount: raw.amount === null || raw.amount === undefined ? null : asNumber(raw.amount),
    pixDestination,
    donatedAt: asString(raw.donatedAt ?? raw.donated_at),
  }
}

function normalizePaginatedEvents (payload: unknown): AdminPaginatedResponse<AdminEventSummary> {
  const root = asRecord(payload)
  const source = asRecord(unwrapResponse<unknown>(payload))
  const data = Array.isArray(source.data) ? source.data : (Array.isArray(root.data) ? root.data : [])

  return {
    data: data.map(item => normalizeEventSummary(item)),
    page: asNumber(source.page ?? root.page, 1),
    perPage: asNumber(source.perPage ?? source.per_page ?? root.perPage ?? root.per_page, 10),
    total: asNumber(source.total ?? root.total, data.length),
  }
}

function normalizeDashboard (payload: unknown): AdminDashboardMetrics {
  const raw = asRecord(unwrapResponse<unknown>(payload))

  return {
    guestsCount: asNumber(raw.guestsCount ?? raw.guests_count, 0),
    giftsCount: asNumber(raw.giftsCount ?? raw.gifts_count, 0),
    purchasesCount: asNumber(raw.purchasesCount ?? raw.purchases_count, 0),
    donationsCount: asNumber(raw.donationsCount ?? raw.donations_count, 0),
  }
}

function normalizeAuthTokens (payload: unknown): AdminLoginResponse {
  const root = asRecord(payload)
  const data = asRecord(root.data)

  const accessToken = asString(
    data.accessToken ?? data.access_token ?? root.accessToken ?? root.access_token,
  )

  const refreshToken = asNullableString(
    data.refreshToken ?? data.refresh_token ?? root.refreshToken ?? root.refresh_token,
  )

  const expiresInCandidate = data.expiresIn ?? data.expires_in ?? root.expiresIn ?? root.expires_in

  const normalizedExpiresIn = expiresInCandidate === undefined || expiresInCandidate === null
    ? undefined
    : asNumber(expiresInCandidate, 0)

  return {
    accessToken,
    refreshToken: refreshToken ?? undefined,
    expiresIn: normalizedExpiresIn && normalizedExpiresIn > 0 ? normalizedExpiresIn : undefined,
  }
}

export async function adminLogin (payload: AdminLoginPayload): Promise<AdminLoginResponse> {
  const response = await apiFetch<unknown>('/admin/login', {
    method: 'POST',
    data: payload,
  })

  return normalizeAuthTokens(response)
}

export function adminSignup (payload: AdminSignupPayload) {
  return apiFetch('/auth/register', {
    method: 'POST',
    data: {
      name: payload.name,
      email: payload.email,
      password: payload.password,
    },
  })
}

export function adminLogout (): Promise<void> {
  return apiFetch<void>('/admin/logout', {
    method: 'POST',
  })
}

export async function adminRefreshToken (refreshToken: string): Promise<AdminLoginResponse> {
  try {
    const response = await apiFetch<unknown>('/auth/refresh', {
      method: 'POST',
      data: { refreshToken },
    })

    return normalizeAuthTokens(response)
  } catch {
    const fallbackResponse = await apiFetch<unknown>('/admin/refresh', {
      method: 'POST',
      data: { refreshToken },
    })

    return normalizeAuthTokens(fallbackResponse)
  }
}

export async function listAdminEvents (query: AdminListEventsQuery = {}): Promise<AdminPaginatedResponse<AdminEventSummary>> {
  const payload = await apiFetch<unknown>('/admin/events', {
    params: {
      status: query.status,
      search: query.search,
      page: query.page,
      per_page: query.perPage,
    },
  })

  return normalizePaginatedEvents(payload)
}

export async function getAdminEventByCode (eventCode: string): Promise<AdminEventDetails> {
  const payload = await apiFetch<unknown>(`/admin/events/by-code/${eventCode}`)

  return normalizeEventDetails(unwrapResponse(payload))
}

export async function updateAdminEventByCode (
  eventCode: string,
  payload: AdminUpdateEventPayload,
): Promise<AdminEventDetails> {
  const response = await apiFetch<unknown>(`/admin/events/by-code/${eventCode}`, {
    method: 'PATCH',
    data: payload,
  })

  return normalizeEventDetails(unwrapResponse(response))
}

export function archiveAdminEventByCode (eventCode: string, isArchived: boolean): Promise<void> {
  return apiFetch<void>(`/admin/events/by-code/${eventCode}/archive`, {
    method: 'PATCH',
    data: { isArchived },
  })
}

export function deleteAdminEventByCode (eventCode: string, eventName: string): Promise<void> {
  return apiFetch<void>(`/admin/events/by-code/${eventCode}`, {
    method: 'DELETE',
    data: { eventName },
  })
}

export async function getAdminEventDashboard (eventId: string): Promise<AdminDashboardMetrics> {
  const payload = await apiFetch<unknown>(`/admin/events/${eventId}/dashboard`)

  return normalizeDashboard(payload)
}

export async function listAdminEventGifts (eventId: string): Promise<AdminGift[]> {
  const payload = await apiFetch<unknown>(`/admin/events/${eventId}/gifts`)
  const data = unwrapResponse<unknown>(payload)

  if (!Array.isArray(data)) {
    return []
  }

  return data.map(item => normalizeGift(item))
}

export async function createAdminEventGift (eventId: string, payload: AdminGiftInputPayload): Promise<AdminGift> {
  const response = await apiFetch<unknown>(`/admin/events/${eventId}/gifts`, {
    method: 'POST',
    data: payload,
  })

  return normalizeGift(unwrapResponse(response))
}

export async function updateAdminEventGift (
  eventId: string,
  giftId: string,
  payload: AdminGiftInputPayload,
): Promise<AdminGift> {
  const response = await apiFetch<unknown>(`/admin/events/${eventId}/gifts/${giftId}`, {
    method: 'PUT',
    data: payload,
  })

  return normalizeGift(unwrapResponse(response))
}

export function toggleAdminEventGiftBlock (eventId: string, giftId: string): Promise<void> {
  return apiFetch<void>(`/admin/events/${eventId}/gifts/${giftId}/block`, {
    method: 'PUT',
  })
}

export function deleteAdminEventGift (eventId: string, giftId: string): Promise<void> {
  return apiFetch<void>(`/admin/events/${eventId}/gifts/${giftId}`, {
    method: 'DELETE',
  })
}

export async function listAdminEventGuests (eventId: string): Promise<AdminGuest[]> {
  const payload = await apiFetch<unknown>(`/admin/events/${eventId}/guests`)
  const data = unwrapResponse<unknown>(payload)

  if (!Array.isArray(data)) {
    return []
  }

  return data.map(item => normalizeGuest(item))
}

export async function listAdminEventPurchases (eventId: string): Promise<AdminPurchase[]> {
  const payload = await apiFetch<unknown>(`/admin/events/${eventId}/purchases`)
  const data = unwrapResponse<unknown>(payload)

  if (!Array.isArray(data)) {
    return []
  }

  return data.map(item => normalizePurchase(item))
}

export async function listAdminEventDonations (eventId: string): Promise<AdminDonation[]> {
  const payload = await apiFetch<unknown>(`/admin/events/${eventId}/donations`)
  const data = unwrapResponse<unknown>(payload)

  if (!Array.isArray(data)) {
    return []
  }

  return data.map(item => normalizeDonation(item))
}

export async function exportAdminGuestsCsv (eventId: string): Promise<Blob> {
  const response = await apiClient.get(`/admin/events/${eventId}/export/guests`, {
    responseType: 'blob',
  })

  return response.data as Blob
}

export async function exportAdminPurchasesCsv (eventId: string): Promise<Blob> {
  const response = await apiClient.get(`/admin/events/${eventId}/export/purchases`, {
    responseType: 'blob',
  })

  return response.data as Blob
}
