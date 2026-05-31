import PocketBase from 'pocketbase'

export function getPocketBase() {
  const config = useRuntimeConfig()
  const pbUrl = config.public.pbUrl as string
  if (!pbUrl) {
    throw new Error('PUBLIC_PB_URL environment variable is not set')
  }
  return new PocketBase(pbUrl)
}

export interface RoyIcpSite {
  id: string
  filling_no: string
  domain: string
  name: string
  description?: string
  site_url: string
  icon?: string
  user: string
  categories?: Record<string, boolean>
  approved_at?: string | null
  submission?: string
  created: string
  updated: string
}

export interface RoyIcpIdentity {
  id: string
  name: string
  description?: string
  icon?: string
  created: string
  updated: string
}
