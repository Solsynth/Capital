import { create } from 'zustand'
import { sni } from './network'
import { hasCookie } from 'cookies-next/client'

interface SnAccount {
  id: number
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date | null
  confirmedAt?: Date | null
  contacts?: SnAccountContact[] | null
  avatar: string
  banner: string
  description: string
  name: string
  nick: string
  permNodes: Record<string, any>
  profile?: SnAccountProfile | null
  badges: SnAccountBadge[]
  suspendedAt?: Date | null
  affiliatedId?: number | null
  affiliatedTo?: number | null
  automatedBy?: number | null
  automatedId?: number | null
}

interface SnAccountContact {
  accountId: number
  content: string
  createdAt: Date
  deletedAt?: Date | null
  id: number
  isPrimary: boolean
  isPublic: boolean
  type: number
  updatedAt: Date
  verifiedAt?: Date | null
}

interface SnAccountProfile {
  id: number
  accountId: number
  birthday?: Date | null
  createdAt: Date
  deletedAt?: Date | null
  experience: number
  firstName: string
  lastName: string
  lastSeenAt?: Date | null
  updatedAt: Date
}

interface SnAccountBadge {
  id: number
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date | null
  type: string
  accountId: number
  metadata: Record<string, any>
}

export interface UserStore {
  account: SnAccount | undefined
  fetchUser: () => Promise<SnAccount | undefined>
}

export const useUserStore = create<UserStore>((set) => ({
  account: undefined,
  fetchUser: async (): Promise<SnAccount | undefined> => {
    if (!hasCookie('nex_user_atk')) return
    try {
      const resp = await sni.get<SnAccount>('/cgi/id/users/me')
      set({ account: resp.data })
      console.log('[Authenticator] Logged in as @' + resp.data.name)
      return resp.data
    } catch (err) {
      console.error('[Authenticator] Unable to get user profile: ', err)
      return
    }
  },
}))
