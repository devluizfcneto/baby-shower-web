import type { EventPublic } from '@/types/event'
import { apiFetch } from '@/services/http'

export function getEventByCode (eventCode: string): Promise<EventPublic> {
  return apiFetch<EventPublic>(`/events/${eventCode}`)
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
