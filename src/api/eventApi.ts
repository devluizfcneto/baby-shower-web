import type { ApiEnvelope, EventPublic } from '@/types/event'
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

function normalizeEventPublic (payload: unknown): EventPublic {
  const root = asRecord(payload)
  const source = asRecord(root.data)
  const rawEvent = Object.keys(source).length > 0 ? source : root
  const pixRecord = asRecord(rawEvent.pix)

  return {
    id: Number(rawEvent.id || 0),
    eventCode: asNullableString(rawEvent.eventCode ?? rawEvent.event_code) || undefined,
    name: asNullableString(rawEvent.name) || 'Baby Shower',
    eventDetail: asNullableString(rawEvent.eventDetail ?? rawEvent.event_detail),
    date: asNullableString(rawEvent.date) || '',
    venueAddress: asNullableString(rawEvent.venueAddress ?? rawEvent.venue_address) || '',
    deliveryAddress: asNullableString(rawEvent.deliveryAddress ?? rawEvent.delivery_address),
    deliveryAddress2: asNullableString(rawEvent.deliveryAddress2 ?? rawEvent.delivery_address2),
    deliveryAddress3: asNullableString(rawEvent.deliveryAddress3 ?? rawEvent.delivery_address3),
    mapsLink: asNullableString(rawEvent.mapsLink ?? rawEvent.maps_link),
    coverImageUrl: asNullableString(rawEvent.coverImageUrl ?? rawEvent.cover_image_url),
    pix: {
      dadKey: asNullableString(pixRecord.dadKey ?? pixRecord.dad_key),
      momKey: asNullableString(pixRecord.momKey ?? pixRecord.mom_key),
    },
    isArchived: Boolean(rawEvent.isArchived ?? rawEvent.is_archived ?? false),
  }
}

export async function getEventByCode (eventCode: string): Promise<EventPublic> {
  const response = await apiFetch<ApiEnvelope<EventPublic> | EventPublic>(`/events/${eventCode}`)
  return normalizeEventPublic(response)
}

export function getEventGiftsByCode (eventCode: string) {
  return apiFetch(`/events/${eventCode}/gifts`)
}

export function createDonationByCode (eventCode: string, payload: unknown) {
  return apiFetch(`/events/${eventCode}/donations`, {
    method: 'POST',
    data: payload,
  })
}
