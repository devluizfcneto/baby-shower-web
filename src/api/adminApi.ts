import type { AdminLoginPayload } from '@/types/admin'
import type { EventDashboard, EventListResponse, EventPublic } from '@/types/event'
import { apiFetch } from '@/services/http'

export function adminLogin (payload: AdminLoginPayload) {
  return apiFetch('/admin/login', {
    method: 'POST',
    data: payload,
  })
}

export function listAdminEvents (): Promise<EventListResponse> {
  return apiFetch<EventListResponse>('/admin/events')
}

export function getAdminEventByCode (eventCode: string): Promise<EventPublic> {
  return apiFetch<EventPublic>(`/admin/events/by-code/${eventCode}`)
}

export function getAdminEventDashboard (eventId: string): Promise<EventDashboard> {
  return apiFetch<EventDashboard>(`/admin/events/${eventId}/dashboard`)
}
