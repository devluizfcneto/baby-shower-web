import type {
  AdminCreateEventPayload,
  AdminDashboardMetrics,
  AdminDonation,
  AdminEventDetails,
  AdminEventSummary,
  AdminGift,
  AdminGiftImportPayload,
  AdminGiftImportResult,
  AdminGiftInputPayload,
  AdminGuest,
  AdminGuestsListResponse,
  AdminGuestsSummary,
  AdminListEventsQuery,
  AdminLoginPayload,
  AdminLoginResponse,
  AdminPaginatedResponse,
  AdminPurchase,
  AdminPurchaseSummary,
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
  const counters = asRecord(raw.counters)

  return {
    id: String(raw.id || ''),
    eventCode: asString(raw.eventCode ?? raw.event_code ?? raw.code),
    name: asString(raw.name),
    date: asString(raw.date),
    isArchived: asBoolean(raw.isArchived ?? raw.is_archived),
    guestsCount: asNumber(raw.guestsCount ?? raw.guests_count ?? counters.guests, 0),
    giftsCount: asNumber(raw.giftsCount ?? raw.gifts_count ?? counters.gifts, 0),
    purchasesCount: asNumber(
      raw.purchasesCount
      ?? raw.purchases_count
      ?? counters.purchases
      ?? counters.purchase_confirmations,
      0,
    ),
    donationsCount: asNumber(raw.donationsCount ?? raw.donations_count ?? counters.donations, 0),
  }
}

function normalizeEventDetails (input: unknown): AdminEventDetails {
  const raw = asRecord(input)
  const pix = asRecord(raw.pix)

  return {
    id: String(raw.id || ''),
    eventCode: asString(raw.eventCode ?? raw.event_code ?? raw.code),
    name: asString(raw.name),
    date: asString(raw.date),
    venueAddress: asString(raw.venueAddress ?? raw.venue_address),
    deliveryAddress: asNullableString(raw.deliveryAddress ?? raw.delivery_address),
    deliveryAddress2: asNullableString(raw.deliveryAddress2 ?? raw.delivery_address2),
    deliveryAddress3: asNullableString(raw.deliveryAddress3 ?? raw.delivery_address3),
    eventDetail: asNullableString(raw.eventDetail ?? raw.event_detail),
    mapsLink: asNullableString(raw.mapsLink ?? raw.maps_link),
    coverImageUrl: asNullableString(raw.coverImageUrl ?? raw.cover_image_url),
    pixKeyDad: asNullableString(raw.pixKeyDad ?? raw.pix_key_dad ?? pix.dadKey ?? pix.dad_key),
    pixKeyMom: asNullableString(raw.pixKeyMom ?? raw.pix_key_mom ?? pix.momKey ?? pix.mom_key),
    isArchived: asBoolean(raw.isArchived ?? raw.is_archived),
    guestsCount: asNumber(raw.guestsCount ?? raw.guests_count, 0),
    giftsCount: asNumber(raw.giftsCount ?? raw.gifts_count, 0),
    purchasesCount: asNumber(raw.purchasesCount ?? raw.purchases_count, 0),
    donationsCount: asNumber(raw.donationsCount ?? raw.donations_count, 0),
  }
}

