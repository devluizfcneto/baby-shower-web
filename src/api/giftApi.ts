import type { Gift, GiftPurchaseConfirmationPayload } from '@/types/gift'
import { apiFetch } from '@/services/http'

type UnknownRecord = Record<string, unknown>

function asRecord (value: unknown): UnknownRecord {
  if (typeof value === 'object' && value !== null) {
    return value as UnknownRecord
  }

  return {}
}

function asNullableString (value: unknown): string | null {
  return typeof value === 'string' ? value : null
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

function asMarketplace (value: unknown): Gift['marketplace'] {
  if (value === 'amazon' || value === 'mercadolivre' || value === 'shopee') {
    return value
  }

  return 'amazon'
}

function normalizeGift (input: unknown): Gift {
  const rawGift = asRecord(input)

  return {
    id: String(rawGift.id || ''),
    eventId: asNullableString(rawGift.eventId ?? rawGift.event_id) || undefined,
    name: asNullableString(rawGift.name) || 'Presente',
    description: asNullableString(rawGift.description),
    imageUrl: asNullableString(rawGift.imageUrl ?? rawGift.image_url),
    marketplace: asMarketplace(rawGift.marketplace),
    marketplaceUrl: asNullableString(rawGift.marketplaceUrl ?? rawGift.marketplace_url) || '',
    maxQuantity: asNumber(rawGift.maxQuantity ?? rawGift.max_quantity, 1),
    confirmedQuantity: asNumber(rawGift.confirmedQuantity ?? rawGift.confirmed_quantity, 0),
    isBlocked: Boolean(rawGift.isBlocked ?? rawGift.is_blocked ?? false),
    sortOrder: asNumber(rawGift.sortOrder ?? rawGift.sort_order, 0),
  }
}

function normalizeGiftList (payload: unknown): Gift[] {
  if (Array.isArray(payload)) {
    return payload.map(item => normalizeGift(item))
  }

  const root = asRecord(payload)
  const source = root.data

  if (Array.isArray(source)) {
    return source.map(item => normalizeGift(item))
  }

  return []
}

export function listPublicGifts (eventCode: string): Promise<Gift[]> {
  return apiFetch<unknown>(`/events/${eventCode}/gifts`).then(normalizeGiftList)
}

export function confirmGiftPurchase (
  eventCode: string,
  giftId: string,
  payload: GiftPurchaseConfirmationPayload,
): Promise<void> {
  return apiFetch<void>(`/events/${eventCode}/gifts/${giftId}/confirm-purchase`, {
    method: 'POST',
    data: {
      guestName: payload.guestName,
      guestEmail: payload.guestEmail,
      quantity: payload.quantity,
      notes: payload.notes,
    },
  })
}
