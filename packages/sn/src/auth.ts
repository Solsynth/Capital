import Cookies from 'universal-cookie'

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

export function setTokenCookies(atk: string, rtk: string) {
  const cookies = new Cookies()
  cookies.set('nex_user_atk', atk, { path: '/', maxAge: 2592000 })
  cookies.set('nex_user_rtk', rtk, { path: '/', maxAge: 2592000 })
}

export function removeTokenCookies() {
  const cookies = new Cookies()
  cookies.remove('nex_user_atk')
  cookies.remove('nex_user_rtk')
}

export function checkAuthenticatedClient(): boolean {
  const cookies = new Cookies()
  return !!cookies.get('nex_user_atk')
}

export function redirectToLogin() {
  window.open('/auth/login?redirect_uri=' + encodeURIComponent(window.location.pathname), '_self')
}
