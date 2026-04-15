import type { DonationCreatePayload } from '@/types/donation'
import { apiFetch } from '@/services/http'

export function createDonationByCode (eventCode: string, payload: DonationCreatePayload): Promise<void> {
  return apiFetch<void>(`/events/${eventCode}/donations`, {
    method: 'POST',
    data: {
      donorName: payload.donorName,
      donorEmail: payload.donorEmail,
      amount: payload.amount,
      pixDestination: payload.pixDestination,
    },
  })
}
