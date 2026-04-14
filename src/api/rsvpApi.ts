import type { RSVPCreatePayload } from '@/types/rsvp'
import { apiFetch } from '@/services/http'

export function submitRsvp (eventCode: string, payload: RSVPCreatePayload): Promise<void> {
  return apiFetch<void>(`/events/${eventCode}/rsvp`, {
    method: 'POST',
    data: payload,
  })
}