function mapEventWritePayload (payload: AdminCreateEventPayload | AdminUpdateEventPayload): UnknownRecord {
  const pix = payload.pix ?? {
    dadKey: payload.pixKeyDad,
    momKey: payload.pixKeyMom,
  }

  return {
    name: payload.name,
    date: payload.date,
    venueAddress: payload.venueAddress,
    deliveryAddress: payload.deliveryAddress,
    deliveryAddress2: payload.deliveryAddress2,
    deliveryAddress3: payload.deliveryAddress3,
    mapsLink: payload.mapsLink,
    coverImageUrl: payload.coverImageUrl,
    eventDetail: payload.eventDetail,
    pix: {
      dadKey: pix.dadKey,
      momKey: pix.momKey,
    },
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

function normalizeGuestRowType (raw: UnknownRecord): AdminGuest['rowType'] {
  const candidate = asString(raw.rowType ?? raw.row_type ?? raw.recordType ?? raw.record_type ?? raw.type ?? raw.kind)
    .trim()
    .toLowerCase()

  if (candidate === 'companion' || candidate === 'acompanhante') {
    return 'companion'
  }

  if (candidate === 'guest' || candidate === 'convidado') {
    return 'guest'
  }

  if (raw.companionId || raw.companion_id || raw.parentGuestId || raw.parent_guest_id) {
    return 'companion'
  }

  return 'guest'
}

function normalizeGuest (input: unknown): AdminGuest {
  const raw = asRecord(input)
  const rowType = normalizeGuestRowType(raw)
  const normalizedGuestId = asString(raw.guestId ?? raw.guest_id ?? raw.parentGuestId ?? raw.parent_guest_id)
  const fallbackId = String(raw.id ?? raw.rowId ?? raw.row_id ?? raw.guestId ?? raw.guest_id ?? raw.companionId ?? raw.companion_id ?? '')
  const normalizedEmail = asNullableString(raw.email ?? raw.guestEmail ?? raw.guest_email ?? raw.companionEmail ?? raw.companion_email)

  return {
    id: fallbackId,
    guestId: normalizedGuestId || fallbackId,
    rowType,
    fullName: asString(raw.fullName ?? raw.full_name ?? raw.name),
    email: normalizedEmail,
    confirmedAt: asString(raw.confirmedAt ?? raw.confirmed_at ?? raw.guestConfirmedAt ?? raw.guest_confirmed_at),
  }
}

function normalizePurchase (input: unknown): AdminPurchase {
  const raw = asRecord(input)

  return {
    id: String(raw.id ?? raw.confirmationId ?? raw.confirmation_id ?? ''),
    giftId: String(raw.giftId ?? raw.gift_id ?? ''),
    giftName: asString(raw.giftName ?? raw.gift_name),
    guestName: asString(raw.guestName ?? raw.guest_name),
    guestEmail: asString(raw.guestEmail ?? raw.guest_email),
    quantity: asNumber(raw.quantity, 1),
    notes: asNullableString(raw.notes),
    orderNumber: asNullableString(raw.orderNumber ?? raw.order_number),
    confirmedAt: asString(raw.confirmedAt ?? raw.confirmed_at),
  }
}

function normalizeGuestsSummary (payload: unknown, guests: AdminGuest[]): AdminGuestsSummary {
  const root = asRecord(payload)
  const unwrapped = asRecord(unwrapResponse<unknown>(payload))
  const rootMeta = asRecord(root.meta)
  const sourceMeta = asRecord(unwrapped.meta)
  const rootSummary = asRecord(rootMeta.summary)
  const sourceSummary = asRecord(sourceMeta.summary)

  const inferredGuests = guests.filter(item => item.rowType === 'guest').length
  const inferredCompanions = guests.filter(item => item.rowType === 'companion').length
  const guestsCount = asNumber(sourceSummary.guests ?? rootSummary.guests, inferredGuests)
  const totalPeople = asNumber(
    sourceSummary.totalPeople ?? sourceSummary.total_people ?? rootSummary.totalPeople ?? rootSummary.total_people,
    guests.length,
  )

  return {
    guests: guestsCount,
    companions: asNumber(sourceSummary.companions ?? rootSummary.companions, inferredCompanions),
    totalPeople,
  }
}

function normalizePurchaseSummary (payload: unknown): AdminPurchaseSummary {
  const root = asRecord(payload)
  const unwrapped = asRecord(unwrapResponse<unknown>(payload))
  const rootMeta = asRecord(root.meta)
  const sourceMeta = asRecord(unwrapped.meta)
  const rootSummary = asRecord(rootMeta.summary)
  const sourceSummary = asRecord(sourceMeta.summary)

  return {
    confirmations: asNumber(sourceSummary.confirmations ?? rootSummary.confirmations, 0),
    unitsConfirmed: asNumber(
      sourceSummary.unitsConfirmed
      ?? sourceSummary.units_confirmed
      ?? rootSummary.unitsConfirmed
      ?? rootSummary.units_confirmed,
      0,
    ),
    buyersUnique: asNumber(
      sourceSummary.buyersUnique
      ?? sourceSummary.buyers_unique
      ?? rootSummary.buyersUnique
      ?? rootSummary.buyers_unique,
      0,
    ),
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
  const sourceMeta = asRecord(source.meta)
  const rootMeta = asRecord(root.meta)
  const data = Array.isArray(source.data) ? source.data : (Array.isArray(root.data) ? root.data : [])

  return {
    data: data.map(item => normalizeEventSummary(item)),
    page: asNumber(source.page ?? root.page ?? sourceMeta.page ?? rootMeta.page, 1),
    perPage: asNumber(
      source.perPage
      ?? source.per_page
      ?? root.perPage
      ?? root.per_page
      ?? sourceMeta.perPage
      ?? sourceMeta.per_page
      ?? rootMeta.perPage
      ?? rootMeta.per_page,
      10,
    ),
    total: asNumber(source.total ?? root.total ?? sourceMeta.total ?? rootMeta.total, data.length),
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
      perPage: query.perPage,
    },
  })

  return normalizePaginatedEvents(payload)
}

export async function createAdminEvent (payload: AdminCreateEventPayload): Promise<AdminEventDetails> {
  const response = await apiFetch<unknown>('/admin/events', {
    method: 'POST',
    data: mapEventWritePayload(payload),
  })

  return normalizeEventDetails(unwrapResponse(response))
}

export async function getAdminEventById (eventId: string): Promise<AdminEventDetails> {
  const payload = await apiFetch<unknown>(`/admin/events/${eventId}`)

  return normalizeEventDetails(unwrapResponse(payload))
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
    data: mapEventWritePayload(payload),
  })

  return normalizeEventDetails(unwrapResponse(response))
}

