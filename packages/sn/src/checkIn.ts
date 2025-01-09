export interface SnCheckInRecord {
  id: number
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date | null
  resultTier: number
  resultExperience: number
  resultModifiers: number[]
  accountId: number
}
