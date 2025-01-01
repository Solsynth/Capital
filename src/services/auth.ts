import { hasCookie } from 'cookies-next/client'

export interface SnAuthResult {
  isFinished: boolean
  ticket: SnAuthTicket
}

export interface SnAuthTicket {
  id: number
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date | null
  stepRemain: number
  grantToken?: string | null
  accessToken?: string | null
  refreshToken?: string | null
  ipAddress: string
  location: string
  userAgent: string
  expiredAt?: Date | null
  lastGrantAt?: Date | null
  availableAt?: Date | null
  nonce?: string | null
  accountId?: number | null
  factorTrail: number[]
}

export interface SnAuthFactor {
  id: number
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date | null
  type: number
  config?: Record<string, any> | null
  accountId?: number | null
}

export function checkAuthenticatedClient(): boolean {
  return !!hasCookie('nex_user_atk')
}

export function redirectToLogin() {
  window.open('/auth/login?redirect_uri=' + encodeURIComponent(window.location.pathname), '_self')
}
