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
  artifactsExpired: boolean
  artifacts: ProductReleaseArtifact[]
}

export function useProductReleases(slug: string) {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const releases = ref<ProductRelease[]>([])
  const selectedVersion = ref<string | null>(null)

  const latest = computed(() => releases.value[0] || null)
  const selected = computed(() => {
    if (!releases.value.length) return null
    return releases.value.find((release) => release.version === selectedVersion.value) || latest.value
  })

  async function fetchReleases() {
    loading.value = true
    error.value = null
    try {
      const data = await $fetch<{ releases: ProductRelease[] }>(
        `/api/products/${slug}/releases?limit=100`,
      )
      releases.value = data.releases
      if (!selectedVersion.value || !releases.value.some((release) => release.version === selectedVersion.value)) {
        selectedVersion.value = releases.value[0]?.version || null
      }
    } catch (cause: unknown) {
      error.value = cause instanceof Error ? cause.message : "Failed to fetch releases"
      releases.value = []
      selectedVersion.value = null
    } finally {
      loading.value = false
    }
  }

  async function fetchLatest() {
    if (releases.value.length) {
      selectedVersion.value = releases.value[0].version
      return
    }
    try {
      const data = await $fetch<{ release: ProductRelease }>(`/api/products/${slug}/releases/latest`)
      releases.value = [data.release]
      selectedVersion.value = data.release.version
    } catch {
      selectedVersion.value = null
    }
  }

  function selectRelease(version: string) {
    if (releases.value.some((release) => release.version === version)) {
      selectedVersion.value = version
    }
  }

  async function refresh() {
    await fetchReleases()
  }

  return {
    releases: computed(() => releases.value),
    latest,
    selected,
    selectedVersion: computed(() => selectedVersion.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    fetchReleases,
    fetchLatest,
    selectRelease,
    refresh,
  }
}

