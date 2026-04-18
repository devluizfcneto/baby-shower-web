export interface RSVPCompanionPayload {
  fullName: string
  email?: string
}

export interface RSVPCreatePayload {
  fullName: string
  email: string
  companions?: RSVPCompanionPayload[]
}
