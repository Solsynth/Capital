export interface ProductReleaseArtifact {
  id?: string
  platform?: string
  architecture?: string
  file_name?: string
  mime_type?: string
  size?: number
  hash?: string
  download_url?: string
  expired?: boolean
  uploaded_at?: string | null
  created_at?: string | null
}

export interface ProductRelease {
  id: string
  slug: string
  version: string
  createdAt: string | null
  releasedAt: string | null
  title: string | null
  changelog: string
  downloadUrl: string | null
  isPrerelease: boolean
  minimumVersion: string | null
  status: string
  artifacts: ProductReleaseArtifact[]
}

export function useProductReleases(slug: string) {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const releases = ref<ProductRelease[]>([])
  const latest = ref<ProductRelease | null>(null)

  async function fetchReleases() {
    loading.value = true
    error.value = null
    try {
      const data = await $fetch<{ releases: ProductRelease[] }>(`/api/products/${slug}/releases`)
      releases.value = data.releases
    } catch (cause: unknown) {
      error.value = cause instanceof Error ? cause.message : "Failed to fetch releases"
    } finally {
      loading.value = false
    }
  }

  async function fetchLatest() {
    try {
      const data = await $fetch<{ release: ProductRelease }>(`/api/products/${slug}/releases/latest`)
      latest.value = data.release
    } catch {
      latest.value = null
    }
  }

  async function refresh() {
    await Promise.all([fetchReleases(), fetchLatest()])
  }

  return {
    releases: computed(() => releases.value),
    latest: computed(() => latest.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    fetchReleases,
    fetchLatest,
    refresh,
  }
}