export async function updateAdminEventById (
  eventId: string,
  payload: AdminUpdateEventPayload,
): Promise<AdminEventDetails> {
  const response = await apiFetch<unknown>(`/admin/events/${eventId}`, {
    method: 'PUT',
    data: mapEventWritePayload(payload),
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
    data: { confirmationName: eventName },
  })
}

export async function getAdminEventDashboard (eventId: string): Promise<AdminDashboardMetrics> {
  const payload = await apiFetch<unknown>(`/admin/events/${eventId}`)

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

export async function countAdminEventGifts (eventId: string): Promise<number> {
  const payload = await apiFetch<unknown>(`/admin/events/${eventId}/gifts`)
  const root = asRecord(payload)
  const unwrapped = asRecord(unwrapResponse<unknown>(payload))
  const unwrappedMeta = asRecord(unwrapped.meta)
  const rootMeta = asRecord(root.meta)

  return asNumber(unwrappedMeta.total ?? rootMeta.total, 0)
}

export async function createAdminEventGift (eventId: string, payload: AdminGiftInputPayload): Promise<AdminGift> {
  const response = await apiFetch<unknown>(`/admin/events/${eventId}/gifts`, {
    method: 'POST',
    data: payload,
  })

  return normalizeGift(unwrapResponse(response))
}

export async function importAdminEventGifts (
  eventId: string,
  payload: AdminGiftImportPayload,
): Promise<AdminGiftImportResult> {
  const response = await apiFetch<unknown>(`/admin/events/${eventId}/gifts/import`, {
    method: 'POST',
    data: payload,
  })

  const data = asRecord(unwrapResponse<unknown>(response))
  const toOptionalNumber = (value: unknown): number | undefined => {
    if (value === null || value === undefined || value === '') {
      return undefined
    }

    return asNumber(value)
  }

  return {
    imported: toOptionalNumber(data.imported),
    importedCount: toOptionalNumber(data.importedCount ?? data.imported_count),
    created: toOptionalNumber(data.created),
    count: toOptionalNumber(data.count),
    message: asNullableString(data.message) ?? undefined,
  }
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

export function toggleAdminEventGiftBlock (eventId: string, giftId: string, isBlocked: boolean): Promise<void> {
  return apiFetch<void>(`/admin/events/${eventId}/gifts/${giftId}/block`, {
    method: 'PUT',
    data: { isBlocked },
  })
}

export function deleteAdminEventGift (eventId: string, giftId: string): Promise<void> {
  return apiFetch<void>(`/admin/events/${eventId}/gifts/${giftId}`, {
    method: 'DELETE',
  })
}

export async function listAdminEventGuests (eventId: string): Promise<AdminGuestsListResponse> {
  const payload = await apiFetch<unknown>(`/admin/events/${eventId}/guests`)
  const data = unwrapResponse<unknown>(payload)

  if (!Array.isArray(data)) {
    return {
      data: [],
      summary: {
        guests: 0,
        companions: 0,
        totalPeople: 0,
      },
    }
  }

  const guests = data.map(item => normalizeGuest(item))

  return {
    data: guests,
    summary: normalizeGuestsSummary(payload, guests),
  }
}

export async function getAdminEventPurchaseSummary (eventId: string): Promise<AdminPurchaseSummary> {
  const payload = await apiFetch<unknown>(`/admin/events/${eventId}/purchase-confirmations`, {
    params: {
      page: 1,
      perPage: 1,
    },
  })

  return normalizePurchaseSummary(payload)
}

export async function listAdminEventPurchases (eventId: string): Promise<AdminPurchase[]> {
  let payload: unknown

  try {
    payload = await apiFetch<unknown>(`/admin/events/${eventId}/purchase-confirmations`)
  } catch {
    payload = await apiFetch<unknown>(`/admin/events/${eventId}/purchases`)
  }

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
