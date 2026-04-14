import type { Gift, GiftPurchaseConfirmationPayload } from '@/types/gift'
import { apiFetch } from '@/services/http'

export function listPublicGifts (eventCode: string): Promise<Gift[]> {
  return apiFetch<Gift[]>(`/events/${eventCode}/gifts`)
}

export function confirmGiftPurchase (
  eventCode: string,
  giftId: string,
  payload: GiftPurchaseConfirmationPayload,
): Promise<void> {
  return apiFetch<void>(`/events/${eventCode}/gifts/${giftId}/confirm-purchase`, {
    method: 'POST',
    data: payload,
  })
}
