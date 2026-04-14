export interface RSVPCompanion {
  fullName: string
}

export interface RSVPCreatePayload {
  fullName: string
  email: string
  companions?: RSVPCompanion[]
}
