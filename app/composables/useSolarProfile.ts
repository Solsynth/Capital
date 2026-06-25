export interface SolarProfile {
  id: string
  name: string
  nick: string
  language: string
  region: string
  activated_at: string
  is_superuser: boolean
  profile: {
    id: string
    first_name: string
    middle_name: string
    last_name: string
    bio: string
    gender: string
    pronouns: string
    time_zone: string
    location: string
    links: Array<{ name: string; url: string }>
    username_color: {
      type: string
      value: string | null
      direction: string
      colors: string[]
    }
    birthday: string
    last_seen_at: string
    verification: {
      type: number
      title: string
      description: string
      verified_by: string
    } | null
    active_badge: {
      id: string
      type: string
      label: string
      caption: string
      meta: Record<string, string>
    } | null
    experience: number
    level: number
    leveling_progress: number
    social_credits: number
    social_credits_level: number
    picture: SolarFile | null
    background: SolarFile | null
  }
  contacts: Array<{
    id: string
    type: number
    verified_at: string
    is_primary: boolean
    is_public: boolean
    content: string
  }>
  badges: Array<{
    id: string
    type: string
    label: string
    caption: string
    activated_at: string
    expired_at: string | null
  }>
  perk_subscription: {
    id: string
    display_name: string
    perk_level: number
    is_active: boolean
  } | null
}

export interface SolarFile {
  id: string
  name: string
  file_meta: Record<string, any>
  mime_type: string
  hash: string
  size: number
  has_compression: boolean
  url: string | null
  width: number | null
  height: number | null
  blurhash: string | null
}

export function useSolarProfile() {
  const data = ref<SolarProfile | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetch() {
    loading.value = true
    error.value = null
    try {
      const result = await $fetch<SolarProfile>('/api/auth/solar-profile')
      data.value = result
    } catch (e: any) {
      error.value = e?.data?.statusMessage || e?.message || 'Failed to fetch profile'
      data.value = null
    } finally {
      loading.value = false
    }
  }

  return { data, loading, error, fetch }
}

export function useSolarFileUrl(file: SolarFile | null | undefined): string | null {
  if (!file) return null
  return `https://api.solian.app/drive/files/${file.id}`
}
