export type PixDestination = 'dad' | 'mom'

export interface DonationCreatePayload {
  donorName?: string
  donorEmail?: string
  amount?: number
  pixDestination?: PixDestination
}
